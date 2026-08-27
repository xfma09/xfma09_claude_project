"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PixelText } from "@/components/game/pixel-text";
import type { Difficulty } from "@/lib/sudoku/puzzle";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "EASY" },
  { value: "medium", label: "MEDIUM" },
  { value: "hard", label: "HARD" },
];

interface StartScreenProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  loading: boolean;
  errorMessage: string | null;
}

export function StartScreen({
  onSelectDifficulty,
  loading,
  errorMessage,
}: StartScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <PixelText text="스도쿠 대탈출" fontSize={26} scale={3} />

      <div className="flex flex-col items-center gap-4">
        <span className="text-sm text-muted-foreground">
          난이도를 고르면 시작합니다
        </span>
        <div className="flex gap-3">
          {DIFFICULTIES.map((d) => (
            <Button
              key={d.value}
              size="lg"
              disabled={loading}
              onClick={() => onSelectDifficulty(d.value)}
            >
              <PixelText text={d.label} fontSize={11} scale={2} />
            </Button>
          ))}
        </div>
        {loading && (
          <span className="text-xs text-muted-foreground">
            퍼즐을 받아오는 중...
          </span>
        )}
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="max-w-sm">
          <AlertTitle>퍼즐을 받아오지 못했습니다</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
