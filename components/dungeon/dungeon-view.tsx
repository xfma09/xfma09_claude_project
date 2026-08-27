"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PathStep } from "@/lib/escape/path";
import { cn } from "@/lib/utils";

interface DungeonViewProps {
  path: PathStep[];
  stepIndex: number;
  energy: number;
  maxEnergy: number;
  attacking: boolean;
  // 현재 턴의 제한시간이 끝나는 시각(ms epoch). 흐르지 않는 상태면 null.
  turnDeadline: number | null;
  turnDurationMs: number;
  className?: string;
}

const CANVAS_W = 160;
const CANVAS_H = 120;

const WALL_LIT = ["#7a3b2e", "#5e2d24", "#46211b", "#331812", "#241110"];
const WALL_DARK = ["#63302a", "#4b241f", "#381a17", "#28110f", "#1b0c0b"];
const MORTAR = ["#93513f", "#6d3a2e", "#512a22", "#3a1d18", "#28120f"];
const FLOOR = ["#6b5a44", "#54452f", "#3f3324", "#2c231a", "#1d1712"];
const FLOOR_ALT = ["#5a4a37", "#453827", "#33291d", "#231b14", "#17120e"];
const CEIL = ["#2a2320", "#1f1a18", "#171311", "#100d0c", "#0a0808"];

function drawCorridor(
  ctx: CanvasRenderingContext2D,
  tintOffset: number,
  depthT: number = 0
) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = 80;
  const cy = 56;
  // depthT(0→1)만큼 모든 깊이 구간을 카메라 쪽으로 당겨, 한 칸 전진하는 돌리줌을 만든다.
  const scale = (i: number) => 1 / (1 + 0.85 * (i - depthT));
  const extent = (i: number) => ({ hw: 82 * scale(i), hh: 62 * scale(i) });

  for (let i = 4; i >= 0; i--) {
    const near = extent(i);
    const far = extent(i + 1);
    const nL = cx - near.hw;
    const nR = cx + near.hw;
    const nT = cy - near.hh;
    const nB = cy + near.hh;
    const fL = cx - far.hw;
    const fR = cx + far.hw;
    const fT = cy - far.hh;
    const fB = cy + far.hh;
    const tint = (i + tintOffset) % 2;

    ctx.fillStyle = CEIL[i];
    ctx.beginPath();
    ctx.moveTo(nL, nT);
    ctx.lineTo(nR, nT);
    ctx.lineTo(fR, fT);
    ctx.lineTo(fL, fT);
    ctx.fill();

    ctx.fillStyle = tint ? FLOOR[i] : FLOOR_ALT[i];
    ctx.beginPath();
    ctx.moveTo(nL, nB);
    ctx.lineTo(nR, nB);
    ctx.lineTo(fR, fB);
    ctx.lineTo(fL, fB);
    ctx.fill();

    ctx.fillStyle = tint ? WALL_LIT[i] : WALL_DARK[i];
    ctx.beginPath();
    ctx.moveTo(nL, nT);
    ctx.lineTo(fL, fT);
    ctx.lineTo(fL, fB);
    ctx.lineTo(nL, nB);
    ctx.fill();

    ctx.fillStyle = tint ? WALL_DARK[i] : WALL_LIT[i];
    ctx.beginPath();
    ctx.moveTo(nR, nT);
    ctx.lineTo(fR, fT);
    ctx.lineTo(fR, fB);
    ctx.lineTo(nR, nB);
    ctx.fill();

    ctx.strokeStyle = MORTAR[i];
    ctx.lineWidth = 1;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const ny = nT + (nB - nT) * t;
      const fy = fT + (fB - fT) * t;
      ctx.beginPath();
      ctx.moveTo(nL, ny);
      ctx.lineTo(fL, fy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(nR, ny);
      ctx.lineTo(fR, fy);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(fL, fT);
    ctx.lineTo(fL, fB);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fR, fT);
    ctx.lineTo(fR, fB);
    ctx.stroke();
  }

  const e = extent(5);
  ctx.fillStyle = "#080506";
  ctx.fillRect(cx - e.hw, cy - e.hh, e.hw * 2, e.hh * 2);
}

// 한 걸음마다 무작위로 등장하는 일반 추격자 이미지들 (CC-BY-SA 3.0 Clint Bellanger).
// 출처와 라이선스는 public/dungeon/CREDITS.md 참고.
const REGULAR_ENEMY_SRCS = [
  "/dungeon/enemies/druid.png",
  "/dungeon/enemies/skeleton.png",
  "/dungeon/enemies/zombie.png",
  "/dungeon/enemies/death_speaker.png",
  "/dungeon/enemies/imp.png",
];
// 탈출 직전, 마지막 걸음에만 고정으로 등장하는 보스.
const DRAGON_SRC = "/dungeon/enemies/dragon.png";
const DRAGON_INDEX = REGULAR_ENEMY_SRCS.length;
const ENEMY_SRCS = [...REGULAR_ENEMY_SRCS, DRAGON_SRC];

/** 걸음마다 등장할 몬스터 순서를 만든다. 마지막 두 걸음은 항상 드래곤. */
function buildEnemySequence(steps: number): number[] {
  const seq: number[] = [];
  for (let i = 0; i < steps; i++) {
    seq.push(
      i >= steps - 2
        ? DRAGON_INDEX
        : Math.floor(Math.random() * REGULAR_ENEMY_SRCS.length)
    );
  }
  return seq;
}

function enemyIndexAt(seq: number[], stepIndex: number) {
  if (seq.length === 0) return 0;
  return seq[Math.min(Math.max(stepIndex, 0), seq.length - 1)];
}

// 위 에셋이 로드되기 전이나 실패했을 때만 쓰는 대체용 도트 그래픽.
const MONSTER_ROWS = [
  "....000000....",
  "...0112211 0..",
  "..01122221 0..",
  "..0113223110..",
  "..0112222110..",
  "...011221100..",
  "....044440....",
  "..3344444433..",
  ".333444444333.",
  "3335544445333.",
  ".335444444533.",
  "..33444444 33.",
  "..0555555550..",
  "..0555555550..",
  "...06666660...",
];
const MONSTER_PALETTE: Record<string, string> = {
  "0": "#140b09",
  "1": "#7b5236",
  "2": "#a06f45",
  "3": "#4a4f5c",
  "4": "#8d9099",
  "5": "#5b4230",
  "6": "#3d3a44",
};

function drawMonsterFallback(ctx: CanvasRenderingContext2D, scale: number) {
  const ox = 80 - (7.5 * scale);
  const oy = 34;
  for (let y = 0; y < MONSTER_ROWS.length; y++) {
    for (let x = 0; x < MONSTER_ROWS[y].length; x++) {
      const ch = MONSTER_ROWS[y][x];
      if (ch === " " || ch === ".") continue;
      ctx.fillStyle = MONSTER_PALETTE[ch] ?? "#000";
      ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale);
    }
  }
  ctx.fillStyle = "#ffd45e";
  ctx.fillRect(ox + 5 * scale, oy + 3 * scale, scale, scale);
  ctx.fillRect(ox + 8 * scale, oy + 3 * scale, scale, scale);
}

// 피격 점멸용 오프스크린 캔버스. source-atop은 destination에 이미 그려진
// 모든 불투명 픽셀(복도 배경 포함) 위에 합성되므로, 메인 캔버스에 바로
// 그리면 몬스터가 아니라 화면 전체가 하얗게 덮인다. 그래서 몬스터만 담긴
// 별도 캔버스에서 흰색을 입힌 뒤, 그 결과를 메인 캔버스로 옮긴다.
let flashCanvas: HTMLCanvasElement | null = null;
function getFlashCanvas() {
  if (!flashCanvas) {
    flashCanvas = document.createElement("canvas");
    flashCanvas.width = CANVAS_W;
    flashCanvas.height = CANVAS_H;
  }
  return flashCanvas;
}

function drawEnemyImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  alpha: number,
  scale: number,
  flash: number = 0,
  // 캔버스 높이 대비 아래로 밀어낼 비율. 용이 가라앉으며 퇴장할 때 쓴다.
  sinkRatio: number = 0
) {
  if (alpha <= 0) return;
  const dw = CANVAS_W * scale;
  const dh = CANVAS_H * scale;
  const dx = (CANVAS_W - dw) / 2;
  const dy = (CANVAS_H - dh) / 2 + CANVAS_H * sinkRatio;

  if (flash > 0) {
    const off = getFlashCanvas();
    const octx = off.getContext("2d");
    if (octx) {
      octx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      octx.imageSmoothingEnabled = false;
      octx.globalCompositeOperation = "source-over";
      octx.drawImage(img, dx, dy, dw, dh);
      octx.globalCompositeOperation = "source-atop";
      octx.globalAlpha = flash;
      octx.fillStyle = "#ffffff";
      octx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.globalAlpha = alpha;
      ctx.drawImage(off, 0, 0);
      ctx.globalAlpha = 1;
      return;
    }
  }

  ctx.globalAlpha = alpha;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.globalAlpha = 1;
}

/**
 * swapT === 0: 정지 상태, prevImg(=현재 몬스터)만 그린다. attacking이면 살짝 확대.
 * 0 < swapT < 1: 정답을 맞혀 몬스터가 피격 점멸하며 사라지고, 뒤이어 nextImg가
 * 멀리서 다가오며 나타난다.
 * isFinalDeparture이면(용을 쓰러뜨려 탈출을 확정지은 순간) 다음 몬스터 없이,
 * 용 혼자 천천히 점멸하며 화면 아래로 가라앉듯 퇴장한다.
 */
function drawMonster(
  ctx: CanvasRenderingContext2D,
  prevImg: HTMLImageElement | null,
  nextImg: HTMLImageElement | null,
  swapT: number,
  attacking: boolean,
  isFinalDeparture: boolean = false
) {
  if (swapT <= 0) {
    if (!prevImg) {
      drawMonsterFallback(ctx, attacking ? 2.9 : 2.7);
      return;
    }
    drawEnemyImage(ctx, prevImg, 1, attacking ? 1.08 : 1);
    return;
  }

  if (isFinalDeparture) {
    if (!prevImg) return;
    // 점멸 주기를 천천히(약 3회) 반복하면서, 서서히 투명해지고 가라앉는다.
    const blink = (Math.sin(swapT * Math.PI * 6) + 1) / 2;
    const flash = swapT < 0.85 ? blink * (1 - swapT) : 0;
    const alpha = Math.max(0, 1 - swapT ** 1.5);
    const sinkRatio = swapT ** 2 * 0.9;
    drawEnemyImage(ctx, prevImg, alpha, 1, flash, sinkRatio);
    return;
  }

  if (swapT < 0.5) {
    const t = swapT / 0.5;
    if (prevImg) {
      if (t < 0.5) {
        // 피격 점멸 구간: 제자리에서 하얗게-원래 모습으로 빠르게 두 번 번쩍인다.
        const blinkOn = Math.floor((t / 0.5) * 4) % 2 === 0;
        drawEnemyImage(ctx, prevImg, 1, 1, blinkOn ? 1 : 0);
      } else {
        // 이후 확대되며 사라진다.
        const ft = (t - 0.5) / 0.5;
        drawEnemyImage(ctx, prevImg, 1 - ft, 1 + ft * 0.5);
      }
    } else if (t < 0.5) {
      drawMonsterFallback(ctx, 2.7 + t);
    }
    return;
  }

  const t = (swapT - 0.5) / 0.5;
  if (nextImg) drawEnemyImage(ctx, nextImg, t, 0.6 + t * 0.4);
  else if (t > 0.5) drawMonsterFallback(ctx, 2.7);
}

// 지나온 거리와 남은 거리를 사각 격자가 아닌 일자 진행 바로 보여준다.
function drawMinimap(
  ctx: CanvasRenderingContext2D,
  path: PathStep[],
  stepIndex: number
) {
  const w = 62;
  const h = 10;
  const x = CANVAS_W - w - 3;
  const y = 3;

  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#0a0a0c";
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#6f665c";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

  const total = path.length;
  if (total === 0) {
    ctx.globalAlpha = 1;
    return;
  }

  const innerX = x + 1.5;
  const innerY = y + 1.5;
  const innerW = w - 3;
  const innerH = h - 3;
  const progress = Math.min(stepIndex, total) / total;

  ctx.fillStyle = "#3a3733";
  ctx.fillRect(innerX, innerY, innerW, innerH);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(innerX, innerY, innerW * progress, innerH);

  const markerX = Math.min(
    innerX + innerW * progress,
    innerX + innerW - 1.5
  );
  ctx.fillStyle = "#e8e2d8";
  ctx.fillRect(markerX, innerY - 1, 1.5, innerH + 2);

  ctx.globalAlpha = 1;
  ctx.fillStyle = "#e8e2d8cc";
  ctx.font = "7px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`${Math.min(stepIndex, total)}/${total}`, x + w, y + h + 8);
}

function drawEnergy(ctx: CanvasRenderingContext2D, energy: number, max: number) {
  const pipW = 11;
  const gap = 4;
  const totalW = max * pipW + (max - 1) * gap;
  const startX = CANVAS_W / 2 - totalW / 2;
  const yPos = CANVAS_H - 12;

  for (let i = 0; i < max; i++) {
    const filled = i < energy;
    ctx.fillStyle = filled ? "#c0392b" : "#2a1f1d";
    ctx.fillRect(startX + i * (pipW + gap), yPos, pipW, 9);
    ctx.fillStyle = filled ? "#e8574a" : "#3a2c2a";
    ctx.fillRect(startX + i * (pipW + gap) + 1, yPos + 1, pipW - 2, 4);
  }
}

const STEP_ANIMATION_MS = 380;
// 용 퇴장 연출 재생 시간. app/page.tsx의 ESCAPE_TRANSITION_MS가 이보다
// 길어야 화면이 끊기지 않고 다 재생된다.
const DRAGON_EXIT_MS = 1400;

export function DungeonView({
  path,
  stepIndex,
  energy,
  maxEnergy,
  attacking,
  turnDeadline,
  turnDurationMs,
  className,
}: DungeonViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevStepRef = useRef(stepIndex);
  const rafRef = useRef<number | null>(null);
  const enemyImgsRef = useRef<(HTMLImageElement | null)[]>(
    ENEMY_SRCS.map(() => null)
  );
  const [enemyLoadTick, setEnemyLoadTick] = useState(0);
  // path가 바뀔 때(새 퍼즐)만 다시 섞고, 같은 판 안에서는 순서를 유지한다.
  const enemySequence = useMemo(() => buildEnemySequence(path.length), [path]);

  useEffect(() => {
    ENEMY_SRCS.forEach((src, i) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        enemyImgsRef.current[i] = img;
        setEnemyLoadTick((t) => t + 1);
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const prevStep = prevStepRef.current;
    const stepped = stepIndex > prevStep;

    // 이미지 지연 로딩(enemyLoadTick)만으로 이펙트가 재실행된 경우, 아직
    // 재생 중인 스텝/퇴장 애니메이션을 건드리지 않는다. 그렇지 않으면
    // 진행 중이던 연출이 정지 프레임으로 리셋돼 중간에 끊겨 보인다.
    if (!stepped && rafRef.current !== null) return;

    prevStepRef.current = stepIndex;

    // 마지막 걸음을 넘어섰다면 탈출이 확정된 순간이다. 다음 몬스터로
    // 넘어가는 대신, 방금 쓰러뜨린 용이 혼자 퇴장하는 연출을 보여준다.
    const isFinalDeparture = stepIndex >= path.length && path.length > 0;

    const prevEnemyImg =
      enemyImgsRef.current[enemyIndexAt(enemySequence, prevStep)];
    const nextEnemyImg = isFinalDeparture
      ? null
      : enemyImgsRef.current[enemyIndexAt(enemySequence, stepIndex)];

    function render(depthT: number, swapT: number) {
      if (!ctx) return;
      drawCorridor(ctx, stepIndex, depthT);
      drawMonster(
        ctx,
        prevEnemyImg,
        nextEnemyImg,
        swapT,
        attacking,
        isFinalDeparture
      );
      drawEnergy(ctx, energy, maxEnergy);

      if (attacking) {
        ctx.fillStyle = "rgba(180, 30, 20, 0.35)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      drawMinimap(ctx, path, stepIndex);
    }

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    if (!stepped) {
      render(0, 0);
      return;
    }

    // 전진 시 카메라가 한 칸 앞으로 훅 다가가는 동안, 몬스터도 물러나 사라졌다가
    // 다음 몬스터가 다른 모습으로 다가오며 나타난다. 용 퇴장은 훨씬 천천히 보여준다.
    const duration = isFinalDeparture ? DRAGON_EXIT_MS : STEP_ANIMATION_MS;
    const start = performance.now();
    function tick(now: number) {
      const raw = Math.min(1, (now - start) / duration);
      const easedDepth = 1 - (1 - raw) ** 3;
      render(easedDepth, raw);
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [path, stepIndex, energy, maxEnergy, attacking, enemyLoadTick, enemySequence]);

  return (
    <div className={cn("relative aspect-[4/3] w-full", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`던전 뷰. ${stepIndex}번째 걸음, 남은 걸음 ${Math.max(
          path.length - stepIndex,
          0
        )}, 에너지 ${energy}/${maxEnergy}`}
        width={CANVAS_W}
        height={CANVAS_H}
        className="h-full w-full rounded-2xl border border-border [image-rendering:pixelated]"
      />
      {turnDeadline !== null && (
        // key로 turnDeadline을 주면 새 턴이 시작될 때마다(정답·시간초과 처리
        // 직후) 이 엘리먼트가 다시 마운트되어 CSS 애니메이션이 처음부터 재생된다.
        <div
          key={turnDeadline}
          className="absolute right-[1.875%] top-[12.5%] h-[5%] w-[38.75%] overflow-hidden rounded-sm bg-black/40"
        >
          <div
            className="h-full [animation-fill-mode:forwards] [animation-timing-function:linear] [animation-name:turn-timer-drain]"
            style={{ animationDuration: `${turnDurationMs}ms` }}
          />
        </div>
      )}
    </div>
  );
}
