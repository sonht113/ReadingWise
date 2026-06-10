"use client";

import { Button } from "@/components/ui/button";

const YN_OPTIONS = ["YES", "NO", "NOT GIVEN"] as const;

interface YesNoNGProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function YesNoNG({
  question,
  value,
  onChange,
  disabled,
}: YesNoNGProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{question}</p>
      <div className="flex gap-2">
        {YN_OPTIONS.map((option) => {
          const label =
            option === "YES"
              ? "Yes"
              : option === "NO"
                ? "No"
                : "Not Given";
          return (
            <Button
              key={option}
              variant={value === option ? "default" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => onChange(value === option ? "" : option)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
