import { generateEscapePath, type PathStep } from "@/lib/escape/path";
import {
  countBlanks,
  parseBoard,
  type Board,
  type Difficulty,
} from "@/lib/sudoku/puzzle";

export const MAX_ENERGY = 7;

// 빈칸 하나를 맞히는 데 주어지는 제한시간(ms). 난이도가 값을 정한다.
export const TURN_DURATION_MS: Record<Difficulty, number> = {
  easy: 30_000,
  medium: 45_000,
  hard: 90_000,
};

// "escaping"은 탈출이 확정된 뒤, 마지막 칸 자동완성과 용 퇴장 연출이
// 재생되는 동안 머무는 중간 상태다. 연출이 끝나야 "escaped"로 넘어간다.
export type Phase =
  | "start"
  | "loading"
  | "playing"
  | "escaping"
  | "escaped"
  | "dead";

export interface CellPosition {
  row: number;
  col: number;
}

export interface GameState {
  phase: Phase;
  difficulty: Difficulty | null;
  board: Board;
  given: boolean[][];
  solution: Board | null;
  path: PathStep[];
  stepIndex: number;
  energy: number;
  selectedCell: CellPosition | null;
  attacking: boolean;
  // 현재 턴(빈칸 하나)의 제한시간이 끝나는 시각(ms epoch). 흐르지 않는
  // 상태(로딩·탈출·사망)에서는 null이다.
  turnDeadline: number | null;
  // 마지막 빈칸이 남아 스도쿠 규칙상 자동으로 채워진 칸들. 애니메이션 트리거용.
  autoFilledCells: CellPosition[];
  startedAt: number | null;
  endedAt: number | null;
  errorMessage: string | null;
}

export type GameAction =
  | { type: "SELECT_DIFFICULTY"; difficulty: Difficulty }
  | { type: "PUZZLE_LOADED"; puzzle: string; solution: string; now: number }
  | { type: "PUZZLE_FAILED"; message: string }
  | { type: "SELECT_CELL"; row: number; col: number }
  | { type: "SUBMIT_VALUE"; value: number; now: number }
  | { type: "TIMEOUT"; now: number }
  | { type: "CLEAR_ATTACK" }
  | { type: "FINISH_ESCAPE" }
  | { type: "RESTART" };

export function createInitialState(): GameState {
  return {
    phase: "start",
    difficulty: null,
    board: [],
    given: [],
    solution: null,
    path: [],
    stepIndex: 0,
    energy: MAX_ENERGY,
    selectedCell: null,
    attacking: false,
    turnDeadline: null,
    autoFilledCells: [],
    startedAt: null,
    endedAt: null,
    errorMessage: null,
  };
}

// 오답과 시간초과는 똑같이 처리된다: 추격자에게 맞아 에너지가 한 칸 줄고,
// 남았으면 다음 턴의 제한시간이 다시 가득 차 새로 흐른다.
function applyHit(state: GameState, now: number): GameState {
  const energy = state.energy - 1;
  const dead = energy <= 0;
  const difficulty = state.difficulty ?? "easy";
  return {
    ...state,
    energy,
    attacking: true,
    phase: dead ? "dead" : "playing",
    endedAt: dead ? now : state.endedAt,
    turnDeadline: dead ? null : now + TURN_DURATION_MS[difficulty],
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_DIFFICULTY":
      return {
        ...state,
        phase: "loading",
        difficulty: action.difficulty,
        errorMessage: null,
      };

    case "PUZZLE_LOADED": {
      const board = parseBoard(action.puzzle);
      const solution = parseBoard(action.solution);
      const given = board.map((row) => row.map((cell) => cell !== null));
      const blanks = countBlanks(board);
      const difficulty = state.difficulty ?? "easy";
      return {
        ...state,
        phase: "playing",
        board,
        given,
        solution,
        path: generateEscapePath(blanks),
        stepIndex: 0,
        energy: MAX_ENERGY,
        selectedCell: null,
        attacking: false,
        turnDeadline: action.now + TURN_DURATION_MS[difficulty],
        autoFilledCells: [],
        startedAt: action.now,
        endedAt: null,
        errorMessage: null,
      };
    }

    case "PUZZLE_FAILED":
      return {
        ...state,
        phase: "start",
        difficulty: null,
        errorMessage: action.message,
      };

    case "SELECT_CELL": {
      if (state.phase !== "playing") return state;
      if (state.given[action.row]?.[action.col]) return state;
      if (state.board[action.row]?.[action.col] !== null) return state;
      return { ...state, selectedCell: { row: action.row, col: action.col } };
    }

    case "SUBMIT_VALUE": {
      if (state.phase !== "playing" || !state.selectedCell || !state.solution) {
        return state;
      }
      const { row, col } = state.selectedCell;
      const correct = state.solution[row][col] === action.value;

      if (correct) {
        const board = state.board.map((r) => [...r]);
        board[row][col] = action.value;
        let stepIndex = state.stepIndex + 1;
        const autoFilledCells: CellPosition[] = [];

        // 빈칸이 정확히 하나 남으면 그 값은 스도쿠 규칙상 이미 하나로
        // 결정돼 있으므로, 입력을 더 받지 않고 자동으로 채워 마무리한다.
        if (stepIndex === state.path.length - 1) {
          for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
              if (board[r][c] === null) {
                board[r][c] = state.solution[r][c];
                autoFilledCells.push({ row: r, col: c });
              }
            }
          }
          stepIndex += 1;
        }

        const escaped = stepIndex >= state.path.length;
        const difficulty = state.difficulty ?? "easy";
        return {
          ...state,
          board,
          stepIndex,
          selectedCell: null,
          attacking: false,
          autoFilledCells,
          // 탈출이 확정돼도 곧바로 "escaped"로 넘기지 않는다. 자동완성과 용
          // 퇴장 연출이 재생될 시간을 준 뒤 FINISH_ESCAPE로 마무리한다.
          phase: escaped ? "escaping" : "playing",
          endedAt: escaped ? action.now : state.endedAt,
          // 탈출이 확정되면 더 이상 턴이 없으므로 제한시간도 멈춘다.
          turnDeadline: escaped
            ? null
            : action.now + TURN_DURATION_MS[difficulty],
        };
      }

      return applyHit(state, action.now);
    }

    case "TIMEOUT": {
      if (state.phase !== "playing") return state;
      return applyHit(state, action.now);
    }

    case "CLEAR_ATTACK":
      return { ...state, attacking: false };

    case "FINISH_ESCAPE":
      if (state.phase !== "escaping") return state;
      return { ...state, phase: "escaped" };

    case "RESTART":
      return createInitialState();

    default:
      return state;
  }
}
