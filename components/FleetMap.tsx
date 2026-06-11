"use client";

import { useState, useRef, useEffect } from "react";
import { ROWS, STATUS_COLOR, STATUS_LABEL, STATUS_CLS } from "@/lib/fleet-data";
import type { ShipmentRow, VehicleIcon } from "@/lib/fleet-data";

/* -- Reusable filter dropdown ---------------------------- */
type FilterItem = { value: string; label: string; icon?: React.ReactNode };

function FilterDropdown({
  label, icon, value, items, onSelect, searchable = false, alignRight = false,
}: {
  label: string; icon: React.ReactNode; value: string;
  items: FilterItem[]; onSelect: (v: string) => void;
  searchable?: boolean; alignRight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive  = value !== "all";
  const filtered = searchable ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())) : items;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={["bg-surface border rounded-full px-2.5 py-1.5 text-[11px] font-medium tracking-[-0.004em] text-ink inline-flex items-center gap-1.5 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
          open ? "border-orange" : "border-ink-06"].join(" ")}
      >
        <span className="text-ink-40">{icon}</span>
        <span className="text-ink-40 whitespace-nowrap">{label}</span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />}
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"
          className={`w-[11px] h-[11px] text-ink-40 transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
          <path d="M3 5l4 4 4-4"/>
        </svg>
      </button>

      {open && (
        <div className={`absolute top-[calc(100%+6px)] z-30 bg-surface border border-ink-06 rounded-[14px] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.04)] min-w-[200px] max-h-[360px] overflow-auto ${alignRight ? "right-0" : "left-0"}`}>
          {searchable && (
            <div className="flex items-center gap-2 px-1 pb-2 border-b border-ink-04 mb-1.5">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5 text-ink-30 shrink-0">
                <circle cx="6" cy="6" r="4.5"/><path d="M10 10l3 3"/>
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search regions..."
                className="flex-1 border-none outline-none bg-transparent text-[13px] font-medium text-ink placeholder:text-ink-40"
              />
            </div>
          )}
          {filtered.map((item) => (
            <div
              key={item.value}
              onClick={() => { onSelect(item.value); setOpen(false); setQuery(""); }}
              className={["flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium tracking-[-0.004em] cursor-pointer",
                item.value === value ? "bg-[rgba(255,146,86,0.08)]" : "hover:bg-canvas"].join(" ")}
              style={{ color: "var(--color-ink)" }}
            >
              <span className="inline-flex items-center gap-2.5">
                {item.icon && <span className="w-4 h-4 inline-flex" style={{ color: "var(--color-ink-40)" }}>{item.icon}</span>}
                {item.label}
              </span>
              {item.value === value && (
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 shrink-0">
                  <path d="M2.5 7.5l3 3 6-7"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PinIcon({ icon }: { icon: VehicleIcon }) {
  if (icon === "van") return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5.22925 10.5001C5.08772 11.4895 4.23681 12.2501 3.20825 12.2501C2.1797 12.2501 1.32879 11.4895 1.18726 10.5001H0.583252V3.50008C0.583252 3.17792 0.844422 2.91675 1.16659 2.91675H9.33325C9.65543 2.91675 9.91659 3.17792 9.91659 3.50008V4.66675H11.6666L13.4166 7.03257V10.5001H12.2293C12.0877 11.4895 11.2368 12.2501 10.2083 12.2501C9.17972 12.2501 8.32881 11.4895 8.18724 10.5001H5.22925ZM8.74992 4.08341H1.74992V8.77954C2.12049 8.40137 2.63697 8.16675 3.20825 8.16675C4.0227 8.16675 4.72576 8.64362 5.05344 9.33342H8.36305C8.46088 9.1275 8.59219 8.94048 8.74992 8.77954V4.08341ZM9.91659 7.58342H12.2499V7.41717L11.0784 5.83342H9.91659V7.58342ZM10.2083 11.0834C10.5892 11.0834 10.9133 10.8399 11.0334 10.5001C11.0657 10.4088 11.0833 10.3107 11.0833 10.2084C11.0833 9.72518 10.6915 9.33342 10.2083 9.33342C9.72502 9.33342 9.33325 9.72518 9.33325 10.2084C9.33325 10.3107 9.35081 10.4088 9.38307 10.5001C9.50318 10.8399 9.82728 11.0834 10.2083 11.0834ZM4.08325 10.2084C4.08325 9.72518 3.6915 9.33342 3.20825 9.33342C2.725 9.33342 2.33325 9.72518 2.33325 10.2084C2.33325 10.3107 2.3508 10.4088 2.38304 10.5001C2.50316 10.8399 2.82727 11.0834 3.20825 11.0834C3.58923 11.0834 3.91334 10.8399 4.03346 10.5001C4.06571 10.4088 4.08325 10.3107 4.08325 10.2084Z" fill="white"/>
    </svg>
  );
  if (icon === "scooter") return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9.33341 0.583252C9.65559 0.583252 9.91675 0.844422 9.91675 1.16659V1.74992H12.8334V5.24992H11.6558L13.2576 9.65053C13.3603 9.91355 13.4167 10.1999 13.4167 10.4993C13.4167 11.788 12.3721 12.8327 11.0834 12.8327C9.99637 12.8327 9.08299 12.0893 8.82376 11.0833H6.34325C6.08419 12.0896 5.17065 12.8333 4.08341 12.8333C2.94913 12.8333 2.00388 12.0239 1.79368 10.9512C1.42106 10.7564 1.16675 10.3662 1.16675 9.91658V4.08325C1.16675 3.76109 1.42792 3.49992 1.75008 3.49992H5.83341C6.15559 3.49992 6.41675 3.76109 6.41675 4.08325V6.99992C6.41675 7.32209 6.67791 7.58325 7.00008 7.58325H8.16675C8.48892 7.58325 8.75008 7.32209 8.75008 6.99992V1.74992H7.00008V0.583252H9.33341ZM4.08341 9.33325C3.43908 9.33325 2.91675 9.85557 2.91675 10.4999C2.91675 11.1443 3.43908 11.6666 4.08341 11.6666C4.72775 11.6666 5.25008 11.1443 5.25008 10.4999C5.25008 9.85557 4.72775 9.33325 4.08341 9.33325ZM11.0834 9.33267C10.4391 9.33267 9.91675 9.85499 9.91675 10.4993C9.91675 11.1437 10.4391 11.666 11.0834 11.666C11.7278 11.666 12.2501 11.1437 12.2501 10.4993C12.2501 10.3592 12.2253 10.2247 12.18 10.1002L12.1705 10.0749C12.0007 9.64044 11.578 9.33267 11.0834 9.33267ZM10.4143 5.24992H9.91675V6.99992C9.91675 7.96644 9.13327 8.74992 8.16675 8.74992H7.00008C6.03356 8.74992 5.25008 7.96644 5.25008 6.99992H2.33341V8.95654C2.76096 8.47214 3.38651 8.16658 4.08341 8.16658C5.17065 8.16658 6.08419 8.91022 6.34325 9.91658H8.82346C9.08229 8.90993 9.99596 8.166 11.0834 8.166C11.2215 8.166 11.3569 8.17802 11.4884 8.20106L10.4143 5.24992ZM5.25008 4.66658H2.33341V5.83325H5.25008V4.66658ZM11.6667 2.91659H9.91675V4.08325H11.6667V2.91659Z" fill="white"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C10.8793 6.41666 10.9528 6.40249 11.0217 6.37495C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.62576 5.68559 2.6116 5.75912 2.6116 5.83333C2.6116 6.1555 2.87277 6.41666 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.55913 9.91666 8.51188 9.90482 8.46959 9.88219C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="white"/>
    </svg>
  );
}

function VehBadgeIcon({ icon }: { icon: VehicleIcon }) {
  const svg =
    icon === "van" ? (
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M5.22925 10.5001C5.08772 11.4895 4.23681 12.2501 3.20825 12.2501C2.1797 12.2501 1.32879 11.4895 1.18726 10.5001H0.583252V3.50008C0.583252 3.17792 0.844422 2.91675 1.16659 2.91675H9.33325C9.65543 2.91675 9.91659 3.17792 9.91659 3.50008V4.66675H11.6666L13.4166 7.03257V10.5001H12.2293C12.0877 11.4895 11.2368 12.2501 10.2083 12.2501C9.17972 12.2501 8.32881 11.4895 8.18724 10.5001H5.22925ZM8.74992 4.08341H1.74992V8.77954C2.12049 8.40137 2.63697 8.16675 3.20825 8.16675C4.0227 8.16675 4.72576 8.64362 5.05344 9.33342H8.36305C8.46088 9.1275 8.59219 8.94048 8.74992 8.77954V4.08341ZM9.91659 7.58342H12.2499V7.41717L11.0784 5.83342H9.91659V7.58342ZM10.2083 11.0834C10.5892 11.0834 10.9133 10.8399 11.0334 10.5001C11.0657 10.4088 11.0833 10.3107 11.0833 10.2084C11.0833 9.72518 10.6915 9.33342 10.2083 9.33342C9.72502 9.33342 9.33325 9.72518 9.33325 10.2084C9.33325 10.3107 9.35081 10.4088 9.38307 10.5001C9.50318 10.8399 9.82728 11.0834 10.2083 11.0834ZM4.08325 10.2084C4.08325 9.72518 3.6915 9.33342 3.20825 9.33342C2.725 9.33342 2.33325 9.72518 2.33325 10.2084C2.33325 10.3107 2.3508 10.4088 2.38304 10.5001C2.50316 10.8399 2.82727 11.0834 3.20825 11.0834C3.58923 11.0834 3.91334 10.8399 4.03346 10.5001C4.06571 10.4088 4.08325 10.3107 4.08325 10.2084Z" fill="currentColor" fillOpacity="0.4"/>
      </svg>
    ) : icon === "scooter" ? (
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M9.33341 0.583252C9.65559 0.583252 9.91675 0.844422 9.91675 1.16659V1.74992H12.8334V5.24992H11.6558L13.2576 9.65053C13.3603 9.91355 13.4167 10.1999 13.4167 10.4993C13.4167 11.788 12.3721 12.8327 11.0834 12.8327C9.99637 12.8327 9.08299 12.0893 8.82376 11.0833H6.34325C6.08419 12.0896 5.17065 12.8333 4.08341 12.8333C2.94913 12.8333 2.00388 12.0239 1.79368 10.9512C1.42106 10.7564 1.16675 10.3662 1.16675 9.91658V4.08325C1.16675 3.76109 1.42792 3.49992 1.75008 3.49992H5.83341C6.15559 3.49992 6.41675 3.76109 6.41675 4.08325V6.99992C6.41675 7.32209 6.67791 7.58325 7.00008 7.58325H8.16675C8.48892 7.58325 8.75008 7.32209 8.75008 6.99992V1.74992H7.00008V0.583252H9.33341ZM4.08341 9.33325C3.43908 9.33325 2.91675 9.85557 2.91675 10.4999C2.91675 11.1443 3.43908 11.6666 4.08341 11.6666C4.72775 11.6666 5.25008 11.1443 5.25008 10.4999C5.25008 9.85557 4.72775 9.33325 4.08341 9.33325ZM11.0834 9.33267C10.4391 9.33267 9.91675 9.85499 9.91675 10.4993C9.91675 11.1437 10.4391 11.666 11.0834 11.666C11.7278 11.666 12.2501 11.1437 12.2501 10.4993C12.2501 10.3592 12.2253 10.2247 12.18 10.1002L12.1705 10.0749C12.0007 9.64044 11.578 9.33267 11.0834 9.33267ZM10.4143 5.24992H9.91675V6.99992C9.91675 7.96644 9.13327 8.74992 8.16675 8.74992H7.00008C6.03356 8.74992 5.25008 7.96644 5.25008 6.99992H2.33341V8.95654C2.76096 8.47214 3.38651 8.16658 4.08341 8.16658C5.17065 8.16658 6.08419 8.91022 6.34325 9.91658H8.82346C9.08229 8.90993 9.99596 8.166 11.0834 8.166C11.2215 8.166 11.3569 8.17802 11.4884 8.20106L10.4143 5.24992ZM5.25008 4.66658H2.33341V5.83325H5.25008V4.66658ZM11.6667 2.91659H9.91675V4.08325H11.6667V2.91659Z" fill="currentColor" fillOpacity="0.4"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C10.8793 6.41666 10.9528 6.40249 11.0217 6.37495C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.62576 5.68559 2.6116 5.75912 2.6116 5.83333C2.6116 6.1555 2.87277 6.41666 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.55913 9.91666 8.51188 9.90482 8.46959 9.88219C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="currentColor" fillOpacity="0.4"/>
      </svg>
    );
  return svg;
}

function Popup({ row }: { row: ShipmentRow }) {
  const sCls   = STATUS_CLS[row.status];
  const sLbl   = STATUS_LABEL[row.status];
  const loadN  = parseInt(row.load);
  const fuelN  = parseInt(row.fuel);
  const loadC  = loadN >= 60 ? "#037847" : loadN >= 30 ? "#A15A00" : "#BB2422";
  const fuelC  = fuelN >= 60 ? "#037847" : fuelN >= 30 ? "#A15A00" : "#BB2422";
  const svcC   = row.service.startsWith("Overdue") ? "#BB2422" : "#037847";

  const rows = [
    { k: "Driver",        val: row.driver,      color: undefined },
    { k: "Load",          val: row.load,        color: loadC     },
    { k: "Last check in", val: row.lastCheckIn, color: undefined },
    { k: "Fuel",          val: row.fuel,        color: fuelC     },
    { k: "Service",       val: row.service,     color: svcC      },
  ];

  return (
    <div className="bg-surface border border-ink-06 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)] pointer-events-none flex flex-col" style={{ width: 229 }}>
      {/* Top section */}
      <div className="flex items-center justify-between shrink-0 px-3" style={{ height: 50, background: "var(--canvas)" }}>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--ink-40)" }}>
          <VehBadgeIcon icon={row.vehIcon} />
          {row.veh}
        </span>
        <span className={`inline-flex items-center px-2 h-4 rounded-full text-[10px] font-medium ${sCls}`}>{sLbl}</span>
      </div>
      {/* Separator */}
      <div style={{ height: 1, background: "var(--ink-06)" }} />
      {/* Body */}
      <div className="flex flex-col px-3 pt-3.5 pb-3 gap-5">
        {rows.map(r => (
          <div key={r.k} className="flex justify-between items-center text-[11px] font-medium">
            <span className="text-ink-40 tracking-[-0.004em]">{r.k}</span>
            <span style={{ color: r.color ?? "var(--ink)" }}>{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_ITEMS = [
  { value: "all",       label: "All"        },
  { value: "transit",   label: "In transit" },
  { value: "delayed",   label: "Delayed"    },
  { value: "idle",      label: "Idle"       },
  { value: "delivered", label: "Delivered"  },
  { value: "upcoming",  label: "Upcoming"   },
  { value: "cancelled", label: "Cancelled"  },
];

const REGION_ITEMS = [
  { value: "all",           label: "All regions"  },
  { value: "Lagos",         label: "Lagos"        },
  { value: "Abuja",         label: "Abuja"        },
  { value: "Port Harcourt", label: "Port Harcourt"},
  { value: "Kano",          label: "Kano"         },
  { value: "Ibadan",        label: "Ibadan"       },
  { value: "Kaduna",        label: "Kaduna"       },
];

const CarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C10.8793 6.41666 10.9528 6.40249 11.0217 6.37495C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.62576 5.68559 2.6116 5.75912 2.6116 5.83333C2.6116 6.1555 2.87277 6.41666 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.55913 9.91666 8.51188 9.90482 8.46959 9.88219C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="currentColor"/>
  </svg>
);

const VanIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.22925 10.5001C5.08772 11.4895 4.23681 12.2501 3.20825 12.2501C2.1797 12.2501 1.32879 11.4895 1.18726 10.5001H0.583252V3.50008C0.583252 3.17792 0.844422 2.91675 1.16659 2.91675H9.33325C9.65543 2.91675 9.91659 3.17792 9.91659 3.50008V4.66675H11.6666L13.4166 7.03257V10.5001H12.2293C12.0877 11.4895 11.2368 12.2501 10.2083 12.2501C9.17972 12.2501 8.32881 11.4895 8.18724 10.5001H5.22925ZM8.74992 4.08341H1.74992V8.77954C2.12049 8.40137 2.63697 8.16675 3.20825 8.16675C4.0227 8.16675 4.72576 8.64362 5.05344 9.33342H8.36305C8.46088 9.1275 8.59219 8.94048 8.74992 8.77954V4.08341ZM9.91659 7.58342H12.2499V7.41717L11.0784 5.83342H9.91659V7.58342ZM10.2083 11.0834C10.5892 11.0834 10.9133 10.8399 11.0334 10.5001C11.0657 10.4088 11.0833 10.3107 11.0833 10.2084C11.0833 9.72518 10.6915 9.33342 10.2083 9.33342C9.72502 9.33342 9.33325 9.72518 9.33325 10.2084C9.33325 10.3107 9.35081 10.4088 9.38307 10.5001C9.50318 10.8399 9.82728 11.0834 10.2083 11.0834ZM4.08325 10.2084C4.08325 9.72518 3.6915 9.33342 3.20825 9.33342C2.725 9.33342 2.33325 9.72518 2.33325 10.2084C2.33325 10.3107 2.3508 10.4088 2.38304 10.5001C2.50316 10.8399 2.82727 11.0834 3.20825 11.0834C3.58923 11.0834 3.91334 10.8399 4.03346 10.5001C4.06571 10.4088 4.08325 10.3107 4.08325 10.2084Z" fill="currentColor"/>
  </svg>
);

const ScooterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9.33341 0.583252C9.65559 0.583252 9.91675 0.844422 9.91675 1.16659V1.74992H12.8334V5.24992H11.6558L13.2576 9.65053C13.3603 9.91355 13.4167 10.1999 13.4167 10.4993C13.4167 11.788 12.3721 12.8327 11.0834 12.8327C9.99637 12.8327 9.08299 12.0893 8.82376 11.0833H6.34325C6.08419 12.0896 5.17065 12.8333 4.08341 12.8333C2.94913 12.8333 2.00388 12.0239 1.79368 10.9512C1.42106 10.7564 1.16675 10.3662 1.16675 9.91658V4.08325C1.16675 3.76109 1.42792 3.49992 1.75008 3.49992H5.83341C6.15559 3.49992 6.41675 3.76109 6.41675 4.08325V6.99992C6.41675 7.32209 6.67791 7.58325 7.00008 7.58325H8.16675C8.48892 7.58325 8.75008 7.32209 8.75008 6.99992V1.74992H7.00008V0.583252H9.33341ZM4.08341 9.33325C3.43908 9.33325 2.91675 9.85557 2.91675 10.4999C2.91675 11.1443 3.43908 11.6666 4.08341 11.6666C4.72775 11.6666 5.25008 11.1443 5.25008 10.4999C5.25008 9.85557 4.72775 9.33325 4.08341 9.33325ZM11.0834 9.33267C10.4391 9.33267 9.91675 9.85499 9.91675 10.4993C9.91675 11.1437 10.4391 11.666 11.0834 11.666C11.7278 11.666 12.2501 11.1437 12.2501 10.4993C12.2501 10.3592 12.2253 10.2247 12.18 10.1002L12.1705 10.0749C12.0007 9.64044 11.578 9.33267 11.0834 9.33267ZM10.4143 5.24992H9.91675V6.99992C9.91675 7.96644 9.13327 8.74992 8.16675 8.74992H7.00008C6.03356 8.74992 5.25008 7.96644 5.25008 6.99992H2.33341V8.95654C2.76096 8.47214 3.38651 8.16658 4.08341 8.16658C5.17065 8.16658 6.08419 8.91022 6.34325 9.91658H8.82346C9.08229 8.90993 9.99596 8.166 11.0834 8.166C11.2215 8.166 11.3569 8.17802 11.4884 8.20106L10.4143 5.24992ZM5.25008 4.66658H2.33341V5.83325H5.25008V4.66658ZM11.6667 2.91659H9.91675V4.08325H11.6667V2.91659Z" fill="currentColor"/>
  </svg>
);

const VEHICLE_ITEMS = [
  { value: "all",          label: "All",          icon: undefined                                    },
  { value: "Heavy truck",  label: "Heavy truck",  icon: <VanIcon />                                  },
  { value: "Delivery van", label: "Delivery van", icon: <VanIcon />                                  },
  { value: "Scooter",      label: "Scooter",      icon: <ScooterIcon />                              },
  { value: "Sedan car",    label: "Sedan car",    icon: <CarIcon />                                  },
];

export default function FleetMap() {
  const [hoveredId,     setHoveredId]     = useState<string | null>(null);
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [regionFilter,  setRegionFilter]  = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [search,        setSearch]        = useState("");
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  const filtersActive =
    statusFilter !== "all" || regionFilter !== "all" || vehicleFilter !== "all" || search !== "";

  const hoveredRow = ROWS.find((r) => r.id === hoveredId) ?? null;

  const visibleRows = ROWS.filter((row) => {
    if (statusFilter  !== "all" && row.status      !== statusFilter)  return false;
    if (regionFilter  !== "all" && row.region      !== regionFilter)  return false;
    if (vehicleFilter !== "all" && row.vehicleType !== vehicleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![row.veh, row.driver, row.region, row.from, row.to].join(" ").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Tapped pin → mobile popup (only rendered <768px)
  const selectedRow = visibleRows.find((r) => r.id === selectedId) ?? null;
  const fuelColor = (fuel: string) => {
    const n = parseInt(fuel);
    return n >= 60 ? "var(--color-green)" : n >= 30 ? "var(--color-amber)" : "var(--color-red)";
  };

  return (
    <div className="fleet-map-root bg-surface border border-ink-06 relative w-full" style={{ height: "437px", borderRadius: "12px", borderWidth: "1px" }}>
      {/* Map head */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3.5">
        <h3 className="m-0 text-sm font-medium tracking-[-0.008em]">
          Live fleet map
        </h3>
        <div className="fleet-map-desktop-controls flex gap-2">
          <FilterDropdown
            label="Status:" value={statusFilter} items={STATUS_ITEMS} onSelect={setStatusFilter} alignRight
            icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[11px] h-[11px]"><path d="M1 3h12M3 7h8M5 11h4"/></svg>}
          />
          <FilterDropdown
            label="Region:" value={regionFilter} items={REGION_ITEMS} onSelect={setRegionFilter} searchable alignRight
            icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[11px] h-[11px]"><path d="M7 1c2.5 0 4.5 2 4.5 4.5C11.5 9 7 13 7 13S2.5 9 2.5 5.5C2.5 3 4.5 1 7 1z"/><circle cx="7" cy="5.5" r="1.7"/></svg>}
          />
          <FilterDropdown
            label="Vehicle:" value={vehicleFilter} items={VEHICLE_ITEMS} onSelect={setVehicleFilter} alignRight
            icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[11px] h-[11px]"><path d="M1 3h12M3 7h8M5 11h4"/></svg>}
          />
          {/* Search */}
          <div className="bg-surface border border-ink-06 rounded-full px-2.5 py-1.5 text-[11px] font-medium tracking-[-0.004em] text-ink-30 inline-flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-w-[170px]">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[11px] h-[11px] shrink-0"><circle cx="6" cy="6" r="4.5"/><path d="M10 10l3 3"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for fleets"
              className="border-none outline-none bg-transparent text-[11px] font-medium text-ink placeholder:text-ink-30 w-full"
            />
          </div>
        </div>
        <div ref={panelRef} className="fleet-map-mobile-controls relative">
          <button type="button" className="mobile-filter-btn" onClick={() => setPanelOpen(o => !o)}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M1 3h12M3 7h8M5 11h4" />
            </svg>
            Filter
            {filtersActive && <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />}
          </button>
          <button type="button" className="mobile-icon-btn" aria-label="Search fleets" onClick={() => setPanelOpen(o => !o)}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="6" cy="6" r="4.5" />
              <path d="M10 10l3 3" />
            </svg>
          </button>

          {panelOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-30 flex flex-col items-stretch gap-2.5 bg-surface border border-ink-06 rounded-xl p-3 w-[224px] shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
              <div className="bg-surface border border-ink-06 rounded-full px-2.5 py-1.5 text-[11px] font-medium tracking-[-0.004em] text-ink-30 inline-flex items-center gap-1.5">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[11px] h-[11px] shrink-0"><circle cx="6" cy="6" r="4.5"/><path d="M10 10l3 3"/></svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for fleets"
                  className="border-none outline-none bg-transparent text-[11px] font-medium text-ink placeholder:text-ink-30 w-full"
                />
              </div>
              <FilterDropdown
                label="Status:" value={statusFilter} items={STATUS_ITEMS} onSelect={setStatusFilter}
                icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[11px] h-[11px]"><path d="M1 3h12M3 7h8M5 11h4"/></svg>}
              />
              <FilterDropdown
                label="Region:" value={regionFilter} items={REGION_ITEMS} onSelect={setRegionFilter} searchable
                icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[11px] h-[11px]"><path d="M7 1c2.5 0 4.5 2 4.5 4.5C11.5 9 7 13 7 13S2.5 9 2.5 5.5C2.5 3 4.5 1 7 1z"/><circle cx="7" cy="5.5" r="1.7"/></svg>}
              />
              <FilterDropdown
                label="Vehicle:" value={vehicleFilter} items={VEHICLE_ITEMS} onSelect={setVehicleFilter}
                icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[11px] h-[11px]"><path d="M1 3h12M3 7h8M5 11h4"/></svg>}
              />
            </div>
          )}
        </div>
      </div>

      {/* Map canvas */}
      <div className="absolute inset-0 overflow-hidden fleet-map-surface" style={{ borderRadius: "12px" }}>
        <img src="/map-clean.png" alt="" className="map-light" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <img src="/map-dark.jpg" alt="" className="map-dark" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />

        {/* Pins */}
        {visibleRows.map((row) => {
          const bg = STATUS_COLOR[row.status];
          const isHovered = hoveredId === row.id;
          const lNum = parseFloat(row.mapPos.l);
          const tNum = parseFloat(row.mapPos.t);
          const showRight = lNum <= 55;
          const showBelow = tNum <= 50;
          const popupStyle: React.CSSProperties = {
            ...(showRight ? { left: "38px" } : { right: "38px" }),
            ...(showBelow ? { top: 0 } : { bottom: 0 }),
          };

          return (
            <div
              key={row.id}
              className="absolute"
              style={{ left: row.mapPos.l, top: row.mapPos.t, transform: "translate(-50%, -50%)", zIndex: isHovered ? 20 : 10 }}
              onMouseEnter={() => setHoveredId(row.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedId((id) => (id === row.id ? null : row.id))}
            >
              <div
                className="w-[30px] h-[30px] flex items-center justify-center shadow-[0_8px_18px_rgba(0,0,0,0.18)] cursor-pointer transition-transform duration-100"
                style={{ borderRadius: "50%", background: bg, transform: isHovered ? "scale(1.15)" : "scale(1)" }}
              >
                <PinIcon icon={row.vehIcon} />
              </div>

              {isHovered && hoveredRow && (
                <div className="fleet-hover-popup absolute z-30" style={popupStyle}>
                  <div className="relative">
                    <Popup row={hoveredRow} />
                    <div style={{
                      position: "absolute",
                      width: 10,
                      height: 10,
                      background: "var(--canvas)",
                      ...(showBelow ? { top: 18 } : { bottom: 18 }),
                      transform: "rotate(45deg)",
                      ...(showRight
                        ? { left: -5,  borderBottom: "1px solid var(--ink-06)", borderLeft:  "1px solid var(--ink-06)" }
                        : { right: -5, borderTop:    "1px solid var(--ink-06)", borderRight: "1px solid var(--ink-06)" }
                      ),
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {selectedRow && (
          <div className="fleet-map-mobile-popup">
            <div className="mobile-map-popup-head">
              <span className="mobile-map-order">
                <span className="mobile-popup-dot" style={{ background: STATUS_COLOR[selectedRow.status] }}>
                  <PinIcon icon={selectedRow.vehIcon} />
                </span>
                Order {selectedRow.id}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className={`mobile-map-status ${STATUS_CLS[selectedRow.status]}`}>
                  {STATUS_LABEL[selectedRow.status]}
                </span>
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="Close vehicle details"
                  className="w-6 h-6 rounded-full bg-canvas border border-ink-06 inline-flex items-center justify-center cursor-pointer shrink-0"
                >
                  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-2.5 h-2.5">
                    <path d="M2 2l6 6M8 2L2 8"/>
                  </svg>
                </button>
              </span>
            </div>
            <div className="mobile-map-popup-body">
              <span>Driver</span><strong>{selectedRow.driver}</strong>
              <span>Location</span><strong><em>{selectedRow.from}</em> <span>→</span> {selectedRow.to}</strong>
              <span>Last check in</span><strong>{selectedRow.lastCheckIn}</strong>
              <span>Fuel</span><strong style={{ color: fuelColor(selectedRow.fuel) }}>{selectedRow.fuel}</strong>
            </div>
          </div>
        )}

      </div>

      {/* Legend */}
      <div className="fleet-map-desktop-legend absolute left-3.5 bottom-3.5 z-10 flex gap-1 bg-surface border border-ink-06 rounded-full px-2 py-1 text-[10px] font-medium tracking-[-0.004em] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        {[
          { label: "In transit", dot: "bg-green"       },
          { label: "Delayed",    dot: "bg-red"         },
          { label: "Idle",       dot: "bg-amber"       },
          { label: "Delivered",  dot: "bg-green"       },
          { label: "Upcoming",   dot: "bg-[#667085]"   },
          { label: "Cancelled",  dot: "bg-red"         },
        ].map((l, i, arr) => (
          <span key={l.label} className="inline-flex items-center gap-[3px]">
            <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${l.dot}`} />
            {l.label}
            {i < arr.length - 1 && <span className="ml-0.5 text-ink-10">·</span>}
          </span>
        ))}
      </div>
      <div className="fleet-map-mobile-legend">
        {[
          { label: "Active", dot: "bg-green" },
          { label: "Delayed", dot: "bg-red" },
          { label: "Idle", dot: "bg-amber" },
        ].map((l) => (
          <span key={l.label}>
            <span className={l.dot} />
            {l.label}
          </span>
        ))}
      </div>
      {/* Maximize */}
      <div className="fleet-map-maximize absolute right-3.5 bottom-3.5 z-10 w-7 h-7 bg-surface border border-ink-06 rounded-lg inline-flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5">
          <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/>
        </svg>
      </div>
    </div>
  );
}
