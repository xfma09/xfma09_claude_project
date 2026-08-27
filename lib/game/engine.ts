import { generateEscapePath, type PathStep } from "@/lib/escape/path";
import {
  countBlanks,
  parseBoard,
  type Board,
  type Difficulty,
} from "@/lib/sudoku/puzzle";

export const MAX_ENERGY = 7;

export type Phase = "start" | "loading" | "playing" | "escaped" | "dead";

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
        const stepIndex = state.stepIndex + 1;
        const escaped = stepIndex >= state.path.length;
        return {
          ...state,
          board,
          stepIndex,
          selectedCell: null,
          attacking: false,
          phase: escaped ? "escaped" : "playing",
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

    case "RESTART":
      return createInitialState();

    default:
      return state;
  }
}
