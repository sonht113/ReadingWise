"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MatchingHeadingProps {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MatchingHeading({
  question,
  options,
  value,
  onChange,
  disabled,
}: MatchingHeadingProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{question}</p>
      <Select value={value} onValueChange={(val) => onChange(val ?? "")} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select heading..." />
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
