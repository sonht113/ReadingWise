"use client";

import { Button } from "@/components/ui/button";

const TF_OPTIONS = ["TRUE", "FALSE", "NOT GIVEN"] as const;

interface TrueFalseNGProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TrueFalseNG({
  question,
  value,
  onChange,
  disabled,
}: TrueFalseNGProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{question}</p>
      <div className="flex gap-2">
        {TF_OPTIONS.map((option) => {
          const label =
            option === "TRUE"
              ? "True"
              : option === "FALSE"
                ? "False"
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
