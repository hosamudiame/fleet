"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type DriverStatus   = "transit" | "delayed" | "idle" | "upcoming";
type VehicleType    = "car" | "van" | "truck" | "scooter";
type ComplianceCls  = "clean" | "warn" | "overdue";
type TripStatus     = "delivered" | "transit" | "delayed" | "cancelled";
type DocStatus      = "verified" | "pending" | "expired";

// ─── Avatar gradients ─────────────────────────────────────────────────────────
const AV_GRADIENT: Record<string, string> = {
  a1: "linear-gradient(135deg,#f3a76a,#b86a2e)",
  a2: "linear-gradient(135deg,#6c8cd5,#2e4a8e)",
  a3: "linear-gradient(135deg,#6fc498,#2b7a4e)",
  a4: "linear-gradient(135deg,#d4836e,#8a3e26)",
  a5: "linear-gradient(135deg,#c98ad4,#6d3a85)",
};

// ─── Mock driver dataset ──────────────────────────────────────────────────────
const DRIVERS = [
  { id:"DRV-0001", name:"Ngozi Eze",     initials:"NE", avCls:"a1", avatar:"/icons/ngozi.svg",  online:true, region:"Lagos",         vehicle:"CAR-041", vehicleType:"car"     as VehicleType, from:"Oshodi",    to:"Ikeja",    status:"transit"  as DriverStatus, trips:142, rating:4.9, since:"Jan 2022", phone:"+234 801 234 5678", email:"ngozi.eze@fleetops.ng" },
  { id:"DRV-0002", name:"Emeka Okeke",   initials:"EO", avCls:"a4", avatar:"/icons/emeka.svg",  online:true, region:"Lagos",         vehicle:"VAN-007", vehicleType:"van"     as VehicleType, from:"Ikorodu",   to:"VI",       status:"transit"  as DriverStatus, trips:30,  rating:4.7, since:"Mar 2023", phone:"+234 802 345 6789", email:"emeka.okeke@fleetops.ng" },
  { id:"DRV-0003", name:"Fatima Bello",  initials:"FB", avCls:"a3", avatar:undefined,           online:true, region:"Lagos",         vehicle:"TRK-055", vehicleType:"truck"   as VehicleType, from:"Yaba",      to:"Surulere", status:"delayed"  as DriverStatus, trips:132, rating:4.2, since:"Jun 2021", phone:"+234 803 456 7890", email:"fatima.bello@fleetops.ng" },
  { id:"DRV-0004", name:"Segun Adebayo", initials:"SA", avCls:"a2", avatar:"/icons/segun.svg",  online:true, region:"Lagos",         vehicle:"SCT-014", vehicleType:"scooter" as VehicleType, from:"Tin Can",   to:"Ajah",     status:"idle"     as DriverStatus, trips:131, rating:4.5, since:"Aug 2022", phone:"+234 804 567 8901", email:"segun.adebayo@fleetops.ng" },
  { id:"DRV-0005", name:"Nkechi Obi",    initials:"NO", avCls:"a5", avatar:undefined,           online:true, region:"Lagos",         vehicle:"TRK-017", vehicleType:"truck"   as VehicleType, from:"Apapa",     to:"Lekki",    status:"transit"  as DriverStatus, trips:23,  rating:4.8, since:"Nov 2023", phone:"+234 805 678 9012", email:"nkechi.obi@fleetops.ng" },
  { id:"DRV-0006", name:"Chidi Okoro",   initials:"CO", avCls:"a4", avatar:"/icons/chidi.svg",  online:true, region:"Kano",          vehicle:"TRK-029", vehicleType:"truck"   as VehicleType, from:"Kano",      to:"Zaria",    status:"upcoming" as DriverStatus, trips:323, rating:4.6, since:"Feb 2020", phone:"+234 806 789 0123", email:"chidi.okoro@fleetops.ng" },
];

// ─── Per-driver mock data ─────────────────────────────────────────────────────
const TRIP_DATA: Record<string, Array<{ id:string; from:string; to:string; date:string; status:TripStatus; distance:string; duration:string }>> = {
  "DRV-0001": [
    { id:"TRP-8821", from:"Oshodi",   to:"Ikeja",          date:"Today, 09:14",      status:"transit",   distance:"18 km",  duration:"42 min"  },
    { id:"TRP-8820", from:"Ikeja",    to:"Victoria Island", date:"Yesterday, 14:30",  status:"delivered", distance:"31 km",  duration:"1h 10m"  },
    { id:"TRP-8818", from:"Surulere", to:"Lekki",          date:"Jun 8, 11:05",      status:"delivered", distance:"24 km",  duration:"55 min"  },
    { id:"TRP-8815", from:"Apapa",    to:"Ojota",          date:"Jun 7, 08:22",      status:"delivered", distance:"22 km",  duration:"48 min"  },
    { id:"TRP-8810", from:"Ikeja",    to:"Badagry",        date:"Jun 6, 15:50",      status:"delayed",   distance:"62 km",  duration:"2h 05m"  },
    { id:"TRP-8805", from:"Yaba",     to:"Surulere",       date:"Jun 5, 10:30",      status:"delivered", distance:"8 km",   duration:"22 min"  },
    { id:"TRP-8800", from:"VI",       to:"Tin Can",        date:"Jun 4, 07:15",      status:"cancelled", distance:"—",      duration:"—"        },
    { id:"TRP-8796", from:"Oshodi",   to:"Apapa",          date:"Jun 3, 13:40",      status:"delivered", distance:"19 km",  duration:"44 min"  },
  ],
};

const COMPLIANCE_DATA: Record<string, Array<{ label:string; detail:string; cls:ComplianceCls; expires:string }>> = {
  "DRV-0001": [
    { label:"Driver's License",      detail:"Class A · #LG-2291047",          cls:"clean",   expires:"Expires Dec 2027"     },
    { label:"Vehicle Insurance",     detail:"Zenith Insurance · Policy #Z9901", cls:"warn",    expires:"Expires in 7 days"    },
    { label:"Medical Certificate",   detail:"LASUTH · Ref #MED-441",           cls:"clean",   expires:"Expires Mar 2027"     },
    { label:"Hazmat Certification",  detail:"NEMA Certified · #HZ-7712",       cls:"clean",   expires:"Expires Sep 2026"     },
    { label:"Background Check",      detail:"Verified · TrackSafe NG",         cls:"clean",   expires:"Verified Jan 2025"    },
    { label:"Coaching Assessment",   detail:"Defensive driving required",      cls:"overdue", expires:"Overdue since Apr 2026"},
  ],
};

const DOCUMENT_DATA: Record<string, Array<{ name:string; type:string; size:string; uploaded:string; status:DocStatus }>> = {
  "DRV-0001": [
    { name:"Driver's License",          type:"PDF", size:"1.2 MB",  uploaded:"Jan 14, 2025", status:"verified" },
    { name:"Insurance Certificate",     type:"PDF", size:"840 KB",  uploaded:"Mar 02, 2025", status:"verified" },
    { name:"Vehicle Inspection Report", type:"PDF", size:"2.1 MB",  uploaded:"Apr 18, 2025", status:"pending"  },
    { name:"Medical Certificate",       type:"PDF", size:"620 KB",  uploaded:"Mar 10, 2025", status:"verified" },
    { name:"Employment Contract",       type:"PDF", size:"3.4 MB",  uploaded:"Jan 06, 2023", status:"verified" },
    { name:"Hazmat Certificate",        type:"PDF", size:"1.8 MB",  uploaded:"Sep 20, 2024", status:"expired"  },
  ],
};

// ─── Fallback data for unknown drivers ────────────────────────────────────────
const FALLBACK_DRIVER = DRIVERS[0];
const FALLBACK_TRIPS  = TRIP_DATA["DRV-0001"];
const FALLBACK_COMP   = COMPLIANCE_DATA["DRV-0001"];
const FALLBACK_DOCS   = DOCUMENT_DATA["DRV-0001"];

// ─── Status helpers ───────────────────────────────────────────────────────────
const TRIP_STATUS_CLS: Record<TripStatus, string> = {
  delivered: "bg-[rgba(10,184,109,0.08)] text-[#037847]",
  transit:   "bg-[rgba(246,98,17,0.08)] text-[#f66211]",
  delayed:   "bg-[rgba(253,81,78,0.08)] text-[#BB2422]",
  cancelled: "bg-[rgba(102,112,133,0.08)] text-[#667085]",
};
const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  delivered: "Delivered", transit: "In transit", delayed: "Delayed", cancelled: "Cancelled",
};
const DRIVER_STATUS_DOT: Record<DriverStatus, string> = {
  transit: "#0ab86d", delayed: "#fd514e", idle: "#ee9b32", upcoming: "#667085",
};
const DRIVER_STATUS_LABEL: Record<DriverStatus, string> = {
  transit: "In transit", delayed: "Delayed", idle: "Idle", upcoming: "Upcoming",
};
const COMP_CLS: Record<ComplianceCls, { dot: string; bg: string; text: string; badge: string }> = {
  clean:   { dot:"#0ab86d", bg:"rgba(10,184,109,0.08)",  text:"#037847",  badge:"Clean"   },
  warn:    { dot:"#ee9b32", bg:"rgba(238,155,50,0.08)",  text:"#A15A00",  badge:"Warning" },
  overdue: { dot:"#fd514e", bg:"rgba(253,81,78,0.08)",   text:"#BB2422",  badge:"Overdue" },
};
const DOC_STATUS_CLS: Record<DocStatus, { bg:string; text:string; label:string }> = {
  verified: { bg:"rgba(10,184,109,0.08)",  text:"#037847",  label:"Verified" },
  pending:  { bg:"rgba(238,155,50,0.08)",  text:"#A15A00",  label:"Pending"  },
  expired:  { bg:"rgba(253,81,78,0.08)",   text:"#BB2422",  label:"Expired"  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function CarIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.6116 5.75912 2.6116 6.1555 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="currentColor"/>
    </svg>
  );
}

function StarIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="#EE9B32" style={{ width: size, height: size, flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.77844 1.05766C6.63534 1.10621 6.51001 1.1964 6.41852 1.31666C6.38236 1.36916 5.99327 2.03124 5.55344 2.78841L4.74494 4.17441C4.74086 4.17966 4.01519 4.34008 3.13261 4.53024L1.43511 4.91758C1.04252 5.08849 0.881523 5.61524 1.11544 5.96583C1.15044 6.01774 1.66436 6.60399 2.25761 7.26783L3.33677 8.52141C3.33677 8.54649 3.26269 9.29608 3.17227 10.188L2.98911 11.9893C3.13436 12.1731 3.28602 12.3988 3.54269 12.5242C3.80461 12.5003 3.91369 12.4904 4.21002 12.3679L6.99952 11.1534L9.78902 12.368C10.0865 12.4904 10.1956 12.5003 10.4575 12.5242C10.7142 12.3988 10.8659 12.1731 11.0111 11.9572L10.8256 10.1577L10.6856 8.46308C10.7014 8.43858 11.1879 7.88791 11.7677 7.23924L12.8848 5.96641C13.1181 5.61466 12.9577 5.08849 12.5651 4.91758L10.8676 4.53083L9.25527 4.17441C9.25061 4.16916 8.87552 3.52516 8.42111 2.74291L7.51169 1.23616C7.38627 1.10899 7.23286 1.04424 7.03744 1.03491C6.95045 1.02945 6.86314 1.03712 6.77844 1.05766Z"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3.5 h-3.5 shrink-0">
      <path d="M4.5 1.5h2l1 2.5-1.5 1C6.5 6.5 7.5 7.5 8 8l1-1.5L11.5 7.5v2C11.5 10.5 8 12.5 4 8.5S2 2.5 3.5 2.5l1-1z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3.5 h-3.5 shrink-0">
      <rect x="1.5" y="3" width="11" height="8" rx="1.5"/>
      <path d="M1.5 4.5l5.5 3.5 5.5-3.5"/>
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 shrink-0">
      <rect width="32" height="32" rx="6" fill="rgba(246,98,17,0.08)"/>
      <path d="M10 8h8l5 5v11a1 1 0 01-1 1H10a1 1 0 01-1-1V9a1 1 0 011-1z" fill="rgba(246,98,17,0.15)" stroke="#f66211" strokeWidth="1"/>
      <path d="M18 8v5h5" stroke="#f66211" strokeWidth="1" strokeLinejoin="round"/>
      <text x="7" y="26" fill="#f66211" fontSize="5.5" fontWeight="700" fontFamily="system-ui">PDF</text>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5 shrink-0">
      <path d="M7 1v8M4 4l3-3 3 3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5 shrink-0">
      <path d="M7 1v8M4 6.5l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path d="M7 2.37287L2.91667 3.90412V7.03253C2.9168 7.79079 3.12806 8.53403 3.52678 9.17899C3.92551 9.82395 4.49594 10.3452 5.17417 10.6842L7 11.5977L8.82583 10.6842C9.50406 10.3452 10.0745 9.82395 10.4732 9.17899C10.8719 8.53403 11.0832 7.79079 11.0833 7.03253V3.90412L7 2.37287Z" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DriverProfileContent({ driverId }: { driverId: string }) {
  const [activeSection, setActiveSection] = useState<"trips" | "compliance" | "documents">("trips");

  const driver   = DRIVERS.find(d => d.id === driverId) ?? FALLBACK_DRIVER;
  const trips    = TRIP_DATA[driver.id]    ?? FALLBACK_TRIPS;
  const compList = COMPLIANCE_DATA[driver.id] ?? FALLBACK_COMP;
  const docs     = DOCUMENT_DATA[driver.id]   ?? FALLBACK_DOCS;

  const gradient = AV_GRADIENT[driver.avCls];
  const onTimeCount  = trips.filter(t => t.status === "delivered").length;
  const onTimeRate   = Math.round((onTimeCount / trips.length) * 100);
  const compIssues   = compList.filter(c => c.cls !== "clean").length;

  // KPI strip
  const kpis = [
    { label: "Total trips",   value: driver.trips },
    { label: "This month",    value: trips.length },
    { label: "On-time rate",  value: `${onTimeRate}%` },
    { label: "Compliance",    value: compIssues === 0 ? "Clean" : `${compIssues} issue${compIssues > 1 ? "s" : ""}`, warn: compIssues > 0 },
  ];

  const SECTIONS = ["trips", "compliance", "documents"] as const;
  const SECTION_LABEL: Record<string, string> = { trips:"Trips", compliance:"Compliance", documents:"Documents" };

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      <Topbar crumb={`Drivers / ${driver.name}`} />

      <div className="p-4 flex flex-col gap-4">

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <div className="driver-hero bg-surface border border-ink-06 rounded-xl p-5 flex items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {driver.avatar
              ? <img src={driver.avatar} alt={driver.name} className="rounded-full" style={{ width: 64, height: 64 }} />
              : <span className="rounded-full inline-flex items-center justify-center text-white font-semibold shrink-0" style={{ width: 64, height: 64, fontSize: 20, background: gradient, border: "2px solid rgba(0,0,0,0.06)" }}>{driver.initials}</span>
            }
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-surface" style={{ background: driver.online ? "#0ab86d" : "#667085" }} />
          </div>

          {/* Name + meta */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="m-0 text-[18px] font-semibold tracking-[-0.012em] leading-none">{driver.name}</h2>
              <span className="inline-flex items-center px-2 h-5 rounded-full text-[10px] font-medium tracking-[-0.004em]" style={{ background: `rgba(10,184,109,0.08)`, color: DRIVER_STATUS_DOT[driver.status] === "#0ab86d" ? "#037847" : "#667085" }}>
                <span className="w-1.5 h-1.5 rounded-full mr-1 shrink-0" style={{ background: DRIVER_STATUS_DOT[driver.status] }} />
                {DRIVER_STATUS_LABEL[driver.status]}
              </span>
            </div>
            <span className="text-[13px] text-ink-40 font-medium tracking-[-0.004em]">{driver.id} · {driver.region}</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-40"><PhoneIcon />{driver.phone}</span>
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-40"><MailIcon />{driver.email}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-ink-06 mx-2 shrink-0" />

          {/* Stats strip */}
          <div className="driver-hero-stats flex items-center gap-8 flex-1">
            {[
              { label: "Vehicle",      value: driver.vehicle },
              { label: "Total trips",  value: driver.trips   },
              { label: "Rating",       value: (
                <span className="inline-flex items-center gap-1">
                  <StarIcon size={13} />
                  <span>{driver.rating}</span>
                </span>
              )},
              { label: "Active since", value: driver.since },
            ].map(s => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-ink-40 tracking-[-0.004em]">{s.label}</span>
                <span className="text-sm font-semibold tracking-[-0.008em]">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-ink-06 mx-2 shrink-0" />

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-[10px] text-[12px] font-medium tracking-[-0.004em] border border-ink-06 bg-canvas cursor-pointer hover:border-ink-40 transition-colors">
              <MailIcon />Message
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-[10px] text-[12px] font-medium tracking-[-0.004em] bg-orange text-white cursor-pointer hover:opacity-90 transition-opacity">
              Edit profile
            </button>
          </div>
        </div>

        {/* ── KPI strip ─────────────────────────────────────────────────── */}
        <div className="driver-kpi-grid grid grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-surface border border-ink-06 rounded-xl px-5 py-4 flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-ink-40 tracking-[-0.004em]">{k.label}</span>
              <span className="text-[22px] font-semibold leading-none tracking-[-0.02em]" style={{ color: k.warn ? "#BB2422" : "var(--ink)" }}>{k.value}</span>
            </div>
          ))}
        </div>

        {/* ── Body: section tabs + content ──────────────────────────────── */}
        <div className="bg-surface border border-ink-06 rounded-xl flex flex-col">

          {/* Tab row */}
          <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-ink-06">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-4 py-2.5 text-[13px] font-medium tracking-[-0.004em] cursor-pointer rounded-t-lg border-b-2 transition-all ${
                  activeSection === s
                    ? "text-orange border-orange"
                    : "text-ink-40 border-transparent hover:text-ink"
                }`}
              >
                {SECTION_LABEL[s]}
                {s === "compliance" && compIssues > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold bg-[rgba(253,81,78,0.1)] text-[#BB2422]">{compIssues}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Trips ─────────────────────────────────────────────────── */}
          {activeSection === "trips" && (
            <div className="fleet-table-scroll flex flex-col">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Trip ID", "Route", "Date", "Status", "Distance", "Duration"].map((h, i) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-medium text-ink-40 tracking-[-0.004em] border-b border-ink-04 bg-canvas whitespace-nowrap" style={{ minWidth: [130,200,160,130,110,110][i] }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t, idx) => (
                    <tr key={t.id} className="border-b border-ink-04 last:border-b-0" style={{ height: 54, backgroundColor: idx % 2 === 0 ? "var(--surface)" : "var(--canvas)" }}>
                      <td className="px-5 text-[12px] font-medium">{t.id}</td>
                      <td className="px-5">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
                          <span style={{ color:"#f66211" }}>{t.from}</span>
                          <span className="text-ink-40">→</span>
                          <span>{t.to}</span>
                        </span>
                      </td>
                      <td className="px-5 text-[12px] font-medium text-ink-40 whitespace-nowrap">{t.date}</td>
                      <td className="px-5">
                        <span className={`inline-flex items-center px-2.5 h-5 rounded-full text-[11px] font-medium tracking-[-0.004em] ${TRIP_STATUS_CLS[t.status]}`}>
                          {TRIP_STATUS_LABEL[t.status]}
                        </span>
                      </td>
                      <td className="px-5 text-[12px] font-medium text-ink-40">{t.distance}</td>
                      <td className="px-5 text-[12px] font-medium text-ink-40">{t.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Compliance ────────────────────────────────────────────── */}
          {activeSection === "compliance" && (
            <div className="p-5 flex flex-col gap-2.5">
              {compList.map(c => {
                const s = COMP_CLS[c.cls];
                return (
                  <div key={c.label} className="comp-row flex items-center justify-between px-4 py-3.5 rounded-xl border border-ink-06 bg-canvas">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                        <ShieldIcon />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-medium tracking-[-0.004em]">{c.label}</span>
                        <span className="text-[11px] font-medium text-ink-40 tracking-[-0.004em]">{c.detail}</span>
                      </div>
                    </div>
                    <div className="comp-row-right flex items-center gap-3">
                      <span className="text-[11px] font-medium text-ink-40">{c.expires}</span>
                      <span className="inline-flex items-center px-2.5 h-5 rounded-full text-[11px] font-medium" style={{ background: s.bg, color: s.text }}>
                        <span className="w-1.5 h-1.5 rounded-full mr-1 shrink-0" style={{ background: s.dot }} />
                        {s.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Documents ─────────────────────────────────────────────── */}
          {activeSection === "documents" && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-medium text-ink-40 tracking-[-0.004em]">{docs.length} documents</span>
                <button className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-[10px] text-[12px] font-medium tracking-[-0.004em] bg-orange text-white cursor-pointer hover:opacity-90">
                  <UploadIcon />Upload document
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {docs.map(doc => {
                  const s = DOC_STATUS_CLS[doc.status];
                  return (
                    <div key={doc.name} className="flex items-center justify-between px-4 py-3 rounded-xl border border-ink-06 bg-canvas">
                      <div className="flex items-center gap-3">
                        <PdfIcon />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-medium tracking-[-0.004em]">{doc.name}</span>
                          <span className="text-[11px] font-medium text-ink-40 tracking-[-0.004em]">{doc.type} · {doc.size} · Uploaded {doc.uploaded}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2.5 h-5 rounded-full text-[11px] font-medium" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                        <button className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-ink-40 hover:bg-ink-04 hover:text-ink cursor-pointer border border-ink-06 transition-colors">
                          <DownloadIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
