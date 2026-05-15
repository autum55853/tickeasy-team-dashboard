export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/server";
import { ConcertStats } from "@/components/concerts/concert-stats";
import { ConcertTable } from "@/components/concerts/concert-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ConcertsPage() {
  const supabase = createAdminClient();

  // 獲取演唱會數據，包含關聯的 organization 和 venue
  const [{ data: rawConcerts, error }, { data: organizations }, { data: venues }] = await Promise.all([
    supabase.from("concert").select("*").order("createdAt", { ascending: false }),
    supabase.from("organization").select("organizationId, orgName, userId"),
    supabase.from("venues").select("venueId, venueName, venueAddress"),
  ]);
  if (error) {
    console.error("Error fetching concerts:", error);
  }

  const concerts = rawConcerts?.map((concert) => ({
    ...concert,
    organization: organizations?.find((o) => o.organizationId === concert.organizationId),
    venue: venues?.find((v) => v.venueId === concert.venueId),
  }));

  // 計算統計數據
  const stats = {
    total: concerts?.length || 0,
    pending_review: 0,
    reviewing: 0,
    published: 0,
    draft: 0,
    rejected: 0,
    finished: 0,
    review_skipped: 0,
  };

  concerts?.forEach((concert) => {
    switch (concert.conInfoStatus) {
      case "draft":
        stats.draft++;
        break;
      case "reviewing":
        stats.reviewing++;
        if (concert.reviewStatus === "pending") {
          stats.pending_review++;
        }
        break;
      case "published":
        stats.published++;
        break;
      case "rejected":
        stats.rejected++;
        break;
      case "finished":
        stats.finished++;
        break;
    }

    if (concert.reviewStatus === "skipped") {
      stats.review_skipped++;
    }
  });

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">演唱會審核</h1>
        <p className="text-muted-foreground">
          審核和管理所有演唱會活動
        </p>
      </div> */}

      <ConcertStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>演唱會列表</CardTitle>
          <CardDescription>查看和審核所有演唱會</CardDescription>
        </CardHeader>
        <CardContent>
          <ConcertTable concerts={concerts || []} />
        </CardContent>
      </Card>
    </div>
  );
}
