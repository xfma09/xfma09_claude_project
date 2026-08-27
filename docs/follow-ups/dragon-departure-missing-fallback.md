# 용 퇴장 연출에 이미지 미로드 폴백이 없음

**Symptom**: 용 이미지(`dragon.png`)가 아직 로드되지 않은 상태에서 탈출이 확정되면, 용 퇴장 연출 동안 몬스터가 전혀 그려지지 않고 빈 복도만 보인다.

**Observed evidence**: code-review low 패스, `components/dungeon/dungeon-view.tsx`의 `drawMonster` 함수 `isFinalDeparture` 분기 — `if (!prevImg) return;`로 그냥 종료한다. 같은 함수의 다른 분기들은 `prevImg`가 없을 때 `drawMonsterFallback`(도트 그래픽)으로 대체해 그린다.

**Suspected cause**: 용 퇴장 분기를 새로 추가하면서, 기존 분기들이 쓰던 폴백 처리를 넣지 않았다.

**What was tried**: 없음. 이미지 로딩은 컴포넌트 마운트 시 한 번에 시작되므로, 게임을 끝까지 플레이하는 동안 로드가 끝나 있을 확률이 높은 엣지케이스라 이번 스펙 범위에서는 보류.

**Proposed next step**: `isFinalDeparture` 분기에서도 `prevImg`가 없으면 `drawMonsterFallback`으로 대체해 그리도록 맞춘다.
