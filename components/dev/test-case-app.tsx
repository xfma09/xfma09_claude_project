"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";

import { GameApp } from "@/components/game/game-app";
import {
  buildAlmostEscapedState,
  buildFreshPlayingState,
} from "@/lib/dev/test-cases";

const DIGIT_LABEL = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-border bg-amber-950/40 px-6 py-3 text-sm text-amber-200">
      <span className="font-semibold">[테스트 화면]</span> {children}
    </div>
  );
}

/** 마지막 빈칸 자동완성 애니메이션 + 용 퇴장 연출을 바로 확인하는 케이스. */
function Case1() {
  const { state, hintRow, hintCol, hintValue } = buildAlmostEscapedState();
  return (
    <GameApp
      initialState={() => state}
      banner={
        <Banner>
          {hintRow + 1}행 {hintCol + 1}열 칸을 클릭한 뒤 {DIGIT_LABEL[hintValue]}
          을(를) 입력해 보세요. 마지막 칸 자동완성과 용 퇴장 연출이 이어서
          재생됩니다.
        </Banner>
      }
    />
  );
}

/** 오답 시 화면 전체가 흔들리는 피격 연출을 바로 확인하는 케이스. */
function Case2() {
  return (
    <GameApp
      initialState={buildFreshPlayingState}
      banner={
        <Banner>
          빈칸을 아무 곳이나 클릭한 뒤, 일부러 틀린 숫자를 입력해 보세요.
          화면 전체가 흔들리는 피격 연출을 확인할 수 있습니다.
        </Banner>
      }
    />
  );
}

const CASES: Record<string, () => ReactElement> = {
  case_1: Case1,
  case_2: Case2,
};

export const TEST_CASE_KEYS = Object.keys(CASES);

export function TestCaseApp({ testCase }: { testCase: string }) {
  // 케이스 상태는 Date.now()로 구성되므로, 서버 렌더링 결과와 클라이언트
  // hydration 결과가 어긋나지 않도록 마운트된 뒤(클라이언트에서만)에 그린다.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const CaseComponent = CASES[testCase];
  if (!CaseComponent) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-lg font-semibold">알 수 없는 테스트 케이스입니다.</p>
        <p className="text-sm text-muted-foreground">
          사용 가능한 케이스: {TEST_CASE_KEYS.join(", ")}
        </p>
      </div>
    );
  }
  if (!mounted) return null;
  return <CaseComponent />;
}
