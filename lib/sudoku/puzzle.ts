export type Difficulty = "easy" | "medium" | "hard";

export type CellValue = number | null;

export type Board = CellValue[][];

export function parseBoard(raw: string): Board {
  if (raw.length !== 81) {
    throw new Error(`퍼즐 문자열은 81자여야 합니다 (받은 길이: ${raw.length})`);
  }

  const board: Board = [];
  for (let row = 0; row < 9; row++) {
    const cells: CellValue[] = [];
    for (let col = 0; col < 9; col++) {
      const ch = raw[row * 9 + col];
      cells.push(ch === "0" ? null : Number(ch));
    }
    board.push(cells);
  }
  return board;
}

export function countBlanks(board: Board): number {
  return board.reduce(
    (total, row) => total + row.filter((cell) => cell === null).length,
    0
  );
}
