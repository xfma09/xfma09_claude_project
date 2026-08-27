"use client";

import { Digit } from "@/components/sudoku/digit";
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
    <div className="w-full max-w-md">
      <div
        style={{ backgroundImage: "url(/dungeon/cave-bg.png)" }}
        className="rounded-2xl border border-[#3a3020] bg-cover bg-center p-2.5 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#141210]">
          <div
            aria-hidden
            style={{ backgroundImage: "url(/dungeon/cave-bg.png)" }}
            className="absolute inset-0 bg-cover bg-center opacity-[0.1]"
          />
          <div
            role="grid"
            aria-label="스도쿠 보드"
            className="relative grid h-full w-full grid-cols-9"
          >
            {board.map((row, rowIndex) =>
              row.map((value, colIndex) => {
                const isGiven = given[rowIndex]?.[colIndex] ?? false;
                const isSelected =
                  selectedCell?.row === rowIndex &&
                  selectedCell?.col === colIndex;
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
                      "flex items-center justify-center bg-black/35 transition-colors",
                      !isGiven &&
                        isBlank &&
                        "hover:bg-black/15 disabled:pointer-events-none",
                      isSelected &&
                        "z-10 bg-[#7a5a1a]/35 ring-2 ring-inset ring-[#e3c15c]",
                      colIndex % 3 === 0
                        ? "border-l-2 border-l-[#c9a227]"
                        : "border-l border-l-[#4a3f30]/60",
                      colIndex === 8
                        ? "border-r-2 border-r-[#c9a227]"
                        : "border-r border-r-[#4a3f30]/60",
                      rowIndex % 3 === 0
                        ? "border-t-2 border-t-[#c9a227]"
                        : "border-t border-t-[#4a3f30]/60",
                      rowIndex === 8
                        ? "border-b-2 border-b-[#c9a227]"
                        : "border-b border-b-[#4a3f30]/60"
                    )}
                  >
                    {value !== null && (
                      <div className="h-[60%] w-[60%]">
                        <Digit value={value} tone={isGiven ? "given" : "input"} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
