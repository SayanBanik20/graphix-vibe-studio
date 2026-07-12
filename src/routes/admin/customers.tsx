import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type Customer = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const supabase = getSupabaseClient();
  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      return (data || []) as Customer[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-zinc-500">View and manage customer accounts</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input placeholder="Search customers..." className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader className="px-6">
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Loading customers...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-zinc-500">
                    <th className="py-3 pr-4 font-medium">Customer</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Phone</th>
                    <th className="py-3 pr-4 font-medium">Joined</th>
                    <th className="py-3 pr-4 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {customers?.map((customer) => (
                    <tr key={customer.id} className="border-b">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-zinc-500" />
                          </div>
                          <div className="font-medium">
                            {customer.full_name || "Unnamed Customer"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-zinc-600">{customer.email}</td>
                      <td className="py-4 pr-4 text-zinc-600">{customer.phone || "-"}</td>
                      <td className="py-4 pr-4 text-zinc-600">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4 text-zinc-600">
                        <span className={`px-2 py-1 rounded text-xs ${
                          customer.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-zinc-100 text-zinc-800"
                        }`}>
                          {customer.role}
                        </span>
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
