"use client";

import { Button } from "@/components/ui/button";

interface NumberPadProps {
  disabled: boolean;
  onSubmit: (value: number) => void;
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function NumberPad({ disabled, onSubmit }: NumberPadProps) {
  return (
    <div
      role="group"
      aria-label="숫자 입력"
      className="grid w-full max-w-md grid-cols-9 gap-1.5"
    >
      {NUMBERS.map((n) => (
        <Button
          key={n}
          variant="secondary"
          size="icon"
          disabled={disabled}
          onClick={() => onSubmit(n)}
        >
          {n}
        </Button>
      ))}
    </div>
  );
}
