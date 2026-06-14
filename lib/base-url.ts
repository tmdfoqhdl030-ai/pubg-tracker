/**
 * 서버/클라이언트 모두에서 API 베이스 URL을 반환한다.
 * - NEXT_PUBLIC_BASE_URL 환경변수가 있으면 그것을 사용
 * - Vercel 배포 시 VERCEL_URL 자동 감지
 * - 로컬 개발 시 localhost:3000
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
