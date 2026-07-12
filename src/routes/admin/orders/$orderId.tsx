import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Eye } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  subtotal_inr: number;
  shipping_inr: number;
  discount_inr: number;
  total_inr: number;
  currency: string;
  payment_provider: string | null;
  payment_reference: string | null;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
  shipping_address_id: string | null;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string;
  unit_price_inr: number;
  quantity: number;
  personalization_photo_url: string | null;
  personalization_photo_name: string | null;
  personalization_note: string | null;
};

type Address = {
  id: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
};

type User = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
};

export const Route = createFileRoute("/admin/orders/$orderId")({
  component: AdminOrderDetails,
});

function AdminOrderDetails() {
  const { orderId } = Route.useParams();
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      return data as Order;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["admin-order-items", orderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      return (data || []) as OrderItem[];
    },
  });

  const { data: user } = useQuery({
    queryKey: ["admin-order-user", order?.user_id],
    queryFn: async () => {
      if (!order?.user_id) return null;
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", order.user_id)
        .single();
      return data as User;
    },
    enabled: !!order?.user_id,
  });

  const { data: address } = useQuery({
    queryKey: ["admin-order-address", order?.shipping_address_id],
    queryFn: async () => {
      if (!order?.shipping_address_id) return null;
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", order.shipping_address_id)
        .single();
      return data as Address;
    },
    enabled: !!order?.shipping_address_id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
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

  const orderStatuses = [
    "pending_payment",
    "paid",
    "in_production",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (orderLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8 text-zinc-500">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <div className="text-center py-8">
          <h2 className="text-xl font-bold">Order not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order {order.order_number}
          </h1>
          <p className="text-zinc-500">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 py-2 border-b last:border-b-0"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-zinc-100 rounded-md overflow-hidden">
                        {item.personalization_photo_url ? (
                          <img
                            src={item.personalization_photo_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-zinc-500">
                          Qty: {item.quantity}
                        </div>
                        {item.personalization_note && (
                          <div className="text-sm text-zinc-600 mt-1">
                            Note: {item.personalization_note}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ₹{item.unit_price_inr * item.quantity}
                      </div>
                      <div className="text-sm text-zinc-500">
                        ₹{item.unit_price_inr} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {address && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="font-medium">{address.recipient_name}</div>
                  <div>{address.phone}</div>
                  <div>{address.line1}</div>
                  {address.line2 && <div>{address.line2}</div>}
                  <div>
                    {address.city}, {address.state} {address.postal_code}
                  </div>
                  <div>{address.country_code}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {order.customer_note && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-700">{order.customer_note}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Current Status</span>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-600">Update Status</label>
                <Select
                  value={order.status}
                  onValueChange={(value) =>
                    updateStatusMutation.mutate(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Subtotal</span>
                <span>₹{order.subtotal_inr}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Shipping</span>
                <span>₹{order.shipping_inr}</span>
              </div>
              {order.discount_inr > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount_inr}</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-3">
                <span>Total</span>
                <span>₹{order.total_inr}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user?.full_name && (
                <div className="font-medium">{user.full_name}</div>
              )}
              <div className="text-sm text-zinc-600">{user?.email}</div>
              {user?.phone && (
                <div className="text-sm text-zinc-600">{user.phone}</div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="w-full">Print Invoice</Button>
            <Button variant="outline" className="w-full">
              Download Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
