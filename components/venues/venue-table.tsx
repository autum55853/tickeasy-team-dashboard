"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth-utils";
import type { Venue } from "@/lib/types/concert";
import { VenueFormDialog } from "./venue-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

interface VenueTableProps {
  venues: Venue[];
}

export function VenueTable({ venues: initialVenues }: VenueTableProps) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = venues.filter(
    (v) =>
      v.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.venueAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (updated: Venue) => {
    setVenues((prev) => prev.map((v) => (v.venueId === updated.venueId ? updated : v)));
  };

  const handleCreated = (venue: Venue) => {
    setVenues((prev) => [...prev, venue].sort((a, b) => a.venueName.localeCompare(b.venueName, "zh-TW")));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVenue) return;

    setIsDeleting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/dashboard/venues/${deletingVenue.venueId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (result.success) {
        toast.success("場地刪除成功");
        setVenues((prev) => prev.filter((v) => v.venueId !== deletingVenue.venueId));
        setDeletingVenue(null);
      } else {
        toast.error(result.error || "刪除失敗");
      }
    } catch {
      toast.error("網路錯誤，請稍後再試");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="搜尋場地名稱或地址..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新增場地
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>場地名稱</TableHead>
              <TableHead>地址</TableHead>
              <TableHead className="text-right">容納人數</TableHead>
              <TableHead className="text-center">無障礙</TableHead>
              <TableHead className="text-center">停車場</TableHead>
              <TableHead className="text-center">大眾交通</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {searchTerm ? "找不到符合的場地" : "尚無場地資料"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((venue) => (
                <TableRow key={venue.venueId}>
                  <TableCell className="font-medium">{venue.venueName}</TableCell>
                  <TableCell className="text-muted-foreground">{venue.venueAddress}</TableCell>
                  <TableCell className="text-right">
                    {venue.venueCapacity != null ? venue.venueCapacity.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={venue.isAccessible ? "default" : "secondary"}>
                      {venue.isAccessible ? "是" : "否"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={venue.hasParking ? "default" : "secondary"}>
                      {venue.hasParking ? "是" : "否"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={venue.hasTransit ? "default" : "secondary"}>
                      {venue.hasTransit ? "是" : "否"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingVenue(venue)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingVenue(venue)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <VenueFormDialog
        venue={editingVenue ?? undefined}
        open={!!editingVenue}
        onClose={() => setEditingVenue(null)}
        onSave={handleSave}
      />

      <VenueFormDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />

      <AlertDialog open={!!deletingVenue} onOpenChange={(o) => !o && setDeletingVenue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除場地</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除「{deletingVenue?.venueName}」嗎？此操作無法復原，且可能影響關聯的演唱會資料。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "刪除中..." : "確認刪除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
