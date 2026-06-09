"use client";

import { useState, useEffect, useCallback } from "react";

export interface SelectionState {
  startOffset: number;
  endOffset: number;
  selectedText: string;
  rect: DOMRect;
}

function getGlobalOffset(
  root: HTMLElement,
  targetNode: Node,
  targetOffset: number,
): number {
  let totalOffset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode === targetNode) {
      return totalOffset + targetOffset;
    }
    totalOffset += currentNode.textContent?.length ?? 0;
    currentNode = walker.nextNode();
  }

  return targetOffset;
}

export function useSelection(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  const [selection, setSelection] = useState<SelectionState | null>(null);

  useEffect(() => {
    function handleMouseUp() {
      const container = containerRef.current;
      if (!container) return;

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }

      const range = sel.getRangeAt(0);
      const selectedText = sel.toString().trim();
      if (!selectedText) {
        setSelection(null);
        return;
      }

      if (!container.contains(range.commonAncestorContainer)) return;

      const startOffset = getGlobalOffset(
        container,
        range.startContainer,
        range.startOffset,
      );
      const endOffset = getGlobalOffset(
        container,
        range.endContainer,
        range.endOffset,
      );

      const rect = range.getBoundingClientRect();

      setSelection({
        startOffset: Math.min(startOffset, endOffset),
        endOffset: Math.max(startOffset, endOffset),
        selectedText,
        rect,
      });
    }

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [containerRef]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  return { selection, clearSelection };
}
