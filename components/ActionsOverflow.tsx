"use client";

import { useState, useRef, useEffect } from "react";

/* "⋯" overflow menu for page-header actions on small screens.
   Hidden ≥768px via .page-actions-overflow in globals.css.
   Children are rendered as menu rows (pass modals with `menuItem`). */
export default function ActionsOverflow({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="page-actions-overflow relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="More actions"
        title="More actions"
        className={`btn justify-center ${open ? "border-orange" : ""}`}
        style={{ width: 32, padding: 0 }}
      >
        <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
          <circle cx="3" cy="7" r="1.1"/><circle cx="7" cy="7" r="1.1"/><circle cx="11" cy="7" r="1.1"/>
        </svg>
      </button>

      {/* Always mounted: the children own their dialogs/toasts, so
          unmounting on close would kill an open modal. Closed state is
          hidden via visibility (see .actions-menu-closed) and the
          modal overlay/toast restore their own visibility. */}
      <div
        className={`actions-menu-panel absolute right-0 top-[calc(100%+6px)] z-40 min-w-[185px] bg-surface border border-ink-06 rounded-xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.04)] ${open ? "" : "actions-menu-closed"}`}
        onClick={() => setOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
