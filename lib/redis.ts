import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ── Upstash Redis 클라이언트 (env 없으면 null → 자동 폴백) ──────────
// Vercel 마켓플레이스에서 Upstash 연결 시 자동 주입되는 env 이름을 모두 지원
const url =
  process.env.UPSTASH_REDIS_REST_URL ??
  process.env.KV_REST_API_URL ??
  null;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ??
  process.env.KV_REST_API_TOKEN ??
  null;

export const redis: Redis | null =
  url && token ? new Redis({ url, token }) : null;

export const redisEnabled = redis !== null;

// ── 분산 rate limiter (인스턴스 합산 분당 제어) ─────────────────────
// PUBG 한도 분당 10회 → 안전하게 9회로 슬라이딩 윈도우
export const pubgRatelimit: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(9, "60 s"),
      prefix: "m249:pubgrl",
      analytics: false,
    })
  : null;
