# 퍼즐 응답 길이 미검증

**Symptom**: `app/api/puzzle/route.ts`가 upstream 응답의 `puzzle`/`solution`이 문자열인지만 확인하고 81자인지는 확인하지 않는다.

**Observed evidence**: code-review low 패스, `app/api/puzzle/route.ts:55` — 길이 체크 없이 그대로 반환.

**Suspected cause**: 검증 로직 작성 시 타입만 확인하고 길이 검증을 빠뜨림.

**What was tried**: 없음(정상 API 응답에서는 항상 81자라 재현되지 않아 이번 스펙 범위에서는 보류).

**Proposed next step**: route.ts에 `data.puzzle.length === 81 && data.solution.length === 81` 체크를 추가하고 실패 시 502로 응답하도록 고친다.
