import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// next/font/google은 Next.js의 빌드타임 SWC 변환에 의존하는 특수 모듈이라,
// vitest(순수 node) 환경에서는 아무 export도 없는 빈 모듈로 로드된다.
// vitest가 named export 존재 여부를 정적으로 검증하므로 Proxy로는 우회할 수
// 없어, 실제 프로젝트에서 쓰는 폰트 이름을 그대로 나열해 모킹한다. 새 폰트를
// 추가하면 이 목록에도 이름을 더해야 한다.
vi.mock("next/font/google", () => {
  const mockFont = () => ({
    className: "mock-font",
    style: { fontFamily: "mock-font" },
    variable: "--font-mock",
  });
  return {
    Geist: mockFont,
    Geist_Mono: mockFont,
    Inter: mockFont,
    Public_Sans: mockFont,
    Song_Myung: mockFont,
    UnifrakturMaguntia: mockFont,
    Cinzel: mockFont,
  };
});

// globals: false 이므로 Testing Library 자동 cleanup이 걸리지 않는다.
afterEach(cleanup);
