"use client";

import type { Board } from "@/lib/sudoku/puzzle";
import { cn } from "@/lib/utils";

interface SudokuBoardProps {
  board: Board;
  given: boolean[][];
  selectedCell: { row: number; col: number } | null;
  onSelectCell: (row: number, col: number) => void;
}

export function SudokuBoard({
  board,
  given,
  selectedCell,
  onSelectCell,
}: SudokuBoardProps) {
  return (
    <div
      role="grid"
      aria-label="스도쿠 보드"
      className="grid aspect-square w-full max-w-md grid-cols-9 gap-px overflow-hidden rounded-2xl border border-border bg-border"
    >
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const isGiven = given[rowIndex]?.[colIndex] ?? false;
          const isSelected =
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isBlank = value === null;

          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={
                isGiven
                  ? `${rowIndex + 1}행 ${colIndex + 1}열, 주어진 값 ${value}`
                  : `${rowIndex + 1}행 ${colIndex + 1}열, ${
                      isBlank ? "빈칸" : `입력값 ${value}`
                    }`
              }
              disabled={isGiven || !isBlank}
              onClick={() => onSelectCell(rowIndex, colIndex)}
              className={cn(
                "flex items-center justify-center bg-background text-base font-medium tabular-nums transition-colors",
                isGiven || !isBlank
                  ? "text-foreground/70"
                  : "text-primary hover:bg-muted disabled:pointer-events-none",
                isSelected && "bg-primary/15 ring-2 ring-inset ring-ring",
                colIndex % 3 === 0 && "border-l-2 border-l-border",
                colIndex === 8 && "border-r-2 border-r-border",
                rowIndex % 3 === 0 && "border-t-2 border-t-border",
                rowIndex === 8 && "border-b-2 border-b-border"
              )}
            >
              {value ?? ""}
            </button>
          );
        })
      )}
    </div>
  );
}
