"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth-utils";
import type { Venue } from "@/lib/types/concert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface VenueFormDialogProps {
  venue?: Venue;
  open: boolean;
  onClose: () => void;
  onSave?: (updated: Venue) => void;
  onCreated?: (venue: Venue) => void;
}

type FormState = {
  venueName: string;
  venueAddress: string;
  venueDescription: string;
  venueCapacity: string;
  venueImageUrl: string;
  googleMapUrl: string;
  isAccessible: boolean;
  hasParking: boolean;
  hasTransit: boolean;
};

function toFormState(venue?: Venue): FormState {
  return {
    venueName: venue?.venueName ?? "",
    venueAddress: venue?.venueAddress ?? "",
    venueDescription: venue?.venueDescription ?? "",
    venueCapacity: venue?.venueCapacity?.toString() ?? "",
    venueImageUrl: venue?.venueImageUrl ?? "",
    googleMapUrl: venue?.googleMapUrl ?? "",
    isAccessible: venue?.isAccessible ?? false,
    hasParking: venue?.hasParking ?? false,
    hasTransit: venue?.hasTransit ?? false,
  };
}

function validate(form: FormState): string | null {
  if (!form.venueName.trim()) return "場地名稱為必填";
  if (!form.venueAddress.trim()) return "地址為必填";
  if (!form.venueDescription.trim()) return "場地描述為必填";
  if (!form.venueCapacity) return "容納人數為必填";
  if (Number(form.venueCapacity) <= 0) return "容納人數需大於 0";
  if (!form.venueImageUrl.trim()) return "場地圖片 URL 為必填";
  if (!form.googleMapUrl.trim()) return "Google Maps 連結為必填";
  return null;
}

function isFormValid(form: FormState): boolean {
  return (
    form.venueName.trim() !== "" &&
    form.venueAddress.trim() !== "" &&
    form.venueDescription.trim() !== "" &&
    !!form.venueCapacity &&
    Number(form.venueCapacity) > 0 &&
    form.venueImageUrl.trim() !== "" &&
    form.googleMapUrl.trim() !== ""
  );
}

export function VenueFormDialog({ venue, open, onClose, onSave, onCreated }: VenueFormDialogProps) {
  const isCreate = !venue;
  const [form, setForm] = useState<FormState>(() => toFormState(venue));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(toFormState(venue));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate(form);
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        venueName: form.venueName.trim(),
        venueAddress: form.venueAddress.trim(),
        venueDescription: form.venueDescription.trim(),
        venueCapacity: Number(form.venueCapacity),
        venueImageUrl: form.venueImageUrl.trim(),
        googleMapUrl: form.googleMapUrl.trim(),
        isAccessible: form.isAccessible,
        hasParking: form.hasParking,
        hasTransit: form.hasTransit,
      };

      const url = isCreate ? "/dashboard/venues/create" : `/dashboard/venues/${venue.venueId}`;
      const method = isCreate ? "POST" : "PATCH";

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const result = await res.json();

      if (!result.success) {
        toast.error(result.error || (isCreate ? "新增失敗" : "更新失敗"));
        return;
      }

      if (isCreate) {
        toast.success("場地新增成功");
        onCreated?.(result.data);
        handleClose();
      } else {
        toast.success("場地更新成功");
        onSave?.({ ...venue, ...payload });
        onClose();
      }
    } catch {
      toast.error("網路錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreate ? "新增場地" : "編輯場地資訊"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vf-venueName">場地名稱 *</Label>
            <Input
              id="vf-venueName"
              value={form.venueName}
              onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vf-venueAddress">地址 *</Label>
            <Input
              id="vf-venueAddress"
              value={form.venueAddress}
              onChange={(e) => setForm((f) => ({ ...f, venueAddress: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vf-venueDescription">場地描述 *</Label>
            <Textarea
              id="vf-venueDescription"
              value={form.venueDescription}
              onChange={(e) => setForm((f) => ({ ...f, venueDescription: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vf-venueCapacity">容納人數 *</Label>
            <Input
              id="vf-venueCapacity"
              type="number"
              min={1}
              value={form.venueCapacity}
              onChange={(e) => setForm((f) => ({ ...f, venueCapacity: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vf-venueImageUrl">場地圖片 URL *</Label>
            <Input
              id="vf-venueImageUrl"
              type="url"
              value={form.venueImageUrl}
              onChange={(e) => setForm((f) => ({ ...f, venueImageUrl: e.target.value }))}
              placeholder="https://..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vf-googleMapUrl">Google Maps 連結 *</Label>
            <Input
              id="vf-googleMapUrl"
              type="url"
              value={form.googleMapUrl}
              onChange={(e) => setForm((f) => ({ ...f, googleMapUrl: e.target.value }))}
              placeholder="https://maps.google.com/..."
              required
            />
          </div>

          <div className="space-y-3">
            <Label>設施</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="vf-isAccessible"
                  checked={form.isAccessible}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, isAccessible: !!checked }))}
                />
                <Label htmlFor="vf-isAccessible" className="font-normal cursor-pointer">
                  無障礙設施
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="vf-hasParking"
                  checked={form.hasParking}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, hasParking: !!checked }))}
                />
                <Label htmlFor="vf-hasParking" className="font-normal cursor-pointer">
                  停車場
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="vf-hasTransit"
                  checked={form.hasTransit}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, hasTransit: !!checked }))}
                />
                <Label htmlFor="vf-hasTransit" className="font-normal cursor-pointer">
                  大眾交通
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading || !isFormValid(form)}>
              {isLoading ? (isCreate ? "新增中..." : "儲存中...") : isCreate ? "新增" : "儲存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
