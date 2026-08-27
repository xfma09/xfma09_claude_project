import { notFound } from "next/navigation";

import { TestCaseApp } from "@/components/dev/test-case-app";

// 특정 연출/상황을 바로 재현해 보기 위한 QA용 라우트다.
// 로컬 개발 서버(next dev)에서만 열리고, 배포된(production) 빌드에서는
// 이 세그먼트 자체가 존재하지 않는 것처럼 404 처리한다.
export default async function TestCasePage({
  params,
}: {
  params: Promise<{ case: string }>;
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { case: testCase } = await params;
  return <TestCaseApp testCase={testCase} />;
}
