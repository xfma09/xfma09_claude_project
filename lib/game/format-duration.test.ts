import { describe, expect, test } from "vitest";

import { formatDuration } from "@/lib/game/format-duration";

describe("formatDuration", () => {
  test("밀리초를 분:초로 바꾼다", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(59_000)).toBe("00:59");
    expect(formatDuration(60_000)).toBe("01:00");
    expect(formatDuration(125_000)).toBe("02:05");
  });

  test("음수는 0으로 취급한다", () => {
    expect(formatDuration(-500)).toBe("00:00");
  });
});
