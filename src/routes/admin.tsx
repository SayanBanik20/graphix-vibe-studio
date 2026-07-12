import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
  beforeLoad: ({ context }) => {
    // This will be handled in the component
  },
});

function AdminRoute() {
  const { loading, isAdmin, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-zinc-500">You need admin privileges to access this page.</p>
      </div>
    </div>;
  }

  return <AdminLayout />;
}
