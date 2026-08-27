"use client";

import { type ReactNode, useEffect, useReducer } from "react";

import { DeathScreen } from "@/components/game/death-screen";
import { EscapeScreen } from "@/components/game/escape-screen";
import { GameScreen } from "@/components/game/game-screen";
import { StartScreen } from "@/components/game/start-screen";
import {
  createInitialState,
  gameReducer,
  type GameState,
} from "@/lib/game/engine";
import type { Difficulty } from "@/lib/sudoku/puzzle";

const ATTACK_ANIMATION_MS = 400;
// 용이 천천히 점멸하며 가라앉는 퇴장 연출(DRAGON_EXIT_MS, dungeon-view.tsx)이
// 다 재생될 시간을 준 뒤에 결과 화면으로 넘어간다.
const ESCAPE_TRANSITION_MS = 1600;

interface GameAppProps {
  // 시작 상태를 다르게 주입하고 싶을 때 쓴다(예: 테스트 라우트). 기본은
  // 실제 게임과 동일하게 시작 화면(createInitialState)에서 출발한다.
  initialState?: () => GameState;
  // 시작 상태를 주입했을 때, 화면 위에 상황을 설명하는 배너를 얹고 싶으면 쓴다.
  banner?: ReactNode;
}

/** 실제 게임 페이지(app/page.tsx)와 테스트 라우트가 함께 쓰는 게임 진행 로직. */
export function GameApp({ initialState, banner }: GameAppProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    initialState ?? createInitialState
  );

  async function handleSelectDifficulty(difficulty: Difficulty) {
    dispatch({ type: "SELECT_DIFFICULTY", difficulty });
    try {
      const response = await fetch(`/api/puzzle?difficulty=${difficulty}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "퍼즐을 받아오지 못했습니다.");
      }
      dispatch({
        type: "PUZZLE_LOADED",
        puzzle: data.puzzle,
        solution: data.solution,
        now: Date.now(),
      });
    } catch (error) {
      dispatch({
        type: "PUZZLE_FAILED",
        message:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    }
  }

  useEffect(() => {
    if (!state.attacking) return;
    const timer = setTimeout(
      () => dispatch({ type: "CLEAR_ATTACK" }),
      ATTACK_ANIMATION_MS
    );
    return () => clearTimeout(timer);
  }, [state.attacking]);

  useEffect(() => {
    if (state.phase !== "escaping") return;
    const timer = setTimeout(
      () => dispatch({ type: "FINISH_ESCAPE" }),
      ESCAPE_TRANSITION_MS
    );
    return () => clearTimeout(timer);
  }, [state.phase]);

  // 턴 제한시간이 끝나는 정확한 시각에 시간초과를 알린다. 정답이든
  // 시간초과든 새 턴이 시작될 때마다 turnDeadline이 갱신되므로, 그때마다
  // 이 타이머도 다시 걸린다.
  useEffect(() => {
    if (state.phase !== "playing" || state.turnDeadline === null) return;
    const remaining = state.turnDeadline - Date.now();
    const timer = setTimeout(
      () => dispatch({ type: "TIMEOUT", now: Date.now() }),
      Math.max(0, remaining)
    );
    return () => clearTimeout(timer);
  }, [state.phase, state.turnDeadline]);

  const screen = (() => {
    if (state.phase === "start" || state.phase === "loading") {
      return (
        <StartScreen
          onSelectDifficulty={handleSelectDifficulty}
          loading={state.phase === "loading"}
          errorMessage={state.errorMessage}
        />
      );
    }

    if (state.phase === "escaped") {
      return (
        <EscapeScreen
          elapsedMs={(state.endedAt ?? 0) - (state.startedAt ?? 0)}
          onRestart={() => dispatch({ type: "RESTART" })}
        />
      );
    }

    if (state.phase === "dead") {
      return <DeathScreen onRestart={() => dispatch({ type: "RESTART" })} />;
    }

    return (
      <GameScreen
        state={state}
        onSelectCell={(row, col) => dispatch({ type: "SELECT_CELL", row, col })}
        onSubmitValue={(value) =>
          dispatch({ type: "SUBMIT_VALUE", value, now: Date.now() })
        }
      />
    );
  })();

  if (!banner) return screen;

  return (
    <div className="flex flex-1 flex-col">
      {banner}
      <div className="flex flex-1 flex-col">{screen}</div>
    </div>
  );
}
