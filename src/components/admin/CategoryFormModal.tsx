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

type Category = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
};

type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  category?: Category;
};

export function CategoryFormModal({
  open,
  onClose,
  category,
}: CategoryFormModalProps) {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Category>({
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (category) {
      setForm(category);
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        sort_order: 0,
        is_active: true,
      });
    }
  }, [category]);

  const saveMutation = useMutation({
    mutationFn: async (data: Category) => {
      if (data.id) {
        const { error } = await supabase
          .from("categories")
          .update(data)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update category details" : "Create a new category"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) })
              }
            />
          </div>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
