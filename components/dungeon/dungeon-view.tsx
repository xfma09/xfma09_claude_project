"use client";

import { useEffect, useRef } from "react";

import type { PathStep } from "@/lib/escape/path";
import { cn } from "@/lib/utils";

interface DungeonViewProps {
  path: PathStep[];
  stepIndex: number;
  energy: number;
  maxEnergy: number;
  attacking: boolean;
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

function drawCorridor(ctx: CanvasRenderingContext2D, tintOffset: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = 80;
  const cy = 56;
  const scale = (i: number) => 1 / (1 + 0.85 * i);
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

function drawMonster(ctx: CanvasRenderingContext2D, scale: number) {
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

function drawMinimap(
  ctx: CanvasRenderingContext2D,
  path: PathStep[],
  stepIndex: number
) {
  const w = 48;
  const h = 36;
  const x = CANVAS_W - w - 3;
  const y = 3;

  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#0a0a0c";
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "#6f665c";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

  if (path.length === 0) {
    ctx.globalAlpha = 1;
    return;
  }

  const maxX = Math.max(...path.map((p) => p.x));
  const maxY = Math.max(...path.map((p) => p.y));
  const cell = Math.max(
    2,
    Math.min((w - 4) / (maxX + 1), (h - 4) / (maxY + 1))
  );
  const px = x + 2;
  const py = y + 2;

  path.forEach((step, i) => {
    ctx.fillStyle = i < stepIndex ? "#c9a227" : "#3a3733";
    ctx.fillRect(px + step.x * cell, py + step.y * cell, cell - 0.5, cell - 0.5);
  });

  const current = path[Math.min(stepIndex, path.length - 1)];
  ctx.fillStyle = "#e8e2d8";
  ctx.fillRect(
    px + current.x * cell,
    py + current.y * cell,
    cell - 0.5,
    cell - 0.5
  );
  ctx.globalAlpha = 1;
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

function drawTurnHint(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#e8e2d8cc";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("↷ 방향 전환", 4, CANVAS_H - 4);
}

export function DungeonView({
  path,
  stepIndex,
  energy,
  maxEnergy,
  attacking,
  className,
}: DungeonViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    drawCorridor(ctx, stepIndex);
    drawMonster(ctx, attacking ? 2.9 : 2.7);
    drawEnergy(ctx, energy, maxEnergy);

    const upcoming = path[stepIndex];
    if (upcoming?.turn) drawTurnHint(ctx);

    if (attacking) {
      ctx.fillStyle = "rgba(180, 30, 20, 0.35)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    drawMinimap(ctx, path, stepIndex);
  }, [path, stepIndex, energy, maxEnergy, attacking]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`던전 뷰. ${stepIndex}번째 걸음, 남은 걸음 ${Math.max(
        path.length - stepIndex,
        0
      )}, 에너지 ${energy}/${maxEnergy}`}
      width={CANVAS_W}
      height={CANVAS_H}
      className={cn(
        "aspect-[4/3] w-full rounded-2xl border border-border [image-rendering:pixelated]",
        attacking && "animate-[shake_0.35s_ease-in-out]",
        className
      )}
    />
  );
}
