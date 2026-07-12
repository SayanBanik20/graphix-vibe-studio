import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  Star,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const revenueData = [
  { month: "Jan", revenue: 4000, sales: 2400 },
  { month: "Feb", revenue: 3000, sales: 1398 },
  { month: "Mar", revenue: 2000, sales: 9800 },
  { month: "Apr", revenue: 2780, sales: 3908 },
  { month: "May", revenue: 1890, sales: 4800 },
  { month: "Jun", revenue: 2390, sales: 3800 },
];

const recentOrders = [
  { id: "#ORD-1024", customer: "John Doe", status: "Paid", total: "₹1,299", date: "Oct 24" },
  { id: "#ORD-1023", customer: "Jane Smith", status: "Shipped", total: "₹899", date: "Oct 23" },
  { id: "#ORD-1022", customer: "Bob Johnson", status: "Processing", total: "₹1,599", date: "Oct 23" },
  { id: "#ORD-1021", customer: "Alice Williams", status: "Delivered", total: "₹699", date: "Oct 22" },
];

const recentReviews = [
  { product: "Photo Frame", customer: "Sarah Lee", rating: 5, date: "Oct 24" },
  { product: "Love Book", customer: "Mike Brown", rating: 4, date: "Oct 23" },
  { product: "Keychain", customer: "Emma Davis", rating: 5, date: "Oct 22" },
];

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500">Welcome back! Here's what's happening today.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Quick Action
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231</div>
            <p className="text-xs text-zinc-500">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">356</div>
            <p className="text-xs text-zinc-500">+12.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-zinc-500">+2 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-zinc-500">+5.4% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Star className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-zinc-500">{order.customer}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{order.total}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReviews.map((review, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{review.product}</div>
                    <div className="text-sm text-zinc-500">{review.customer}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-500 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-zinc-300"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
