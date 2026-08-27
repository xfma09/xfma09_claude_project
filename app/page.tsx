"use client";

import { useEffect, useReducer } from "react";

import { DeathScreen } from "@/components/game/death-screen";
import { EscapeScreen } from "@/components/game/escape-screen";
import { GameScreen } from "@/components/game/game-screen";
import { StartScreen } from "@/components/game/start-screen";
import { createInitialState, gameReducer } from "@/lib/game/engine";
import type { Difficulty } from "@/lib/sudoku/puzzle";

const ATTACK_ANIMATION_MS = 400;

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

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
}
