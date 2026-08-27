import { describe, expect, test } from "vitest";

import { countBlanks, parseBoard } from "@/lib/sudoku/puzzle";

const RAW =
  "003620905040009000920000300004072003030180409089345100300051004050000820708260501";

describe("parseBoard", () => {
  test("81자 문자열을 9x9 보드로 바꾼다", () => {
    const board = parseBoard(RAW);

    expect(board).toHaveLength(9);
    board.forEach((row) => expect(row).toHaveLength(9));
    expect(board[0]).toEqual([null, null, 3, 6, 2, null, 9, null, 5]);
  });

  test("0은 빈칸(null)으로 바꾼다", () => {
    const board = parseBoard(RAW);
    expect(board[0][0]).toBeNull();
    expect(board[0][2]).toBe(3);
  });

  test("81자가 아니면 오류를 던진다", () => {
    expect(() => parseBoard("123")).toThrowError();
  });
});

describe("countBlanks", () => {
  test("빈칸 개수를 센다", () => {
    const board = parseBoard(RAW);
    const blanks = RAW.split("").filter((ch) => ch === "0").length;
    expect(countBlanks(board)).toBe(blanks);
  });
});
