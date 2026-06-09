"use client";

import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface MiniToolbarProps {
  rect: DOMRect;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function MiniToolbar({
  rect,
  onSave,
  onCancel,
  isSaving,
}: MiniToolbarProps) {
  const top = rect.top - 48;
  const left = rect.left + rect.width / 2;

  return createPortal(
    <div
      className="fixed z-50 bg-popover border rounded-md shadow-lg p-1 flex gap-1"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <Button
        size="xs"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Translating..." : "Dịch"}
      </Button>
      <Button size="xs" variant="ghost" onClick={onCancel}>
        Save
      </Button>
    </div>,
    document.body,
  );
}
