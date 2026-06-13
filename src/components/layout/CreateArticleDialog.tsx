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
  DialogDescription,
} from "@/components/ui/dialog";
import { useCollections } from "@/hooks/useCollections";
import { useReaderStore } from "@/stores/reader-store";
import type { ParsedArticleInput } from "@/lib/openrouter";

interface CreateArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCollectionId?: string;
}

export function CreateArticleDialog({
  open,
  onOpenChange,
  defaultCollectionId,
}: CreateArticleDialogProps) {
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedArticleInput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedQuestions, setEditedQuestions] = useState<
    ParsedArticleInput["questions"]
  >([]);

  const { data: collections } = useCollections();
  const [collectionId, setCollectionId] = useState(
    defaultCollectionId ?? "",
  );
  const queryClient = useQueryClient();
  const openArticle = useReaderStore((s) => s.openArticle);

  const reset = () => {
    setRawText("");
    setParsed(null);
    setEditedTitle("");
    setEditedContent("");
    setEditedQuestions([]);
    setError("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;

    setIsAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/articles/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: rawText.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Analysis failed");
      }

      const result: ParsedArticleInput = await res.json();
      setParsed(result);
      setEditedTitle(result.title);
      setEditedContent(result.content);
      setEditedQuestions([...result.questions]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreate = async () => {
    if (!collectionId || !editedTitle || !editedContent || editedQuestions.length === 0) return;

    setIsCreating(true);
    setError("");

    try {
      const res = await fetch("/api/articles/with-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId,
          title: editedTitle,
          content: editedContent,
          questions: editedQuestions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Creation failed");
      }

      const { article } = await res.json();

      queryClient.invalidateQueries({ queryKey: ["articles"] });
      openArticle(article.id, article.title);
      handleOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Creation failed");
    } finally {
      setIsCreating(false);
    }
  };

  const updateQuestion = (
    index: number,
    field: "type" | "question" | "answer",
    value: string,
  ) => {
    setEditedQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const updateOptions = (index: number, optionsStr: string) => {
    const opts = optionsStr
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setEditedQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, options: opts.length > 0 ? opts : null } : q,
      ),
    );
  };

  const needsOptions = (type: string) =>
    ["multiple_choice", "matching_heading", "matching_info", "summary_completion"].includes(type);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Article</DialogTitle>
          <DialogDescription>
            Paste an IELTS passage with its questions and answers. AI will parse it into structured data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-2">
            <label className="text-sm font-medium">Collection</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full h-9 rounded-md border bg-background px-3 py-1 text-sm"
              disabled={!!parsed}
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

          {!parsed ? (
            <>
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <label className="text-sm font-medium">
                  Paste raw text
                </label>
                <textarea
                  className="flex-1 min-h-[200px] rounded-md border bg-background px-3 py-2 text-sm font-mono resize-none"
                  placeholder="Paste the title, passage, questions and answers here — any format is fine..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isAnalyzing}>
                  Cancel
                </Button>
                <Button onClick={handleAnalyze} disabled={!rawText.trim() || !collectionId || isAnalyzing}>
                  {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content (Passage)</label>
                  <textarea
                    className="w-full h-32 rounded-md border bg-background px-3 py-2 text-sm resize-none"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Questions ({editedQuestions.length})
                  </label>
                  {editedQuestions.map((q, i) => (
                    <div key={i} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground shrink-0">
                          Q{i + 1}
                        </span>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(i, "type", e.target.value)}
                          className="h-8 rounded border bg-background px-2 text-xs"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false_not_given">True/False/NG</option>
                          <option value="yes_no_not_given">Yes/No/NG</option>
                          <option value="matching_heading">Matching Heading</option>
                          <option value="matching_info">Matching Info</option>
                          <option value="fill_in_blank">Fill in Blank</option>
                          <option value="summary_completion">Summary Completion</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                      </div>

                      <Input
                        value={q.question}
                        onChange={(e) => updateQuestion(i, "question", e.target.value)}
                        placeholder="Question text"
                        className="text-sm"
                      />

                      <Input
                        value={q.answer}
                        onChange={(e) => updateQuestion(i, "answer", e.target.value)}
                        placeholder="Correct answer"
                        className="text-sm"
                      />

                      {needsOptions(q.type) && (
                        <textarea
                          className="w-full h-20 rounded-md border bg-background px-3 py-2 text-xs font-mono resize-none"
                          value={(q.options ?? []).join("\n")}
                          onChange={(e) => updateOptions(i, e.target.value)}
                          placeholder="Options — one per line"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive shrink-0">{error}</p>
              )}

              <div className="flex justify-end gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setParsed(null);
                    setError("");
                  }}
                  disabled={isCreating}
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!collectionId || !editedTitle || !editedContent || editedQuestions.length === 0 || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Article"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
