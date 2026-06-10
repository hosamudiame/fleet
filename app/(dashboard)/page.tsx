"use client";

import React, { useState } from "react";
import Topbar from "@/components/Topbar";
import ShipmentTable from "@/components/ShipmentTable";
import FleetMap from "@/components/FleetMap";
import AddNewModal from "@/components/AddNewModal";
import ExportReportModal from "@/components/ExportReportModal";
import CustomiseModal from "@/components/CustomiseModal";
import CountUp from "@/components/CountUp";

const DEFAULT_KPIS    = ["Active vehicles", "Deliveries today", "On-time rate", "Exceptions"];
const DEFAULT_WIDGETS = ["Today's schedule", "Active drivers", "Upcoming maintenance"];

/* -- Shared primitives --------------------------------- */
const DotsIcon = () => (
  <img src="/icons/more.svg" alt="" className="w-3.5 h-3.5 cursor-pointer icon-ink-60" />
);

function OpenBtn() {
  return (
    <div className="open-btn group w-6 h-6 rounded-full bg-canvas border border-ink-04 inline-flex items-center justify-center cursor-pointer shrink-0 hover:bg-ink-06 active:scale-90 transition-all duration-150">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
        className="text-ink transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px">
        <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3.5M8.5 1.5V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* -- KPI tile ------------------------------------------ */
function KpiTile({ iconSrc, title, value, footLabel, pill }: {
  iconSrc: string; title: string; value: React.ReactNode;
  footLabel: string; pill: { label: string; positive?: boolean; negative?: boolean };
}) {
  const pillCls = pill.positive ? "bg-green-soft text-green" : pill.negative ? "bg-red-soft text-red" : "bg-ink-04 text-ink-60";
  return (
    <div className="overview-kpi-tile flex-1 min-w-0 h-[104px] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-medium tracking-[-0.004em] text-ink-60">
          <img src={iconSrc} alt="" className="w-3.5 h-3.5 icon-ink-60" />
          {title}
        </span>
        <DotsIcon />
      </div>
      <div className="font-[500] text-2xl leading-none tracking-[-0.02em] mt-3 text-ink"
        style={{ fontFamily: '"SF Pro Display", var(--font-geist-sans), sans-serif' }}>
        {value}
      </div>
      <div className="flex items-center justify-between mt-auto pt-[18px]">
        <span className="text-[10px] font-medium text-ink-40 tracking-[-0.008em]">{footLabel}</span>
        <span className={`inline-flex items-center px-1.5 h-4 rounded-xl text-[10px] font-medium leading-none tracking-[-0.02em] ${pillCls}`}>{pill.label}</span>
      </div>
    </div>
  );
}

function kpiProps(name: string) {
  switch (name) {
    case "Active vehicles":   return { iconSrc: "/icons/active-vehicle.svg",   title: name, value: <><CountUp target={47} /><span style={{ color: "var(--ink-40)" }}> / 64</span></>, footLabel: "From yesterday",  pill: { label: "+3",     positive: true  } };
    case "Deliveries today":  return { iconSrc: "/icons/deliveries-today.svg", title: name, value: <CountUp target={218} />,                                                           footLabel: "From yesterday",  pill: { label: "+12",    positive: true  } };
    case "On-time rate":      return { iconSrc: "/icons/on-time-rate.svg",     title: name, value: <CountUp target={91.4} decimals={1} suffix="%" />,                                 footLabel: "From last week",  pill: { label: "-2.3%",  negative: true  } };
    case "Exceptions":        return { iconSrc: "/icons/exceptions.svg",       title: name, value: <CountUp target={9} />,                                                             footLabel: "3 critical",      pill: { label: "-3",     negative: true  } };
    case "Avg delivery time": return { iconSrc: "/icons/deliveries-today.svg", title: name, value: <><CountUp target={42} /><span style={{ color: "var(--ink-40)" }}> min</span></>,  footLabel: "From yesterday",  pill: { label: "-3 min", positive: true  } };
    case "Fleet utilisation": return { iconSrc: "/icons/active-vehicle.svg",   title: name, value: <CountUp target={73} suffix="%" />,                                                footLabel: "From last week",  pill: { label: "+5%",    positive: true  } };
    default: return { iconSrc: "/icons/active-vehicle.svg", title: name, value: "—", footLabel: "", pill: { label: "—" } };
  }
}

/* -- Widgets ------------------------------------------- */
function TodayScheduleWidget() {
  return (
    <>
      <div className="py-[17px] px-[14px] flex items-center justify-between border-b border-ink-04 shrink-0">
        <h3 className="m-0 text-sm font-medium tracking-[-0.008em]">Today&apos;s delivery schedule</h3>
        <OpenBtn />
      </div>
      <div className="flex-1 overflow-hidden" style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "17px", paddingBottom: "14px" }}>
        <div className="flex flex-col" style={{ gap: "24px" }}>
          {[
            { active: true,  name: "Ngozi Eze",   vehIcon: "/icons/car.svg",   id: "#NDI-1047", from: "Oshodi",  to: "Ikeja",          time: "07:45am" },
            { active: true,  name: "Emeka Okeke", vehIcon: "/icons/truck.svg",  id: "#NDI-1052", from: "Ikorodu", to: "Victoria Island", time: "09:30am" },
            { active: false, name: "Aisha Musa",  vehIcon: "/icons/e-bike.svg", id: "#NDI-1078", from: "Apapa",   to: "Lekki phase 1",  time: "11:00am" },
          ].map((row, i, arr) => (
            <div key={i} className="grid items-start gap-2" style={{ gridTemplateColumns: "24px 1fr auto" }}>
              <div className="flex flex-col items-center relative">
                {row.active ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-[3px] shrink-0">
                    <rect x="0.421053" y="0.421053" width="15.1579" height="15.1579" rx="7.57895" stroke="#FF9256" strokeWidth="0.842105"/>
                    <circle cx="8" cy="8" r="4.63158" fill="#FF9256"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-[3px] shrink-0">
                    <rect x="0.421053" y="0.421053" width="15.1579" height="15.1579" rx="7.57895" fill="var(--inactive-dot-outer)" stroke="var(--inactive-dot-stroke)" strokeWidth="1"/>
                    <circle cx="8" cy="8" r="4.63158" fill="var(--inactive-dot-inner)"/>
                  </svg>
                )}
                {i < arr.length - 1 && (
                  <div style={{ position: "absolute", top: "21px", width: "1px", height: "62px", background: "repeating-linear-gradient(to bottom, var(--ink-06) 0 6px, transparent 6px 12px)", pointerEvents: "none" }} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <img src={row.vehIcon} alt="" className="w-3.5 h-3.5 icon-adaptive" />
                  <span className="text-xs font-medium tracking-[-0.004em] leading-none">{row.name}</span>
                </div>
                <div className="pl-[22px] flex flex-col" style={{ gap: "6px", marginTop: "6px" }}>
                  <span className="text-xs text-ink-40 underline leading-none">{row.id}</span>
                  <span className="text-xs text-ink-40 leading-none">{row.from} <span className="mx-1">→</span> {row.to}</span>
                </div>
              </div>
              <div className="text-xs font-medium tracking-[-0.004em] mt-[3px]">{row.time}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ActiveDriversWidget() {
  return (
    <>
      <div className="py-[17px] px-5 flex items-center justify-between border-b border-ink-04 shrink-0">
        <h3 className="m-0 text-sm font-medium tracking-[-0.008em]">Active drivers</h3>
        <OpenBtn />
      </div>
      <div className="flex-1 overflow-hidden flex flex-col" style={{ gap: "31px", paddingLeft: "20px", paddingRight: "20px", paddingTop: "12px", paddingBottom: "10.33px" }}>
        {[
          { name: "Ngozi Eze",     avatar: "/icons/ngozi.svg", route: "Oshodi → Ikeja", tag: "onroute", label: "On route" },
          { name: "Emeka Okeke",   avatar: "/icons/emeka.svg", route: "Ikorodu → VI",   tag: "onroute", label: "On route" },
          { name: "Segun Adebayo", avatar: "/icons/segun.svg", route: "Abuja → Lokoja", tag: "idle",    label: "Idle"     },
          { name: "Chidi Okoro",   avatar: "/icons/chidi.svg", route: "Kano → Kaduna",  tag: "break",   label: "On break" },
        ].map((d, i) => {
          const tagCls = d.tag === "onroute" ? "text-green" : d.tag === "idle" ? "text-amber" : "text-[#4e71fd]";
          const dotBg  = d.tag === "onroute" ? "bg-green"  : d.tag === "idle" ? "bg-amber"  : "bg-[#4e71fd]";
          return (
            <div key={i} className="flex items-start">
              <img src={d.avatar} alt={d.name} className="shrink-0 rounded-full" style={{ width: "30px", height: "30px" }} />
              <div className="flex-1 min-w-0" style={{ marginLeft: "8px" }}>
                <div className="text-xs font-medium tracking-[-0.004em] leading-none">{d.name}</div>
                <div className="text-[11px] text-ink-40 mt-0.5 leading-none">{d.route}</div>
              </div>
              <span className={`inline-flex items-center gap-[5px] text-[11px] font-medium tracking-[-0.004em] shrink-0 ${tagCls}`}>
                <span className={`w-[7px] h-[7px] rounded-full ${dotBg}`} />
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function UpcomingMaintenanceWidget() {
  return (
    <>
      <div className="h-[52px] px-5 flex items-center justify-between border-b border-ink-04">
        <h3 className="m-0 text-sm font-medium tracking-[-0.008em]">Upcoming maintenance</h3>
        <OpenBtn />
      </div>
      <div style={{ paddingLeft: "14px", paddingRight: "21px", paddingTop: "13px", display: "flex", flexDirection: "column", gap: "31px" }}>
        {[
          { id: "TRK - 001", desc: "Full service",   status: "overdue", label: "Overdue 2 days", thumb: "/icons/TRK-001.png" },
          { id: "SCT - 029", desc: "Oil change",      status: "overdue", label: "Overdue 1 days", thumb: "/icons/SCT-029.png" },
          { id: "TRK - 009", desc: "Tyre check",      status: "warn",    label: "In 5 days",      thumb: "/icons/TRK-009.png" },
          { id: "CAR - 092", desc: "Routine service", status: "ok",      label: "In 11 days",     thumb: "/icons/CAR-092.png" },
        ].map((m, i) => {
          const statusCls = m.status === "overdue" ? "text-red" : m.status === "warn" ? "text-amber" : "text-green";
          const dotBg     = m.status === "overdue" ? "bg-red"   : m.status === "warn" ? "bg-amber"  : "bg-green";
          return (
            <div key={i} className="grid gap-3 items-center" style={{ gridTemplateColumns: "40px 1fr auto", height: "34px" }}>
              <img src={m.thumb} alt="" className="rounded-[6px] shrink-0 veh-thumb" style={{ width: "44px", height: "24px", objectFit: "cover" }} />
              <div>
                <div className="text-xs font-medium tracking-[-0.004em]">{m.id}</div>
                <div className="text-[11px] text-ink-40 mt-1.5">{m.desc}</div>
              </div>
              <span className={`inline-flex items-center gap-[5px] text-[11px] font-medium tracking-[-0.004em] ${statusCls}`}>
                <span className={`w-[7px] h-[7px] rounded-full ${dotBg}`} />
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function RecentAlertsWidget() {
  const ALERTS = [
    { color: "#BB2422", bg: "rgba(187,36,34,0.08)",  msg: "TRK-001 engine fault detected",   sub: "Automatic diagnostic report filed", time: "2m ago"  },
    { color: "#A15A00", bg: "rgba(161,90,0,0.08)",   msg: "CAR-041 running 18 min behind",   sub: "May affect on-time rate today",     time: "14m ago" },
    { color: "#A15A00", bg: "rgba(161,90,0,0.08)",   msg: "SCT-029 low fuel warning",        sub: "Last check-in: Apapa depot",        time: "32m ago" },
    { color: "#037847", bg: "rgba(3,120,71,0.08)",   msg: "NDI-1047 delivered successfully", sub: "Oshodi → Ikeja confirmed",          time: "1h ago"  },
  ];
  return (
    <>
      <div className="py-[17px] px-5 flex items-center justify-between border-b border-ink-04 shrink-0">
        <h3 className="m-0 text-sm font-medium tracking-[-0.008em]">Recent alerts</h3>
        <OpenBtn />
      </div>
      <div className="flex-1 flex flex-col divide-y overflow-hidden" style={{ borderColor: "var(--ink-04)" }}>
        {ALERTS.map((a, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5" style={{ background: a.bg }}>
              <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                <circle cx="5" cy="5" r="3.5" fill={a.color} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium tracking-[-0.004em] leading-none m-0">{a.msg}</p>
              <p className="text-[11px] text-ink-40 mt-1 leading-none m-0">{a.sub}</p>
            </div>
            <span className="text-[11px] text-ink-40 shrink-0 mt-0.5">{a.time}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function TopRoutesWidget() {
  const ROUTES = [
    { from: "Oshodi",  to: "Ikeja",         count: 34, pct: 100 },
    { from: "Ikorodu", to: "Victoria Is.",  count: 28, pct: 82  },
    { from: "Apapa",   to: "Lekki Ph. 1",  count: 21, pct: 62  },
    { from: "Abuja",   to: "Lokoja",        count: 14, pct: 41  },
    { from: "Kano",    to: "Kaduna",        count: 9,  pct: 26  },
  ];
  return (
    <>
      <div className="py-[17px] px-5 flex items-center justify-between border-b border-ink-04 shrink-0">
        <h3 className="m-0 text-sm font-medium tracking-[-0.008em]">Top routes</h3>
        <OpenBtn />
      </div>
      <div className="flex-1 flex flex-col px-5 pt-4 pb-3 overflow-hidden" style={{ gap: "18px" }}>
        {ROUTES.map((r, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-[-0.004em]">{r.from} → {r.to}</span>
              <span className="text-[11px] text-ink-40 font-medium">{r.count} deliveries</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ink-04)" }}>
              <div className="h-full rounded-full bg-orange" style={{ width: `${r.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function DriverPerfWidget() {
  const DRIVERS = [
    { name: "Ngozi Eze",     avatar: "/icons/ngozi.svg", score: 98, tag: "Top driver" },
    { name: "Emeka Okeke",   avatar: "/icons/emeka.svg", score: 94, tag: null         },
    { name: "Segun Adebayo", avatar: "/icons/segun.svg", score: 87, tag: null         },
    { name: "Chidi Okoro",   avatar: "/icons/chidi.svg", score: 81, tag: null         },
  ];
  return (
    <>
      <div className="py-[17px] px-5 flex items-center justify-between border-b border-ink-04 shrink-0">
        <h3 className="m-0 text-sm font-medium tracking-[-0.008em]">Driver performance</h3>
        <OpenBtn />
      </div>
      <div className="flex-1 flex flex-col px-5 pt-4 pb-3 overflow-hidden" style={{ gap: "22px" }}>
        {DRIVERS.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-ink-40 w-4 shrink-0 tabular-nums">{i + 1}</span>
            <img src={d.avatar} alt={d.name} className="w-7 h-7 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-medium tracking-[-0.004em]">{d.name}</span>
                {d.tag && <span className="text-[10px] font-medium px-1.5 h-4 rounded-full inline-flex items-center bg-green-soft text-green">{d.tag}</span>}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ink-04)" }}>
                <div className="h-full rounded-full bg-orange" style={{ width: `${d.score}%` }} />
              </div>
            </div>
            <span className="text-xs font-semibold text-ink tabular-nums shrink-0">{d.score}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function WidgetContent({ name }: { name: string }) {
  switch (name) {
    case "Today's schedule":     return <TodayScheduleWidget />;
    case "Active drivers":       return <ActiveDriversWidget />;
    case "Upcoming maintenance": return <UpcomingMaintenanceWidget />;
    case "Recent alerts":        return <RecentAlertsWidget />;
    case "Top routes":           return <TopRoutesWidget />;
    case "Driver performance":   return <DriverPerfWidget />;
    default:                     return null;
  }
}

/* -- Page --------------------------------------------- */
export default function OverviewPage() {
  const [kpis,    setKpis]    = useState<string[]>(DEFAULT_KPIS);
  const [widgets, setWidgets] = useState<string[]>(DEFAULT_WIDGETS);

  return (
    <>
      <Topbar crumb="Overview" />
      <div className="overview-page-shell p-4 flex flex-col gap-4">

        {/* Row head */}
        <div className="overview-head flex items-end justify-between gap-6">
          <div>
            <h1 className="overview-title m-0 text-[18px] font-medium leading-none tracking-[-0.008em]">Welcome back, Monty</h1>
            <div
              className="op-ai-banner overview-ai-banner mt-3 inline-flex items-center gap-1.5 rounded-[6px] px-1.5 py-[3px] text-orange-deep text-xs font-normal leading-none tracking-[-0.008em]"
              style={{ background: "rgba(255,146,86,0.20)" }}
            >
              <img src="/icons/op-ai.svg" alt="" className="w-3.5 h-3.5" />
              <b className="font-semibold tracking-[-0.016em]">Op AI:</b>
              <span>2 vehicles are overdue for maintenance and CAR-041 is running 18 min behind — your on-time rate may dip below 90% today</span>
            </div>
          </div>
          <div className="overview-actions flex gap-2 shrink-0">
            <CustomiseModal
              kpis={kpis}
              widgets={widgets}
              onSave={(k, w) => { setKpis(k); setWidgets(w); }}
            />
            <ExportReportModal />
            <AddNewModal />
          </div>
        </div>

        {/* KPIs */}
        <div className="overview-kpi-grid bg-surface border border-ink-06 rounded-xl p-[14px] flex items-center gap-4 w-full h-[134px]">
          {kpis.map((name, i) => (
            <React.Fragment key={name}>
              {i > 0 && <div className="overview-kpi-divider w-px self-stretch bg-ink-04" />}
              <KpiTile {...kpiProps(name)} />
            </React.Fragment>
          ))}
        </div>

        {/* Body grid */}
        <div className="overview-body-grid grid gap-4 items-start">

          {/* Left col — widgets */}
          <div className="overview-left-col flex flex-col gap-4 min-w-0">
            {widgets.map((name) => (
              <div key={name} className="overview-widget-card bg-surface border border-ink-06 rounded-xl overflow-hidden flex flex-col" style={{ height: "303.67px" }}>
                <WidgetContent name={name} />
              </div>
            ))}
          </div>

          {/* Right col — map + table */}
          <div className="overview-right-col flex flex-col gap-4 min-w-0">
            <div className="overview-map-card">
              <FleetMap />
            </div>
            <div className="overview-table-card bg-surface border border-ink-06 rounded-xl overflow-hidden flex flex-col" style={{ height: "490px" }}>
              <ShipmentTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
