"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ROWS, STATUS_CLS, STATUS_LABEL, STATUS_COLOR } from "@/lib/fleet-data";
import type { ShipmentRow } from "@/lib/fleet-data";
const DATE_OPTIONS = ["Today", "Yesterday", "This week", "This month", "Custom range"] as const;
type DateRange = typeof DATE_OPTIONS[number];

import CopyButton from "@/components/CopyButton";

const TABS = ["All", "Pending", "Completed", "Cancelled"] as const;
type Tab = typeof TABS[number];

const TAB_FILTER: Record<Tab, string[]> = {
  All:       ["transit", "delayed", "idle", "delivered", "upcoming", "cancelled"],
  Pending:   ["transit", "idle", "upcoming"],
  Completed: ["delivered"],
  Cancelled: ["cancelled", "delayed"],
};

function MobileOrders({ rows, activeTab, onTabChange, dateRange, onDateChange }: {
  rows: ShipmentRow[];
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  dateRange: DateRange;
  onDateChange: (d: DateRange) => void;
}) {
  const visible = rows.slice(0, 2);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen && !dateOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen, dateOpen]);

  return (
    <div className="shipment-mobile">
      <div className="mobile-orders-header">
        <h3>Orders</h3>
        <div className="mobile-orders-actions">
          <div ref={filterRef} className="relative">
            <button type="button" className="mobile-filter-btn" onClick={() => setFilterOpen(o => !o)}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M1 3h12M3 7h8M5 11h4" />
              </svg>
              Filter
              {activeTab !== "All" && <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-30 bg-surface border border-ink-06 rounded-xl p-2 shadow-[0_8px_24px_rgba(0,0,0,0.10)] min-w-[150px]">
                {TABS.map((tab) => (
                  <div
                    key={tab}
                    onClick={() => { onTabChange(tab); setFilterOpen(false); }}
                    className={`flex items-center justify-between gap-4 px-2.5 py-2 rounded-lg text-[12px] font-medium tracking-[-0.004em] cursor-pointer ${tab === activeTab ? "bg-orange-soft text-orange" : "text-ink hover:bg-canvas"}`}
                  >
                    {tab}
                    {tab === activeTab && (
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0">
                        <path d="M2 6l2.5 2.5L10 3"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div ref={dateRef} className="relative">
            <button type="button" className="mobile-icon-btn" aria-label="Pick date" onClick={() => setDateOpen(o => !o)}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="1.5" y="2.5" width="11" height="10" rx="1" />
                <path d="M1.5 5h11M4 1.2v2.4M10 1.2v2.4" />
              </svg>
            </button>
            {dateOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-30 bg-surface border border-ink-06 rounded-xl p-2 shadow-[0_8px_24px_rgba(0,0,0,0.10)] min-w-[150px]">
                {DATE_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => { onDateChange(opt); setDateOpen(false); }}
                    className={`flex items-center justify-between gap-4 px-2.5 py-2 rounded-lg text-[12px] font-medium tracking-[-0.004em] cursor-pointer ${opt === dateRange ? "bg-orange-soft text-orange" : "text-ink hover:bg-canvas"}`}
                  >
                    {opt}
                    {opt === dateRange && (
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0">
                        <path d="M2 6l2.5 2.5L10 3"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="mobile-icon-btn" aria-label="Search orders">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="6" cy="6" r="4.5" />
              <path d="M10 10l3 3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mobile-orders-grid" style={{ gridTemplateColumns: `82px repeat(${visible.length}, minmax(0, 1fr))` }}>
        <div className="mobile-row-label">Order ID</div>
        {visible.map((row) => (
          <div key={`${row.id}-id`} className="mobile-order-cell mobile-order-strong">
            {row.id.replace("N", "H")} <CopyButton text={row.id.replace("N", "H")} />
          </div>
        ))}

        <div className="mobile-row-label">Vehicle</div>
        {visible.map((row) => (
          <div key={`${row.id}-vehicle`} className="mobile-order-cell mobile-order-muted">
            <img src={`/icons/${row.vehIcon === "scooter" ? "e-bike" : row.vehIcon}.svg`} alt="" className="w-3 h-3 icon-adaptive" />
            {row.veh}
          </div>
        ))}

        <div className="mobile-row-label">Driver</div>
        {visible.map((row) => (
          <div key={`${row.id}-driver`} className="mobile-order-cell mobile-order-muted">{row.driver}</div>
        ))}

        <div className="mobile-row-label">Route</div>
        {visible.map((row) => (
          <div key={`${row.id}-route`} className="mobile-order-cell">
            <span className="mobile-route-line">
              <span className="mobile-route-dot" style={{ background: row.dotStyle?.from ?? "#ff9256" }} />
              <span>{row.from}</span>
            </span>
            <span className="mobile-route-line mobile-order-muted">
              <span className="mobile-route-dot" style={{ background: row.dotStyle?.to ?? "var(--dot-empty)" }} />
              <span>{row.to}</span>
            </span>
          </div>
        ))}

        <div className="mobile-row-label">ETA</div>
        {visible.map((row) => (
          <div key={`${row.id}-eta`} className="mobile-order-cell mobile-order-muted">{row.eta}</div>
        ))}

        <div className="mobile-row-label">Status</div>
        {visible.map((row) => (
          <div key={`${row.id}-status`} className="mobile-order-cell">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-[-0.004em] ${STATUS_CLS[row.status]}`}>
              {STATUS_LABEL[row.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShipmentTable() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [dateRange, setDateRange] = useState<DateRange>("Today");
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 3, width: 0 });

  useLayoutEffect(() => {
    const idx = TABS.indexOf(activeTab);
    const el = tabRefs.current[idx];
    const bar = tabBarRef.current;
    if (!el || !bar) return;
    const barRect = bar.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const borderLeft = parseFloat(getComputedStyle(bar).borderLeftWidth) || 0;
    setPill({ left: elRect.left - barRect.left - borderLeft, width: elRect.width });
  }, [activeTab]);

  useEffect(() => {
    if (!dateOpen) return;
    const handler = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dateOpen]);

  const filtered = ROWS.filter((r) => TAB_FILTER[activeTab].includes(r.status));

  return (
    <>
      {/* Header */}
      <div className="shipment-table-header flex items-center justify-between px-5 border-b border-ink-04" style={{ width: "100%", height: "62px", paddingTop: "14px", paddingBottom: "14px", position: "relative", zIndex: 10 }}>
        <h3 className="m-0 text-sm font-medium tracking-[-0.008em]">Recent shipments</h3>
        <div className="flex items-center gap-3">
          <div ref={tabBarRef} className="bg-canvas border border-ink-06 rounded-[12px] p-[3px] flex items-center justify-evenly overflow-hidden relative" style={{ width: "268px", height: "34px" }}>
            {pill.width > 0 && (
              <div
                className="absolute top-[3px] rounded-[11px] bg-orange border border-[rgba(18,18,18,0.05)] pointer-events-none"
                style={{ left: pill.left, width: pill.width, height: "calc(100% - 6px)", transition: "left 200ms cubic-bezier(0.4,0,0.2,1), width 200ms cubic-bezier(0.4,0,0.2,1)" }}
              />
            )}
            {TABS.map((tab, i) => (
              <button
                key={tab}
                ref={el => { tabRefs.current[i] = el; }}
                onClick={() => setActiveTab(tab)}
                className={[
                  "relative z-10 h-full px-2.5 rounded-[11px] cursor-pointer inline-flex items-center justify-center text-[11px] font-medium leading-none tracking-[-0.004em] transition-colors duration-150 whitespace-nowrap shrink-0",
                  tab === activeTab ? "text-white" : "text-ink-60 hover:text-ink",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>
          <div ref={dateRef} className="relative">
            <span
              onClick={() => setDateOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 bg-surface border border-ink-04 rounded-[12px] px-2.5 py-1.5 text-[11px] font-medium tracking-[-0.004em] text-ink cursor-pointer select-none"
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3 h-3">
                <rect x="1.5" y="2.5" width="11" height="10" rx="1"/>
                <path d="M1.5 5h11M4 1.2v2.4M10 1.2v2.4"/>
              </svg>
              {dateRange}
              <svg
                viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"
                className="w-[11px] h-[11px] transition-transform"
                style={{ transform: dateOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path d="M3 5l3 3 3-3"/>
              </svg>
            </span>
            {dateOpen && (
              <div className="absolute right-0 top-[calc(100%+4px)] z-30 bg-surface border border-ink-06 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden min-w-[140px]">
                {DATE_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => { setDateRange(opt); setDateOpen(false); }}
                    className="px-3 py-2 text-[12px] font-medium tracking-[-0.004em] cursor-pointer flex items-center justify-between gap-4"
                    style={{ color: opt === dateRange ? "#f66211" : "var(--color-ink)", background: opt === dateRange ? "rgba(246,98,17,0.04)" : undefined }}
                  >
                    {opt}
                    {opt === dateRange && (
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0">
                        <path d="M2 6l2.5 2.5L10 3"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="text-[11px] font-medium tracking-[-0.004em] border border-ink-04 rounded-[12px] px-2.5 py-1.5 bg-surface cursor-pointer">View all</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
      <table className="shipment-table-desktop border-collapse w-full" style={{ minWidth: 660 }}>
        <thead>
          <tr>
            {["Order ID", "Vehicle", "Driver", "Route", "ETA", "Status"].map((h, i) => {
              const minW = [120, 90, 110, 140, 100, 90][i];
              return (
                <th key={h} className="text-left p-4 text-[11px] font-medium text-ink-40 tracking-[-0.004em] border-b border-ink-04 bg-canvas" style={{ minWidth: minW }}>{h}</th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, idx) => {
            const statusCls = STATUS_CLS[row.status];
            const statusLabel = STATUS_LABEL[row.status];
            const vehSvg =
              row.vehIcon === "van" ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                  <path d="M5.22925 10.5001C5.08772 11.4895 4.23681 12.2501 3.20825 12.2501C2.1797 12.2501 1.32879 11.4895 1.18726 10.5001H0.583252V3.50008C0.583252 3.17792 0.844422 2.91675 1.16659 2.91675H9.33325C9.65543 2.91675 9.91659 3.17792 9.91659 3.50008V4.66675H11.6666L13.4166 7.03257V10.5001H12.2293C12.0877 11.4895 11.2368 12.2501 10.2083 12.2501C9.17972 12.2501 8.32881 11.4895 8.18724 10.5001H5.22925ZM8.74992 4.08341H1.74992V8.77954C2.12049 8.40137 2.63697 8.16675 3.20825 8.16675C4.0227 8.16675 4.72576 8.64362 5.05344 9.33342H8.36305C8.46088 9.1275 8.59219 8.94048 8.74992 8.77954V4.08341ZM9.91659 7.58342H12.2499V7.41717L11.0784 5.83342H9.91659V7.58342ZM10.2083 11.0834C10.5892 11.0834 10.9133 10.8399 11.0334 10.5001C11.0657 10.4088 11.0833 10.3107 11.0833 10.2084C11.0833 9.72518 10.6915 9.33342 10.2083 9.33342C9.72502 9.33342 9.33325 9.72518 9.33325 10.2084C9.33325 10.3107 9.35081 10.4088 9.38307 10.5001C9.50318 10.8399 9.82728 11.0834 10.2083 11.0834ZM4.08325 10.2084C4.08325 9.72518 3.6915 9.33342 3.20825 9.33342C2.725 9.33342 2.33325 9.72518 2.33325 10.2084C2.33325 10.3107 2.3508 10.4088 2.38304 10.5001C2.50316 10.8399 2.82727 11.0834 3.20825 11.0834C3.58923 11.0834 3.91334 10.8399 4.03346 10.5001C4.06571 10.4088 4.08325 10.3107 4.08325 10.2084Z" fill="currentColor"/>
                </svg>
              ) : row.vehIcon === "scooter" ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                  <path d="M9.33341 0.583252C9.65559 0.583252 9.91675 0.844422 9.91675 1.16659V1.74992H12.8334V5.24992H11.6558L13.2576 9.65053C13.3603 9.91355 13.4167 10.1999 13.4167 10.4993C13.4167 11.788 12.3721 12.8327 11.0834 12.8327C9.99637 12.8327 9.08299 12.0893 8.82376 11.0833H6.34325C6.08419 12.0896 5.17065 12.8333 4.08341 12.8333C2.94913 12.8333 2.00388 12.0239 1.79368 10.9512C1.42106 10.7564 1.16675 10.3662 1.16675 9.91658V4.08325C1.16675 3.76109 1.42792 3.49992 1.75008 3.49992H5.83341C6.15559 3.49992 6.41675 3.76109 6.41675 4.08325V6.99992C6.41675 7.32209 6.67791 7.58325 7.00008 7.58325H8.16675C8.48892 7.58325 8.75008 7.32209 8.75008 6.99992V1.74992H7.00008V0.583252H9.33341ZM4.08341 9.33325C3.43908 9.33325 2.91675 9.85557 2.91675 10.4999C2.91675 11.1443 3.43908 11.6666 4.08341 11.6666C4.72775 11.6666 5.25008 11.1443 5.25008 10.4999C5.25008 9.85557 4.72775 9.33325 4.08341 9.33325ZM11.0834 9.33267C10.4391 9.33267 9.91675 9.85499 9.91675 10.4993C9.91675 11.1437 10.4391 11.666 11.0834 11.666C11.7278 11.666 12.2501 11.1437 12.2501 10.4993C12.2501 10.3592 12.2253 10.2247 12.18 10.1002L12.1705 10.0749C12.0007 9.64044 11.578 9.33267 11.0834 9.33267ZM10.4143 5.24992H9.91675V6.99992C9.91675 7.96644 9.13327 8.74992 8.16675 8.74992H7.00008C6.03356 8.74992 5.25008 7.96644 5.25008 6.99992H2.33341V8.95654C2.76096 8.47214 3.38651 8.16658 4.08341 8.16658C5.17065 8.16658 6.08419 8.91022 6.34325 9.91658H8.82346C9.08229 8.90993 9.99596 8.166 11.0834 8.166C11.2215 8.166 11.3569 8.17802 11.4884 8.20106L10.4143 5.24992ZM5.25008 4.66658H2.33341V5.83325H5.25008V4.66658ZM11.6667 2.91659H9.91675V4.08325H11.6667V2.91659Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                  <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C10.8793 6.41666 10.9528 6.40249 11.0217 6.37495C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.62576 5.68559 2.6116 5.75912 2.6116 5.83333C2.6116 6.1555 2.87277 6.41666 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.55913 9.91666 8.51188 9.90482 8.46959 9.88219C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="currentColor"/>
                </svg>
              );
            const avGradient = ({
              "":  "linear-gradient(135deg,#f3a76a,#b86a2e)",
              a2:  "linear-gradient(135deg,#6c8cd5,#2e4a8e)",
              a3:  "linear-gradient(135deg,#6fc498,#2b7a4e)",
              a4:  "linear-gradient(135deg,#d4836e,#8a3e26)",
              a5:  "linear-gradient(135deg,#c98ad4,#6d3a85)",
              a6:  "linear-gradient(135deg,#e6c168,#a4791f)",
            } as Record<string, string>)[row.avCls] ?? "linear-gradient(135deg,#f3a76a,#b86a2e)";
            const dotColor = STATUS_COLOR[row.status];
            return (
              <tr key={row.id} className="border-b border-ink-04 last:border-b-0" style={{ height: "54px", backgroundColor: idx % 2 === 0 ? "var(--surface)" : "var(--canvas)" }}>
                <td className="px-4 text-xs font-medium">
                  <span className="inline-flex items-center gap-1.5" style={{ color: "var(--ink)" }}>{row.id} <CopyButton text={row.id} /></span>
                </td>
                <td className="px-4 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-ink-40">
                    <span className="inline-flex items-center justify-center">{vehSvg}</span>
                    {row.veh}
                  </span>
                </td>
                <td className="px-4 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    {row.avatar
                      ? <img src={row.avatar} alt={row.driver} className="shrink-0 rounded-full" style={{ width: "20px", height: "20px" }} />
                      : <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-white border border-ink-04 text-[9px] font-medium leading-none shrink-0" style={{ background: avGradient }}>{row.av}</span>
                    }
                    <span style={{ color: "var(--ink-40)" }}>{row.driver}</span>
                  </span>
                </td>
                <td className="px-4">
                  <div className="flex flex-col gap-1 relative">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--ink)" }}>
                      <span className="w-3 h-3 inline-flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                      </span>{row.from}
                    </span>
                    <svg width="1" viewBox="0 0 1 159" fill="none" preserveAspectRatio="none" style={{ position: "absolute", left: "5.5px", top: "12px", bottom: "12px", height: "calc(100% - 24px)", zIndex: 0, transform: "rotate(-180deg)" }}>
                      <path d="M0.5 0V158.5" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="30 40"/>
                    </svg>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--ink-40)" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <g clipPath="url(#loc-clip)">
                          <path fillRule="evenodd" clipRule="evenodd" d="M6 1.00024C7.19347 1.00024 8.33807 1.47435 9.18198 2.31826C10.0259 3.16218 10.5 4.30677 10.5 5.50024C10.5 7.03724 9.662 8.29524 8.779 9.19774C8.33776 9.64369 7.85639 10.0481 7.341 10.4057L7.128 10.5507L7.028 10.6172L6.8395 10.7372L6.6715 10.8397L6.4635 10.9607C6.32225 11.0411 6.16252 11.0834 6 11.0834C5.83748 11.0834 5.67775 11.0411 5.5365 10.9607L5.3285 10.8397L5.0685 10.6797L4.9725 10.6172L4.7675 10.4807C4.21149 10.1044 3.69353 9.6747 3.221 9.19774C2.338 8.29474 1.5 7.03724 1.5 5.50024C1.5 4.30677 1.97411 3.16218 2.81802 2.31826C3.66193 1.47435 4.80653 1.00024 6 1.00024ZM6 2.00024C5.07174 2.00024 4.1815 2.36899 3.52513 3.02537C2.86875 3.68175 2.5 4.57199 2.5 5.50024C2.5 6.66124 3.136 7.68024 3.9355 8.49824C4.27931 8.84619 4.65087 9.16558 5.0465 9.45324L5.2755 9.61624C5.3495 9.66774 5.4205 9.71574 5.489 9.76024L5.684 9.88524L5.8555 9.98974L6 10.0742L6.2275 9.93974L6.411 9.82474C6.5085 9.76274 6.6135 9.69324 6.7245 9.61624L6.9535 9.45324C7.34913 9.16558 7.72069 8.84619 8.0645 8.49824C8.864 7.68074 9.5 6.66124 9.5 5.50024C9.5 4.57199 9.13125 3.68175 8.47487 3.02537C7.8185 2.36899 6.92826 2.00024 6 2.00024ZM6 3.50024C6.53043 3.50024 7.03914 3.71096 7.41421 4.08603C7.78929 4.4611 8 4.96981 8 5.50024C8 6.03068 7.78929 6.53939 7.41421 6.91446C7.03914 7.28953 6.53043 7.50024 6 7.50024C5.46957 7.50024 4.96086 7.28953 4.58579 6.91446C4.21071 6.53939 4 6.03068 4 5.50024C4 4.96981 4.21071 4.4611 4.58579 4.08603C4.96086 3.71096 5.46957 3.50024 6 3.50024ZM6 4.50024C5.73478 4.50024 5.48043 4.6056 5.29289 4.79314C5.10536 4.98067 5 5.23503 5 5.50024C5 5.76546 5.10536 6.01981 5.29289 6.20735C5.48043 6.39489 5.73478 6.50024 6 6.50024C6.26522 6.50024 6.51957 6.39489 6.70711 6.20735C6.89464 6.01981 7 5.76546 7 5.50024C7 5.23503 6.89464 4.98067 6.70711 4.79314C6.51957 4.6056 6.26522 4.50024 6 4.50024Z" fill="currentColor" fillOpacity="0.4"/>
                        </g>
                        <defs>
                          <clipPath id="loc-clip"><rect width="12" height="12" fill="white"/></clipPath>
                        </defs>
                      </svg>
                      {row.to}
                    </span>
                  </div>
                </td>
                <td className="px-4 text-xs font-medium" style={{ color: "var(--ink-40)" }}>{row.eta}</td>
                <td className="px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-[-0.004em] ${statusCls}`}>{statusLabel}</span>
                </td>
              </tr>
            );
          })}
          {Array.from({ length: ROWS.length - filtered.length }).map((_, i) => (
            <tr key={`filler-${i}`} className="border-b border-ink-04" style={{ height: "54px", backgroundColor: (filtered.length + i) % 2 === 0 ? "var(--surface)" : "var(--canvas)" }}>
              {Array.from({ length: 6 }).map((__, j) => (
                <td key={j} className="px-4">&nbsp;</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <MobileOrders
        rows={filtered}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dateRange={dateRange}
        onDateChange={setDateRange}
      />
    </>
  );
}
