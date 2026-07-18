import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id?: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  price_inr: number;
  compare_at_price_inr?: number | null;
  sku?: string | null;
  main_image_url?: string | null;
  category_id?: string | null;
  details: any[];
  requires_photo: boolean;
  min_photo_count: number;
  max_photo_count: number;
  photo_upload_label?: string | null;
  photo_upload_description?: string | null;
  is_active: boolean;
  is_featured: boolean;
};

type ProductFormModalProps = {
  open: boolean;
  onClose: () => void;
  product?: Product;
  categories: { id: string; name: string }[];
};

export function ProductFormModal({
  open,
  onClose,
  product,
  categories,
}: ProductFormModalProps) {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Product>({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    price_inr: 0,
    compare_at_price_inr: undefined,
    sku: undefined,
    main_image_url: undefined,
    category_id: undefined,
    details: [],
    requires_photo: false,
    min_photo_count: 0,
    max_photo_count: 0,
    photo_upload_label: undefined,
    photo_upload_description: undefined,
    is_active: true,
    is_featured: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSlugError(null);
    }
  }, [open]);

  useEffect(() => {
    if (product) {
      setForm(product);
      setImagePreview(product.main_image_url || null);
    } else {
      setForm({
        name: "",
        slug: "",
        tagline: "",
        description: "",
        price_inr: 0,
        compare_at_price_inr: undefined,
        sku: undefined,
        main_image_url: undefined,
        category_id: undefined,
        details: [],
        requires_photo: false,
        min_photo_count: 0,
        max_photo_count: 0,
        photo_upload_label: undefined,
        photo_upload_description: undefined,
        is_active: true,
        is_featured: false,
      });
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [product]);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async (data: Product) => {
      let imageUrl = data.main_image_url;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      // Convert undefined fields to null for Supabase
      const cleanData: any = {
        ...data,
        main_image_url: imageUrl,
      };
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === undefined) {
          cleanData[key] = null;
        }
      });

      if (cleanData.id) {
        const { error } = await supabase
          .from("products")
          .update(cleanData)
          .eq("id", cleanData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(cleanData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Product saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate key") || error.message?.includes("products_slug_key")) {
        toast.error("Product URL already exists. Please change the slug or product name.");
        setSlugError("This URL is already taken.");
      } else {
        toast.error(error.message || "Failed to save product.");
      }
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const autoGenerateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const generateUniqueSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
    let currentSlug = baseSlug;
    let counter = 1;

    while (true) {
      // Check if slug exists
      const { data, error } = await supabase
        .from("products")
        .select("id")
        .eq("slug", currentSlug)
        .maybeSingle();

      if (error) throw error;

      // If no product found OR it's the current product being edited, use this slug
      if (!data || data.id === excludeId) {
        return currentSlug;
      }

      // Otherwise, increment counter and try again
      currentSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details" : "Create a new product"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={async (e) => {
                  const name = e.target.value;
                  const baseSlug = autoGenerateSlug(name);
                  const uniqueSlug = await generateUniqueSlug(baseSlug, product?.id);
                  setForm({ ...form, name, slug: uniqueSlug });
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={async (e) => {
                  const newSlug = e.target.value;
                  setForm({ ...form, slug: newSlug });

                  // Check if new slug is unique
                  if (newSlug) {
                    const { data } = await supabase
                      .from("products")
                      .select("id")
                      .eq("slug", newSlug)
                      .maybeSingle();

                    if (data && data.id !== product?.id) {
                      setSlugError("This URL is already taken.");
                    } else {
                      setSlugError(null);
                    }
                  }
                }}
                className={slugError ? "border-red-500" : ""}
                required
              />
              {slugError && (
                <p className="text-xs text-red-500">{slugError}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={form.tagline || ""}
              onChange={(e) => setForm({ ...form, tagline: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (INR)</Label>
              <Input
                id="price"
                type="number"
                value={form.price_inr}
                onChange={(e) =>
                  setForm({ ...form, price_inr: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compare">Compare At (INR)</Label>
              <Input
                id="compare"
                type="number"
                value={form.compare_at_price_inr || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    compare_at_price_inr: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={form.sku || ""}
                onChange={(e) => setForm({ ...form, sku: e.target.value || undefined })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.category_id ?? undefined}
              onValueChange={(val) => setForm({ ...form, category_id: val || undefined })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Main Image</Label>
            {imagePreview ? (
              <div className="relative rounded-lg border border-border p-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 rounded-full bg-foreground text-background p-1 hover:bg-opacity-80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-8 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer">
                <Upload className="w-8 h-8" />
                Upload product image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
              </label>
            )}
            <div className="text-xs text-muted-foreground">
              Or enter image URL:
            </div>
            <Input
              id="mainImage"
              value={form.main_image_url || ""}
              onChange={(e) => {
                const url = e.target.value;
                setForm({ ...form, main_image_url: url || undefined });
                setImagePreview(url || null);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="photoLabel">Photo Upload Label</Label>
              <Input
                id="photoLabel"
                value={form.photo_upload_label || ""}
                onChange={(e) =>
                  setForm({ ...form, photo_upload_label: e.target.value || undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoDesc">Photo Upload Description</Label>
              <Input
                id="photoDesc"
                value={form.photo_upload_description || ""}
                onChange={(e) =>
                  setForm({ ...form, photo_upload_description: e.target.value || undefined })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPhotos">Min Photo Count</Label>
              <Input
                id="minPhotos"
                type="number"
                value={form.min_photo_count}
                onChange={(e) =>
                  setForm({ ...form, min_photo_count: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPhotos">Max Photo Count</Label>
              <Input
                id="maxPhotos"
                type="number"
                value={form.max_photo_count}
                onChange={(e) =>
                  setForm({ ...form, max_photo_count: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_active: Boolean(checked) })
                }
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={form.is_featured}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_featured: Boolean(checked) })
                }
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="requiresPhoto"
                checked={form.requires_photo}
                onCheckedChange={(checked) =>
                  setForm({ ...form, requires_photo: Boolean(checked) })
                }
              />
              <Label htmlFor="requiresPhoto">Requires Photo Upload</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
