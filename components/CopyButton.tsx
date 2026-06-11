"use client";

import { useRef, useState } from "react";

/* Copy-to-clipboard icon button: morphs into a green check and pops
   a small "Copied!" bubble for ~1.4s. Styles in globals.css (.copy-btn). */
export default function CopyButton({ text, size = 12 }: { text: string; size?: number }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { navigator.clipboard?.writeText(text); } catch { /* clipboard unavailable */ }
    if (timer.current) clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${text}`}
      title={copied ? undefined : "Copy"}
      className="copy-btn relative inline-flex items-center justify-center bg-transparent border-none p-0 shrink-0"
    >
      {copied ? (
        <svg viewBox="0 0 12 12" fill="none" stroke="var(--color-green)" strokeWidth="1.7" style={{ width: size, height: size }}>
          <path d="M2 6.2L4.8 9 10 3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: size, height: size }}>
          <rect x="3" y="3" width="7" height="7" rx="1" /><path d="M2 8V2h6" />
        </svg>
      )}
      {copied && <span className="copy-pop">Copied!</span>}
    </button>
  );
}
