"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth-utils";
import type { Venue } from "@/lib/types/concert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface VenueEditDialogProps {
  venue: Venue;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Venue) => void;
}

export function VenueEditDialog({ venue, open, onClose, onSave }: VenueEditDialogProps) {
  const [form, setForm] = useState({
    venueName: venue.venueName,
    venueDescription: venue.venueDescription ?? "",
    venueAddress: venue.venueAddress,
    venueCapacity: venue.venueCapacity?.toString() ?? "",
    venueImageUrl: venue.venueImageUrl ?? "",
    googleMapUrl: venue.googleMapUrl ?? "",
    isAccessible: venue.isAccessible ?? false,
    hasParking: venue.hasParking ?? false,
    hasTransit: venue.hasTransit ?? false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.venueName.trim() || !form.venueAddress.trim()) {
      toast.error("場地名稱和地址為必填");
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch("/dashboard/venues/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          venueId: venue.venueId,
          venueName: form.venueName.trim(),
          venueDescription: form.venueDescription.trim() || null,
          venueAddress: form.venueAddress.trim(),
          venueCapacity: form.venueCapacity ? Number(form.venueCapacity) : null,
          venueImageUrl: form.venueImageUrl.trim() || null,
          googleMapUrl: form.googleMapUrl.trim() || null,
          isAccessible: form.isAccessible,
          hasParking: form.hasParking,
          hasTransit: form.hasTransit,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("場地更新成功");
        onSave({
          ...venue,
          venueName: form.venueName.trim(),
          venueDescription: form.venueDescription.trim() || undefined,
          venueAddress: form.venueAddress.trim(),
          venueCapacity: form.venueCapacity ? Number(form.venueCapacity) : undefined,
          venueImageUrl: form.venueImageUrl.trim() || undefined,
          googleMapUrl: form.googleMapUrl.trim() || undefined,
          isAccessible: form.isAccessible,
          hasParking: form.hasParking,
          hasTransit: form.hasTransit,
        });
        onClose();
      } else {
        toast.error(result.error || "更新失敗");
      }
    } catch {
      toast.error("網路錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>編輯場地資訊</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venueName">場地名稱 *</Label>
            <Input
              id="venueName"
              value={form.venueName}
              onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueAddress">地址 *</Label>
            <Input
              id="venueAddress"
              value={form.venueAddress}
              onChange={(e) => setForm((f) => ({ ...f, venueAddress: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueDescription">場地描述</Label>
            <Textarea
              id="venueDescription"
              value={form.venueDescription}
              onChange={(e) => setForm((f) => ({ ...f, venueDescription: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueCapacity">容納人數</Label>
            <Input
              id="venueCapacity"
              type="number"
              min={0}
              value={form.venueCapacity}
              onChange={(e) => setForm((f) => ({ ...f, venueCapacity: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueImageUrl">場地圖片 URL</Label>
            <Input
              id="venueImageUrl"
              type="url"
              value={form.venueImageUrl}
              onChange={(e) => setForm((f) => ({ ...f, venueImageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleMapUrl">Google Maps 連結</Label>
            <Input
              id="googleMapUrl"
              type="url"
              value={form.googleMapUrl}
              onChange={(e) => setForm((f) => ({ ...f, googleMapUrl: e.target.value }))}
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className="space-y-3">
            <Label>設施</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isAccessible"
                  checked={form.isAccessible}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isAccessible: !!checked }))
                  }
                />
                <Label htmlFor="isAccessible" className="font-normal cursor-pointer">
                  無障礙設施
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasParking"
                  checked={form.hasParking}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, hasParking: !!checked }))
                  }
                />
                <Label htmlFor="hasParking" className="font-normal cursor-pointer">
                  停車場
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasTransit"
                  checked={form.hasTransit}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, hasTransit: !!checked }))
                  }
                />
                <Label htmlFor="hasTransit" className="font-normal cursor-pointer">
                  大眾交通
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "儲存中..." : "儲存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
