# test-case-app.tsx의 useEffect 내 setState 호출이 린트 에러로 걸림

**Symptom**: `bun run lint` 실행 시 `components/dev/test-case-app.tsx:64`에서 `react-hooks/set-state-in-effect` 규칙이 에러로 걸려 린트 전체가 실패한다.

**Observed evidence**: `bun run lint` 출력. `useEffect(() => setMounted(true), [])` 라인이 "Calling setState synchronously within an effect can trigger cascading renders"로 지적된다. 이번 칸당 제한시간 작업(`docs/specs/time-limit/`)의 diff에는 이 파일이 포함되지 않았으며, 작업 전부터 있던 코드다.

**Suspected cause**: hydration 이후에만 그리기 위해 `useEffect`로 `mounted` 플래그를 세팅하는 흔한 패턴인데, 최신 eslint 규칙(react-hooks 플러그인)이 이 패턴을 경고 대상으로 새로 잡기 시작한 것으로 보인다.

**What was tried**: 아무것도 하지 않았다. 이번 작업 범위(칸당 제한시간)와 무관해 그대로 두었다.

**Proposed next step**: `useSyncExternalStore`나 CSS만으로 처리하는 대안으로 바꿀지, 아니면 이 라인만 규칙에서 예외 처리할지 검토한다.
