"use client";

import { useState, useRef } from "react";

const FLEET_VEHICLES = ["/icons/TRK-001.png", "/icons/SCT-029.png", "/icons/TRK-009.png", "/icons/CAR-092.png"];

const KPI_OPTIONS    = ["Active vehicles", "Deliveries today", "On-time rate", "Exceptions", "Avg delivery time", "Fleet utilisation"];
const WIDGET_OPTIONS = ["Today's schedule", "Active drivers", "Upcoming maintenance", "Recent alerts", "Top routes", "Driver performance"];

const DEFAULT_KPIS    = ["Active vehicles", "Deliveries today", "On-time rate", "Exceptions"];
const DEFAULT_WIDGETS = ["Today's schedule", "Active drivers", "Upcoming maintenance"];

const LockIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3 h-3">
    <rect x="3" y="6" width="8" height="6" rx="1"/><path d="M5 6V4a2 2 0 014 0v2"/>
  </svg>
);

export default function CustomiseModal({
  kpis:     externalKpis    = DEFAULT_KPIS,
  widgets:  externalWidgets = DEFAULT_WIDGETS,
  onSave,
  menuItem = false,
}: {
  kpis?:    string[];
  widgets?: string[];
  onSave?:  (kpis: string[], widgets: string[]) => void;
  menuItem?: boolean;
}) {
  const [open,        setOpen]        = useState(false);
  const [gearHovered, setGearHovered] = useState(false);
  const [kpis,        setKpis]        = useState<string[]>(externalKpis);
  const [widgets,     setWidgets]     = useState<string[]>(externalWidgets);
  const [picking,     setPicking]     = useState<{ type: "kpi" | "widget"; index: number } | null>(null);
  const [toast,       setToast]       = useState(false);
  const [vehicle,     setVehicle]     = useState(FLEET_VEHICLES[0]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => { setKpis([...DEFAULT_KPIS]); setWidgets([...DEFAULT_WIDGETS]); setPicking(null); };

  const handleOpen = () => {
    setKpis(externalKpis);
    setWidgets(externalWidgets);
    setPicking(null);
    setOpen(true);
  };

  const select = (value: string) => {
    if (!picking) return;
    if (picking.type === "kpi") {
      const next = [...kpis]; next[picking.index] = value; setKpis(next);
    } else {
      const next = [...widgets]; next[picking.index] = value; setWidgets(next);
    }
    setPicking(null);
  };

  const availableOptions = picking
    ? (picking.type === "kpi" ? KPI_OPTIONS : WIDGET_OPTIONS).filter(
        (o) => !(picking.type === "kpi" ? kpis : widgets).includes(o) ||
               (picking.type === "kpi" ? kpis : widgets)[picking.index] === o
      )
    : [];

  const handleSave = () => {
    onSave?.(kpis, widgets);
    setOpen(false);
    setPicking(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setVehicle(FLEET_VEHICLES[Math.floor(Math.random() * FLEET_VEHICLES.length)]);
    setToast(true);
    toastTimer.current = setTimeout(() => setToast(false), 3500);
  };

  const handleClose = () => { setOpen(false); setPicking(null); };

  return (
    <>
      <button
        onClick={handleOpen}
        onMouseEnter={() => setGearHovered(true)}
        onMouseLeave={() => setGearHovered(false)}
        className={menuItem
          ? "w-full bg-transparent border-none flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium tracking-[-0.004em] text-ink hover:bg-canvas cursor-pointer text-left"
          : "btn"}
      >
        <img
          src="/icons/customise.svg"
          alt=""
          className="w-3.5 h-3.5 icon-adaptive"
          style={{
            transform:  gearHovered ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        Customise
      </button>

      {open && (
        <div
          className="modal-overlay-wrap fixed inset-0 z-50 flex items-center justify-center px-5 py-10 bg-black/[0.35] backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="modal-shell max-w-full max-h-[calc(100vh-80px)] bg-surface rounded-[24px] flex flex-col overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.18)]" style={{ width: "clamp(580px, calc(100vw - 680px), 700px)" }}>

            {/* Head */}
            <div className="px-4 pt-6 pb-5 flex items-start justify-between gap-3 border-b border-ink-04 shrink-0">
              <div className="flex flex-col gap-1.5">
                <h2 className="m-0 text-[18px] font-medium leading-none tracking-[-0.002em]">Customise overview</h2>
                <span className="text-sm font-normal leading-none tracking-[-0.004em] text-ink-40">Pick what shows in each slot of your dashboard</span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-surface border border-ink-04 inline-flex items-center justify-center cursor-pointer shrink-0 hover:bg-canvas"
              >
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                  <path d="M3 3l8 8M11 3l-8 8"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-6 overflow-auto flex flex-col gap-5 flex-1">
              <p className="m-0 text-sm font-normal leading-relaxed tracking-[-0.004em] text-ink-60">
                Tap any tile below to change what it shows. Map and orders table are part of the core layout and can&apos;t be swapped.
              </p>

              <div className="bg-canvas rounded-2xl p-4 flex flex-col gap-3.5">
                <button onClick={reset} className="self-end text-[13px] font-medium tracking-[-0.004em] cursor-pointer bg-transparent border-none p-0 text-ink hover:text-orange">
                  <span className="font-medium">Reset</span> to default
                </button>

                {/* KPI row */}
                <div className="modal-grid-4 grid grid-cols-4 gap-2.5">
                  {kpis.map((kpi, i) => (
                    <div
                      key={i}
                      onClick={() => setPicking(picking?.type === "kpi" && picking.index === i ? null : { type: "kpi", index: i })}
                      className={["border rounded-xl bg-surface p-3.5 min-h-[80px] flex flex-col justify-between cursor-pointer transition-colors",
                        picking?.type === "kpi" && picking.index === i
                          ? "border-orange bg-[rgba(255,146,86,0.03)]"
                          : "border-ink-06 hover:border-orange"].join(" ")}
                    >
                      <span className="text-[11px] font-normal text-ink-40 tracking-[-0.004em]">KPI {i + 1}</span>
                      <span className="text-sm font-medium tracking-[-0.008em] leading-snug">{kpi}</span>
                    </div>
                  ))}
                </div>

                {/* Widget + locked cols */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Editable widgets */}
                  <div className="flex flex-col gap-2.5">
                    {widgets.map((w, i) => (
                      <div
                        key={i}
                        onClick={() => setPicking(picking?.type === "widget" && picking.index === i ? null : { type: "widget", index: i })}
                        className={["border rounded-xl bg-surface p-3.5 min-h-[80px] flex flex-col justify-between cursor-pointer transition-colors",
                          picking?.type === "widget" && picking.index === i
                            ? "border-orange bg-[rgba(255,146,86,0.03)]"
                            : "border-ink-06 hover:border-orange"].join(" ")}
                      >
                        <span className="text-[11px] font-normal text-ink-40 tracking-[-0.004em]">Widget {i + 1}</span>
                        <span className="text-sm font-medium tracking-[-0.008em]">{w}</span>
                      </div>
                    ))}
                  </div>

                  {/* Locked col */}
                  <div className="flex flex-col gap-2.5">
                    {[{ label: "Live fleet map", size: "min-h-[120px]" }, { label: "Orders table", size: "min-h-[140px]" }].map((l) => (
                      <div
                        key={l.label}
                        className={`border border-dashed border-ink-06 rounded-xl p-3.5 flex flex-col justify-between cursor-not-allowed ${l.size}`}
                        style={{ background: "var(--ink-03)" }}
                      >
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-normal text-ink-40">
                          <LockIcon /> Locked
                        </span>
                        <span className="text-sm font-medium tracking-[-0.008em] text-ink-40">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Picker dropdown */}
                {picking && (
                  <div className="border border-ink-06 rounded-xl bg-surface overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <div className="px-3.5 py-2.5 border-b border-ink-04 text-xs font-medium text-ink-40 tracking-[-0.004em]">
                      Select {picking.type === "kpi" ? "a KPI" : "a widget"} for slot {picking.index + 1}
                    </div>
                    {availableOptions.map((opt) => {
                      const current = picking.type === "kpi" ? kpis[picking.index] : widgets[picking.index];
                      return (
                        <div
                          key={opt}
                          onClick={() => select(opt)}
                          className={["px-3.5 py-2.5 text-sm font-medium tracking-[-0.008em] cursor-pointer flex items-center justify-between",
                            opt === current ? "text-orange bg-[rgba(255,146,86,0.04)]" : "text-ink hover:bg-canvas"].join(" ")}
                        >
                          {opt}
                          {opt === current && (
                            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-orange">
                              <path d="M2 7l3.5 3.5L12 3"/>
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-ink-04 p-[14px_16px] grid grid-cols-2 gap-3 shrink-0">
              <button
                onClick={handleClose}
                className="h-11 rounded-xl border border-ink-04 bg-surface text-ink text-sm font-medium tracking-[-0.008em] cursor-pointer hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-11 rounded-xl border border-black/[0.06] bg-orange text-white text-sm font-medium tracking-[-0.008em] cursor-pointer hover:bg-[#ff8344]"
              >
                Save changes
              </button>
            </div>

          </div>
        </div>
      )}
      {toast && (
        <div
          className="app-toast fixed top-0 left-0 right-0 z-[200] flex items-center justify-between gap-4 px-5 overflow-hidden"
          style={{ height: 52, background: "#037847", animation: "banner-slide 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {/* Road scene */}
          <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: "none" }}>
            <div style={{
              position: "absolute", bottom: 9, left: 0, right: 0, height: 2,
              backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.45) 0 18px, transparent 18px 36px)",
              backgroundSize: "36px 100%",
              animation: "road-scroll 0.32s linear infinite",
            }} />
            <div style={{ position: "absolute", bottom: 5, animation: "car-journey 3.5s forwards" }}>
              <div style={{ position: "relative", animation: "car-idle 0.16s ease-in-out infinite" }}>
                <div style={{
                  position: "absolute", right: "100%", top: "18%", bottom: "18%", width: 40,
                  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.55))",
                  animation: "speed-opacity 3.5s linear forwards",
                }} />
                <div style={{ position: "absolute", right: "88%", top: "28%", width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "exhaust 1.1s 0.78s ease-out infinite" }} />
                <div style={{ position: "absolute", right: "88%", top: "38%", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.25)", animation: "exhaust 1.1s 1.18s ease-out infinite" }} />
                <img src={vehicle} style={{ width: 60, height: 32, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.55)) brightness(1.1)" }} />
                <div style={{
                  position: "absolute", left: "98%", top: "20%", width: 26, bottom: "20%",
                  background: "linear-gradient(to right, rgba(255,252,180,0.55), transparent)",
                  clipPath: "polygon(0% 15%, 100% 0%, 100% 100%, 0% 85%)",
                }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <svg viewBox="0 0 18 18" fill="none" className="w-[18px] h-[18px] shrink-0" style={{ color: "rgba(255,255,255,0.9)" }}>
              <path d="M3.5 9l4 4L14.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[13px] font-semibold text-white tracking-[-0.008em]">Dashboard updated</span>
            <span className="text-[13px] font-normal tracking-[-0.004em]" style={{ color: "rgba(255,255,255,0.7)" }}>
              — Your layout changes have been saved.
            </span>
          </div>
          <button
            onClick={() => setToast(false)}
            className="shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center cursor-pointer transition-colors relative"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.6" className="w-2.5 h-2.5">
              <path d="M2 2l6 6M8 2L2 8"/>
            </svg>
          </button>
          <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "rgba(255,255,255,0.25)" }}>
            <div className="h-full" style={{ background: "rgba(255,255,255,0.6)", animation: "banner-progress 3.5s linear forwards" }} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes banner-slide {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes banner-progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        @keyframes car-journey {
          0%   { transform: translateX(-90px);             animation-timing-function: cubic-bezier(0.15,0,0.1,1); }
          16%  { transform: translateX(calc(62vw + 14px)); animation-timing-function: cubic-bezier(0.34,1.5,0.64,1); }
          21%  { transform: translateX(calc(62vw));        animation-timing-function: linear; }
          82%  { transform: translateX(calc(62vw));        animation-timing-function: cubic-bezier(0.8,0,1,0.45); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes car-idle {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-1px); }
        }
        @keyframes road-scroll {
          from { background-position: 0 0; }
          to   { background-position: -36px 0; }
        }
        @keyframes speed-opacity {
          0%   { opacity: 1; }
          18%  { opacity: 0; }
          82%  { opacity: 0; }
          88%  { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes exhaust {
          0%   { transform: translate(0,0)        scale(0.5); opacity: 0.5; }
          100% { transform: translate(-7px,-14px) scale(2.2); opacity: 0;   }
        }
      `}</style>
    </>
  );
}
