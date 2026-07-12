import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/uploads")({
  component: AdminUploadsPage,
});

function AdminUploadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Uploads</h1>
        <p className="text-zinc-500">View customer uploaded customization images.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Uploads Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
