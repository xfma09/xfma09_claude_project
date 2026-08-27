"use client";

import { Button } from "@/components/ui/button";
import { PixelText } from "@/components/game/pixel-text";
import { formatDuration } from "@/lib/game/format-duration";

interface EscapeScreenProps {
  elapsedMs: number;
  onRestart: () => void;
}

export function EscapeScreen({ elapsedMs, onRestart }: EscapeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <PixelText text="ESCAPED!" fontSize={26} scale={3} color="#c9a227" />
      <p className="text-sm text-muted-foreground">
        던전을 탈출했습니다. 걸린 시간
      </p>
      <PixelText text={formatDuration(elapsedMs)} fontSize={22} scale={3} />
      <Button size="lg" onClick={onRestart}>
        새로 시작
      </Button>
    </div>
  );
}
