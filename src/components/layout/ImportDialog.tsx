"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCollections } from "@/hooks/useCollections";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCollectionId?: string;
}

export function ImportDialog({
  open,
  onOpenChange,
  defaultCollectionId,
}: ImportDialogProps) {
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const { data: collections } = useCollections();
  const [collectionId, setCollectionId] = useState(
    defaultCollectionId ?? "",
  );
  const queryClient = useQueryClient();

  const handleImport = async () => {
    if (!url.trim() || !collectionId) return;

    setIsImporting(true);
    setError("");

    try {
      const res = await fetch("/api/articles/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          collectionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const detail = data.step ? ` [step: ${data.step}]` : "";
        throw new Error((data.error ?? "Import failed") + detail);
      }

      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setUrl("");
      setError("");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Article</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Collection</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full h-9 rounded-md border bg-background px-3 py-1 text-sm"
            >
              <option value="" disabled>
                Select a collection...
              </option>
              {collections?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Article URL</label>
            <Input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              disabled={isImporting}
            />
            <p className="text-xs text-muted-foreground">
              Paste a link to any English article. The content will be
              extracted and automatically translated to Vietnamese.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!url.trim() || !collectionId || isImporting}
            >
              {isImporting ? "Importing..." : "Import + Translate"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
