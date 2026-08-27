"use client";

import { Button } from "@/components/ui/button";
import { PixelText } from "@/components/game/pixel-text";

interface DeathScreenProps {
  onRestart: () => void;
}

export function DeathScreen({ onRestart }: DeathScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-black px-6 py-16">
      <PixelText text="YOU DIED" fontSize={28} scale={3} color="#c0392b" />
      <p className="text-sm text-muted-foreground">던전이 무너졌습니다.</p>
      <Button size="lg" variant="destructive" onClick={onRestart}>
        새로 시작
      </Button>
    </div>
  );
}
