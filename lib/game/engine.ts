import { generateEscapePath, type PathStep } from "@/lib/escape/path";
import {
  countBlanks,
  parseBoard,
  type Board,
  type Difficulty,
} from "@/lib/sudoku/puzzle";

export const MAX_ENERGY = 7;

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
    autoFilledCells: [],
    startedAt: null,
    endedAt: null,
    errorMessage: null,
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
        };
      }

      const energy = state.energy - 1;
      const dead = energy <= 0;
      return {
        ...state,
        energy,
        attacking: true,
        phase: dead ? "dead" : "playing",
        endedAt: dead ? action.now : state.endedAt,
      };
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
