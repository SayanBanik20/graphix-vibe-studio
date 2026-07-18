import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Package } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_inr: number;
  currency: string;
  created_at: string;
};

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const supabase = getSupabaseClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []) as Order[];
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
      case "in_production":
      case "paid":
        return "outline";
      case "pending_payment":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-zinc-500">Manage and track all customer orders</p>
        </div>
        <Button variant="outline">Export</Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input placeholder="Search orders..." className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader className="px-6">
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Loading orders...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-zinc-500">
                    <th className="py-3 pr-4 font-medium">Order</th>
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Total</th>
                    <th className="py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 rounded-md flex items-center justify-center">
                            <Package className="w-4 h-4 text-zinc-500" />
                          </div>
                          <div className="font-medium">{order.order_number}</div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-zinc-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 font-medium">
                        ₹{order.total_inr}
                      </td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/admin/orders/$orderId" params={{ orderId: order.id }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
