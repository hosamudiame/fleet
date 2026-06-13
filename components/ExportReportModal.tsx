"use client";

import { useState, useRef } from "react";

const XBtn = ({ onClose }: { onClose: () => void }) => (
  <button
    onClick={onClose}
    className="w-8 h-8 rounded-full bg-surface border border-ink-04 inline-flex items-center justify-center cursor-pointer shrink-0 hover:bg-canvas"
  >
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <path d="M3 3l8 8M11 3l-8 8"/>
    </svg>
  </button>
);

const FORMATS   = ["PDF", "CSV", "XLSX"] as const;
const RANGES    = ["Today", "This week", "This month", "This quarter", "Custom"] as const;
const INCLUDES  = [
  { label: "KPI summary",               count: "4 metrics"  },
  { label: "Orders table",              count: "218 rows"   },
  { label: "Today's delivery schedule", count: "12 items"   },
  { label: "Active drivers",            count: "28 drivers" },
  { label: "Upcoming deliveries",       count: "9 vehicles" },
];

const FLEET_VEHICLES = ["/icons/TRK-001.png", "/icons/SCT-029.png", "/icons/TRK-009.png", "/icons/CAR-092.png"];

export default function ExportReportModal({ menuItem = false }: { menuItem?: boolean } = {}) {
  const [open,      setOpen]      = useState(false);
  const [format,    setFormat]    = useState<string>("PDF");
  const [range,     setRange]     = useState<string>("Today");
  const [included,  setIncluded]  = useState<Set<string>>(
    new Set(INCLUDES.map((i) => i.label))
  );
  const [animating, setAnimating] = useState(false);
  const [toast,     setToast]     = useState(false);
  const [vehicle,   setVehicle]   = useState(FLEET_VEHICLES[0]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setVehicle(FLEET_VEHICLES[Math.floor(Math.random() * FLEET_VEHICLES.length)]);
    setToast(true);
    toastTimer.current = setTimeout(() => setToast(false), 3500);
  };

  const handleHover = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 500);
  };

  const toggleInclude = (label: string) =>
    setIncluded((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });


  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={handleHover}
        className={menuItem
          ? "w-full bg-transparent border-none flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium tracking-[-0.004em] text-ink hover:bg-canvas cursor-pointer text-left"
          : "btn"}
      >
        <span style={{ display: "inline-flex" }}>
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14" style={{ overflow: "visible" }}>
            {/* Tray base — stays still */}
            <path d="M2.33329 11.0834H11.6666V7.00008H12.8333V11.6667C12.8333 11.9889 12.5721 12.2501 12.25 12.2501H1.74996C1.4278 12.2501 1.16663 11.9889 1.16663 11.6667V7.00008H2.33329V11.0834Z" fill="currentColor" />
            {/* Arrow — flies up on hover */}
            <path
              d="M8.16663 5.25008V8.75008H5.83329V5.25008H2.91663L6.99996 1.16675L11.0833 5.25008H8.16663Z"
              fill="currentColor"
              style={{
                transform: animating ? "translateY(-12px)" : "translateY(0)",
                opacity: animating ? 0 : 1,
                transition: animating
                  ? "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease"
                  : "transform 0.2s ease, opacity 0.2s ease",
              }}
            />
          </svg>
        </span>
        <span>Export report</span>
      </button>

      {open && (
        <div
          className="export-modal-wrap modal-overlay-wrap fixed inset-0 z-50 flex items-center justify-center px-5 py-10 bg-black/[0.35] backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="modal-shell max-w-full max-h-[calc(100vh-80px)] bg-surface rounded-[24px] flex flex-col overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.18)]" style={{ width: "clamp(580px, calc(100vw - 680px), 700px)" }}>

            {/* Head */}
            <div className="modal-head px-4 pt-6 pb-5 flex items-start justify-between gap-3 border-b border-ink-04 shrink-0">
              <div className="flex flex-col gap-1.5">
                <h2 className="m-0 text-[18px] font-medium leading-none tracking-[-0.002em]">Export report</h2>
                <span className="text-sm font-normal leading-none tracking-[-0.004em] text-ink-40">Download a snapshot of your fleet data</span>
              </div>
              <XBtn onClose={() => setOpen(false)} />
            </div>

            {/* Body */}
            <div className="modal-body px-4 py-6 overflow-auto flex flex-col gap-5 flex-1">

              {/* Format */}
              <div>
                <div className="text-base font-medium tracking-[-0.008em] mb-3">Format</div>
                <div className="flex gap-2.5 flex-wrap">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={["h-9 px-[18px] rounded-full border text-sm font-medium tracking-[-0.008em] cursor-pointer transition-colors",
                        format === f
                          ? "bg-[rgba(255,146,86,0.08)] border-orange text-orange"
                          : "bg-canvas border-ink-06 text-ink hover:border-orange",
                      ].join(" ")}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-ink-04" />

              {/* Date range */}
              <div>
                <div className="text-base font-medium tracking-[-0.008em] mb-3">Date range</div>
                <div className="flex gap-2.5 flex-wrap">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={["h-9 px-[18px] rounded-full border text-sm font-medium tracking-[-0.008em] cursor-pointer transition-colors",
                        range === r
                          ? "bg-[rgba(255,146,86,0.08)] border-orange text-orange"
                          : "bg-canvas border-ink-06 text-ink hover:border-orange",
                      ].join(" ")}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-ink-04" />

              {/* Include */}
              <div>
                <div className="text-base font-medium tracking-[-0.008em] mb-1">Include</div>
                {INCLUDES.map((item, i) => {
                  const on = included.has(item.label);
                  return (
                    <div
                      key={item.label}
                      onClick={() => toggleInclude(item.label)}
                      className={["flex items-center justify-between py-3 cursor-pointer",
                        i > 0 ? "border-t border-ink-04" : ""].join(" ")}
                    >
                      <span className="inline-flex items-center gap-3 text-sm font-medium tracking-[-0.004em]">
                        <span className={["w-5 h-5 rounded-[5px] border inline-flex items-center justify-center shrink-0",
                          on ? "bg-orange border-orange" : "bg-surface border-ink-10"].join(" ")}>
                          {on && (
                            <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" className="w-3 h-3">
                              <path d="M2 6l2.5 2.5L10 3"/>
                            </svg>
                          )}
                        </span>
                        {item.label}
                      </span>
                      <span className="text-[13px] font-normal text-ink-40 tracking-[-0.004em]">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-foot border-t border-ink-04 p-[14px_16px] grid grid-cols-2 gap-3 shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="h-11 rounded-xl border border-ink-04 bg-surface text-ink text-sm font-medium tracking-[-0.008em] cursor-pointer hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                onClick={() => { setOpen(false); showToast(); }}
                className="h-11 rounded-xl border border-black/[0.06] bg-orange text-white text-sm font-medium tracking-[-0.008em] cursor-pointer hover:bg-[#ff8344] inline-flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M2.33329 11.0834H11.6666V7.00008H12.8333V11.6667C12.8333 11.9889 12.5721 12.2501 12.25 12.2501H1.74996C1.4278 12.2501 1.16663 11.9889 1.16663 11.6667V7.00008H2.33329V11.0834ZM8.16663 5.25008V8.75008H5.83329V5.25008H2.91663L6.99996 1.16675L11.0833 5.25008H8.16663Z"/>
                </svg>
                Export
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
                <img src={vehicle} style={{
                  width: 60, height: 32, objectFit: "contain",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.55)) brightness(1.1)",
                }} />
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
            <span className="text-[13px] font-semibold text-white tracking-[-0.008em]">Report exported successfully</span>
            <span className="toast-desc text-[13px] font-normal tracking-[-0.004em]" style={{ color: "rgba(255,255,255,0.7)" }}>
              — Your {format} report is ready to download.
            </span>
          </div>
          <button
            onClick={() => setToast(false)}
            className="shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center cursor-pointer transition-colors"
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
          0%   { transform: translateX(-90px);              animation-timing-function: cubic-bezier(0.15,0,0.1,1); }
          16%  { transform: translateX(calc(62vw + 14px));  animation-timing-function: cubic-bezier(0.34,1.5,0.64,1); }
          21%  { transform: translateX(calc(62vw));         animation-timing-function: linear; }
          82%  { transform: translateX(calc(62vw));         animation-timing-function: cubic-bezier(0.8,0,1,0.45); }
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
