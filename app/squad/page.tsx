import { redirect } from "next/navigation";

// ── 스쿼드 팀 분석 페이지는 일시 비활성화되었습니다 ──────────────────
// 기존 화면이 실제 전적이 아닌 예시(mock) 데이터로 구성되어 있어,
// 신뢰도 문제로 페이지를 내리고 홈으로 리다이렉트합니다.
// (추후 팀원별 실제 스탯 연동으로 재구현 예정)
export default function SquadDisabled() {
  redirect("/");
}
