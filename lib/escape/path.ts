export interface PathStep {
  x: number;
  y: number;
  turn: boolean;
}

const DEFAULT_WIDTH = 6;

/**
 * 빈칸 수(steps)만큼 격자 위를 지그재그로 지나가는 탈출 경로를 만든다.
 * 한 줄이 끝나면 다음 줄로 내려가며 좌우 방향이 뒤집힌다.
 */
export function generateEscapePath(
  steps: number,
  width: number = DEFAULT_WIDTH
): PathStep[] {
  if (steps <= 0) return [];

  const path: PathStep[] = [];
  let prevDx = 0;
  let prevDy = 0;

  for (let i = 0; i < steps; i++) {
    const row = Math.floor(i / width);
    const posInRow = i % width;
    const x = row % 2 === 0 ? posInRow : width - 1 - posInRow;
    const y = row;

    if (i === 0) {
      path.push({ x, y, turn: false });
      continue;
    }

    const prev = path[i - 1];
    const dx = x - prev.x;
    const dy = y - prev.y;
    const turn = i > 1 && (dx !== prevDx || dy !== prevDy);

    path.push({ x, y, turn });
    prevDx = dx;
    prevDy = dy;
  }

  return path;
}
