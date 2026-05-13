import { createAdminClient } from "@/lib/supabase/server";
import { OrderTable } from "@/components/orders/order-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { 
  ShoppingCart,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";

export default async function OrdersPage() {
  const supabase = createAdminClient();
  
  // 獲取訂單數據，包含關聯的用戶和票券資訊
  const { data: orders, error } = await supabase
    .from("order")
    .select(`
      *,
      user:userId (
        userId,
        name,
        email,
        phone
      ),
      ticketType:ticketTypeId (
        ticketTypeId,
        ticketTypeName,
        ticketTypePrice,
        concertSessionId
      )
    `)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  // 計算訂單統計
  const stats = {
    total: orders?.length || 0,
    held: 0,
    expired: 0,
    paid: 0,
    cancelled: 0,
    refunded: 0,
  };

  orders?.forEach((order) => {
    if (order.orderStatus in stats) {
      stats[order.orderStatus as keyof typeof stats]++;
    }
  });

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">訂單管理</h1>
        <p className="text-muted-foreground">
          查看和管理所有訂單記錄
        </p>
      </div> */}

      {/* 訂單統計卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="總訂單數"
          value={stats.total}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatsCard
          title="保留中"
          value={stats.held}
          icon={<Clock className="h-4 w-4" />}
          className={stats.held > 0 ? "border-yellow-200" : ""}
        />
        <StatsCard
          title="已過期"
          value={stats.expired}
          icon={<AlertCircle className="h-4 w-4" />}
          className={stats.expired > 0 ? "border-orange-200" : ""}
        />
        <StatsCard
          title="已付款"
          value={stats.paid}
          icon={<CheckCircle className="h-4 w-4" />}
          className="border-green-200"
        />
        <StatsCard
          title="已退款"
          value={stats.refunded}
          icon={<RefreshCw className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>訂單列表</CardTitle>
          <CardDescription>
            查看所有訂單詳情
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTable orders={orders || []} />
        </CardContent>
      </Card>
    </div>
  );
} 