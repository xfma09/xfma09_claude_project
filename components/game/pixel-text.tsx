"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface PixelTextProps {
  text: string;
  fontSize?: number;
  scale?: number;
  color?: string;
  fontFamily?: string;
  bold?: boolean;
  shadowColor?: string;
  /** 글자 사이 여백(px, 확대 전 기준). 다크소울류의 넓은 자간을 낼 때 쓴다. */
  letterSpacing?: number;
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
  fontFamily = FONT_STACK,
  bold = true,
  shadowColor,
  letterSpacing = 0,
  className,
}: PixelTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const font = `${bold ? "bold " : ""}${fontSize}px ${fontFamily}`;

    function measureWithSpacing() {
      if (!ctx) return 0;
      ctx.font = font;
      let w = 0;
      for (const ch of text) w += ctx.measureText(ch).width + letterSpacing;
      return w - letterSpacing;
    }

    function drawWithSpacing(baseline: number) {
      if (!ctx) return;
      let x = 2;
      for (const ch of text) {
        ctx.fillText(ch, x, baseline);
        x += ctx.measureText(ch).width + letterSpacing;
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.font = font;
      const width =
        Math.ceil(letterSpacing ? measureWithSpacing() : ctx.measureText(text).width) + 4;
      const height = Math.ceil(fontSize * 1.6);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${height * scale}px`;

      ctx.font = font;
      ctx.textBaseline = "middle";
      ctx.imageSmoothingEnabled = false;

      if (shadowColor) {
        ctx.fillStyle = shadowColor;
        if (letterSpacing) drawWithSpacing(height / 2 + 1);
        else ctx.fillText(text, 3, height / 2 + 1);
      }
      ctx.fillStyle = color;
      if (letterSpacing) drawWithSpacing(height / 2);
      else ctx.fillText(text, 2, height / 2);
    }

    // 커스텀 웹폰트가 로드되기 전에 그리면 대체 폰트로 찍히므로, 폰트 로드를 기다린다.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.load(font, text).then(draw).catch(draw);
    } else {
      draw();
    }
  }, [text, fontSize, scale, color, fontFamily, bold, shadowColor, letterSpacing]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={text}
      className={cn("[image-rendering:pixelated]", className)}
    />
  );
}
