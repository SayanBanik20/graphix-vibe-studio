import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Star,
  Upload,
  Warehouse,
  BarChart3,
  Percent,
  Bell,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: Tag },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/reviews", label: "Reviews", icon: Star },
    { to: "/admin/uploads", label: "Customer Uploads", icon: Upload },
    { to: "/admin/inventory", label: "Inventory", icon: Warehouse },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/coupons", label: "Coupons", icon: Percent },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/admin/users", label: "Users & Roles", icon: UserCog },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-zinc-900 text-zinc-100 flex flex-col h-full fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">Graphix Vibe Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
