export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/server";
import { VenueTable } from "@/components/venues/venue-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VenuesPage() {
  const supabase = createAdminClient();

  const { data: venues, error } = await supabase
    .from("venues")
    .select("*")
    .order("venueName", { ascending: true });

  if (error) {
    console.error("Error fetching venues:", error);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>場地管理</CardTitle>
          <CardDescription>查看和編輯所有演唱會場地資訊</CardDescription>
        </CardHeader>
        <CardContent>
          <VenueTable venues={venues || []} />
        </CardContent>
      </Card>
    </div>
  );
}
