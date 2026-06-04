import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSurvived(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
}

export function getDangerLevel(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    돌격형: "#E8501A",
    저격형: "#7A9BB5",
    지원형: "#40C080",
    생존형: "#F0C040",
  };
  return colors[role] ?? "#7A9BB5";
}

export function getStyleColor(style: string): string {
  const colors: Record<string, string> = {
    공격형: "#E8501A",
    존버형: "#40C080",
    균형형: "#7A9BB5",
  };
  return colors[style] ?? "#7A9BB5";
}
