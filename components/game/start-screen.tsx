"use client";

import { useState } from "react";
import { Song_Myung, UnifrakturMaguntia } from "next/font/google";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PixelText } from "@/components/game/pixel-text";
import type { Difficulty } from "@/lib/sudoku/puzzle";

const titleFont = Song_Myung({ weight: "400" });
const flavorFont = UnifrakturMaguntia({ weight: "400" });

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "쉬운 던전" },
  { value: "medium", label: "보통 던전" },
  { value: "hard", label: "어려운 던전" },
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
  const [focused, setFocused] = useState<Difficulty>("easy");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 bg-black px-6 py-16">
      <div className="flex flex-col items-center gap-2">
        <PixelText
          text="스도쿠 대탈출"
          fontSize={30}
          scale={3}
          color="#e3c15c"
          shadowColor="#3a2a0f"
          fontFamily={titleFont.style.fontFamily}
        />
        <PixelText
          text="DUNGEON ESCAPE"
          fontSize={16}
          scale={2}
          color="#8a7550"
          fontFamily={flavorFont.style.fontFamily}
        />
      </div>

      <p className="max-w-xs text-center text-sm leading-relaxed text-[#b9ac8c]">
        빈칸을 맞힐 때마다 한 걸음 전진합니다.
        <br />
        틀리면 추격자에게 붙잡혀 에너지를 잃습니다.
      </p>

      <nav
        aria-label="난이도 선택"
        className="flex flex-col items-start gap-3 border border-[#3a3020] bg-[#0d0a06] px-8 py-6"
      >
        {DIFFICULTIES.map((d) => {
          const isFocused = focused === d.value;
          return (
            <button
              key={d.value}
              type="button"
              disabled={loading}
              onMouseEnter={() => setFocused(d.value)}
              onFocus={() => setFocused(d.value)}
              onClick={() => onSelectDifficulty(d.value)}
              className="flex items-center gap-2 text-left transition-colors disabled:pointer-events-none disabled:opacity-40"
            >
              <span
                className="w-4 text-[#e3c15c]"
                style={{ opacity: isFocused ? 1 : 0 }}
              >
                ▸
              </span>
              <PixelText
                text={d.label}
                fontSize={13}
                scale={2}
                color={isFocused ? "#f4dfa0" : "#9a8b68"}
              />
            </button>
          );
        })}
      </nav>

      {loading && (
        <span className="text-xs text-[#8a7550]">퍼즐을 받아오는 중...</span>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="max-w-sm">
          <AlertTitle>퍼즐을 받아오지 못했습니다</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
