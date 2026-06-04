"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select URL manually
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
      style={{
        backgroundColor: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
        color: copied ? "#22C55E" : "rgba(255,255,255,0.55)",
        border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent",
      }}
    >
      {copied ? <Check size={11} /> : <Share2 size={11} />}
      {copied ? "복사됨!" : "공유"}
    </button>
  );
}
