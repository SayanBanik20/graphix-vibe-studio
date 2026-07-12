import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-zinc-500">View detailed reports and insights.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analytics Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
