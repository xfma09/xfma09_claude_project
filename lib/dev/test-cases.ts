import { createInitialState, gameReducer, type GameState } from "@/lib/game/engine";

// 실제 API 응답 없이 로컬에서 바로 게임을 구성하기 위한 고정 퍼즐.
// 빈칸 43개짜리 easy 난이도 표본이다.
const PUZZLE =
  "607501080100870000300900000540037820710000000280640070061750204932080710000012600";
const SOLUTION =
  "697521483154873962328964157546137829713298546289645371861759234932486715475312698";

function loadedState(): GameState {
  const now = Date.now();
  let state = createInitialState();
  state = gameReducer(state, { type: "SELECT_DIFFICULTY", difficulty: "easy" });
  state = gameReducer(state, {
    type: "PUZZLE_LOADED",
    puzzle: PUZZLE,
    solution: SOLUTION,
    now,
  });
  return state;
}

export interface AlmostEscapedCase {
  state: GameState;
  hintRow: number;
  hintCol: number;
  hintValue: number;
}

/** 마지막 빈칸 하나만 남기고 나머지를 전부 채운 상태. 자동완성 애니메이션과
 * 용 퇴장 연출을 곧바로 확인할 수 있다. */
export function buildAlmostEscapedState(): AlmostEscapedCase {
  let state = loadedState();
  const blanks: { row: number; col: number }[] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (state.board[row]?.[col] === null) blanks.push({ row, col });
    }
  }

  // 마지막 한 칸은 정답을 넣어도 스도쿠 규칙상 남은 한 칸이 자동으로
  // 채워지는 engine.ts 로직(빈칸이 정확히 하나 남을 때 자동완성)이 있으므로,
  // 사용자가 실제로 클릭할 빈칸을 하나 남기려면 마지막 두 칸을 남겨야 한다.
  const toFillManually = blanks.slice(0, -2);
  const now = Date.now();
  toFillManually.forEach(({ row, col }, i) => {
    state = gameReducer(state, { type: "SELECT_CELL", row, col });
    const value = state.solution![row][col]!;
    state = gameReducer(state, {
      type: "SUBMIT_VALUE",
      value,
      now: now + i + 1,
    });
  });

  const hintCell = blanks[blanks.length - 2];
  const hintValue = state.solution![hintCell.row][hintCell.col]!;
  return { state, hintRow: hintCell.row, hintCol: hintCell.col, hintValue };
}

/** 방금 시작한 상태. 아무 빈칸이나 골라 오답을 넣으면 피격/흔들림 연출을
 * 바로 확인할 수 있다. */
export function buildFreshPlayingState(): GameState {
  return loadedState();
}
