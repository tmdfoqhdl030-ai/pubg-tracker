import fs from "fs";
import path from "path";
import { redis } from "./redis";

interface Entry<T> {
  data: T;
  expiresAt: number;   // fresh TTL 만료 시각
  staleUntil: number;  // stale 보존 만료 시각
}

// ── 1차: 모듈 메모리 캐시 (가장 빠름, 같은 인스턴스 내) ──────────────
const store = new Map<string, Entry<unknown>>();

// ── 2차: /tmp 파일 캐시 (서버리스 인스턴스 교체에도 유지) ──────────
const TMP_DIR = "/tmp";

function filePath(key: string): string {
  const safe = key.replace(/[^a-zA-Z0-9_\-.]/g, "_");
  return path.join(TMP_DIR, `m249cache_${safe}.json`);
}

function readFile<T>(key: string): Entry<T> | null {
  try {
    const fp = filePath(key);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(fs.readFileSync(fp, "utf-8")) as Entry<T>;
  } catch {
    return null;
  }
}

function writeFile<T>(key: string, entry: Entry<T>): void {
  try {
    fs.writeFileSync(filePath(key), JSON.stringify(entry), "utf-8");
  } catch {
    /* /tmp 쓰기 실패(로컬 Windows 등) 시 무시 — 메모리 캐시는 동작 */
  }
}

// 메모리에 없으면 파일에서 끌어와 메모리에 채움
function load<T>(key: string): Entry<T> | null {
  const mem = store.get(key) as Entry<T> | undefined;
  if (mem) return mem;
  const file = readFile<T>(key);
  if (file) {
    store.set(key, file as Entry<unknown>);
    return file;
  }
  return null;
}

// ── fresh 데이터만 반환 (만료 시 null) ──────────────────────────────
export function getCache<T>(key: string): T | null {
  const entry = load<T>(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) return null; // 만료됨 (stale은 남겨둠)
  return entry.data;
}

// ── 단순 저장 (fresh = stale 동일) ──────────────────────────────────
export function setCache<T>(key: string, data: T, ttlMs: number): void {
  const entry: Entry<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
    staleUntil: Date.now() + ttlMs,
  };
  store.set(key, entry as Entry<unknown>);
  writeFile(key, entry);
}

// ── stale 포함 저장 ─────────────────────────────────────────────────
export function setCacheWithStale<T>(
  key: string,
  data: T,
  ttlMs: number,
  staleTtlMs = 4 * 60 * 60 * 1000
): void {
  const entry: Entry<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
    staleUntil: Date.now() + Math.max(ttlMs, staleTtlMs),
  };
  store.set(key, entry as Entry<unknown>);
  writeFile(key, entry);
}

// ── 만료됐어도 staleUntil 이내면 반환 (RATE_LIMIT 폴백용) ───────────
export function getStaleCache<T>(key: string): T | null {
  const entry = load<T>(key);
  if (!entry) return null;
  if (Date.now() > entry.staleUntil) return null;
  return entry.data;
}

// ── fresh 우선, 없으면 stale ────────────────────────────────────────
export function getStaleOrFresh<T>(key: string): T | null {
  return getCache<T>(key) ?? getStaleCache<T>(key);
}

// ════════════════════════════════════════════════════════════════════
//  ASYNC: Redis 공유 캐시 (인스턴스 간 공유) — 핵심 PUBG 호출용
//  Redis 미연결 시 메모리+/tmp(sync) 캐시로 자동 폴백
// ════════════════════════════════════════════════════════════════════

const REDIS_PREFIX = "m249:c:";

// fresh 데이터만 반환 (만료 시 null). Redis L2 → 메모리/파일 L1 폴백
export async function getCacheAsync<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const entry = await redis.get<Entry<T>>(REDIS_PREFIX + key);
      if (entry) {
        store.set(key, entry as Entry<unknown>); // L1 갱신
        if (Date.now() > entry.expiresAt) return null;
        return entry.data;
      }
    } catch { /* Redis 오류 시 폴백 */ }
  }
  return getCache<T>(key);
}

// fresh 우선, 없으면 stale (RATE_LIMIT 폴백용)
export async function getStaleOrFreshAsync<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const entry = await redis.get<Entry<T>>(REDIS_PREFIX + key);
      if (entry) {
        store.set(key, entry as Entry<unknown>);
        if (Date.now() <= entry.staleUntil) return entry.data;
        return null;
      }
    } catch { /* 폴백 */ }
  }
  return getStaleOrFresh<T>(key);
}

// Redis + 메모리 + /tmp 동시 저장
export async function setCacheWithStaleAsync<T>(
  key: string,
  data: T,
  ttlMs: number,
  staleTtlMs = 4 * 60 * 60 * 1000
): Promise<void> {
  const entry: Entry<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
    staleUntil: Date.now() + Math.max(ttlMs, staleTtlMs),
  };
  store.set(key, entry as Entry<unknown>);
  writeFile(key, entry);
  if (redis) {
    try {
      const ttlSec = Math.ceil(Math.max(ttlMs, staleTtlMs) / 1000);
      await redis.set(REDIS_PREFIX + key, entry, { ex: ttlSec });
    } catch { /* Redis 쓰기 실패 무시 */ }
  }
}
