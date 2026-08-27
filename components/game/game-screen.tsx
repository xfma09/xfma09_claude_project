"use client";

import { useEffect } from "react";

import { DungeonView } from "@/components/dungeon/dungeon-view";
import { NumberPad } from "@/components/sudoku/number-pad";
import { SudokuBoard } from "@/components/sudoku/board";
import { MAX_ENERGY, type GameState } from "@/lib/game/engine";
import { cn } from "@/lib/utils";

interface GameScreenProps {
  state: GameState;
  onSelectCell: (row: number, col: number) => void;
  onSubmitValue: (value: number) => void;
}

export function GameScreen({
  state,
  onSelectCell,
  onSubmitValue,
}: GameScreenProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!state.selectedCell) return;
      const value = Number(event.key);
      if (value >= 1 && value <= 9) onSubmitValue(value);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedCell, onSubmitValue]);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center gap-8 px-6 py-8 lg:flex-row lg:items-center lg:justify-center",
        state.attacking && "animate-[shake_0.35s_ease-in-out]"
      )}
    >
      <div className="flex w-full flex-col items-center gap-4 lg:max-w-md">
        <SudokuBoard
          board={state.board}
          given={state.given}
          selectedCell={state.selectedCell}
          onSelectCell={onSelectCell}
          autoFilledCells={state.autoFilledCells}
        />
        <NumberPad disabled={!state.selectedCell} onSubmit={onSubmitValue} />
      </div>
      <div className="flex w-full items-center justify-center lg:max-w-2xl">
        <DungeonView
          path={state.path}
          stepIndex={state.stepIndex}
          energy={state.energy}
          maxEnergy={MAX_ENERGY}
          attacking={state.attacking}
          className="w-full"
        />
      </div>
    </div>
  );
}
