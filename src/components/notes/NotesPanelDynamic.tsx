"use client";

import dynamic from "next/dynamic";

const NotesPanel = dynamic(
  () => import("./NotesPanel").then((m) => ({ default: m.NotesPanel })),
  { ssr: false },
);

export function NotesPanelDynamic() {
  return <NotesPanel />;
}
