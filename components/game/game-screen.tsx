"use client";

import { useEffect } from "react";

import { DungeonView } from "@/components/dungeon/dungeon-view";
import { NumberPad } from "@/components/sudoku/number-pad";
import { SudokuBoard } from "@/components/sudoku/board";
import { MAX_ENERGY, type GameState } from "@/lib/game/engine";

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
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-8 lg:flex-row lg:items-start lg:justify-center">
      <div className="flex w-full flex-col items-center gap-4 lg:max-w-md">
        <SudokuBoard
          board={state.board}
          given={state.given}
          selectedCell={state.selectedCell}
          onSelectCell={onSelectCell}
        />
        <NumberPad disabled={!state.selectedCell} onSubmit={onSubmitValue} />
      </div>
      <div className="w-full lg:max-w-md">
        <DungeonView
          path={state.path}
          stepIndex={state.stepIndex}
          energy={state.energy}
          maxEnergy={MAX_ENERGY}
          attacking={state.attacking}
        />
      </div>
    </div>
  );
}
