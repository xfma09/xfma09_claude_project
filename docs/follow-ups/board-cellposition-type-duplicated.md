# SudokuBoard의 선택 셀 타입 중복

**Symptom**: `components/sudoku/board.tsx`가 `{row: number; col: number}`를 인라인으로 다시 선언한다. `lib/game/engine.ts`가 이미 `CellPosition`으로 같은 모양을 export한다.

**Observed evidence**: code-review low 패스, `components/sudoku/board.tsx:9`.

**Suspected cause**: 컴포넌트 작성 시 엔진 쪽 타입을 재사용하지 않고 그 자리에서 새로 씀.

**What was tried**: 없음(런타임 동작에는 영향 없어 이번 스펙 범위에서는 보류).

**Proposed next step**: board.tsx에서 `CellPosition`을 `@/lib/game/engine`에서 import해 인라인 타입을 대체한다.
