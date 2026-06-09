"use client";

import { Input } from "@/components/ui/input";

interface FillInBlankProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function FillInBlank({
  question,
  value,
  onChange,
  disabled,
}: FillInBlankProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{question}</p>
      <Input
        placeholder="Type your answer..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="max-w-xs"
      />
    </div>
  );
}
