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

type Product = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price_inr: number;
  compare_at_price_inr?: number;
  sku?: string;
  main_image_url?: string;
  category_id?: string;
  is_active: boolean;
  is_featured: boolean;
  requires_photo: boolean;
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
    description: "",
    price_inr: 0,
    compare_at_price_inr: 0,
    sku: "",
    main_image_url: "",
    category_id: "",
    is_active: true,
    is_featured: false,
    requires_photo: false,
  });

  useEffect(() => {
    if (product) {
      setForm(product);
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        price_inr: 0,
        compare_at_price_inr: 0,
        sku: "",
        main_image_url: "",
        category_id: "",
        is_active: true,
        is_featured: false,
        requires_photo: false,
      });
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async (data: Product) => {
      if (data.id) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
  });

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
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
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: autoGenerateSlug(name) });
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
            </div>
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
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.category_id || ""}
              onValueChange={(val) => setForm({ ...form, category_id: val })}
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
            <Label htmlFor="mainImage">Main Image URL</Label>
            <Input
              id="mainImage"
              value={form.main_image_url || ""}
              onChange={(e) =>
                setForm({ ...form, main_image_url: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-4">
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
