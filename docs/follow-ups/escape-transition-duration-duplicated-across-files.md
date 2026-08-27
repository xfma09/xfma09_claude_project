# 탈출 연출 시간 상수가 두 파일에 중복돼 있음

**Symptom**: 용 퇴장 연출이 다 재생되기 전에 결과 화면(EscapeScreen)으로 전환될 수 있다.

**Observed evidence**: code-review low 패스, `components/dungeon/dungeon-view.tsx`의 `DRAGON_EXIT_MS`(용 퇴장 연출 재생 시간)와 `app/page.tsx`의 `ESCAPE_TRANSITION_MS`(결과 화면 전환 지연)가 서로 다른 파일에 각각 하드코딩돼 있고, 후자가 전자보다 크거나 같아야 한다는 제약이 주석으로만 남아 있다.

**Suspected cause**: 두 값이 하나의 공유 상수가 아니라 별도 파일에 독립적으로 선언돼 있어, 한쪽만 수정하면 다른 쪽과 어긋난다.

**What was tried**: 없음. 현재는 두 값이 맞춰져 있어(1400ms / 1600ms) 당장 깨지지 않는다.

**Proposed next step**: `DRAGON_EXIT_MS`를 `lib/game/engine.ts`나 별도 상수 모듈로 옮겨 `app/page.tsx`와 `dungeon-view.tsx`가 같은 값을 참조하게 한다.
