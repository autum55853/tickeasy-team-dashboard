"use client";

import { useState } from "react";
import type { Venue } from "@/lib/types/concert";
import { VenueEditDialog } from "./venue-edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil } from "lucide-react";

interface VenueTableProps {
  venues: Venue[];
}

export function VenueTable({ venues: initialVenues }: VenueTableProps) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const filtered = venues.filter(
    (v) =>
      v.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.venueAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (updated: Venue) => {
    setVenues((prev) => prev.map((v) => (v.venueId === updated.venueId ? updated : v)));
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="搜尋場地名稱或地址..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVenue(venue)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingVenue && (
        <VenueEditDialog
          venue={editingVenue}
          open={!!editingVenue}
          onClose={() => setEditingVenue(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
