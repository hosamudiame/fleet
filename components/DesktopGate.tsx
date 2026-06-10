"use client";

import { useEffect, useState } from "react";

export default function DesktopGate() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Vehicles — each independently fixed, no shared wrapper */}
      {mounted && (
        <>
          <div style={{ position: "fixed", top: "14%", left: "-8%", zIndex: 20, pointerEvents: "none", animation: "drive-r 13s linear infinite", animationDelay: "-5s" }}>
            <img src="/icons/TRK-001.png" alt="" style={{ width: 80, height: 42, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.30))" }} />
          </div>

          <div style={{ position: "fixed", top: "60%", left: "108%", zIndex: 20, pointerEvents: "none", animation: "drive-l 10s linear infinite", animationDelay: "-3.5s" }}>
            <img src="/icons/CAR-092.png" alt="" style={{ width: 72, height: 38, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.30))", transform: "scaleX(-1)" }} />
          </div>

          <div style={{ position: "fixed", top: "74%", left: "-8%", zIndex: 20, pointerEvents: "none", animation: "drive-r-up 16s linear infinite", animationDelay: "-9s" }}>
            <img src="/icons/SCT-029.png" alt="" style={{ width: 68, height: 36, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.30))" }} />
          </div>

          <div style={{ position: "fixed", top: "32%", left: "108%", zIndex: 20, pointerEvents: "none", animation: "drive-l-down 12s linear infinite", animationDelay: "-6s" }}>
            <img src="/icons/TRK-009.png" alt="" style={{ width: 80, height: 42, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.30))", transform: "scaleX(-1)" }} />
          </div>
        </>
      )}

      {/* Full-screen background + centred card */}
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-canvas px-8 text-center">

        {/* Map background */}
        <div
          className="map-bg-light absolute inset-0"
          style={{ opacity: 0.24, filter: "blur(2px)", transform: "scale(1.06)" }}
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 72% 68% at 50% 50%, rgba(250,250,250,0.3) 0%, rgba(250,250,250,0.82) 62%, rgba(250,250,250,0.97) 100%)",
          }}
        />

        {/* Central card */}
        <div
          className="relative flex flex-col items-center gap-5 bg-surface border border-ink-06 rounded-2xl px-8 py-8"
          style={{
            zIndex: 10,
            boxShadow: "0 8px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05)",
            maxWidth: "300px",
            width: "100%",
          }}
        >
          <img src="/icons/logo.png" alt="Fleetops" className="h-6 w-auto" />

          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-sm font-semibold tracking-[-0.016em] text-ink">
              Built for the big screen.
            </p>
            <p className="m-0 text-xs text-ink-40 leading-relaxed">
              Open Fleetops on a laptop or desktop to access the full dashboard.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border border-ink-06 bg-canvas">
            <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: "#0ab86d" }} />
            <span className="text-[11px] font-medium text-ink-40">47 vehicles tracked live</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drive-r {
          0%   { transform: translateX(0);          }
          100% { transform: translateX(116vw);       }
        }
        @keyframes drive-l {
          0%   { transform: translateX(0);           }
          100% { transform: translateX(-116vw);      }
        }
        @keyframes drive-r-up {
          0%   { transform: translate(0, 0);         }
          100% { transform: translate(116vw, -20vh); }
        }
        @keyframes drive-l-down {
          0%   { transform: translate(0, 0);         }
          100% { transform: translate(-116vw, 16vh); }
        }
        @keyframes live-glow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(10,184,109,0.22); }
          50%       { box-shadow: 0 0 0 6px rgba(10,184,109,0.12); }
        }
        .live-dot { animation: live-glow 2s ease-in-out infinite; }
      `}</style>
    </>
  );
}
