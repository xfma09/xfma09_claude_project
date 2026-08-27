# 몬스터 교체 애니메이션이 이미지 로딩 완료로 끊길 수 있음

**Symptom**: `components/dungeon/dungeon-view.tsx`에서 걸음 전진 시 재생되는 몬스터 퇴장/등장 애니메이션이, 진행 도중 다른 몬스터 이미지의 로드가 완료되면 즉시 정지 프레임으로 끊긴다.

**Observed evidence**: code-review low 패스, `components/dungeon/dungeon-view.tsx:353` — 렌더링 `useEffect`의 의존성 배열에 `enemyLoadTick`이 있어, 애니메이션 진행 중(rAF 루프 도중) 이미지 로드로 `setEnemyLoadTick`이 호출되면 effect가 재실행된다. 이때 `prevStepRef.current`가 이미 현재 `stepIndex`로 갱신돼 있어 `stepped`가 `false`가 되고, 진행 중이던 전환 애니메이션이 즉시 정지 프레임으로 대체된다.

**Suspected cause**: 이미지 로드 상태(`enemyLoadTick`)와 걸음 전환 애니메이션을 같은 `useEffect`가 함께 처리하고 있어, 전자의 변경이 후자의 재생 중인 애니메이션을 리셋시킨다.

**What was tried**: 없음. 컴포넌트 마운트 직후 5장(수 KB 수준)이 대부분 즉시 로드되는 짧은 시간창에서만 재현되는 엣지케이스라, 이번 스펙 범위에서는 보류.

**Proposed next step**: 이미지 로딩 상태와 걸음 전환 애니메이션의 `useEffect`를 분리한다. 이미지 로드 완료 시에는 애니메이션이 진행 중이 아닐 때만(`rafRef.current === null`) 정지 프레임을 다시 그리는 방식으로 바꾸면, 진행 중인 전환 애니메이션을 건드리지 않는다.
