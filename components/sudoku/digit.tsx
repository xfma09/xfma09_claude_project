import { cn } from "@/lib/utils";

interface DigitProps {
  value: number;
  tone: "given" | "input";
  className?: string;
}

/**
 * 스도쿠 보드와 숫자패드가 함께 쓰는 도트 숫자 이미지.
 * public/dungeon/numbers/simple을 소스로 쓴다. 원래 있던 "각인 숫자"(리벳 텍스처
 * 기반) 스타일 선택지는 16px 크기에서 오히려 읽기 어렵다는 피드백으로 뺐다.
 */
export function Digit({ value, tone, className }: DigitProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/dungeon/numbers/simple/${tone}/${value}.png`}
      alt=""
      aria-hidden
      className={cn(
        "h-full w-full object-contain [image-rendering:pixelated]",
        className
      )}
    />
  );
}
