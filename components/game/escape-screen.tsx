"use client";

import { PixelText } from "@/components/game/pixel-text";
import { formatDuration } from "@/lib/game/format-duration";

interface EscapeScreenProps {
  elapsedMs: number;
  onRestart: () => void;
}

export function EscapeScreen({ elapsedMs, onRestart }: EscapeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-black px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <PixelText text="ESCAPED!" fontSize={26} scale={3} color="#4de8e8" />
        <PixelText
          text="던전을 탈출했습니다"
          fontSize={13}
          scale={2}
          color="#8ee0e0"
        />
        <PixelText
          text={formatDuration(elapsedMs)}
          fontSize={22}
          scale={3}
          color="#4de8e8"
        />
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="border border-[#204040] bg-[#050d0d] px-6 py-3 transition-colors hover:bg-[#0a1a1a]"
      >
        <PixelText text="새로 시작" fontSize={13} scale={2} color="#8ee0e0" />
      </button>
    </div>
  );
}
