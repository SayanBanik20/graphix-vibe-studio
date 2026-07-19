import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/auth";
import { useShop } from "@/lib/shop";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
  beforeLoad: ({ context }) => {
    // This will be handled in the component
  },
});

function AdminRoute() {
  const { loading, isAdmin, user } = useAuth();
  const { openLogin } = useShop();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      openLogin();
      navigate({ to: "/" });
    } else if (!loading && !isAdmin) navigate({ to: "/" });
  }, [isAdmin, loading, navigate, openLogin, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"></div>;
  }

  if (!user || !isAdmin) return null;

  return <AdminLayout />;
}
