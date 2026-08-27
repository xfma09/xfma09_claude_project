"use client";

import { Cinzel } from "next/font/google";

import { PixelText } from "@/components/game/pixel-text";

const titleFont = Cinzel({ weight: "600", subsets: ["latin"] });

interface DeathScreenProps {
  onRestart: () => void;
}

export function DeathScreen({ onRestart }: DeathScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 bg-black px-6 py-16">
      <div className="border-t border-b border-[#4a2020] px-10 py-4 sm:px-16">
        <PixelText
          text="YOU DIED"
          fontSize={32}
          scale={3}
          color="#7a1414"
          shadowColor="#1a0505"
          letterSpacing={10}
          fontFamily={titleFont.style.fontFamily}
        />
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="border border-[#3a3020] bg-[#0d0a06] px-6 py-3 transition-colors hover:bg-[#1a1510]"
      >
        <PixelText text="새로 시작" fontSize={13} scale={2} color="#c9bfa0" />
      </button>
    </div>
  );
}
