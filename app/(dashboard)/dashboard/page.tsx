import { createAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, Music, ShoppingCart, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createAdminClient();
  // 獲取統計數據
  const [{ count: totalUsers }, { count: totalConcerts }, { count: totalOrders }, { data: concertStats }] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("concert").select("*", { count: "exact", head: true }),
    supabase.from("order").select("*", { count: "exact", head: true }),
    supabase.from("concert").select("conInfoStatus"),
  ]);

  // 計算演唱會狀態統計
  const statusCounts = {
    draft: 0,
    reviewing: 0,
    published: 0,
    rejected: 0,
    finished: 0,
  };

  concertStats?.forEach((concert) => {
    if (concert.conInfoStatus in statusCounts) {
      statusCounts[concert.conInfoStatus as keyof typeof statusCounts]++;
    }
  });

  // 計算待審核數量（reviewing 狀態）
  const pendingReviewCount = statusCounts.reviewing;

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
        <p className="text-muted-foreground">
          歡迎回到 Tickeasy 管理後台
        </p>
      </div> */}

      {/* 主要統計卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="總用戶數" value={totalUsers || 0} icon={<Users className="h-4 w-4" />} description="註冊用戶總數" />
        <StatsCard title="總演唱會數" value={totalConcerts || 0} icon={<Music className="h-4 w-4" />} description="所有演唱會活動" />
        <StatsCard title="總訂單數" value={totalOrders || 0} icon={<ShoppingCart className="h-4 w-4" />} description="所有訂單記錄" />
        <StatsCard title="待審核" value={pendingReviewCount} icon={<Clock className="h-4 w-4" />} description="需要審核的演唱會" className={pendingReviewCount > 0 ? "border-orange-200" : ""} />
      </div>

      {/* 演唱會狀態統計
      <div>
        <h2 className="text-xl font-semibold mb-4">演唱會狀態分布</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="草稿"
            value={statusCounts.draft}
            icon={<FileText className="h-4 w-4" />}
          />
          <StatsCard
            title="審核中"
            value={statusCounts.reviewing}
            icon={<Clock className="h-4 w-4" />}
            className={statusCounts.reviewing > 0 ? "border-orange-200" : ""}
          />
          <StatsCard
            title="已發布"
            value={statusCounts.published}
            icon={<CheckCircle className="h-4 w-4" />}
            className="border-green-200"
          />
          <StatsCard
            title="已拒絕"
            value={statusCounts.rejected}
            icon={<XCircle className="h-4 w-4" />}
            className={statusCounts.rejected > 0 ? "border-red-200" : ""}
          />
          <StatsCard
            title="已完成"
            value={statusCounts.finished}
            icon={<CheckCircle className="h-4 w-4" />}
          />
        </div>
      </div> */}
    </div>
  );
}
