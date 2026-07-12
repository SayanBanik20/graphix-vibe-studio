import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, X } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
};

type User = {
  id: string;
  full_name: string | null;
  email: string;
};

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []) as Review[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-zinc-500">Moderate customer reviews</p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6">
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Loading reviews...</div>
          ) : (
            <div className="space-y-4">
              {reviews?.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-yellow-500 flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "fill-current" : "text-zinc-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge
                        variant={
                          review.status === "published"
                            ? "default"
                            : review.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {review.status}
                      </Badge>
                    </div>
                    <p className="text-zinc-700 mb-2">{review.body}</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {review.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: review.id,
                              status: "published",
                            })
                          }
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: review.id,
                              status: "rejected",
                            })
                          }
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
