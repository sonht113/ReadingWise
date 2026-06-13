"use client";

import { useState } from "react";
import { useCollections, useDeleteCollection } from "@/hooks/useCollections";
import { useArticles, useDeleteArticle } from "@/hooks/useArticles";
import { useReaderStore } from "@/stores/reader-store";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { CollectionDialog } from "./CollectionDialog";
import { ThemeToggle } from "./ThemeToggle";
import { Trash2, Globe, FilePlus } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { ImportDialog } from "./ImportDialog";
import { CreateArticleDialog } from "./CreateArticleDialog";

interface SidebarProps {
  onArticleClick?: () => void;
}

export function Sidebar({ onArticleClick }: SidebarProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "collection" | "article";
    id: string;
    name: string;
  } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { data: collections, isLoading } = useCollections();
  const selectedCollectionId = expandedId;
  const { data: articles } = useArticles(selectedCollectionId);
  const openArticle = useReaderStore((s) => s.openArticle);
  const closeTab = useReaderStore((s) => s.closeTab);
  const { user, signOut } = useUser();
  const deleteCollection = useDeleteCollection();
  const deleteArticle = useDeleteArticle();

  const handleArticleClick = (articleId: string, title: string) => {
    openArticle(articleId, title);
    onArticleClick?.();
  };

  return (
    <aside className="w-84 border-r bg-sidebar flex flex-col shrink-0 h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          Collections
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {isLoading && (
          <p className="text-xs text-muted-foreground px-2">Loading...</p>
        )}
        {collections?.map((collection) => (
          <div key={collection.id}>
            <div className="flex items-center group">
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === collection.id ? null : collection.id,
                  )
                }
                className={`text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors flex-1 ${
                  expandedId === collection.id ? "bg-accent" : ""
                }`}
              >
                {collection.name}
              </button>
              <button
                onClick={() =>
                  setDeleteTarget({
                    type: "collection",
                    id: collection.id,
                    name: collection.name,
                  })
                }
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete collection"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            {expandedId === collection.id && (
              <div className="ml-3 mt-0.5 flex flex-col gap-0.5">
                {articles?.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-1">
                    No articles
                  </p>
                )}
                {articles?.map((article) => (
                  <div key={article.id} className="flex items-center group">
                    <button
                      onClick={() =>
                        handleArticleClick(article.id, article.title)
                      }
                      className="text-left px-2 py-1 rounded text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors truncate flex-1"
                    >
                      {article.title}
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: "article",
                          id: article.id,
                          name: article.title,
                        })
                      }
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete article"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex flex-col gap-2">
        {user && (
          <p className="text-xs text-muted-foreground px-1 truncate">
            {user.email}
          </p>
        )}
        <CollectionDialog />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setImportOpen(true)}
        >
          <Globe className="mr-2 size-3.5" />
          Import URL
        </Button>
        <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setCreateOpen(true)}
        >
          <FilePlus className="mr-2 size-3.5" />
          Create Article
        </Button>
        <CreateArticleDialog open={createOpen} onOpenChange={setCreateOpen} />
        <div className="flex items-center justify-between">
          <ThemeToggle />
          {user && (
            <Button
              variant="ghost"
              size="xs"
              onClick={signOut}
              className="text-xs"
            >
              Sign out
            </Button>
          )}
        </div>
      </div>
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.type === "collection") {
            await deleteCollection.mutateAsync(deleteTarget.id);
          } else {
            await deleteArticle.mutateAsync(deleteTarget.id);
            closeTab(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
        title={
          deleteTarget?.type === "collection"
            ? "Delete Collection"
            : "Delete Article"
        }
        description={
          deleteTarget?.type === "collection"
            ? `Are you sure you want to delete "${deleteTarget?.name}" and all its articles? This action cannot be undone.`
            : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        isPending={deleteCollection.isPending || deleteArticle.isPending}
      />
    </aside>
  );
}
