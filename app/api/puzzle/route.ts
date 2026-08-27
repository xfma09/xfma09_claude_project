import type { Difficulty } from "@/lib/sudoku/puzzle";

const YOUDOSUDOKU_URL = "https://you-do-sudoku-api.vercel.app/api";
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function isDifficulty(value: string | null): value is Difficulty {
  return value !== null && (DIFFICULTIES as string[]).includes(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");

  if (!isDifficulty(difficulty)) {
    return Response.json(
      { error: "difficulty는 easy, medium, hard 중 하나여야 합니다." },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUDOSUDOKU_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "퍼즐 서비스 설정이 누락되었습니다." },
      { status: 500 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(YOUDOSUDOKU_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ difficulty, solution: true, array: false }),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { error: "퍼즐 서비스에 연결하지 못했습니다." },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    return Response.json(
      { error: "퍼즐을 받아오지 못했습니다." },
      { status: 502 }
    );
  }

  const data = await upstream.json();
  if (typeof data.puzzle !== "string" || typeof data.solution !== "string") {
    return Response.json(
      { error: "퍼즐 서비스 응답 형식이 올바르지 않습니다." },
      { status: 502 }
    );
  }

  return Response.json({
    difficulty,
    puzzle: data.puzzle as string,
    solution: data.solution as string,
  });
}
