export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/server";
import { UserTable } from "@/components/users/user-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UsersPage() {
  const supabase = createAdminClient();
  
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">用戶管理</h1>
        <p className="text-muted-foreground">
          管理系統用戶和權限設定
        </p>
      </div> */}

      <Card>
        <CardHeader>
          <CardTitle>用戶列表</CardTitle>
          <CardDescription>
            查看和管理所有註冊用戶
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={users || []} />
        </CardContent>
      </Card>
    </div>
  );
} 