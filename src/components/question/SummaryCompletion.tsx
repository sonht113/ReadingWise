"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SummaryCompletionProps {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SummaryCompletion({
  question,
  options,
  value,
  onChange,
  disabled,
}: SummaryCompletionProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground italic">{question}</p>
      <Select value={value} onValueChange={(val) => onChange(val ?? "")} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a word..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, i) => (
            <SelectItem key={i} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
