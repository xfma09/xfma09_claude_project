import { describe, expect, test } from "vitest";

import {
  createInitialState,
  gameReducer,
  MAX_ENERGY,
} from "@/lib/game/engine";

// 3x3만 채워진 아주 작은 퍼즐: 나머지 78칸은 빈칸이다.
const PUZZLE =
  "123" + "0".repeat(78);
const SOLUTION =
  "123456789456789123789123456234567891567891234891234567345678912678912345912345678";

function loaded() {
  const start = createInitialState();
  const withDifficulty = gameReducer(start, {
    type: "SELECT_DIFFICULTY",
    difficulty: "easy",
  });
  return gameReducer(withDifficulty, {
    type: "PUZZLE_LOADED",
    puzzle: PUZZLE,
    solution: SOLUTION,
    now: 1000,
  });
}

describe("createInitialState", () => {
  test("시작 화면 상태에서 출발한다", () => {
    const state = createInitialState();
    expect(state.phase).toBe("start");
    expect(state.difficulty).toBeNull();
    expect(state.errorMessage).toBeNull();
  });
});

describe("SELECT_DIFFICULTY", () => {
  test("난이도를 고르면 로딩 상태로 바뀐다", () => {
    const state = gameReducer(createInitialState(), {
      type: "SELECT_DIFFICULTY",
      difficulty: "medium",
    });
    expect(state.phase).toBe("loading");
    expect(state.difficulty).toBe("medium");
  });
});

describe("PUZZLE_LOADED", () => {
  test("퍼즐을 받으면 플레이 상태가 되고 경로 길이가 빈칸 수와 같다", () => {
    const state = loaded();
    expect(state.phase).toBe("playing");
    expect(state.energy).toBe(MAX_ENERGY);
    expect(state.stepIndex).toBe(0);
    expect(state.startedAt).toBe(1000);

    const blanks = PUZZLE.split("").filter((ch) => ch === "0").length;
    expect(state.path).toHaveLength(blanks);
  });
});

describe("PUZZLE_FAILED", () => {
  test("실패하면 시작 화면으로 돌아가고 에러 메시지가 남는다", () => {
    const withDifficulty = gameReducer(createInitialState(), {
      type: "SELECT_DIFFICULTY",
      difficulty: "easy",
    });
    const state = gameReducer(withDifficulty, {
      type: "PUZZLE_FAILED",
      message: "네트워크 오류",
    });
    expect(state.phase).toBe("start");
    expect(state.errorMessage).toBe("네트워크 오류");
  });
});

describe("SELECT_CELL / SUBMIT_VALUE", () => {
  test("빈칸을 골라 정답을 넣으면 한 걸음 전진한다", () => {
    let state = loaded();
    state = gameReducer(state, { type: "SELECT_CELL", row: 0, col: 3 });
    expect(state.selectedCell).toEqual({ row: 0, col: 3 });

    state = gameReducer(state, {
      type: "SUBMIT_VALUE",
      value: 4,
      now: 1500,
    });
    expect(state.board[0][3]).toBe(4);
    expect(state.stepIndex).toBe(1);
    expect(state.energy).toBe(MAX_ENERGY);
    expect(state.attacking).toBe(false);
    expect(state.phase).toBe("playing");
  });

  test("이미 정답을 맞힌 칸은 다시 선택할 수 없다", () => {
    let state = loaded();
    state = gameReducer(state, { type: "SELECT_CELL", row: 0, col: 3 });
    state = gameReducer(state, { type: "SUBMIT_VALUE", value: 4, now: 1500 });
    expect(state.stepIndex).toBe(1);

    state = gameReducer(state, { type: "SELECT_CELL", row: 0, col: 3 });
    expect(state.selectedCell).toBeNull();

    state = gameReducer(state, { type: "SUBMIT_VALUE", value: 4, now: 1600 });
    expect(state.stepIndex).toBe(1);
  });

  test("오답을 넣으면 에너지가 줄고 피격 상태가 된다", () => {
    let state = loaded();
    state = gameReducer(state, { type: "SELECT_CELL", row: 0, col: 3 });
    state = gameReducer(state, {
      type: "SUBMIT_VALUE",
      value: 9,
      now: 1500,
    });
    expect(state.board[0][3]).toBeNull();
    expect(state.stepIndex).toBe(0);
    expect(state.energy).toBe(MAX_ENERGY - 1);
    expect(state.attacking).toBe(true);
    expect(state.phase).toBe("playing");
  });

  test("주어진 칸(원래 숫자가 있던 칸)은 선택할 수 없다", () => {
    let state = loaded();
    state = gameReducer(state, { type: "SELECT_CELL", row: 0, col: 0 });
    expect(state.selectedCell).toBeNull();
  });

  test("에너지가 0이 되면 사망 상태가 된다", () => {
    let state = loaded();
    for (let i = 0; i < MAX_ENERGY; i++) {
      state = gameReducer(state, { type: "SELECT_CELL", row: 0, col: 3 });
      state = gameReducer(state, {
        type: "SUBMIT_VALUE",
        value: 9,
        now: 2000 + i,
      });
    }
    expect(state.energy).toBe(0);
    expect(state.phase).toBe("dead");
    expect(state.endedAt).toBe(2000 + MAX_ENERGY - 1);
  });

  test("빈칸이 하나 남으면 자동으로 채워지며 탈출 상태가 된다", () => {
    const blankCells: Array<{ row: number; col: number }> = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (PUZZLE[row * 9 + col] === "0") blankCells.push({ row, col });
      }
    }

    // 마지막 한 칸의 값은 나머지가 다 정해지면 스도쿠 규칙상 하나로 결정되므로,
    // 입력 없이 자동으로 채워진다. 그래서 그 앞까지만 직접 입력한다.
    const toFillManually = blankCells.slice(0, -1);
    let state = loaded();
    toFillManually.forEach(({ row, col }, i) => {
      state = gameReducer(state, { type: "SELECT_CELL", row, col });
      const value = Number(SOLUTION[row * 9 + col]);
      state = gameReducer(state, {
        type: "SUBMIT_VALUE",
        value,
        now: 3000 + i,
      });
    });

    const lastCell = blankCells[blankCells.length - 1];
    expect(state.board[lastCell.row][lastCell.col]).toBe(
      Number(SOLUTION[lastCell.row * 9 + lastCell.col])
    );
    // 탈출 확정 직후에는 연출을 위해 "escaping"에 머무르고,
    // FINISH_ESCAPE가 와야 비로소 "escaped"로 넘어간다.
    expect(state.phase).toBe("escaping");
    expect(state.stepIndex).toBe(blankCells.length);
    expect(state.endedAt).toBe(3000 + toFillManually.length - 1);
    expect(state.autoFilledCells).toEqual([lastCell]);

    state = gameReducer(state, { type: "FINISH_ESCAPE" });
    expect(state.phase).toBe("escaped");
  });
});

describe("FINISH_ESCAPE", () => {
  test("escaping 상태가 아니면 아무 효과가 없다", () => {
    const state = loaded();
    const next = gameReducer(state, { type: "FINISH_ESCAPE" });
    expect(next).toBe(state);
  });
});

describe("CLEAR_ATTACK", () => {
  test("피격 애니메이션이 끝나면 attacking을 끈다", () => {
    let state = loaded();
    state = gameReducer(state, { type: "SELECT_CELL", row: 0, col: 3 });
    state = gameReducer(state, { type: "SUBMIT_VALUE", value: 9, now: 1500 });
    expect(state.attacking).toBe(true);

    state = gameReducer(state, { type: "CLEAR_ATTACK" });
    expect(state.attacking).toBe(false);
  });
});

describe("RESTART", () => {
  test("초기 상태로 되돌아간다", () => {
    const state = gameReducer(loaded(), { type: "RESTART" });
    expect(state).toEqual(createInitialState());
  });
});
