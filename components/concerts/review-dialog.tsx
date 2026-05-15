import React, { useState, useEffect } from "react";
import { Concert } from "@/lib/types/concert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { getAuthToken } from "@/lib/auth-utils";

// 上次審核結果型別
interface ReviewRecord {
  reviewId?: string;
  concertId?: string;
  reviewType?: string; // "ai_auto" 或其他
  reviewStatus: string;
  reviewNote?: string | null; // 舊欄位
  reviewerNote?: string | null; // 新欄位
  reviewerId?: string | null;
  aiResponse?: {
    summary?: string;
    reasons?: string[];
    suggestions?: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

interface ReviewDialogProps {
  concert: Concert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewComplete: (concertId: string, newStatus: string) => void;
}

export function ReviewDialog({ 
  concert, 
  open, 
  onOpenChange, 
  onReviewComplete 
}: ReviewDialogProps) {
  const [reviewNote, setReviewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reviewRecords, setReviewRecords] = useState<ReviewRecord[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // 取得所有審核紀錄
  useEffect(() => {
    if (!concert?.concertId || !open) {
      setReviewRecords([]);
      return;
    }
    setIsReviewLoading(true);
    const token = typeof window !== "undefined" ? getAuthToken() : null;
    fetch(`https://tickeasy-amber-backend.onrender.com/api/v1/concerts/${concert.concertId}/reviews`, {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (
          data.status === "success" &&
          data.data &&
          Array.isArray(data.data.reviews) &&
          data.data.reviews.length > 0
        ) {
          // 以時間倒序排列
          setReviewRecords([...data.data.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          setReviewRecords([]);
        }
      })
      .catch(() => setReviewRecords([]))
      .finally(() => setIsReviewLoading(false));
  }, [concert?.concertId, open]);

  if (!concert) return null;

  const handleReview = async (action: "approved" | "rejected") => {
    if (!concert?.concertId) {
      toast.error("找不到演唱會 ID，無法送出審核！");
      return;
    }
    if (!reviewNote.trim()) {
      toast.error("請輸入審核意見！");
      return;
    }
    setIsLoading(true);

    // 參數檢查 log（繁體中文註解）
    console.log("handleReview 參數檢查", {
      concertId: concert?.concertId,
      reviewNote,
      action,
    });
    
    try {
      // 從 localStorage 取得 token，並加到 Authorization header
      const token = typeof window !== "undefined" ? getAuthToken() : null;
      const res = await fetch(`https://tickeasy-amber-backend.onrender.com/api/v1/concerts/${concert.concertId}/manual-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        // 正確送出物件格式，key 要與後端一致
        body: JSON.stringify({
          reviewStatus: action,
          reviewerNote: reviewNote,
        }),
      });
      const result = await res.json();
      console.log("審核API回傳", result);
      if (result.success) {
        toast.success(action === "approved" ? "演唱會已通過審核" : "演唱會已拒絕");
        onReviewComplete(concert.concertId, action);
        onOpenChange(false);
        setReviewNote("");
      } else {
        toast.error(result.error || result.message || "審核失敗");
      }
    } catch (error) {
      console.error("審核時發生錯誤:", error);
      toast.error("審核時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  // 狀態中文對應
  const statusMap: Record<string, string> = {
    pending: "待審核",
    approved: "已通過",
    rejected: "已拒絕",
  };

  // 時間格式化
  function formatDate(iso: string) {
    const date = new Date(iso);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>審核演唱會</DialogTitle>
          <DialogDescription>
            審核演唱會：{concert.conTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 演唱會基本資訊 */}
          <div className="space-y-2">
            <Label>演唱會資訊</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>主辦單位：{concert.organization?.orgName}</p>
              <p>活動日期：{concert.eventStartDate || "未設定"}</p>
              <p>場地：{concert.venue?.venueName || concert.conLocation || "未設定"}</p>
            </div>
          </div>
          {/* 審核紀錄區塊 */}
          <div className="space-y-2">
            <Label>審核紀錄</Label>
            {isReviewLoading ? (
              <div className="text-sm text-muted-foreground">載入中...</div>
            ) : reviewRecords.length === 0 ? (
              <div className="text-sm text-muted-foreground">尚無審核紀錄</div>
            ) : (
              <div className="space-y-3">
                {reviewRecords.map((record, idx) => (
                  <div key={record.reviewId || idx} className="bg-gray-50 rounded p-3 space-y-1 border">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">狀態：</span>
                      <span>{statusMap[record.reviewStatus] || record.reviewStatus}</span>
                      {record.reviewType === "ai_auto" && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">AI</span>}
                    </div>
                    {/* 審核意見 */}
                    {(record.reviewerNote || record.reviewNote) && (
                      <div><span className="font-semibold">審核意見：</span>{record.reviewerNote || record.reviewNote}</div>
                    )}
                    {/* AI 審核摘要 */}
                    {record.aiResponse?.summary && (
                      <div><span className="font-semibold">AI 審核摘要：</span>{record.aiResponse.summary}</div>
                    )}
                    {/* AI 主要理由 */}
                    {record.aiResponse?.reasons && record.aiResponse.reasons.length > 0 && (
                      <div>
                        <span className="font-semibold">AI 主要理由：</span>
                        <ul className="list-disc pl-5">
                          {record.aiResponse.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* AI 建議調整 */}
                    {record.aiResponse?.suggestions && record.aiResponse.suggestions.length > 0 && (
                      <div>
                        <span className="font-semibold">AI 建議調整：</span>
                        <ul className="list-disc pl-5">
                          {record.aiResponse.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* 審核人員 */}
                    <div><span className="font-semibold">審核人員：</span>{record.reviewerId ? record.reviewerId : (record.reviewType === "ai_auto" ? "AI" : "系統")}</div>
                    {/* 審核時間 */}
                    <div><span className="font-semibold">審核時間：</span>{formatDate(record.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* 審核備註 */}
          <div className="space-y-2">
            <Label htmlFor="reviewNote">審核備註</Label>
            <Textarea
              id="reviewNote"
              placeholder="請輸入審核意見..."
              value={reviewNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleReview("rejected")}
            disabled={isLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            拒絕
          </Button>
          <Button
            onClick={() => handleReview("approved")}
            disabled={isLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            通過
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 