"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MultipleChoiceProps {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MultipleChoice({
  question,
  options,
  value,
  onChange,
  disabled,
}: MultipleChoiceProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{question}</p>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {options.map((option, i) => (
          <div key={i} className="flex items-center gap-2">
            <RadioGroupItem value={option} id={`mc-${i}`} />
            <Label htmlFor={`mc-${i}`} className="text-sm cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
