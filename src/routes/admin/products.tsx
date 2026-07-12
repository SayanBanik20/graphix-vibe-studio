import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_inr: number;
  compare_at_price_inr: number | null;
  main_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  requires_photo: boolean;
  sku: string | null;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
};

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*");
      return (data || []) as Product[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true);
      return (data || []) as Category[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleteModalOpen(false);
      setSelectedProduct(undefined);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: "is_active" | "is_featured";
      value: boolean;
    }) => {
      const { error } = await supabase
        .from("products")
        .update({ [field]: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-zinc-500">Manage your product catalog</p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="px-6">
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          {productsLoading ? (
            <div className="py-8 text-center text-zinc-500">Loading products...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-zinc-500">
                    <th className="py-3 pr-4 font-medium">Product</th>
                    <th className="py-3 pr-4 font-medium">Price</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Featured</th>
                    <th className="py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts?.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 rounded-md overflow-hidden">
                            {product.main_image_url ? (
                              <img
                                src={product.main_image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Eye className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-zinc-500">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-medium">₹{product.price_inr}</div>
                        {product.compare_at_price_inr && (
                          <div className="text-xs text-zinc-400 line-through">
                            ₹{product.compare_at_price_inr}
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={product.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: product.id,
                              field: "is_active",
                              value: !product.is_active,
                            })
                          }
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={product.is_featured ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: product.id,
                              field: "is_featured",
                              value: !product.is_featured,
                            })
                          }
                        >
                          {product.is_featured ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(product)}
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

      <ProductFormModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        product={selectedProduct}
        categories={categories || []}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedProduct) deleteMutation.mutate(selectedProduct.id);
        }}
        title="Delete product?"
        description={`Are you sure you want to delete "${selectedProduct?.name}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
