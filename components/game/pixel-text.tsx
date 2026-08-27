"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface PixelTextProps {
  text: string;
  fontSize?: number;
  scale?: number;
  color?: string;
  className?: string;
}

const FONT_STACK = 'ui-monospace, "Courier New", monospace';

/**
 * 텍스트를 작은 캔버스에 그린 뒤 픽셀 보간 없이 확대해, 도트 그래픽처럼 보이게 한다.
 */
export function PixelText({
  text,
  fontSize = 14,
  scale = 4,
  color = "#e8e2d8",
  className,
}: PixelTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.font = `bold ${fontSize}px ${FONT_STACK}`;
    const width = Math.ceil(ctx.measureText(text).width) + 4;
    const height = Math.ceil(fontSize * 1.5);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;

    ctx.font = `bold ${fontSize}px ${FONT_STACK}`;
    ctx.textBaseline = "middle";
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = color;
    ctx.fillText(text, 2, height / 2);
  }, [text, fontSize, scale, color]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={text}
      className={cn("[image-rendering:pixelated]", className)}
    />
  );
}
