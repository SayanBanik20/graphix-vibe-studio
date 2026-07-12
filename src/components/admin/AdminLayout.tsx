import { Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopNav } from "./AdminTopNav";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminSidebar />
      <div className="ml-64">
        <AdminTopNav />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
