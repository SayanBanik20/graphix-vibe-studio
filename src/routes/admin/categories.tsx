import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return (data || []) as Category[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDeleteModalOpen(false);
      setSelectedCategory(undefined);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete category.");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from("categories")
        .update({ is_active: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category status updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category status.");
    },
  });

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-zinc-500">Organize your products into categories</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6">
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Loading categories...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-zinc-500">
                    <th className="py-3 pr-4 font-medium">Category</th>
                    <th className="py-3 pr-4 font-medium">Slug</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Sort Order</th>
                    <th className="py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((category) => (
                    <tr key={category.id} className="border-b">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 rounded-md flex items-center justify-center">
                            <Tag className="w-4 h-4 text-zinc-500" />
                          </div>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            {category.description && (
                              <div className="text-xs text-zinc-500">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-zinc-500">{category.slug}</td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={category.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: category.id,
                              value: !category.is_active,
                            })
                          }
                        >
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 text-zinc-500">{category.sort_order}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={selectedCategory}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedCategory) deleteMutation.mutate(selectedCategory.id);
        }}
        title="Delete category?"
        description={`Are you sure you want to delete "${selectedCategory?.name}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
