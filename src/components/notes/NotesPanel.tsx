"use client";

import { useState, useRef, useCallback } from "react";
import { X, Trash2 } from "lucide-react";
import { useReaderStore } from "@/stores/reader-store";
import { useArticleNote, useSaveNote, useDeleteNote } from "@/hooks/useArticleNotes";
import { NoteEditor } from "./NoteEditor";
import { Button } from "@/components/ui/button";
import {
  ConfirmDeleteDialog,
} from "@/components/ui/confirm-delete-dialog";

function NotesEditorContent({ noteContent }: { noteContent: string | undefined }) {
  const activeTabId = useReaderStore((s) => s.activeTabId);
  const toggleNotes = useReaderStore((s) => s.toggleNotes);
  const saveNote = useSaveNote(activeTabId ?? "");
  const deleteNote = useDeleteNote(activeTabId ?? "");

  const [content, setContent] = useState(noteContent ?? "");
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving" | "error">("saved");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasNote, setHasNote] = useState(!!noteContent);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSave = useCallback(
    async (html: string) => {
      if (!activeTabId) return;
      setSaveStatus("saving");
      try {
        await saveNote.mutateAsync(html);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [activeTabId, saveNote],
  );

  const handleChange = useCallback(
    (html: string) => {
      setContent(html);
      setSaveStatus("unsaved");

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        doSave(html);
      }, 2000);
    },
    [doSave],
  );

  const handleManualSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    doSave(content);
  }, [doSave, content]);

  const handleDelete = useCallback(async () => {
    if (!activeTabId) return;
    try {
      await deleteNote.mutateAsync();
      setContent("");
      setHasNote(false);
      setSaveStatus("saved");
      setShowDeleteConfirm(false);
    } catch {
      setSaveStatus("error");
    }
  }, [activeTabId, deleteNote]);

  const statusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Save failed";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Notes</h3>
          {saveStatus === "unsaved" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={handleManualSave}
            >
              Save
            </Button>
          )}
          <span
            className={`text-xs ${
              saveStatus === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {statusText()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasNote && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleNotes}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <NoteEditor
          content={content}
          onChange={handleChange}
          editable={!saveNote.isPending}
        />
      </div>

      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        isPending={deleteNote.isPending}
      />
    </>
  );
}

export function NotesPanel() {
  const activeTabId = useReaderStore((s) => s.activeTabId);
  const toggleNotes = useReaderStore((s) => s.toggleNotes);
  const { data: note, isLoading } = useArticleNote(activeTabId);

  return (
    <div className="w-96 border-l bg-background flex flex-col shrink-0 h-full">
      {isLoading ? (
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
          <h3 className="text-sm font-semibold">Notes</h3>
          <button
            type="button"
            onClick={toggleNotes}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0" key={activeTabId}>
          <NotesEditorContent noteContent={note?.content} />
        </div>
      )}
    </div>
  );
}
