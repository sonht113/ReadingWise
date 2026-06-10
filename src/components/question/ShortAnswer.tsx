"use client";

import { Input } from "@/components/ui/input";

interface ShortAnswerProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ShortAnswer({
  question,
  value,
  onChange,
  disabled,
}: ShortAnswerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{question}</p>
      <Input
        placeholder="Answer in no more than 3 words..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="max-w-sm"
      />
    </div>
  );
}
