import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Home from "@/app/page";

test("처음 열면 시작 화면에 타이틀과 난이도 선택이 보인다", () => {
  render(<Home />);

  expect(screen.getByRole("img", { name: "스도쿠 대탈출" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "EASY" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "MEDIUM" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "HARD" })).toBeInTheDocument();
});

test("난이도를 고르면 퍼즐 API를 호출한다", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      difficulty: "easy",
      puzzle: "0".repeat(81),
      solution: "1".repeat(81),
    }),
  });
  vi.stubGlobal("fetch", fetchMock);

  render(<Home />);
  screen.getByRole("button", { name: "EASY" }).click();

  await vi.waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith("/api/puzzle?difficulty=easy");
  });

  vi.unstubAllGlobals();
});
