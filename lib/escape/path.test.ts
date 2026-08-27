import { describe, expect, test } from "vitest";

import { generateEscapePath } from "@/lib/escape/path";

describe("generateEscapePath", () => {
  test("걸음 수만큼 경로를 만든다", () => {
    expect(generateEscapePath(0)).toHaveLength(0);
    expect(generateEscapePath(1)).toHaveLength(1);
    expect(generateEscapePath(45)).toHaveLength(45);
  });

  test("첫 걸음은 꺾임이 아니다", () => {
    const path = generateEscapePath(10);
    expect(path[0].turn).toBe(false);
  });

  test("폭을 넘으면 다음 줄로 꺾인다", () => {
    const width = 6;
    const path = generateEscapePath(width + 2, width);

    // width번째 칸(줄이 바뀌는 지점)은 꺾임이어야 한다.
    expect(path[width].turn).toBe(true);
    // 같은 줄 안에서 이어지는 칸은 꺾이지 않는다.
    expect(path[1].turn).toBe(false);
  });

  test("모든 좌표는 폭 안에 머문다", () => {
    const width = 6;
    const path = generateEscapePath(30, width);
    path.forEach((step) => {
      expect(step.x).toBeGreaterThanOrEqual(0);
      expect(step.x).toBeLessThan(width);
      expect(step.y).toBeGreaterThanOrEqual(0);
    });
  });

  test("짧은 경로(폭 이하)는 꺾이지 않는다", () => {
    const width = 6;
    const path = generateEscapePath(width, width);
    expect(path.every((step) => !step.turn)).toBe(true);
  });
});
