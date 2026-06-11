"use client";

import { useState, useRef, useEffect } from "react";
import { STATUS_CLS, STATUS_LABEL } from "@/lib/fleet-data";
import Topbar from "@/components/Topbar";
import CountUp from "@/components/CountUp";
import ExportReportModal from "@/components/ExportReportModal";
import AddNewModal from "@/components/AddNewModal";
import ActionsOverflow from "@/components/ActionsOverflow";
import CopyButton from "@/components/CopyButton";

// --- Types -------------------------------------------------------------------
type DriverStatus = "transit" | "delayed" | "idle" | "upcoming";
type VehicleType  = "car" | "van" | "truck" | "scooter";
type ComplianceCls = "clean" | "warn" | "overdue";

type Driver = {
  id: string;
  name: string;
  initials: string;
  avCls: "a1" | "a2" | "a3" | "a4" | "a5";
  avatar?: string;
  online: boolean;
  region: string;
  vehicle: string;
  vehicleType: VehicleType;
  from: string;
  to: string;
  status: DriverStatus;
  trips: number;
  rating: number;
  compliance: { label: string; cls: ComplianceCls };
};

// --- Drawer tab types --------------------------------------------------------
type TripStatus   = "delivered" | "transit" | "delayed" | "cancelled";
type DocStatus    = "verified"  | "pending" | "expired";

type DrawerTrip = { id:string; from:string; to:string; date:string; status:TripStatus; distance:string; duration:string };
type DrawerComp = { label:string; detail:string; cls:ComplianceCls; expires:string };
type DrawerDoc  = { name:string; size:string; uploaded:string; status:DocStatus };

const TRIP_STATUS_CLS: Record<TripStatus,string> = {
  delivered: "bg-[rgba(10,184,109,0.08)] text-[#037847]",
  transit:   "bg-[rgba(246,98,17,0.08)] text-[#f66211]",
  delayed:   "bg-[rgba(253,81,78,0.08)] text-[#BB2422]",
  cancelled: "bg-[rgba(102,112,133,0.08)] text-[#667085]",
};
const TRIP_STATUS_LABEL: Record<TripStatus,string> = {
  delivered:"Delivered", transit:"In transit", delayed:"Delayed", cancelled:"Cancelled",
};
const COMP_STYLE: Record<ComplianceCls,{ dot:string; bg:string; text:string; badge:string }> = {
  clean:   { dot:"#0ab86d", bg:"rgba(10,184,109,0.08)",  text:"#037847",  badge:"Clean"   },
  warn:    { dot:"#ee9b32", bg:"rgba(238,155,50,0.08)",  text:"#A15A00",  badge:"Warning" },
  overdue: { dot:"#fd514e", bg:"rgba(253,81,78,0.08)",   text:"#BB2422",  badge:"Overdue" },
};
const DOC_STATUS_STYLE: Record<DocStatus,{ bg:string; text:string; label:string }> = {
  verified: { bg:"rgba(10,184,109,0.08)",  text:"#037847", label:"Verified" },
  pending:  { bg:"rgba(238,155,50,0.08)",  text:"#A15A00", label:"Pending"  },
  expired:  { bg:"rgba(253,81,78,0.08)",   text:"#BB2422", label:"Expired"  },
};

const DRAWER_TRIPS: Record<string, DrawerTrip[]> = {
  "DRV-0001": [
    { id:"TRP-8821", from:"Oshodi",   to:"Ikeja",           date:"Today, 09:14",     status:"transit",   distance:"18 km",  duration:"42 min"  },
    { id:"TRP-8820", from:"Ikeja",    to:"Victoria Island", date:"Yesterday, 14:30", status:"delivered", distance:"31 km",  duration:"1h 10m"  },
    { id:"TRP-8818", from:"Surulere", to:"Lekki",           date:"Jun 8, 11:05",     status:"delivered", distance:"24 km",  duration:"55 min"  },
    { id:"TRP-8815", from:"Apapa",    to:"Ojota",           date:"Jun 7, 08:22",     status:"delivered", distance:"22 km",  duration:"48 min"  },
    { id:"TRP-8810", from:"Ikeja",    to:"Badagry",         date:"Jun 6, 15:50",     status:"delayed",   distance:"62 km",  duration:"2h 05m"  },
    { id:"TRP-8805", from:"Yaba",     to:"Surulere",        date:"Jun 5, 10:30",     status:"delivered", distance:"8 km",   duration:"22 min"  },
    { id:"TRP-8800", from:"VI",       to:"Tin Can",         date:"Jun 4, 07:15",     status:"cancelled", distance:"—",      duration:"—"       },
    { id:"TRP-8796", from:"Oshodi",   to:"Apapa",           date:"Jun 3, 13:40",     status:"delivered", distance:"19 km",  duration:"44 min"  },
  ],
};

const DRAWER_COMPLIANCE: Record<string, DrawerComp[]> = {
  "DRV-0001": [
    { label:"Driver's License",     detail:"Class A · #LG-2291047",           cls:"clean",   expires:"Expires Dec 2027"      },
    { label:"Vehicle Insurance",    detail:"Zenith Insurance · Policy #Z9901", cls:"warn",    expires:"Expires in 7 days"     },
    { label:"Medical Certificate",  detail:"LASUTH · Ref #MED-441",            cls:"clean",   expires:"Expires Mar 2027"      },
    { label:"Hazmat Certification", detail:"NEMA Certified · #HZ-7712",        cls:"clean",   expires:"Expires Sep 2026"      },
    { label:"Background Check",     detail:"Verified · TrackSafe NG",          cls:"clean",   expires:"Verified Jan 2025"     },
    { label:"Coaching Assessment",  detail:"Defensive driving required",       cls:"overdue", expires:"Overdue since Apr 2026" },
  ],
};

const DRAWER_DOCUMENTS: Record<string, DrawerDoc[]> = {
  "DRV-0001": [
    { name:"Driver's License",          size:"1.2 MB",  uploaded:"Jan 14, 2025", status:"verified" },
    { name:"Insurance Certificate",     size:"840 KB",  uploaded:"Mar 02, 2025", status:"verified" },
    { name:"Vehicle Inspection Report", size:"2.1 MB",  uploaded:"Apr 18, 2025", status:"pending"  },
    { name:"Medical Certificate",       size:"620 KB",  uploaded:"Mar 10, 2025", status:"verified" },
    { name:"Employment Contract",       size:"3.4 MB",  uploaded:"Jan 06, 2023", status:"verified" },
    { name:"Hazmat Certificate",        size:"1.8 MB",  uploaded:"Sep 20, 2024", status:"expired"  },
  ],
};

function getFallbackTrips(driver: Driver): DrawerTrip[] {
  const statuses: TripStatus[] = ["delivered","delivered","delivered","delayed","delivered","cancelled","delivered","delivered"];
  const distances = ["18 km","31 km","24 km","22 km","62 km","8 km","—","19 km"];
  const durations = ["42 min","1h 10m","55 min","48 min","2h 05m","22 min","—","44 min"];
  const dates = ["Today, 09:14","Yesterday, 14:30","Jun 8, 11:05","Jun 7, 08:22","Jun 6, 15:50","Jun 5, 10:30","Jun 4, 07:15","Jun 3, 13:40"];
  const routes = [
    [driver.from, driver.to],[driver.to, driver.from],[driver.from, "Lekki"],[driver.to, "Apapa"],
    [driver.from, "VI"],[driver.to, driver.from],[driver.from, driver.to],[driver.to, "Surulere"],
  ];
  return dates.map((date, i) => ({
    id: `TRP-${8800 + i}`,
    from: routes[i][0], to: routes[i][1],
    date, status: i === 0 && driver.status === "transit" ? "transit" : statuses[i],
    distance: distances[i], duration: durations[i],
  }));
}

function getFallbackCompliance(driver: Driver): DrawerComp[] {
  return [
    { label:"Driver's License",     detail:`Class A · #${driver.region.slice(0,2).toUpperCase()}-${driver.id.slice(-4)}`, cls: driver.compliance.cls === "overdue" ? "overdue" : "clean",  expires:"Expires Dec 2027"      },
    { label:"Vehicle Insurance",    detail:`Policy #Z${driver.id.slice(-4)}`,  cls: driver.compliance.cls === "warn" ? "warn" : "clean",    expires:"Expires in 45 days"    },
    { label:"Medical Certificate",  detail:"Certified · Regional Health Auth",  cls:"clean",   expires:"Expires Mar 2027"      },
    { label:"Hazmat Certification", detail:"NEMA Certified",                     cls:"clean",   expires:"Expires Sep 2026"      },
    { label:"Background Check",     detail:"Verified · TrackSafe NG",            cls:"clean",   expires:"Verified Jan 2025"     },
    { label:"Coaching Assessment",  detail:driver.compliance.label,              cls: driver.compliance.cls, expires: driver.compliance.cls === "overdue" ? "Overdue" : driver.compliance.cls === "warn" ? "Due soon" : "Completed" },
  ];
}

function getFallbackDocuments(): DrawerDoc[] {
  return [
    { name:"Driver's License",          size:"1.2 MB",  uploaded:"Jan 14, 2025", status:"verified" },
    { name:"Insurance Certificate",     size:"840 KB",  uploaded:"Mar 02, 2025", status:"verified" },
    { name:"Vehicle Inspection Report", size:"2.1 MB",  uploaded:"Apr 18, 2025", status:"pending"  },
    { name:"Medical Certificate",       size:"620 KB",  uploaded:"Mar 10, 2025", status:"verified" },
    { name:"Employment Contract",       size:"3.4 MB",  uploaded:"Jan 06, 2023", status:"verified" },
  ];
}

// --- Avatar gradient map -----------------------------------------------------
const AV_GRADIENT: Record<string, string> = {
  a1: "linear-gradient(135deg,#f3a76a,#b86a2e)",
  a2: "linear-gradient(135deg,#6c8cd5,#2e4a8e)",
  a3: "linear-gradient(135deg,#6fc498,#2b7a4e)",
  a4: "linear-gradient(135deg,#d4836e,#8a3e26)",
  a5: "linear-gradient(135deg,#c98ad4,#6d3a85)",
};

// --- Drivers data ------------------------------------------------------------
const DRIVERS: Driver[] = [
  { id:"DRV-0001", name:"Ngozi Eze",     initials:"NE", avCls:"a1", avatar:"/icons/ngozi.svg",  online:true, region:"Lagos",         vehicle:"CAR-041", vehicleType:"car",     from:"Oshodi",  to:"Ikeja",    status:"transit",  trips:142, rating:4.9, compliance:{ label:"Clean",        cls:"clean"  } },
  { id:"DRV-0002", name:"Emeka Okeke",   initials:"EO", avCls:"a4", avatar:"/icons/emeka.svg",  online:true, region:"Lagos",         vehicle:"VAN-007", vehicleType:"van",     from:"Ikorodu", to:"VI",       status:"transit",  trips:30,  rating:4.7, compliance:{ label:"License 7d",  cls:"warn"   } },
  { id:"DRV-0003", name:"Fatima Bello",  initials:"FB", avCls:"a3",                             online:true, region:"Lagos",         vehicle:"TRK-055", vehicleType:"truck",   from:"Yaba",    to:"Surulere", status:"delayed",  trips:132, rating:4.2, compliance:{ label:"Hazmat 11d",  cls:"overdue" } },
  { id:"DRV-0004", name:"Segun Adebayo", initials:"SA", avCls:"a2", avatar:"/icons/segun.svg",  online:true, region:"Lagos",         vehicle:"SCT-014", vehicleType:"scooter", from:"Tin Can", to:"Ajah",     status:"idle",     trips:131, rating:4.5, compliance:{ label:"Coaching",    cls:"warn"   } },
  { id:"DRV-0005", name:"Nkechi Obi",    initials:"NO", avCls:"a5",                             online:true, region:"Lagos",         vehicle:"TRK-017", vehicleType:"truck",   from:"Apapa",   to:"Lekki",    status:"transit",  trips:23,  rating:4.8, compliance:{ label:"License 14d", cls:"warn"   } },
  { id:"DRV-0006", name:"Chidi Okoro",   initials:"CO", avCls:"a4", avatar:"/icons/chidi.svg",  online:true, region:"Kano",          vehicle:"TRK-029", vehicleType:"truck",   from:"Kano",    to:"Zaria",    status:"upcoming", trips:323, rating:4.6, compliance:{ label:"Clean",       cls:"clean"  } },
  { id:"DRV-0007", name:"Halima Bala",   initials:"HB", avCls:"a3", online:true, region:"Port Harcourt", vehicle:"TRK-222", vehicleType:"truck",   from:"PH",      to:"Aba",      status:"upcoming", trips:99,  rating:4.8, compliance:{ label:"Clean",       cls:"clean"  } },
  { id:"DRV-0008", name:"Tunde Usman",   initials:"TU", avCls:"a2", online:true, region:"Abuja",         vehicle:"SCT-333", vehicleType:"scooter", from:"Benue",   to:"Katsina",  status:"upcoming", trips:29,  rating:4.4, compliance:{ label:"Clean",       cls:"clean"  } },
  { id:"DRV-0009", name:"May Adewale",   initials:"MA", avCls:"a5", online:true, region:"Kaduna",        vehicle:"VAN-012", vehicleType:"van",     from:"Kogi",    to:"Kwara",    status:"upcoming", trips:30,  rating:4.7, compliance:{ label:"Clean",       cls:"clean"  } },
  { id:"DRV-0010", name:"Sule Dangiwa",  initials:"SD", avCls:"a2", online:true, region:"Ibadan",        vehicle:"CAR-444", vehicleType:"car",     from:"Yobe",    to:"Ondo",     status:"upcoming", trips:120, rating:4.9, compliance:{ label:"Clean",       cls:"clean"  } },
  { id:"DRV-0011", name:"Ibrahim Baba",  initials:"IB", avCls:"a4", online:true, region:"Lagos",         vehicle:"CAR-555", vehicleType:"car",     from:"Ogun",    to:"Ekiti",    status:"upcoming", trips:29,  rating:4.3, compliance:{ label:"Insurance 3d",cls:"overdue" } },
  { id:"DRV-0012", name:"Funke Hassan",  initials:"FH", avCls:"a3", online:true, region:"Accra",         vehicle:"VAN-012", vehicleType:"van",     from:"Osun",    to:"Taraba",   status:"upcoming", trips:280, rating:4.6, compliance:{ label:"Medical 21d", cls:"overdue" } },
  { id:"DRV-0013", name:"Bayo Williams",  initials:"BW", avCls:"a4", online:true, region:"Nairobi",       vehicle:"TRK-666", vehicleType:"truck",   from:"Gombe",    to:"Adamawa",  status:"upcoming", trips:29,  rating:4.5, compliance:{ label:"License 30d", cls:"overdue"  } },
  { id:"DRV-0014", name:"Amaka Nwosu",   initials:"AN", avCls:"a1", online:true, region:"Port Harcourt", vehicle:"VAN-031", vehicleType:"van",     from:"PH",       to:"Enugu",    status:"transit",  trips:88,  rating:4.8, compliance:{ label:"Clean",        cls:"clean"   } },
  { id:"DRV-0015", name:"Dauda Musa",    initials:"DM", avCls:"a2", online:true, region:"Kano",          vehicle:"TRK-072", vehicleType:"truck",   from:"Kano",     to:"Kaduna",   status:"delayed",  trips:61,  rating:4.1, compliance:{ label:"Hazmat 5d",    cls:"overdue" } },
  { id:"DRV-0016", name:"Zainab Garba",  initials:"ZG", avCls:"a3", online:true, region:"Abuja",         vehicle:"CAR-109", vehicleType:"car",     from:"Gwagwa",   to:"Maitama",  status:"transit",  trips:204, rating:4.7, compliance:{ label:"Clean",        cls:"clean"   } },
  { id:"DRV-0017", name:"Olu Akande",    initials:"OA", avCls:"a5", online:true, region:"Lagos",         vehicle:"SCT-021", vehicleType:"scooter", from:"Lekki",    to:"Surulere", status:"idle",     trips:47,  rating:4.4, compliance:{ label:"Coaching",     cls:"warn"    } },
  { id:"DRV-0018", name:"Chisom Eze",    initials:"CE", avCls:"a1", online:true, region:"Ibadan",        vehicle:"VAN-044", vehicleType:"van",     from:"Ibadan",   to:"Abeokuta", status:"transit",  trips:113, rating:4.6, compliance:{ label:"Clean",        cls:"clean"   } },
  { id:"DRV-0019", name:"Musa Lawal",    initials:"ML", avCls:"a4", online:true, region:"Kaduna",        vehicle:"TRK-081", vehicleType:"truck",   from:"Kaduna",   to:"Zaria",    status:"upcoming", trips:72,  rating:4.3, compliance:{ label:"License 10d",  cls:"warn"    } },
  { id:"DRV-0020", name:"Taiwo Ogunle",  initials:"TO", avCls:"a2", online:true, region:"Lagos",         vehicle:"CAR-222", vehicleType:"car",     from:"Ikeja",    to:"Badagry",  status:"transit",  trips:158, rating:4.9, compliance:{ label:"Clean",        cls:"clean"   } },
  { id:"DRV-0021", name:"Rakiya Abdull", initials:"RA", avCls:"a3", online:true, region:"Kano",          vehicle:"SCT-055", vehicleType:"scooter", from:"Sabon Gari",to:"Fagge",   status:"idle",     trips:38,  rating:4.2, compliance:{ label:"Medical 8d",   cls:"overdue" } },
  { id:"DRV-0022", name:"Emeka Udo",     initials:"EU", avCls:"a5", online:true, region:"Port Harcourt", vehicle:"CAR-317", vehicleType:"car",     from:"Rumuola",  to:"D-Line",   status:"transit",  trips:96,  rating:4.7, compliance:{ label:"Clean",        cls:"clean"   } },
  { id:"DRV-0023", name:"Ladi Pwol",     initials:"LP", avCls:"a1", online:true, region:"Abuja",         vehicle:"VAN-058", vehicleType:"van",     from:"Karu",     to:"Lugbe",    status:"delayed",  trips:54,  rating:4.0, compliance:{ label:"Insurance 2d",  cls:"overdue" } },
  { id:"DRV-0024", name:"Adaeze Obi",    initials:"AO", avCls:"a2", online:true, region:"Lagos",         vehicle:"TRK-093", vehicleType:"truck",   from:"Apapa",    to:"Ojota",    status:"upcoming", trips:189, rating:4.8, compliance:{ label:"Clean",        cls:"clean"   } },
  { id:"DRV-0025", name:"Yakubu Sani",   initials:"YS", avCls:"a4", online:true, region:"Ibadan",        vehicle:"SCT-077", vehicleType:"scooter", from:"Bodija",   to:"Ojoo",     status:"transit",  trips:43,  rating:4.5, compliance:{ label:"Coaching",     cls:"warn"    } },
  { id:"DRV-0026", name:"Ngozi Amadi",   initials:"NA", avCls:"a3", online:true, region:"Accra",         vehicle:"CAR-501", vehicleType:"car",     from:"Osu",      to:"Accra CBD",status:"upcoming", trips:67,  rating:4.6, compliance:{ label:"Clean",        cls:"clean"   } },
];

// --- KPI data -----------------------------------------------------------------
const KPI_DATA = [
  { title: "Active now",         value: <><CountUp target={47} /><span style={{ color:"var(--ink-40)" }}> / 64</span></>, bars: [55,75,90,72,40,35,80,68,52,30], icon: "lightning" },
  { title: "On leave",           value: <CountUp target={6} />,                    bars: [45,50,42,80,50,38,42,55,48,35], icon: "location" },
  { title: "Compliance issues",  value: <CountUp target={3} />,                    bars: [28,30,32,30,42,30,36,38,42,30], icon: "shield"   },
  { title: "Avg. driver rating", value: <CountUp target={4.7} decimals={1} />,     bars: [45,40,55,80,72,55,85,90,88,55], icon: "star"     },
];

// --- Icon helpers -------------------------------------------------------------
function LightningIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.04186 1.20625C4.80619 1.29025 4.86044 1.1835 3.54911 4.13925C2.66828 6.12375 2.34628 6.87216 2.33869 6.95383C2.32975 7.06753 2.35467 7.18133 2.41031 7.28089C2.46595 7.38045 2.54983 7.4613 2.65136 7.51325L2.76511 7.57158L3.89094 7.578C4.51044 7.58208 5.01678 7.58733 5.01678 7.59025C5.01678 7.59316 4.67961 8.60291 4.26778 9.83491C3.58703 11.8684 3.51819 12.0901 3.51528 12.2382C3.51236 12.3701 3.52286 12.4232 3.57011 12.5153C3.71478 12.7994 4.05369 12.9079 4.34886 12.7644C4.41536 12.7323 5.53886 11.6234 8.01919 9.14133C11.518 5.64016 11.5939 5.562 11.63 5.43833C11.6755 5.28083 11.6761 5.21958 11.6318 5.07025C11.5915 4.93433 11.4673 4.79375 11.3273 4.72375C11.2404 4.68116 11.1739 4.67766 10.1793 4.67125C9.59828 4.66775 9.12345 4.66016 9.12345 4.65433C9.12345 4.6485 9.42736 4.036 9.79836 3.29341C10.2528 2.384 10.4785 1.908 10.489 1.83566C10.5058 1.71702 10.4856 1.5961 10.4312 1.48933C10.3769 1.38256 10.2909 1.29513 10.1851 1.23891L10.0684 1.17825L7.60678 1.17416C5.42336 1.17008 5.13344 1.17416 5.04186 1.20625ZM8.96011 2.34433C8.96011 2.35075 8.65503 2.96733 8.28228 3.71516C7.74153 4.79958 7.60153 5.09883 7.59103 5.1945C7.58169 5.27966 7.59227 5.36583 7.62193 5.44621C7.65159 5.52659 7.69952 5.59898 7.76194 5.65766C7.92994 5.82566 7.97719 5.83325 8.88836 5.83325H9.67178L7.56128 7.94375C6.40044 9.10458 5.44786 10.0519 5.44436 10.0484C5.60008 9.55514 5.76109 9.06356 5.92736 8.57375C6.19628 7.76583 6.41678 7.06758 6.41678 7.0215C6.41618 6.86114 6.35272 6.70741 6.24003 6.59333C6.06503 6.41833 6.05161 6.41658 4.86103 6.41658C4.29228 6.41658 3.82678 6.41016 3.82678 6.402C3.82678 6.39383 4.23219 5.47508 4.72803 4.36033L5.62869 2.33325H7.29469C8.21053 2.33325 8.96011 2.3385 8.96011 2.34433Z" fill="currentColor"/>
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.56571 1.73986C3.81379 1.85652 3.13421 2.19486 2.58238 2.72686C2.39338 2.90886 2.34613 3.00511 2.34613 3.20811C2.34613 3.39419 2.39454 3.50911 2.52346 3.63219C2.60863 3.71327 2.73696 3.76694 3.37163 3.98977C3.60263 4.07086 3.79921 4.14377 3.80913 4.15194C3.81846 4.16011 3.76071 4.21027 3.68079 4.26277C2.61446 4.96686 2.00779 6.39427 2.17288 7.81236C2.21021 8.13494 2.30179 8.29419 2.50829 8.39744C2.65413 8.46977 2.87463 8.47327 3.00646 8.40444C3.05721 8.37819 3.68429 7.98036 4.40063 7.52069C5.11638 7.06102 5.70846 6.68711 5.71546 6.68944C5.73879 6.69819 5.78254 7.04994 5.80763 7.42794C5.86829 8.33327 5.71371 9.44044 5.38529 10.4531C5.28029 10.7769 5.12338 11.1899 5.03121 11.3864C4.96004 11.5364 4.94896 11.7504 5.00496 11.8846C5.05338 12.0001 5.16888 12.1261 5.28263 12.1868C5.37654 12.2375 5.39638 12.2381 6.51871 12.2445C7.81896 12.2527 7.81488 12.2527 7.99396 12.0736C8.07096 11.9966 8.10479 11.9371 8.14154 11.814C8.22554 11.5288 8.33754 10.8369 8.41571 10.1148C8.47462 9.57169 8.47462 7.94886 8.41571 7.46644C8.35737 6.99102 8.29379 6.62352 8.20046 6.21986C8.17092 6.10305 8.14601 5.98513 8.12579 5.86636C8.12871 5.86344 8.77212 6.11777 9.55496 6.43161C10.9007 6.97119 10.9853 7.00152 11.1066 6.99394C11.2647 6.98402 11.4391 6.90002 11.5295 6.79094C11.6655 6.62586 11.7244 6.29686 11.722 5.71644C11.7209 5.38744 11.711 5.26027 11.669 5.06311C11.4234 3.90344 10.5781 3.08036 9.42546 2.87969C9.10171 2.82311 8.61171 2.84294 8.27746 2.92636C8.04879 2.98352 7.71863 3.10194 7.56579 3.18186C7.50571 3.21336 7.50396 3.21219 7.44154 3.07919C7.09562 2.34827 6.35479 1.84311 5.45996 1.72702C5.16239 1.6966 4.86229 1.70091 4.56571 1.73986ZM5.54163 2.92577C5.89688 3.02261 6.22471 3.26002 6.35246 3.51144C6.41838 3.64152 6.47671 3.82061 6.45921 3.83811C6.45104 3.84627 4.69171 3.22911 4.24779 3.06169C4.19529 3.04186 4.20288 3.03602 4.34113 2.98994C4.63513 2.89252 4.78096 2.87152 5.09829 2.87969C5.28321 2.88436 5.45646 2.90244 5.54163 2.92577ZM9.36304 4.05861C9.82388 4.17644 10.161 4.44302 10.3728 4.85777C10.4959 5.09811 10.6149 5.59919 10.5425 5.57061L9.12562 5.00361L7.73904 4.44886L7.80729 4.39402C7.88954 4.32811 8.15029 4.18927 8.28796 4.13794C8.64029 4.00669 9.04454 3.97694 9.36304 4.05861ZM5.83329 4.94936C6.02579 4.99311 6.11213 5.02636 6.08938 5.04736C6.05029 5.08469 3.37688 6.79094 3.36929 6.78336C3.35004 6.76411 3.45854 6.40536 3.54313 6.20936C3.76654 5.69019 4.12938 5.30402 4.60829 5.07477C5.00904 4.88344 5.37654 4.84552 5.83329 4.94936ZM6.99238 6.19886C7.36746 7.50377 7.41529 9.19544 7.12654 10.9839L7.11079 11.0831H6.76371C6.57296 11.0831 6.41663 11.0744 6.41663 11.0633C6.41663 11.0528 6.43821 10.9816 6.46446 10.9058C6.58381 10.539 6.68428 10.1663 6.76546 9.78927C6.92121 9.04027 6.97546 8.52927 6.97604 7.80711C6.98294 7.30689 6.93719 6.80733 6.83954 6.31669L6.77654 5.99527L6.82438 5.96202C6.85004 5.94394 6.88212 5.93169 6.89496 5.93519C6.90779 5.93869 6.95154 6.05711 6.99238 6.19886Z" fill="currentColor"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path d="M7 2.37287L2.91667 3.90412V7.03253C2.9168 7.79079 3.12806 8.53403 3.52678 9.17899C3.92551 9.82395 4.49594 10.3452 5.17417 10.6842L7 11.5977L8.82583 10.6842C9.50406 10.3452 10.0745 9.82395 10.4732 9.17899C10.8719 8.53403 11.0832 7.79079 11.0833 7.03253V3.90412L7 2.37287ZM8.28333 6.00412L7 5.52287L5.71667 6.00412V7.01328C5.71679 7.25159 5.78327 7.48516 5.90866 7.68782C6.03405 7.89048 6.21338 8.05422 6.42658 8.1607L7 8.44712L7.574 8.16128C7.78727 8.05463 7.9666 7.89067 8.09189 7.6878C8.21719 7.48492 8.28348 7.25115 8.28333 7.0127V6.00412ZM9.45 7.01328C9.45 7.94078 8.925 8.78953 8.0955 9.20428L7.31383 9.5957C7.21658 9.64436 7.10933 9.6697 7.00058 9.6697C6.89184 9.6697 6.78458 9.64436 6.68733 9.5957L5.9045 9.20487C5.49734 9.00125 5.15494 8.68825 4.9157 8.30094C4.67645 7.91364 4.54982 7.46735 4.55 7.01212V5.76203C4.55 5.42137 4.76117 5.11628 5.07967 4.9967L6.713 4.3842L6.783 4.36203C6.94901 4.31636 7.1252 4.32432 7.28642 4.38478L8.92033 4.99728C9.23883 5.11628 9.45 5.42137 9.45 5.76145V7.01328ZM12.25 7.03253C12.25 8.00753 11.9785 8.96327 11.466 9.79267C10.9534 10.6221 10.22 11.2923 9.34792 11.7284L7.39142 12.706C7.26989 12.7668 7.13588 12.7985 7 12.7985C6.86412 12.7985 6.73011 12.7668 6.60858 12.706L4.65208 11.7278C3.78002 11.2917 3.04661 10.6215 2.53404 9.79208C2.02147 8.96269 1.74998 8.00695 1.75 7.03195V3.9047C1.74985 3.66706 1.82228 3.43504 1.95759 3.23968C2.0929 3.04432 2.28464 2.89495 2.50717 2.81153L6.5905 1.28028C6.85453 1.18131 7.14547 1.18131 7.4095 1.28028L11.4928 2.81153C11.7153 2.89491 11.9069 3.0442 12.0422 3.23944C12.1775 3.43468 12.25 3.66657 12.25 3.90412V7.03253Z" fill="currentColor"/>
    </svg>
  );
}

function StarIcon({ filled = true, size = 14 }: { filled?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.77844 1.05766C6.63534 1.10621 6.51001 1.1964 6.41852 1.31666C6.38236 1.36916 5.99327 2.03124 5.55344 2.78841C5.28522 3.25116 5.01572 3.71316 4.74494 4.17441C4.74086 4.17966 4.01519 4.34008 3.13261 4.53024C2.25061 4.72099 1.48644 4.89541 1.43511 4.91758C1.04252 5.08849 0.881523 5.61524 1.11544 5.96583C1.15044 6.01774 1.66436 6.60399 2.25761 7.26783C2.90511 7.99233 3.33677 8.49341 3.33677 8.52141C3.33677 8.54649 3.26269 9.29608 3.17227 10.188C2.98911 11.9893 2.98969 11.9578 3.13436 12.1731C3.28602 12.3988 3.54269 12.5242 3.80461 12.5003C3.91369 12.4904 4.21002 12.3679 5.45194 11.8207C6.28436 11.4538 6.98086 11.1534 6.99952 11.1534C7.01877 11.1534 7.71527 11.4538 8.54827 11.8207C9.79019 12.3685 10.0865 12.4904 10.1956 12.5003C10.4575 12.5242 10.7142 12.3988 10.8659 12.1731C11.0111 11.9572 11.0117 11.9917 10.8256 10.1577C10.6903 8.83174 10.6629 8.49924 10.6856 8.46308C10.7014 8.43858 11.1879 7.88791 11.7677 7.23924C12.3475 6.59116 12.8498 6.01833 12.8848 5.96641C13.1181 5.61466 12.9577 5.08849 12.5651 4.91758C12.5138 4.89541 11.7496 4.72099 10.8676 4.53083C10.329 4.41733 9.79153 4.29852 9.25527 4.17441C9.25061 4.16916 8.87552 3.52516 8.42111 2.74291C7.95619 1.94316 7.55836 1.28399 7.51169 1.23616C7.38627 1.10899 7.23286 1.04424 7.03744 1.03491C6.95045 1.02945 6.86314 1.03712 6.77844 1.05766Z" fill={filled ? "#EE9B32" : "currentColor"}/>
    </svg>
  );
}

function KpiIcon({ icon }: { icon: string }) {
  if (icon === "lightning") return <LightningIcon />;
  if (icon === "location")  return <LocationPinIcon />;
  if (icon === "shield")    return <ShieldIcon />;
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.77844 1.05766C6.63534 1.10621 6.51001 1.1964 6.41852 1.31666C6.38236 1.36916 5.99327 2.03124 5.55344 2.78841C5.28522 3.25116 5.01572 3.71316 4.74494 4.17441C4.74086 4.17966 4.01519 4.34008 3.13261 4.53024C2.25061 4.72099 1.48644 4.89541 1.43511 4.91758C1.04252 5.08849 0.881523 5.61524 1.11544 5.96583C1.15044 6.01774 1.66436 6.60399 2.25761 7.26783C2.90511 7.99233 3.33677 8.49341 3.33677 8.52141C3.33677 8.54649 3.26269 9.29608 3.17227 10.188C2.98911 11.9893 2.98969 11.9578 3.13436 12.1731C3.28602 12.3988 3.54269 12.5242 3.80461 12.5003C3.91369 12.4904 4.21002 12.3679 5.45194 11.8207C6.28436 11.4538 6.98086 11.1534 6.99952 11.1534C7.01877 11.1534 7.71527 11.4538 8.54827 11.8207C9.79019 12.3685 10.0865 12.4904 10.1956 12.5003C10.4575 12.5242 10.7142 12.3988 10.8659 12.1731C11.0111 11.9572 11.0117 11.9917 10.8256 10.1577C10.6903 8.83174 10.6629 8.49924 10.6856 8.46308C10.7014 8.43858 11.1879 7.88791 11.7677 7.23924C12.3475 6.59116 12.8498 6.01833 12.8848 5.96641C13.1181 5.61466 12.9577 5.08849 12.5651 4.91758C12.5138 4.89541 11.7496 4.72099 10.8676 4.53083C10.329 4.41733 9.79153 4.29852 9.25527 4.17441C9.25061 4.16916 8.87552 3.52516 8.42111 2.74291C7.95619 1.94316 7.55836 1.28399 7.51169 1.23616C7.38627 1.10899 7.23286 1.04424 7.03744 1.03491C6.95045 1.02945 6.86314 1.03712 6.77844 1.05766Z" fill="currentColor"/>
    </svg>
  );
}

// --- Vehicle SVG icons (14×14) ------------------------------------------------
function VehicleIcon({ type }: { type: VehicleType }) {
  if (type === "van") return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path d="M5.22925 10.5001C5.08772 11.4895 4.23681 12.2501 3.20825 12.2501C2.1797 12.2501 1.32879 11.4895 1.18726 10.5001H0.583252V3.50008C0.583252 3.17792 0.844422 2.91675 1.16659 2.91675H9.33325C9.65543 2.91675 9.91659 3.17792 9.91659 3.50008V4.66675H11.6666L13.4166 7.03257V10.5001H12.2293C12.0877 11.4895 11.2368 12.2501 10.2083 12.2501C9.17972 12.2501 8.32881 11.4895 8.18724 10.5001H5.22925ZM8.74992 4.08341H1.74992V8.77954C2.12049 8.40137 2.63697 8.16675 3.20825 8.16675C4.0227 8.16675 4.72576 8.64362 5.05344 9.33342H8.36305C8.46088 9.1275 8.59219 8.94048 8.74992 8.77954V4.08341ZM9.91659 7.58342H12.2499V7.41717L11.0784 5.83342H9.91659V7.58342ZM10.2083 11.0834C10.5892 11.0834 10.9133 10.8399 11.0334 10.5001C11.0657 10.4088 11.0833 10.3107 11.0833 10.2084C11.0833 9.72518 10.6915 9.33342 10.2083 9.33342C9.72502 9.33342 9.33325 9.72518 9.33325 10.2084C9.33325 10.3107 9.35081 10.4088 9.38307 10.5001C9.50318 10.8399 9.82728 11.0834 10.2083 11.0834ZM4.08325 10.2084C4.08325 9.72518 3.6915 9.33342 3.20825 9.33342C2.725 9.33342 2.33325 9.72518 2.33325 10.2084C2.33325 10.3107 2.3508 10.4088 2.38304 10.5001C2.50316 10.8399 2.82727 11.0834 3.20825 11.0834C3.58923 11.0834 3.91334 10.8399 4.03346 10.5001C4.06571 10.4088 4.08325 10.3107 4.08325 10.2084Z" fill="currentColor"/>
    </svg>
  );
  if (type === "scooter") return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path d="M9.33341 0.583252C9.65559 0.583252 9.91675 0.844422 9.91675 1.16659V1.74992H12.8334V5.24992H11.6558L13.2576 9.65053C13.3603 9.91355 13.4167 10.1999 13.4167 10.4993C13.4167 11.788 12.3721 12.8327 11.0834 12.8327C9.99637 12.8327 9.08299 12.0893 8.82376 11.0833H6.34325C6.08419 12.0896 5.17065 12.8333 4.08341 12.8333C2.94913 12.8333 2.00388 12.0239 1.79368 10.9512C1.42106 10.7564 1.16675 10.3662 1.16675 9.91658V4.08325C1.16675 3.76109 1.42792 3.49992 1.75008 3.49992H5.83341C6.15559 3.49992 6.41675 3.76109 6.41675 4.08325V6.99992C6.41675 7.32209 6.67791 7.58325 7.00008 7.58325H8.16675C8.48892 7.58325 8.75008 7.32209 8.75008 6.99992V1.74992H7.00008V0.583252H9.33341ZM4.08341 9.33325C3.43908 9.33325 2.91675 9.85557 2.91675 10.4999C2.91675 11.1443 3.43908 11.6666 4.08341 11.6666C4.72775 11.6666 5.25008 11.1443 5.25008 10.4999C5.25008 9.85557 4.72775 9.33325 4.08341 9.33325ZM11.0834 9.33267C10.4391 9.33267 9.91675 9.85499 9.91675 10.4993C9.91675 11.1437 10.4391 11.666 11.0834 11.666C11.7278 11.666 12.2501 11.1437 12.2501 10.4993C12.2501 10.3592 12.2253 10.2247 12.18 10.1002L12.1705 10.0749C12.0007 9.64044 11.578 9.33267 11.0834 9.33267ZM10.4143 5.24992H9.91675V6.99992C9.91675 7.96644 9.13327 8.74992 8.16675 8.74992H7.00008C6.03356 8.74992 5.25008 7.96644 5.25008 6.99992H2.33341V8.95654C2.76096 8.47214 3.38651 8.16658 4.08341 8.16658C5.17065 8.16658 6.08419 8.91022 6.34325 9.91658H8.82346C9.08229 8.90993 9.99596 8.166 11.0834 8.166C11.2215 8.166 11.3569 8.17802 11.4884 8.20106L10.4143 5.24992ZM5.25008 4.66658H2.33341V5.83325H5.25008V4.66658ZM11.6667 2.91659H9.91675V4.08325H11.6667V2.91659Z" fill="currentColor"/>
    </svg>
  );
  if (type === "truck") return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C10.8793 6.41666 10.9528 6.40249 11.0217 6.37495C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.62576 5.68559 2.6116 5.75912 2.6116 5.83333C2.6116 6.1555 2.87277 6.41666 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.55913 9.91666 8.51188 9.90482 8.46959 9.88219C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="currentColor"/>
    </svg>
  );
  // car (default)
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C10.8793 6.41666 10.9528 6.40249 11.0217 6.37495C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.62576 5.68559 2.6116 5.75912 2.6116 5.83333C2.6116 6.1555 2.87277 6.41666 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.55913 9.91666 8.51188 9.90482 8.46959 9.88219C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="currentColor"/>
    </svg>
  );
}

// --- Compliance icon ----------------------------------------------------------
function ComplianceIcon({ cls }: { cls: ComplianceCls }) {
  if (cls === "clean") return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.57981 1.18062C5.34956 1.28854 4.25872 1.72079 3.33589 2.46454C2.35881 3.25262 1.63956 4.37787 1.34322 5.58304C1.21722 6.09696 1.18164 6.40554 1.18164 6.99996C1.18164 7.59437 1.21722 7.90296 1.34322 8.41687C1.86006 10.521 3.58264 12.2097 5.69314 12.6816C6.18547 12.7919 6.44389 12.8193 6.99981 12.8193C7.55572 12.8193 7.81414 12.7919 8.30647 12.6816C10.417 12.2097 12.1396 10.521 12.6564 8.41687C12.7806 7.90996 12.8174 7.59262 12.8186 7.01162C12.8191 6.44229 12.7935 6.19262 12.6815 5.69329C12.4143 4.49804 11.7143 3.34537 10.7798 2.56137C9.71581 1.66829 8.49606 1.20746 7.12814 1.18004C6.9454 1.17483 6.76254 1.17502 6.57981 1.18062ZM9.65397 4.74887C9.88731 4.81829 10.0571 5.05804 10.0565 5.3182C10.0559 5.5492 10.0687 5.53462 8.20964 7.38904C6.48589 9.1087 6.47422 9.11979 6.34006 9.15829C6.20427 9.20048 6.05762 9.19049 5.92881 9.13029C5.82556 9.08829 4.10822 7.38612 4.02189 7.24029C3.96573 7.14065 3.94011 7.0267 3.9482 6.91262C3.95629 6.79853 3.99774 6.68934 4.06739 6.59862C4.18581 6.44287 4.31531 6.38162 4.52647 6.38162C4.67464 6.38162 4.71781 6.39096 4.80647 6.44404C4.86422 6.47846 5.19497 6.79112 5.54147 7.13821L6.17089 7.76995L7.64147 6.30229C8.44997 5.49496 9.14822 4.81654 9.19314 4.79379C9.36814 4.70571 9.47431 4.69521 9.65397 4.74887Z" fill="#037847"/>
    </svg>
  );
  if (cls === "warn") return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.03172 1.19082C4.81691 1.22899 4.61041 1.3044 4.42156 1.41366C4.25414 1.51049 4.09197 1.66507 2.86872 2.89007C1.62622 4.13491 1.49381 4.27549 1.40047 4.44232C1.33608 4.5621 1.28165 4.68696 1.23772 4.81566L1.17822 5.00524V8.99524L1.23772 9.18482C1.27097 9.28866 1.34389 9.45666 1.40047 9.55816C1.49381 9.72557 1.62447 9.86382 2.88039 11.1197C4.13631 12.3757 4.27456 12.5063 4.44197 12.5997C4.54347 12.6562 4.71147 12.7292 4.81531 12.7624L5.00489 12.8219H8.99489L9.18447 12.7624C9.28831 12.7292 9.45631 12.6562 9.55781 12.5997C9.72522 12.5063 9.86347 12.3757 11.1194 11.1197C12.3753 9.86382 12.506 9.72557 12.5993 9.55816C12.6559 9.45666 12.7288 9.28866 12.7621 9.18482L12.8216 8.99524V5.00524L12.7621 4.81566C12.7181 4.68696 12.6637 4.5621 12.5993 4.44232C12.506 4.27491 12.3753 4.13666 11.1194 2.88074C9.86347 1.62482 9.72522 1.49416 9.55781 1.40082C9.43814 1.33638 9.31325 1.28213 9.18447 1.23866L8.99489 1.17916L7.06989 1.17507C6.01114 1.17332 5.09414 1.18032 5.03172 1.19082ZM7.19822 3.53874C7.26531 3.56149 7.35164 3.61749 7.40881 3.67466C7.59081 3.85607 7.58322 3.76624 7.58322 5.83357C7.58322 7.90207 7.59081 7.81049 7.40822 7.99307C7.32059 8.08112 7.20684 8.13847 7.08394 8.15655C6.96104 8.17464 6.83558 8.15249 6.72631 8.09341C6.59085 8.01807 6.48863 7.89462 6.43989 7.74749C6.42356 7.68624 6.41772 7.03816 6.42181 5.78224L6.42822 3.90857L6.49297 3.79832C6.55995 3.67776 6.66798 3.58524 6.79741 3.5376C6.92684 3.48996 7.06907 3.49036 7.19822 3.53874ZM7.19822 8.78874C7.41347 8.86224 7.58322 9.10257 7.58322 9.33357C7.58322 9.47474 7.51381 9.63749 7.40881 9.74249C7.34573 9.80606 7.26877 9.85413 7.18398 9.88294C7.09918 9.91175 7.00887 9.92051 6.92012 9.90852C6.83137 9.89654 6.74661 9.86414 6.6725 9.81388C6.59838 9.76361 6.53693 9.69684 6.49297 9.61882C6.43756 9.52491 6.42822 9.48291 6.42822 9.33357C6.42822 9.18424 6.43756 9.14224 6.49297 9.04832C6.55995 8.92776 6.66798 8.83524 6.79741 8.7876C6.92684 8.73996 7.06907 8.74036 7.19822 8.78874Z" fill="#c4842a"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.76496 1.43025C6.60807 1.47615 6.46694 1.56458 6.35721 1.68575C6.22888 1.83392 1.17371 10.602 1.12821 10.7548C1.07487 10.9601 1.09171 11.1774 1.17605 11.372C1.29621 11.6182 1.5383 11.8019 1.80663 11.8515C1.90346 11.869 3.46213 11.8766 7.00005 11.8766C10.538 11.8766 12.0966 11.869 12.1935 11.8515C12.3292 11.8247 12.457 11.7668 12.5667 11.6824C12.6764 11.598 12.7651 11.4894 12.8258 11.365C12.9063 11.1964 12.9255 10.9374 12.8713 10.7548C12.8229 10.5892 7.76596 1.82692 7.6318 1.67525C7.55866 1.5942 7.46979 1.52888 7.37062 1.48325C7.27144 1.43762 7.16401 1.41264 7.05488 1.40983C6.95776 1.40291 6.86015 1.40979 6.76496 1.43025ZM7.19838 4.70508C7.34596 4.75583 7.49413 4.904 7.54488 5.05158C7.57871 5.15133 7.58338 5.31292 7.58338 6.41658C7.58338 7.8335 7.58513 7.816 7.40838 7.99275C7.32075 8.0808 7.207 8.13815 7.08409 8.15623C6.96119 8.17432 6.83574 8.15216 6.72646 8.09308C6.59064 8.01765 6.48833 7.89368 6.44005 7.746C6.42371 7.68533 6.4173 7.21983 6.42196 6.36467L6.42838 5.07492L6.49313 4.96467C6.5601 4.8441 6.66813 4.75158 6.79756 4.70394C6.92699 4.65631 7.06922 4.65671 7.19838 4.70508ZM7.19838 8.78842C7.41363 8.86192 7.58338 9.10225 7.58338 9.33325C7.58338 9.47442 7.51396 9.63717 7.40896 9.74217C7.34589 9.80574 7.26893 9.85381 7.18413 9.88262C7.09934 9.91143 7.00902 9.92019 6.92028 9.9082C6.83153 9.89622 6.74677 9.86382 6.67265 9.81356C6.59854 9.76329 6.53709 9.69652 6.49313 9.6185C6.43771 9.52458 6.42838 9.48258 6.42838 9.33325C6.42838 9.18392 6.43771 9.14192 6.49313 9.048C6.5601 8.92744 6.66813 8.83492 6.79756 8.78728C6.92699 8.73964 7.06922 8.74004 7.19838 8.78842Z" fill="#BB2422"/>
    </svg>
  );
}

// --- Compliance text color -----------------------------------------------------
const COMPLIANCE_COLOR: Record<ComplianceCls, string> = {
  clean:  "#037847",
  warn:   "#c4842a",
  overdue:"#BB2422",
};

// --- Vehicle chip colors ------------------------------------------------------
const VEH_CHIP: Record<VehicleType, { bg: string; color: string }> = {
  car:     { bg:"#e9eef7", color:"#2b3a55" },
  truck:   { bg:"#e9eef7", color:"#2b3a55" },
  van:     { bg:"#fce5d4", color:"#b86426" },
  scooter: { bg:"#e7f4ed", color:"#2c7a4e" },
};

// --- SparkBars ----------------------------------------------------------------
function SparkBars({ bars }: { bars: number[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div
      style={{ display:"flex", alignItems:"end", gap:"5px", height:"64px" }}
      onMouseLeave={() => setHovered(null)}
    >
      {bars.map((h, i) => (
        <div key={i} style={{ flex:1, position:"relative", height:`${h}%`, minHeight:"8px" }} onMouseEnter={() => setHovered(i)}>
          {hovered === i && (
            <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", background:"#ff9256", color:"#fff", fontSize:"10px", fontWeight:600, lineHeight:1, padding:"3px 6px", borderRadius:"5px", whiteSpace:"nowrap", pointerEvents:"none", zIndex:10 }}>
              {h}%
              <div style={{ position:"absolute", bottom:-4, left:"50%", transform:"translateX(-50%) rotate(45deg)", width:8, height:8, background:"#ff9256" }} />
            </div>
          )}
          <span style={{ display:"block", width:"100%", height:"100%", background:"linear-gradient(180deg,#ff9256 0%,#ffd6bd 100%)", borderRadius:"4px 4px 2px 2px", opacity: hovered === null ? 1 : hovered === i ? 1 : 0.3, transition:"opacity 0.15s ease" }} />
        </div>
      ))}
    </div>
  );
}

// --- Avatar -------------------------------------------------------------------
function DriverAvatar({
  initials,
  avCls,
  avatar,
  size = 32,
  online,
}: {
  initials: string;
  avCls: string;
  avatar?: string;
  size?: number;
  online?: boolean;
}) {
  const fontSize = size <= 32 ? "11px" : size <= 40 ? "13px" : "14px";
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {avatar ? (
        <img src={avatar} alt={initials} className="rounded-full shrink-0" style={{ width: size, height: size }} />
      ) : (
        <span
          className="rounded-full inline-flex items-center justify-center text-white font-medium"
          style={{
            width: size,
            height: size,
            background: AV_GRADIENT[avCls] ?? AV_GRADIENT.a1,
            fontSize,
            border: "1px solid var(--ink-06)",
          }}
        >
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 8,
            right: -1,
            bottom: -1,
            background: online ? "#0ab86d" : "#9ca3af",
            border: "1.5px solid white",
          }}
        />
      )}
    </span>
  );
}

// --- Filter dropdown ---------------------------------------------------------
type FilterItem = { value: string; label: string };

function FilterDropdown({ icon, prefix, defaultLabel, value, items, onSelect, searchable = false, alignRight = false }: {
  icon: React.ReactNode;
  prefix?: string;
  defaultLabel?: string;
  value: string;
  items: FilterItem[];
  onSelect: (v: string) => void;
  searchable?: boolean;
  alignRight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const displayed = searchable ? items.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) : items;
  const isActive  = value !== "all";

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(v => !v)}
        className={`h-[38px] px-3.5 inline-flex items-center gap-1.5 border rounded-[12px] text-[12px] font-medium tracking-[-0.004em] cursor-pointer select-none ${open ? "border-orange" : "border-ink-06"}`}
        style={{ background:"var(--canvas)" }}
      >
        <span className="filter-icon inline-flex items-center justify-center w-3.5 h-3.5 shrink-0 text-ink">{icon}</span>
        {prefix && <span className="text-ink">{prefix}</span>}
        <span className="text-ink whitespace-nowrap">{defaultLabel ?? "All"}</span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />}
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3 h-3 text-ink-40 transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M3 5l4 4 4-4"/>
        </svg>
      </button>
      {open && (
        <div className={`absolute top-[calc(100%+6px)] z-30 bg-surface border border-ink-06 rounded-2xl p-2 shadow-[0_12px_32px_rgba(0,0,0,0.10)] min-w-[200px] max-h-[320px] overflow-auto ${alignRight ? "right-0" : "left-0"}`}>
          {searchable && (
            <div className="flex items-center gap-2 px-1.5 pb-2 border-b border-ink-04 mb-1.5">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5 text-ink-30 shrink-0"><circle cx="6" cy="6" r="4.5"/><path d="M10 10l3 3"/></svg>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="flex-1 border-none outline-none bg-transparent text-[13px] font-medium text-ink placeholder:text-ink-40 py-1.5" />
            </div>
          )}
          {displayed.map(item => (
            <div
              key={item.value}
              onClick={() => { onSelect(item.value); setOpen(false); setQ(""); }}
              className={`flex items-center justify-between gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer text-[13px] font-medium tracking-[-0.004em] ${item.value === value ? "bg-orange-soft text-orange" : "text-ink hover:bg-canvas"}`}
            >
              {item.label}
              {item.value === value && (
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 shrink-0 text-orange"><path d="M2.5 7.5l3 3 6-7"/></svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const REGION_ITEMS_D: FilterItem[] = [
  { value:"all",           label:"All regions"       },
  { value:"Lagos",         label:"🇳🇬 Lagos"          },
  { value:"Kano",          label:"🇳🇬 Kano"           },
  { value:"Port Harcourt", label:"🇳🇬 Port Harcourt"  },
  { value:"Abuja",         label:"🇳🇬 Abuja"          },
  { value:"Ibadan",        label:"🇳🇬 Ibadan"         },
  { value:"Kaduna",        label:"🇳🇬 Kaduna"         },
  { value:"Accra",         label:"🇬🇭 Accra"          },
  { value:"Nairobi",       label:"🇰🇪 Nairobi"        },
];

const STATUS_ITEMS_D: FilterItem[] = [
  { value:"all",      label:"All"        },
  { value:"transit",  label:"In transit" },
  { value:"delayed",  label:"Delayed"    },
  { value:"idle",     label:"Idle"       },
  { value:"upcoming", label:"Upcoming"   },
];

const COMPLIANCE_ITEMS_D: FilterItem[] = [
  { value:"all",     label:"All"     },
  { value:"clean",   label:"Clean"   },
  { value:"warn",    label:"Warning" },
  { value:"overdue", label:"Overdue" },
];

const REGION_FLAG: Record<string, string> = {
  "Lagos":         "🇳🇬",
  "Kano":          "🇳🇬",
  "Port Harcourt": "🇳🇬",
  "Kaduna":        "🇳🇬",
  "Ibadan":        "🇳🇬",
  "Abuja":         "🇳🇬",
  "Accra":         "🇬🇭",
  "Nairobi":       "🇰🇪",
};

const SORT_ITEMS_D: FilterItem[] = [
  { value:"trips",  label:"Most active" },
  { value:"rating", label:"Rating"      },
  { value:"name",   label:"Name"        },
];

// --- KPI cards ----------------------------------------------------------------
function KpiCards() {
  return (
    <div className="drivers-kpi-band bg-surface border border-ink-06 rounded-xl p-[14px] grid grid-cols-4">

      {KPI_DATA.map((k, i) => (
        <div key={k.title} className={`flex flex-col gap-3.5 pb-2 ${i > 0 ? "border-l pl-5" : ""} ${i < 3 ? "pr-5" : ""}`} style={{ borderLeftColor: "var(--ink-04)" }}>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[-0.004em]" style={{ color:"var(--ink)" }}>
              <KpiIcon icon={k.icon} />
              {k.title}
            </span>
            <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5 cursor-pointer">
              <circle cx="3" cy="7" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="11" cy="7" r="1"/>
            </svg>
          </div>
          <div className="text-[28px] font-medium leading-none tracking-[-0.02em] mt-3" style={{ fontFamily:'"SF Pro Display",var(--font-geist-sans),sans-serif' }}>
            {k.value}
          </div>
          <SparkBars bars={k.bars} />
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] font-medium text-ink-40 tracking-[-0.008em]">From yesterday</span>
            <span className="inline-flex items-center px-1.5 h-4 rounded-xl text-[10px] font-medium bg-green-soft text-green">+3</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Action menu icons --------------------------------------------------------
function EyeIcon()     { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M6.51008 2.94132C5.00217 3.07607 3.43242 3.86998 2.24008 5.1014C1.71567 5.64332 1.37383 6.15315 1.23325 6.60465C1.15858 6.86303 1.15858 7.13727 1.23325 7.39565C1.37383 7.84715 1.71567 8.35698 2.24008 8.8989C3.678 10.3835 5.60767 11.1984 7.36758 11.0642C7.89556 11.0318 8.41614 10.9237 8.91342 10.7434C10.2831 10.2668 11.6487 9.2384 12.4047 8.11432C12.8842 7.40148 12.9448 6.88932 12.6234 6.25465C12.1813 5.38023 11.0753 4.32673 9.97508 3.73173C8.80725 3.09998 7.65983 2.83807 6.51008 2.94132ZM7.46208 4.10798C8.86383 4.26023 10.4021 5.16498 11.3272 6.38065C11.4801 6.58132 11.6668 6.92198 11.6668 7.00015C11.6668 7.07832 11.4801 7.41898 11.3272 7.61965C10.5158 8.68598 9.21675 9.5289 7.95267 9.8089C7.32572 9.9524 6.67445 9.9524 6.0475 9.8089C4.78283 9.52832 3.48375 8.68598 2.67292 7.61965C2.52008 7.4184 2.33342 7.07832 2.33342 7.00015C2.33342 6.92198 2.52008 6.5819 2.67292 6.38065C3.35425 5.48407 4.413 4.71932 5.47758 4.35473C6.16825 4.1179 6.81458 4.03798 7.46208 4.10798ZM6.70783 5.27348C6.38679 5.33063 6.08769 5.47513 5.84339 5.69113C5.5991 5.90713 5.41904 6.18627 5.323 6.4979C5.27458 6.65715 5.26583 6.73298 5.26583 7.00015C5.26583 7.26732 5.27458 7.34315 5.323 7.5024C5.4089 7.7788 5.56073 8.03017 5.76539 8.23484C5.97006 8.43951 6.22143 8.59133 6.49783 8.67723C6.65708 8.72565 6.73292 8.7344 7.00008 8.7344C7.26725 8.7344 7.34308 8.72565 7.50233 8.67723C7.77874 8.59133 8.03011 8.43951 8.23477 8.23484C8.43944 8.03017 8.59127 7.7788 8.67717 7.5024C8.72558 7.34315 8.73433 7.26732 8.73433 7.00015C8.73433 6.73298 8.72558 6.65715 8.67717 6.4979C8.50742 5.94023 8.05242 5.4864 7.50233 5.3254C7.29175 5.26357 6.90208 5.23848 6.70783 5.27348ZM7.29875 6.50257C7.66625 6.72832 7.67325 7.26032 7.31217 7.48957C7.24626 7.53134 7.17264 7.55944 7.09566 7.5722C7.01868 7.58496 6.93992 7.58211 6.86406 7.56383C6.78821 7.54554 6.7168 7.51219 6.65409 7.46577C6.59137 7.41934 6.53863 7.36078 6.499 7.29357C6.43658 7.19207 6.42842 7.15823 6.42842 7.0019C6.42842 6.85082 6.43775 6.8094 6.49317 6.7149C6.54566 6.61767 6.62587 6.53825 6.72361 6.48673C6.82136 6.43521 6.93221 6.41392 7.04208 6.42557C7.13315 6.42676 7.22206 6.45344 7.29875 6.50257Z" fill="currentColor" fillOpacity="0.4"/></svg>; }
function EditIcon()    { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M10.0889 2.15846C9.89327 2.20853 9.70895 2.29545 9.54584 2.41454C9.48693 2.45829 7.97201 3.96213 6.17884 5.75646L2.91976 9.01846L2.29968 10.3829L1.68018 11.7479L1.90709 11.9754L2.13401 12.2035H2.50909L3.74576 11.6423L4.98184 11.0805L8.25551 7.80979C11.5887 4.47896 11.6569 4.40721 11.7783 4.11671C11.8768 3.88163 11.9019 3.54154 11.8418 3.25513C11.7333 2.73654 11.2638 2.26696 10.7452 2.15846C10.5284 2.11645 10.3057 2.11645 10.0889 2.15846ZM10.6256 3.38113C10.6898 3.44529 10.6985 3.47038 10.6985 3.58238V3.71013L7.49601 6.91263L4.29351 10.1151L3.94059 10.2738C3.74693 10.3613 3.58359 10.4278 3.57776 10.422C3.57193 10.4167 3.63726 10.2557 3.72301 10.065L3.87876 9.71846L7.06668 6.52588C8.82018 4.77004 10.2762 3.32338 10.3018 3.31171C10.3934 3.27029 10.5474 3.30296 10.6256 3.38113ZM6.80943 11.1202C6.59418 11.1867 6.41684 11.4387 6.41684 11.6785C6.41684 11.903 6.60234 12.1504 6.81934 12.2145C6.92201 12.2455 7.22709 12.2501 9.04184 12.2501C11.4236 12.2501 11.3046 12.2589 11.4901 12.0734C11.5968 11.9666 11.6668 11.805 11.6668 11.6668C11.6668 11.4323 11.4848 11.1844 11.2643 11.119C11.0905 11.0671 6.97743 11.0683 6.80943 11.1202Z" fill="currentColor" fillOpacity="0.4"/></svg>; }
function PhoneIcon()   { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M3.33603 1.28228C3.11145 1.32312 2.67103 1.5652 2.3432 1.82887C1.78612 2.27628 1.38187 2.90512 1.18412 3.63195C1.11178 3.89678 1.10887 3.92595 1.11003 4.32845C1.11237 5.18128 1.34628 6.0837 1.83687 7.12845C2.80753 9.19812 4.79087 11.1797 6.87512 12.1632C7.85103 12.6234 8.73303 12.8638 9.56661 12.8959C10.0788 12.9157 10.4976 12.823 11.0016 12.578C11.7384 12.2198 12.3269 11.6137 12.6402 10.891C12.7102 10.73 12.723 10.6734 12.7236 10.5246C12.7252 10.4257 12.7124 10.3271 12.6857 10.2318C12.5749 9.90278 11.8428 9.16195 11.0494 8.5757C10.6335 8.26887 10.0292 7.85003 9.92711 7.79812C9.76262 7.72082 9.57862 7.695 9.3992 7.72403C9.14603 7.77012 9.0527 7.83603 8.57086 8.31262L8.12287 8.75537L7.83528 8.60545C6.75728 8.04195 5.9692 7.25445 5.3987 6.17062L5.2447 5.8772L5.69095 5.4257C6.18737 4.92345 6.24512 4.83653 6.27662 4.54837C6.29703 4.36228 6.27486 4.21762 6.20428 4.0782C6.10628 3.88453 5.41737 2.9022 5.11228 2.52012C4.72203 2.03245 4.10428 1.4602 3.83887 1.33945C3.67938 1.27577 3.50574 1.25603 3.33603 1.28228ZM3.62537 2.62803C3.97128 2.94653 4.30437 3.35195 4.76987 4.02278L5.04345 4.41653L4.61237 4.85112C4.0967 5.37087 4.05645 5.43445 4.04128 5.75353C4.03195 5.95887 4.03428 5.97287 4.13112 6.21553C4.42862 6.9622 5.04695 7.87628 5.65012 8.45962C6.23462 9.02428 6.98536 9.52712 7.70928 9.83687C7.98986 9.95703 8.13395 9.98503 8.33578 9.9582C8.57495 9.9267 8.67878 9.85378 9.14836 9.38828L9.58236 8.95778L9.99128 9.24887C10.6382 9.7097 11.0226 10.0305 11.3738 10.4021L11.5126 10.5491L11.4724 10.6238C11.3977 10.7626 11.2017 11.0064 11.0541 11.1447C10.6819 11.4929 10.2001 11.7094 9.75037 11.731C9.01828 11.7665 7.81661 11.3967 6.82495 10.8309C5.41795 10.0288 3.97128 8.58212 3.1692 7.17512C2.59928 6.17645 2.23412 4.98645 2.2697 4.24678C2.29303 3.76495 2.51587 3.29303 2.90378 2.90278C3.08695 2.71903 3.38562 2.49678 3.44978 2.49678C3.46787 2.49678 3.54662 2.5557 3.62537 2.62803Z" fill="currentColor" fillOpacity="0.4"/></svg>; }
function PinIcon()     { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M6.61501 1.18058C6.08535 1.23541 5.7546 1.3025 5.34335 1.43841C3.64935 1.99841 2.32576 3.42991 1.90576 5.15658C1.5581 6.58516 1.80893 8.00791 2.64251 9.33266C3.32093 10.4101 4.43043 11.4834 5.78668 12.3724C6.59401 12.9021 6.86176 12.9954 7.26951 12.891C7.6131 12.8023 8.70568 12.0819 9.48501 11.4297C9.61276 11.3224 9.8741 11.0827 10.0654 10.8966C11.2146 9.77716 11.8977 8.63383 12.1438 7.41641C12.2923 6.66869 12.2749 5.89752 12.093 5.15724C11.9111 4.41696 11.569 3.72558 11.0909 3.13183C10.2623 2.10228 9.07693 1.42184 7.77001 1.2255C7.53143 1.18933 6.80285 1.16133 6.61501 1.18058ZM7.50635 2.36941C9.31701 2.60683 10.7269 3.96541 11.0279 5.76325C11.3056 7.4205 10.5111 9.04158 8.65493 10.6078C8.16551 11.0202 7.11551 11.7366 6.99943 11.7366C6.96676 11.7366 6.64651 11.547 6.39335 11.3784C4.55235 10.1511 3.39326 8.75983 3.0316 7.34291C2.87935 6.74616 2.88401 6.04616 3.04501 5.41325C3.55251 3.42175 5.48335 2.104 7.50635 2.36941ZM6.62551 4.11883C6.26863 4.17856 5.93046 4.32022 5.63755 4.53266C5.34464 4.74511 5.10496 5.02257 4.93735 5.34325C4.81569 5.56718 4.73546 5.81123 4.70051 6.06366C4.65851 6.29707 4.65851 6.53609 4.70051 6.7695C4.83001 7.62641 5.43901 8.34741 6.27376 8.6315C6.44585 8.68983 6.81335 8.74991 7.00001 8.74991C7.18668 8.74991 7.55418 8.68983 7.72626 8.6315C8.30026 8.43608 8.79435 8.01433 9.06268 7.48991C9.18433 7.26598 9.26456 7.02193 9.29951 6.7695C9.34151 6.53609 9.34151 6.29707 9.29951 6.06366C9.24392 5.70235 9.10392 5.35923 8.89088 5.06216C8.67783 4.7651 8.39774 4.52245 8.07335 4.35391C7.84942 4.23226 7.60536 4.15203 7.35293 4.11708C7.11208 4.07682 6.86617 4.07741 6.62551 4.11883ZM7.28701 5.28491C7.49701 5.33916 7.65218 5.43075 7.81901 5.59758C7.99168 5.76966 8.08035 5.92483 8.13168 6.14183C8.22851 6.55425 8.12001 6.93516 7.81901 7.23558C7.58393 7.47066 7.31851 7.58325 7.00001 7.58325C6.68151 7.58325 6.4161 7.47066 6.18101 7.23558C5.94593 7.0005 5.83335 6.73508 5.83335 6.41658C5.83335 6.09808 5.94593 5.83266 6.18101 5.59758C6.41668 5.36133 6.66693 5.25458 6.98951 5.25166C7.0896 5.25171 7.18938 5.26286 7.28701 5.28491Z" fill="currentColor" fillOpacity="0.4"/></svg>; }
function HistoryIcon() { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M6.56255 1.1916C5.81996 1.24702 5.14913 1.43077 4.44505 1.77318C3.67863 2.14282 3.00351 2.67749 2.46813 3.33885C1.77805 4.19985 1.36621 5.17052 1.21046 6.29985C1.17138 6.58568 1.17138 7.4356 1.21046 7.72318C1.24896 8.00668 1.3423 8.44535 1.38663 8.55093C1.44671 8.69443 1.54005 8.79302 1.68588 8.86593C1.90813 8.97677 2.13855 8.96102 2.33863 8.82218C2.44246 8.74985 3.75846 7.24193 3.84305 7.09785C3.92355 6.96193 3.94046 6.74727 3.88446 6.57868C3.80338 6.33485 3.55371 6.15985 3.28713 6.15985C3.19788 6.15985 2.54688 6.31093 2.41096 6.36285C2.37246 6.37802 2.38296 6.28352 2.4553 5.96152C2.70321 4.86485 3.38921 3.84402 4.31671 3.19185C5.19521 2.5741 6.31871 2.26552 7.36171 2.35535C8.4613 2.45043 9.43313 2.8856 10.2253 3.6381C10.8086 4.19524 11.2372 4.89429 11.4692 5.66681C11.7012 6.43933 11.7287 7.25886 11.5489 8.04518C11.063 10.1533 9.17938 11.6642 7.03505 11.6659C6.38051 11.6737 5.73196 11.5406 5.13338 11.2757C4.69646 11.0849 4.41296 10.9064 3.9533 10.5337C3.68905 10.3202 3.5858 10.2758 3.39796 10.298C3.24046 10.3167 3.09405 10.3937 3.00713 10.5033C2.87005 10.6766 2.84146 10.8376 2.90738 11.0604C2.95288 11.2138 3.09988 11.3632 3.50005 11.6648C4.9613 12.7643 6.79355 13.1033 8.59838 12.608C10.1454 12.1833 11.4806 11.0779 12.2156 9.61202C12.6339 8.77785 12.8194 7.97868 12.82 7.01152C12.82 6.35527 12.7546 5.88335 12.5843 5.31985C12.1925 4.02724 11.3649 2.91036 10.2422 2.15935C9.15535 1.44112 7.86213 1.101 6.56255 1.1916ZM6.8093 3.5366C6.72727 3.56549 6.65329 3.61348 6.59347 3.6766C6.40972 3.86035 6.41438 3.80785 6.42196 5.59052C6.4278 7.0681 6.43071 7.15677 6.47271 7.24485C6.50188 7.30552 6.8513 7.67302 7.47605 8.29835C8.39363 9.21768 8.4403 9.26085 8.56163 9.29585C8.71971 9.34252 8.78038 9.34252 8.93088 9.2976C9.09363 9.24918 9.24938 9.09343 9.2978 8.93068C9.34271 8.7796 9.34271 8.71893 9.29605 8.56143C9.26046 8.44127 9.21613 8.39227 8.42105 7.59368L7.58338 6.7531V5.38752C7.58338 3.82768 7.5863 3.85627 7.40663 3.6766C7.24388 3.51385 7.03913 3.46602 6.8093 3.5366Z" fill="currentColor" fillOpacity="0.4"/></svg>; }
function SuspendIcon() { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M5.30832 1.42167C4.98562 1.51639 4.673 1.64261 4.37499 1.7985C3.95091 2.01025 3.83891 2.09308 3.76657 2.24767C3.57932 2.65017 3.84649 3.07892 4.28574 3.08008C4.42049 3.08008 4.45374 3.06783 4.78741 2.89575C5.11349 2.72505 5.45612 2.58804 5.80999 2.48683C5.91907 2.45475 6.04332 2.40283 6.08591 2.37133C6.16535 2.3139 6.22893 2.23725 6.27071 2.14857C6.31249 2.05989 6.33111 1.96206 6.32481 1.86423C6.31852 1.7664 6.28753 1.67177 6.23473 1.58917C6.18193 1.50657 6.10905 1.4387 6.02291 1.39192C5.85491 1.30092 5.66941 1.3085 5.30832 1.42167ZM8.01324 1.37442C7.92917 1.41387 7.85578 1.47291 7.79923 1.54657C7.74267 1.62024 7.7046 1.70639 7.68821 1.7978C7.67181 1.88921 7.67756 1.98322 7.70499 2.07195C7.73241 2.16067 7.78071 2.24154 7.84582 2.30775C7.94907 2.40983 7.96774 2.418 8.44666 2.56967C8.65782 2.63675 8.89582 2.73708 9.16882 2.87475C9.54741 3.06608 9.58532 3.08008 9.71716 3.08008C10.0537 3.0795 10.2906 2.84092 10.29 2.50317C10.292 2.41414 10.2726 2.32593 10.2333 2.24602C10.194 2.1661 10.136 2.09684 10.0642 2.04408C9.92016 1.9385 9.36249 1.65967 9.08191 1.5535C8.51841 1.33942 8.20574 1.28692 8.01324 1.37442ZM2.23824 3.77425C2.08482 3.85183 2.00491 3.96267 1.78674 4.39842C1.53182 4.90883 1.32941 5.50967 1.33057 5.75642C1.33232 6.30183 2.02824 6.5305 2.36307 6.09533C2.39866 6.04867 2.45466 5.92092 2.48674 5.81125C2.60341 5.4175 2.69557 5.18592 2.88632 4.8085C3.06599 4.45267 3.07999 4.41475 3.07999 4.2835C3.07941 3.94867 2.84374 3.71008 2.51357 3.71008C2.4176 3.70531 2.32222 3.72754 2.23824 3.77425ZM11.2233 3.77075C11.074 3.85592 11.0372 3.89325 10.9754 4.02508C10.9368 4.10647 10.9178 4.19578 10.92 4.28583C10.92 4.42058 10.9322 4.45383 11.1043 4.7875C11.2869 5.14217 11.4007 5.42742 11.5132 5.81125C11.6159 6.1595 11.8032 6.32342 12.1001 6.32342C12.1749 6.32412 12.2492 6.30991 12.3185 6.28162C12.3878 6.25332 12.4508 6.21152 12.5038 6.15863C12.5568 6.10575 12.5987 6.04285 12.6272 5.97359C12.6556 5.90434 12.67 5.83011 12.6694 5.75525C12.6706 5.50033 12.4734 4.91933 12.201 4.37508C11.9881 3.94867 11.9064 3.83842 11.7524 3.76667C11.5809 3.68675 11.3674 3.6885 11.2233 3.77075ZM4.47416 6.45C3.98824 6.62325 3.95616 7.29467 4.42282 7.52625C4.51266 7.57058 4.57799 7.57175 6.99999 7.57175C9.42199 7.57175 9.48732 7.57058 9.57716 7.52625C9.88107 7.37517 9.99482 7.02458 9.83966 6.72008C9.76486 6.58905 9.64474 6.48987 9.50191 6.44125C9.44474 6.42492 8.59132 6.41733 6.98832 6.41792C5.02191 6.4185 4.54532 6.42492 4.47416 6.45ZM1.66774 7.7205C1.56686 7.76563 1.48127 7.83913 1.42141 7.93203C1.36155 8.02493 1.32999 8.13323 1.33057 8.24375C1.32941 8.57333 1.72082 9.58133 2.02532 10.0334C2.14141 10.2055 2.30182 10.2901 2.51357 10.2901C2.84491 10.2901 3.07941 10.0515 3.07999 9.71375C3.07999 9.57958 3.06774 9.54517 2.91841 9.25817C2.72474 8.88658 2.61391 8.61708 2.51707 8.28517C2.43249 7.99467 2.40682 7.94042 2.30532 7.83892C2.25286 7.78559 2.18988 7.74375 2.1204 7.71603C2.05091 7.68832 1.97642 7.67534 1.90166 7.67792C1.81591 7.67792 1.72549 7.69425 1.66774 7.7205ZM11.8644 7.7205C11.7493 7.77753 11.6529 7.86641 11.5867 7.97658C11.5692 8.011 11.5226 8.14925 11.4829 8.28517C11.3861 8.61708 11.2752 8.88658 11.0816 9.25817C10.9322 9.54517 10.92 9.57958 10.92 9.71375C10.9206 10.0515 11.1551 10.2901 11.4864 10.2901C11.5831 10.2938 11.6792 10.2721 11.7649 10.2271C11.8506 10.182 11.9229 10.1152 11.9747 10.0334C12.2803 9.58017 12.6706 8.5745 12.6694 8.24375C12.6708 8.16862 12.6569 8.094 12.6286 8.02438C12.6003 7.95477 12.5582 7.89161 12.5049 7.83872C12.4515 7.78584 12.3879 7.74432 12.3181 7.71668C12.2482 7.68904 12.1734 7.67586 12.0983 7.67792C12.0126 7.67792 11.9222 7.69425 11.8644 7.7205ZM4.02207 10.9761C3.62949 11.1593 3.59799 11.7263 3.96666 11.9748C4.41874 12.2793 5.42674 12.6707 5.75632 12.6695C6.31982 12.6672 6.53741 11.9339 6.06841 11.6183C6.01824 11.5851 5.87416 11.5285 5.74816 11.4929C5.39989 11.3921 5.06335 11.2544 4.74424 11.0823C4.45782 10.9306 4.42749 10.9201 4.28924 10.9201C4.18307 10.9207 4.10841 10.9358 4.02207 10.9761ZM9.25166 11.0834C8.93424 11.2558 8.59898 11.3931 8.25182 11.4929C8.13936 11.5229 8.03073 11.5658 7.92807 11.6207C7.74257 11.7455 7.65274 11.9573 7.68482 12.1941C7.72274 12.4706 7.95549 12.6683 8.24366 12.6695C8.57324 12.6707 9.58124 12.2793 10.0333 11.9748C10.1133 11.924 10.1789 11.8536 10.2238 11.7703C10.2688 11.6869 10.2915 11.5934 10.29 11.4988C10.29 11.1534 10.0537 10.9201 9.70666 10.9213C9.56432 10.9218 9.53632 10.9318 9.25166 11.0834Z" fill="currentColor" fillOpacity="0.4"/></svg>; }
function ChatIcon()    { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M6.58017 1.18062C6.52242 1.18587 6.35442 1.20629 6.20684 1.22612C4.02692 1.52362 2.21276 3.01404 1.48476 5.10471C1.37285 5.43871 1.28837 5.78129 1.23217 6.12904C1.18201 6.42246 1.18084 6.48196 1.17267 9.07662C1.16684 10.9666 1.17209 11.7681 1.19076 11.8766C1.23464 12.1078 1.34708 12.3203 1.51343 12.4867C1.67979 12.6531 1.89237 12.7655 2.12351 12.8094C2.23201 12.828 3.03351 12.8333 4.92351 12.8275C7.51817 12.8193 7.57767 12.8181 7.87109 12.768C9.01267 12.5737 9.92267 12.1578 10.7802 11.4385C11.7147 10.6545 12.4147 9.50187 12.6818 8.30662C12.7921 7.81429 12.8195 7.55587 12.8195 6.99996C12.8195 6.44404 12.7921 6.18562 12.6818 5.69329C12.4147 4.49804 11.7147 3.34537 10.7802 2.56137C9.71617 1.66829 8.49642 1.20746 7.12851 1.18004C6.94576 1.17483 6.7629 1.17502 6.58017 1.18062ZM8.94851 5.87179C9.16376 5.94529 9.33351 6.18562 9.33351 6.41662C9.33351 6.55779 9.26409 6.72054 9.15909 6.82554C8.97767 7.00754 9.06809 6.99996 6.99901 6.99996C5.00401 6.99996 5.05884 7.00346 4.88501 6.87046C4.82908 6.82216 4.78123 6.76525 4.74326 6.70187C4.68784 6.60796 4.67851 6.56596 4.67851 6.41662C4.67851 6.26729 4.68784 6.22529 4.74326 6.13137C4.81617 6.00712 4.92876 5.91262 5.05767 5.86654C5.12767 5.84146 5.50976 5.83504 6.99026 5.83446C8.64809 5.83329 8.84642 5.83737 8.94851 5.87179ZM7.19851 8.20512C7.41376 8.27862 7.58351 8.51896 7.58351 8.74996C7.58351 8.98096 7.41376 9.22129 7.19851 9.29479C7.03576 9.35021 5.21809 9.35312 5.06234 9.29771C4.92714 9.25275 4.81343 9.15921 4.74326 9.03521C4.68784 8.94129 4.67851 8.89929 4.67851 8.74996C4.67851 8.60062 4.68784 8.55862 4.74326 8.4647C4.77884 8.40462 4.84417 8.32704 4.88909 8.29321C5.04892 8.17129 5.07167 8.16896 6.11526 8.16779C6.95876 8.16662 7.09992 8.17187 7.19851 8.20512Z" fill="currentColor" fillOpacity="0.4"/></svg>; }
function DotsIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 14 14" fill={open ? "#FF9256" : "var(--ink-40)"} className="w-3.5 h-3.5">
      <circle cx="7" cy="3" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="7" cy="11" r="1"/>
    </svg>
  );
}

// --- Action menu --------------------------------------------------------------
const MENU_ITEMS = [
  { icon: <EyeIcon />,     label: "View profile",    highlight: false },
  { icon: <EditIcon />,    label: "Edit details",    highlight: false },
  { icon: <PhoneIcon />,   label: "Call driver",     highlight: false },
  { icon: <PinIcon />,     label: "Assign trip",     highlight: false },
  { icon: <HistoryIcon />, label: "View trip history",highlight: false },
  { icon: <SuspendIcon />, label: "Suspend driver",  highlight: false },
];

// --- File icon ---------------------------------------------------------------
function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ width:24, height:24 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M5.58 2.047C4.847 2.187 4.18 2.868 4.043 3.617C3.982 3.951 3.982 20.049 4.043 20.383C4.184 21.151 4.849 21.816 5.617 21.957C5.95 22.017 18.05 22.017 18.383 21.957C19.151 21.816 19.816 21.151 19.957 20.383C19.986 20.22 20 18.543 20 15.074V10.002L16.57 9.991L13.14 9.98L12.896 9.867C12.5645 9.70154 12.2962 9.43218 12.132 9.1L12.02 8.86L12.009 5.43L11.998 2L8.889 2.004C7.109 2.007 5.695 2.025 5.58 2.047ZM14 5.017V8H19.965L19.94 7.91C19.8908 7.77734 19.835 7.64718 19.773 7.52C19.635 7.231 19.544 7.134 17.205 4.795C14.866 2.456 14.769 2.365 14.48 2.227C14.3528 2.16496 14.2227 2.10923 14.09 2.06L14 2.035V5.017ZM12.33 13.057C12.755 13.209 12.923 13.471 13.039 14.16C13.187 15.036 13.408 15.635 13.812 16.251C14.134 16.743 14.369 17.002 14.909 17.463C15.495 17.963 15.578 18.091 15.578 18.5C15.578 18.829 15.488 19.034 15.255 19.239C14.897 19.553 14.589 19.568 13.898 19.307C13.193 19.041 12.708 18.949 12 18.949C11.292 18.949 10.807 19.041 10.102 19.307C9.411 19.568 9.103 19.553 8.745 19.239C8.512 19.034 8.422 18.829 8.422 18.5C8.422 18.144 8.516 17.958 8.829 17.686L9.315 17.267C9.822 16.831 10.339 16.111 10.604 15.472C10.767 15.078 10.865 14.713 10.963 14.14C11.018 13.817 11.077 13.605 11.143 13.491C11.2313 13.3424 11.3568 13.2194 11.507 13.1341C11.6573 13.0487 11.8272 13.0038 12 13.004C12.099 13.004 12.248 13.028 12.33 13.057Z" fill="currentColor" fillOpacity="0.4"/>
    </svg>
  );
}

// --- Call / Message / Vehicle action icons ------------------------------------
function CallActionIcon()    { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path fillRule="evenodd" clipRule="evenodd" d="M3.32498 1.28253C3.00356 1.35253 2.44531 1.70428 2.08715 2.06303C1.64206 2.5087 1.35565 3.01386 1.17306 3.67478C1.11356 3.89061 1.1089 3.93961 1.10948 4.32811C1.11006 4.65945 1.12173 4.81228 1.16373 5.05145C1.47756 6.8312 2.42431 8.53395 3.94506 10.0547C5.14614 11.2558 6.44815 12.0917 7.83706 12.5531C8.49565 12.7713 9.01773 12.8734 9.58998 12.8949C9.8799 12.906 9.96331 12.9008 10.1733 12.8576C11.2449 12.6359 12.1164 11.9657 12.5871 11.0014C12.7528 10.6625 12.7703 10.4064 12.6466 10.1439C12.5276 9.88962 11.9484 9.28645 11.4088 8.85303C10.8996 8.4447 10.0298 7.83862 9.86706 7.77912C9.71015 7.72195 9.42198 7.72778 9.25573 7.79195C9.03464 7.87712 8.89698 8.03403 8.47873 8.67745C8.24364 9.03912 8.08264 9.26312 8.03831 9.2917C7.89773 9.38037 7.73323 9.3127 7.16623 8.93062C6.23523 8.30412 5.67231 7.73828 5.08023 6.83587C4.73023 6.3027 4.67656 6.15803 4.77748 6.0227C4.80256 5.98887 5.09481 5.7602 5.42614 5.51403C5.82689 5.21711 6.05614 5.03103 6.10806 4.96103C6.26789 4.7452 6.31864 4.44361 6.23989 4.1782C6.18156 3.9822 5.45006 2.92286 5.01431 2.40311C4.60948 1.9207 4.08156 1.44528 3.8249 1.33153C3.66492 1.27391 3.4931 1.25707 3.32498 1.28253Z" fill="currentColor"/></svg>; }
function MessageActionIcon() { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path fillRule="evenodd" clipRule="evenodd" d="M6.57999 1.18062C6.52224 1.18587 6.35424 1.20629 6.20666 1.22612C4.02674 1.52362 2.21257 3.01404 1.48457 5.10471C1.37266 5.43871 1.28819 5.78129 1.23199 6.12904C1.18182 6.42246 1.18066 6.48196 1.17249 9.07662C1.16666 10.9666 1.17191 11.7681 1.19057 11.8766C1.23446 12.1078 1.34689 12.3203 1.51325 12.4867C1.67961 12.6531 1.89219 12.7655 2.12332 12.8094C2.23182 12.828 3.03332 12.8333 4.92332 12.8275C7.51799 12.8193 7.57749 12.8181 7.87091 12.768C9.01249 12.5737 9.92249 12.1578 10.78 11.4385C11.7145 10.6545 12.4145 9.50187 12.6817 8.30662C12.7919 7.81429 12.8193 7.55587 12.8193 6.99996C12.8193 6.44404 12.7919 6.18562 12.6817 5.69329C12.4145 4.49804 11.7145 3.34537 10.78 2.56137C9.71599 1.66829 8.49624 1.20746 7.12832 1.18004C6.94558 1.17483 6.76272 1.17502 6.57999 1.18062ZM8.94832 5.87179C9.16357 5.94529 9.33332 6.18562 9.33332 6.41662C9.33332 6.55779 9.26391 6.72054 9.15891 6.82554C8.97749 7.00754 9.06791 6.99996 6.99882 6.99996C5.00382 6.99996 5.05866 7.00346 4.88482 6.87046C4.8289 6.82216 4.78105 6.76525 4.74307 6.70187C4.68766 6.60796 4.67832 6.56596 4.67832 6.41662C4.67832 6.26729 4.68766 6.22529 4.74307 6.13137C4.81599 6.00712 4.92857 5.91262 5.05749 5.86654C5.12749 5.84146 5.50957 5.83504 6.99007 5.83446C8.64791 5.83329 8.84624 5.83737 8.94832 5.87179ZM7.19832 8.20512C7.41357 8.27862 7.58332 8.51896 7.58332 8.74996C7.58332 8.98096 7.41357 9.22129 7.19832 9.29479C7.03557 9.35021 5.21791 9.35312 5.06216 9.29771C4.92695 9.25275 4.81325 9.15921 4.74307 9.03521C4.68766 8.94129 4.67832 8.89929 4.67832 8.74996C4.67832 8.60062 4.68766 8.55862 4.74307 8.4647C4.77866 8.40462 4.84399 8.32704 4.88891 8.29321C5.04874 8.17129 5.07149 8.16896 6.11507 8.16779C6.95857 8.16662 7.09974 8.17187 7.19832 8.20512Z" fill="currentColor"/></svg>; }
function VehicleActionIcon() { return <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path fillRule="evenodd" clipRule="evenodd" d="M2.08836 2.36092C1.66078 2.44259 1.27169 2.83984 1.19178 3.27675C1.15678 3.46984 1.15678 8.7805 1.19178 8.97359C1.27694 9.44025 1.67536 9.82292 2.15253 9.897L2.32753 9.92442L2.34328 10.0778C2.36661 10.3077 2.39869 10.4203 2.50719 10.6518C2.68686 11.0351 2.96219 11.3116 3.34836 11.4942C3.57728 11.6059 3.82864 11.6639 4.08336 11.6639C4.33808 11.6639 4.58945 11.6059 4.81836 11.4942C5.19122 11.3237 5.49023 11.0247 5.66069 10.6518C5.75461 10.4529 5.83336 10.1496 5.83336 9.9845V9.91684H7.57694L7.59328 10.0743C7.61661 10.3077 7.64869 10.4191 7.75719 10.6518C7.93686 11.0351 8.21219 11.3116 8.59836 11.4942C8.82728 11.6059 9.07864 11.6639 9.33336 11.6639C9.58808 11.6639 9.83945 11.6059 10.0684 11.4942C10.4412 11.3237 10.7402 11.0247 10.9107 10.6518C11.0046 10.4529 11.0834 10.1496 11.0834 9.9845V9.91684H11.4176C11.6014 9.91684 11.8137 9.90517 11.8901 9.89175C12.3381 9.8095 12.726 9.42159 12.8083 8.97359C12.8409 8.79334 12.8427 6.28559 12.81 6.11409C12.7628 5.86384 12.6759 5.72617 12.1544 5.07517C11.6235 4.41192 11.5769 4.36059 11.4124 4.25909C11.1796 4.11442 11.0985 4.09984 10.4825 4.08875L9.91669 4.07942V3.7475C9.91669 3.56492 9.90503 3.35317 9.89161 3.27675C9.80936 2.82875 9.42144 2.44084 8.97344 2.35859C8.79494 2.3265 2.25986 2.32825 2.08836 2.36092ZM11.2344 5.78975L11.6667 6.32875V7.5835H9.91669V5.25017H10.8028L11.2344 5.78975ZM4.28169 9.372C4.49694 9.4455 4.66669 9.68584 4.66669 9.91684C4.66669 10.058 4.59728 10.2208 4.49228 10.3258C4.4292 10.3893 4.35224 10.4374 4.26745 10.4662C4.18266 10.495 4.09234 10.5038 4.00359 10.4918C3.91484 10.4798 3.83008 10.4474 3.75597 10.3971C3.68185 10.3469 3.6204 10.2801 3.57644 10.2021C3.52103 10.1082 3.51169 10.0662 3.51169 9.91684C3.51169 9.7675 3.52103 9.7255 3.57644 9.63159C3.64342 9.51102 3.75145 9.4185 3.88088 9.37086C4.01031 9.32323 4.15254 9.32363 4.28169 9.372ZM9.53169 9.372C9.74694 9.4455 9.91669 9.68584 9.91669 9.91684C9.91669 10.058 9.84728 10.2208 9.74228 10.3258C9.6792 10.3893 9.60224 10.4374 9.51745 10.4662C9.43266 10.495 9.34234 10.5038 9.25359 10.4918C9.16484 10.4798 9.08008 10.4474 9.00597 10.3971C8.93185 10.3469 8.8704 10.2801 8.82644 10.2021C8.77103 10.1082 8.76169 10.0662 8.76169 9.91684C8.76169 9.7675 8.77103 9.7255 8.82644 9.63159C8.89342 9.51102 9.00145 9.4185 9.13088 9.37086C9.26031 9.32323 9.40254 9.32363 9.53169 9.372Z" fill="currentColor"/></svg>; }

// --- Driver profile drawer ----------------------------------------------------
type DrawerTab = "overview" | "trips" | "compliance" | "documents";

function DriverDrawer({
  driver,
  onClose,
}: {
  driver: Driver;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("overview");

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: "overview",    label: "Overview"    },
    { key: "trips",       label: "Trips"       },
    { key: "compliance",  label: "Compliance"  },
    { key: "documents",   label: "Documents"   },
  ];

  const docs = [
    { name: "Driver's license",       sub: "FRSC-LAG-8821",  valid: "2028-03-14" },
    { name: "Defensive driving cert", sub: "DDC-NGA-2025",   valid: "2027-09-22" },
    { name: "Medical fitness",        sub: "MFC-22-0418",    valid: "2026-12-01" },
    { name: "Hazmat certification",   sub: "HZ-NGA-447",     valid: "2027-02-10" },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end" style={{ backdropFilter:"blur(4px)", background:"rgba(0,0,0,0.30)" }} onClick={onClose}>
      <div
        className="driver-drawer flex flex-col bg-surface overflow-y-auto"
        style={{ width: 540, maxWidth: "100vw", boxShadow:"-20px 0 50px rgba(0,0,0,0.15)", paddingTop: 31.5 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Head */}
        <div className="flex items-center justify-between border-b border-ink-04 shrink-0" style={{ paddingLeft:24, paddingRight:24, paddingBottom:27.5 }}>
          <h2 className="m-0 text-[18px] font-medium leading-none tracking-[-0.008em]">Driver profile</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center cursor-pointer"
            style={{ width:32, height:32, borderRadius:"50%", background:"var(--surface)", border:"1px solid var(--ink-06)" }}
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
              <path d="M2 2l10 10M12 2L2 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col flex-1">

          {/* Identity */}
          <div className="flex flex-col">
          <div className="flex items-start gap-4">
            <DriverAvatar initials={driver.initials} avCls={driver.avCls} avatar={driver.avatar} size={72} />
            <div className="flex flex-col justify-between" style={{ height:72 }}>
              <h3 className="m-0 text-[14px] font-medium leading-none tracking-[-0.01em]">{driver.name}</h3>
              <span className="text-[12px] font-medium text-ink-40">
                {driver.id} · <span style={{ color:"initial" }}>{REGION_FLAG[driver.region] ?? "🏳"}</span> {driver.region} · {driver.vehicle}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium self-start ${STATUS_CLS[driver.status]}`}>
                {STATUS_LABEL[driver.status]}
              </span>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              {[
                { icon: <CallActionIcon />,    label: "Call"    },
                { icon: <MessageActionIcon />, label: "Message" },
                { icon: <VehicleActionIcon />, label: "Vehicle" },
              ].map((a) => (
                <button
                  key={a.label}
                  className="inline-flex items-center justify-center cursor-pointer"
                  title={a.label}
                  style={{ width:38, height:38, borderRadius:"50%", background:"var(--surface)", border:"1px solid var(--ink-06)" }}
                >
                  {a.icon}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-ink-06 -mx-6" style={{ marginTop:16, marginBottom:16 }} />
          {/* Tabs */}
          <div className="flex items-center w-full bg-surface border border-ink-06 rounded-[10px] p-[3px] gap-0.5" style={{ marginBottom:16 }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex flex-1 items-center justify-center py-[7px] rounded-lg text-[12px] font-medium tracking-[-0.004em] cursor-pointer ${tab === t.key ? "bg-orange text-white" : "text-ink-40 hover:bg-canvas"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="border-t border-ink-06 -mx-6" style={{ marginBottom:20 }} />
          </div>

          {/* Tab content */}
          {tab === "overview" && (
            <div className="flex flex-col gap-5">

              {/* Current trip */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">Current trip</span>
                  <a href="#" className="text-[12px] font-medium" style={{ color:"#f66211", textDecoration:"none" }}>View on map</a>
                </div>

                <div className="flex flex-col gap-3 bg-canvas rounded-xl p-4">
                  {/* Trip ID */}
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-ink-40">#NDI-9318</span>
                    <CopyButton text="#NDI-9318" />
                  </div>

                  {/* Route */}
                  <span className="text-[14px] font-medium text-ink-40 leading-none">
                    <span style={{ color:"#FF9256" }}>{driver.from}</span> <span className="mx-1">→</span> {driver.to}
                  </span>

                  {/* ETA */}
                  <span className="text-[12px] font-medium text-ink-40">9 km left · ETA 14:42</span>

                  {/* Progress bar */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-ink-40">Progress</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full overflow-hidden bg-ink-04 flex-1">
                        <div className="h-full rounded-full" style={{ width:"72%", background:"#037847" }} />
                      </div>
                      <span className="text-[12px] font-medium" style={{ color:"#037847" }}>72%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-ink-40">
                      <span>72% complete</span>
                      <span>1h 14m elapsed</span>
                    </div>
                  </div>

                  {/* Trip stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label:"Shift",  value:"6h 12m" },
                      { label:"Break",  value:"22m"    },
                      { label:"Drive",  value:"5h 28m" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-col bg-surface border border-ink-06 rounded-[10px] p-3"
                      >
                        <span className="text-[10px] font-medium text-ink-40">{s.label}</span>
                        <span className="text-[13px] font-medium" style={{ marginTop:"32%" }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="flex flex-col gap-3">
                <span className="text-[13px] font-medium">Performance · 30 days</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:"Trips completed",  value:"142",      sub:"▲ 8 vs last month",   subColor:"var(--ink-40)" },
                    { label:"On-time rate",      value:"96.5%",    sub:"target 92%",           subColor:"var(--ink-40)" },
                    { label:"Customer rating",   value:"4.9 ★",    sub:"128 ratings",          subColor:"var(--ink-40)" },
                    { label:"Distance driven",   value:"4,820 km", sub:"avg 161 km / day",     subColor:"var(--ink-40)" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className="flex flex-col gap-1.5 bg-canvas border border-ink-04 rounded-xl p-3.5"
                      style={{ minHeight: 84 }}
                    >
                      <span className="text-[11px] font-medium text-ink-40">{p.label}</span>
                      <span className="text-[18px] font-medium leading-tight" style={{ marginTop: 32 }}>{p.value}</span>
                      <span className="text-[11px] font-medium" style={{ color: p.subColor }}>{p.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="flex flex-col gap-0">
                <span className="text-[13px] font-medium mb-3">Recent documents</span>
                {docs.map((doc, i) => (
                  <div
                    key={doc.sub}
                    className="flex items-center justify-between py-3"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--ink-04)" }}
                  >
                    <div className="flex items-center gap-3">
                      <FileIcon />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-medium">{doc.name}</span>
                        <span className="text-[11px] font-medium text-ink-40">{doc.sub}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-ink-40 whitespace-nowrap">Valid until {doc.valid}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {tab === "trips" && (
            <div className="flex items-center justify-center py-10 text-[13px] font-medium text-ink-40">Coming soon</div>
          )}

          {tab === "compliance" && (
            <div className="flex items-center justify-center py-10 text-[13px] font-medium text-ink-40">Coming soon</div>
          )}

          {tab === "documents" && (
            <div className="flex items-center justify-center py-10 text-[13px] font-medium text-ink-40">Coming soon</div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- Main component -----------------------------------------------------------
export default function DriversContent() {
  const [openMenuId, setOpenMenuId]     = useState<string | null>(null);
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
  const [drawerDriver, setDrawerDriver] = useState<Driver | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [regionFilter,     setRegionFilter]     = useState("all");
  const [statusFilter,     setStatusFilter]     = useState("all");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [sortBy,           setSortBy]           = useState("trips");
  const [search,           setSearch]           = useState("");
  const [page,             setPage]             = useState(1);
  const [filtersOpen,      setFiltersOpen]      = useState(false);
  const filterWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    const h = (e: MouseEvent) => {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target as Node)) setFiltersOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [filtersOpen]);

  const activeFilterCount = [regionFilter, statusFilter, complianceFilter].filter(v => v !== "all").length;

  const ROWS_PER_PAGE = 10;

  function getPageNumbers(current: number, total: number): (number | "…")[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, "…", total];
    if (current >= total - 2) return [1, "…", total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
  }

  const filtered = DRIVERS.filter(d => {
    if (regionFilter !== "all" && d.region !== regionFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (complianceFilter !== "all" && d.compliance.cls !== complianceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${d.id} ${d.name} ${d.region} ${d.vehicle} ${d.from} ${d.to}`.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "name")   return a.name.localeCompare(b.name);
    return b.trips - a.trips;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pagedDrivers = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [openMenuId]);

  return (
    <div className="drivers-shell flex-1 flex flex-col bg-canvas">
      <Topbar crumb="Drivers" />

      <div className="p-4 flex flex-col gap-4">

        {/* -- Row head ----------------------------------------------------- */}
        <div className="page-head flex items-end justify-between gap-6">
          <div>
            <h1 className="m-0 text-[18px] font-medium leading-none tracking-[-0.008em]">
              You have 64 drivers across 6 regions
            </h1>
            <div
              className="op-ai-banner mt-3 inline-flex items-center gap-1.5 rounded-[6px] px-1.5 py-[3px] text-orange-deep text-xs font-normal leading-none tracking-[-0.008em]"
              style={{ background:"rgba(255,146,86,0.20)" }}
            >
              <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                <path d="M7 1l1.2 4H12l-3.1 2.2 1.2 4L7 9.2l-3.1 2 1.2-4L2 5h3.8L7 1z"/>
              </svg>
              <b className="font-semibold tracking-[-0.016em]">Op AI:</b>
              <span>47 of 64 drivers active · 3 compliance flags · 6 need attention</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="page-actions-full">
              <ExportReportModal />
              <AddNewModal initialScreen="add-vehicle" />
            </div>
            <ActionsOverflow>
              <ExportReportModal menuItem />
              <AddNewModal menuItem initialScreen="add-vehicle" />
            </ActionsOverflow>
          </div>
        </div>

        {/* -- KPI cards ---------------------------------------------------- */}
        <KpiCards />

        {/* -- Filter + Table container ------------------------------------- */}
        <div className="bg-surface border border-ink-06 rounded-xl overflow-hidden flex flex-col">

          {/* Filter row */}
          <div className="fleet-filter-row flex items-center gap-2.5 px-4 py-3 border-b border-ink-06">
            {/* Search */}
            <div
              className="flex items-center gap-2 border border-ink-06 px-3.5 shrink-0"
              style={{ width:200, height:38, borderRadius:12, background:"var(--search-bg)" }}
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5 text-ink-30 shrink-0">
                <circle cx="6" cy="6" r="4.5"/><path d="M10 10l3 3"/>
              </svg>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search driver"
                className="border-none outline-none bg-transparent text-[12px] font-medium text-ink placeholder:text-ink-40 flex-1 min-w-0"
              />
            </div>

            {/* Single "Filter" toggle — shown ≤1023px only */}
            <div ref={filterWrapRef} className="filter-collapse">
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className={`filter-toggle-btn h-[38px] px-3.5 items-center gap-1.5 border rounded-[12px] text-[12px] font-medium tracking-[-0.004em] cursor-pointer select-none ${filtersOpen ? "border-orange" : "border-ink-06"}`}
              style={{ background:"var(--canvas)" }}
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-3.5 h-3.5 shrink-0 text-ink">
                <path d="M1.5 2.5h11L8.3 7.6v3.3l-2.6 1.6V7.6L1.5 2.5z" strokeLinejoin="round"/>
              </svg>
              <span className="text-ink whitespace-nowrap">Filter</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-orange text-white text-[10px] font-semibold leading-none">{activeFilterCount}</span>
              )}
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3 h-3 text-ink-40 transition-transform" style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                <path d="M3 5l4 4 4-4"/>
              </svg>
            </button>

            <div className={`filter-group ${filtersOpen ? "filter-group-open" : ""}`}>
            <FilterDropdown
              icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 1c2.5 0 4.5 2 4.5 4.5C11.5 9 7 13 7 13S2.5 9 2.5 5.5C2.5 3 4.5 1 7 1z"/><circle cx="7" cy="5.5" r="1.7"/></svg>}
              defaultLabel="Region" value={regionFilter} items={REGION_ITEMS_D} onSelect={v => { setRegionFilter(v); setPage(1); }}
              searchable
            />

            <FilterDropdown
              icon={<img src="/icons/status-filter.svg" alt="" className="w-3.5 h-3.5 icon-adaptive" />}
              defaultLabel="Status" value={statusFilter} items={STATUS_ITEMS_D} onSelect={v => { setStatusFilter(v); setPage(1); }}
            />

            <FilterDropdown
              icon={<svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path fillRule="evenodd" clipRule="evenodd" d="M6.57981 1.18062C5.34956 1.28854 4.25872 1.72079 3.33589 2.46454C2.35881 3.25262 1.63956 4.37787 1.34322 5.58304C1.21722 6.09696 1.18164 6.40554 1.18164 6.99996C1.18164 7.59437 1.21722 7.90296 1.34322 8.41687C1.86006 10.521 3.58264 12.2097 5.69314 12.6816C6.18547 12.7919 6.44389 12.8193 6.99981 12.8193C7.55572 12.8193 7.81414 12.7919 8.30647 12.6816C10.417 12.2097 12.1396 10.521 12.6564 8.41687C12.7806 7.90996 12.8174 7.59262 12.8186 7.01162C12.8191 6.44229 12.7935 6.19262 12.6815 5.69329C12.4143 4.49804 11.7143 3.34537 10.7798 2.56137C9.71581 1.66829 8.49606 1.20746 7.12814 1.18004C6.9454 1.17483 6.76254 1.17502 6.57981 1.18062ZM7.47814 2.35721C9.10447 2.53862 10.4963 3.51804 11.1998 4.97521C11.5062 5.60652 11.6654 6.29914 11.6653 7.0009C11.6652 7.70265 11.5058 8.39523 11.1992 9.02646C10.817 9.81582 10.2206 10.4819 9.47812 10.9486C8.7356 11.4153 7.87683 11.6639 6.99981 11.666C6.12241 11.6643 5.26322 11.4156 4.52049 10.9485C3.77775 10.4814 3.18146 9.81475 2.79981 9.0247C2.49348 8.39369 2.33432 7.70139 2.33432 6.99996C2.33432 6.29852 2.49348 5.60622 2.79981 4.97521C3.25716 4.02437 4.02423 3.25731 4.97506 2.79996C5.74681 2.42662 6.65856 2.26562 7.47814 2.35721ZM9.34481 4.73429C9.29259 4.7496 9.24184 4.76951 9.19314 4.79379C9.14822 4.81654 8.44997 5.49554 7.64147 6.30229L6.17089 7.76995L5.54147 7.13821C4.83272 6.42771 4.77556 6.38512 4.52647 6.38512C4.35731 6.38454 4.25872 6.42421 4.13331 6.54146C4.04246 6.6267 3.98208 6.7394 3.96142 6.86226C3.94077 6.98511 3.96099 7.11136 4.01897 7.22162C4.09831 7.37446 5.77306 9.04745 5.91947 9.12095C6.03964 9.18104 6.28289 9.18746 6.41122 9.13379C6.52264 9.08829 9.92056 5.70204 9.98997 5.56787C10.0389 5.46771 10.0592 5.35596 10.0486 5.24498C10.038 5.134 9.99694 5.02811 9.92989 4.93904C9.81264 4.78504 9.52972 4.68587 9.34481 4.73429Z" fill="currentColor"/></svg>}
              defaultLabel="Compliance" value={complianceFilter} items={COMPLIANCE_ITEMS_D} onSelect={v => { setComplianceFilter(v); setPage(1); }}
            />
            </div>
            </div>

            <div className="ml-auto">
            <FilterDropdown
              icon={<svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path fillRule="evenodd" clipRule="evenodd" d="M10.3909 1.86889C10.3305 1.88096 10.2718 1.90015 10.2159 1.92606C10.1733 1.94706 9.74225 2.36006 9.25867 2.84306C8.29442 3.80614 8.27867 3.82539 8.27867 4.08322C8.27867 4.31189 8.39067 4.49447 8.59775 4.60414C8.72142 4.66947 8.981 4.67297 9.1 4.61114C9.14492 4.58781 9.34675 4.40464 9.54917 4.20397L9.91667 3.83881V7.50331C9.91667 11.6246 9.90208 11.2985 10.0952 11.4916C10.2002 11.596 10.3623 11.6666 10.5 11.6666C10.7345 11.6666 10.9824 11.4846 11.0477 11.2641C11.0787 11.1596 11.0833 10.6941 11.0833 7.49164V3.83881L11.4508 4.20397C11.6532 4.40464 11.8551 4.58781 11.9 4.61114C12.019 4.67297 12.2786 4.66947 12.4017 4.60356C12.5368 4.53479 12.6403 4.41656 12.6905 4.27347C12.7407 4.13037 12.7337 3.97343 12.6712 3.83531C12.6 3.67372 10.9136 1.98439 10.7567 1.91731C10.643 1.86282 10.5149 1.84587 10.3909 1.86889ZM2.14258 2.36997C1.93083 2.43531 1.75 2.68672 1.75 2.91656C1.75 3.15281 1.93025 3.39839 2.1525 3.46431C2.33217 3.51797 6.41783 3.51797 6.5975 3.46431C6.818 3.39897 7 3.15106 7 2.91656C7 2.68206 6.818 2.43414 6.5975 2.36881C6.42367 2.31689 2.31058 2.31806 2.14258 2.36997ZM2.14258 6.45331C1.93083 6.51864 1.75 6.77006 1.75 6.99989C1.75 7.23614 1.93025 7.48172 2.1525 7.54764C2.25633 7.57856 2.62092 7.58322 4.95833 7.58322C7.29575 7.58322 7.66033 7.57856 7.76417 7.54764C7.98467 7.48231 8.16667 7.23439 8.16667 6.99989C8.16667 6.76539 7.98467 6.51747 7.76417 6.45214C7.58975 6.40022 2.31117 6.40139 2.14258 6.45331ZM2.14258 10.5366C1.93083 10.602 1.75 10.8534 1.75 11.0832C1.75 11.3195 1.93025 11.5651 2.1525 11.631C2.25633 11.6619 2.62092 11.6666 4.95833 11.6666C7.29575 11.6666 7.66033 11.6619 7.76417 11.631C7.98467 11.5656 8.16667 11.3177 8.16667 11.0832C8.16667 10.8487 7.98467 10.6008 7.76417 10.5355C7.58975 10.4836 2.31117 10.4847 2.14258 10.5366Z" fill="currentColor"/></svg>}
              prefix="Sort by: " value={sortBy} items={SORT_ITEMS_D} onSelect={setSortBy}
              alignRight
            />
            </div>
          </div>

          <div className="drivers-table-wrap fleet-table-scroll">
          <table className="drivers-table w-full border-collapse">
            <thead>
              <tr style={{ background:"var(--canvas)" }}>
                {["Drivers","Region","Vehicle","Location / route","Status","Trips","Rating","Compliance","",""].map((h, i) => {
                  const minW = [175, 120, 115, 145, 105, 60, 75, 105, 40, 40][i];
                  return (
                    <th
                      key={i}
                      className="text-left text-[11px] font-medium text-ink-40 px-3 py-3.5 border-b border-ink-04 whitespace-nowrap"
                      style={{ paddingLeft: i === 0 ? 16 : undefined, minWidth: minW }}
                    >
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pagedDrivers.map((d) => {
                const sCls = STATUS_CLS[d.status];
                const sLbl = STATUS_LABEL[d.status];
                const isOpen = openMenuId === d.id;

                return (
                  <tr
                    key={d.id}
                    className="border-b border-ink-04 hover:bg-canvas cursor-pointer"
                    onClick={() => setDrawerDriver(d)}
                  >
                    {/* Driver */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-2.5">
                        <DriverAvatar initials={d.initials} avCls={d.avCls} avatar={d.avatar} size={32} online={d.online} />
                        <span className="text-[13px] font-medium">{d.name}</span>
                      </span>
                    </td>

                    {/* Region */}
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
                        <span className="shrink-0 leading-none" style={{ fontSize:12 }}>{REGION_FLAG[d.region] ?? "🏳"}</span>
                        {d.region}
                      </span>
                    </td>

                    {/* Vehicle */}
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-1.5" style={{ color:"var(--ink-40)" }}>
                        <span className="inline-flex items-center justify-center shrink-0">
                          <VehicleIcon type={d.vehicleType} />
                        </span>
                        <span className="text-[12px] font-medium">{d.vehicle}</span>
                      </span>
                    </td>

                    {/* Location / route */}
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-1 relative">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color:"var(--ink)" }}>
                          <span className="w-3 h-3 inline-flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ({ transit:"#0ab86d", delayed:"#fd514e", idle:"#ee9b32", upcoming:"#667085" } as Record<string,string>)[d.status] }} />
                          </span>
                          {d.from}
                        </span>
                        <svg width="1" viewBox="0 0 1 159" fill="none" preserveAspectRatio="none" style={{ position:"absolute", left:"5.5px", top:"12px", height:"calc(100% - 24px)", zIndex:0, transform:"rotate(-180deg)" }}>
                          <path d="M0.5 0V158.5" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="30 40"/>
                        </svg>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color:"var(--ink-40)" }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink:0 }}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M6 1.00024C7.19347 1.00024 8.33807 1.47435 9.18198 2.31826C10.0259 3.16218 10.5 4.30677 10.5 5.50024C10.5 7.03724 9.662 8.29524 8.779 9.19774C8.33776 9.64369 7.85639 10.0481 7.341 10.4057L7.128 10.5507L7.028 10.6172L6.8395 10.7372L6.6715 10.8397L6.4635 10.9607C6.32225 11.0411 6.16252 11.0834 6 11.0834C5.83748 11.0834 5.67775 11.0411 5.5365 10.9607L5.3285 10.8397L5.0685 10.6797L4.9725 10.6172L4.7675 10.4807C4.21149 10.1044 3.69353 9.6747 3.221 9.19774C2.338 8.29474 1.5 7.03724 1.5 5.50024C1.5 4.30677 1.97411 3.16218 2.81802 2.31826C3.66193 1.47435 4.80653 1.00024 6 1.00024ZM6 2.00024C5.07174 2.00024 4.1815 2.36899 3.52513 3.02537C2.86875 3.68175 2.5 4.57199 2.5 5.50024C2.5 6.66124 3.136 7.68024 3.9355 8.49824C4.27931 8.84619 4.65087 9.16558 5.0465 9.45324L5.2755 9.61624C5.3495 9.66774 5.4205 9.71574 5.489 9.76024L5.684 9.88524L5.8555 9.98974L6 10.0742L6.2275 9.93974L6.411 9.82474C6.5085 9.76274 6.6135 9.69324 6.7245 9.61624L6.9535 9.45324C7.34913 9.16558 7.72069 8.84619 8.0645 8.49824C8.864 7.68074 9.5 6.66124 9.5 5.50024C9.5 4.57199 9.13125 3.68175 8.47487 3.02537C7.8185 2.36899 6.92826 2.00024 6 2.00024ZM6 3.50024C6.53043 3.50024 7.03914 3.71096 7.41421 4.08603C7.78929 4.4611 8 4.96981 8 5.50024C8 6.03068 7.78929 6.53939 7.41421 6.91446C7.03914 7.28953 6.53043 7.50024 6 7.50024C5.46957 7.50024 4.96086 7.28953 4.58579 6.91446C4.21071 6.53939 4 6.03068 4 5.50024C4 4.96981 4.21071 4.4611 4.58579 4.08603C4.96086 3.71096 5.46957 3.50024 6 3.50024ZM6 4.50024C5.73478 4.50024 5.48043 4.6056 5.29289 4.79314C5.10536 4.98067 5 5.23503 5 5.50024C5 5.76546 5.10536 6.01981 5.29289 6.20735C5.48043 6.39489 5.73478 6.50024 6 6.50024C6.26522 6.50024 6.51957 6.39489 6.70711 6.20735C6.89464 6.01981 7 5.76546 7 5.50024C7 5.23503 6.89464 4.98067 6.70711 4.79314C6.51957 4.6056 6.26522 4.50024 6 4.50024Z" fill="currentColor" fillOpacity="0.4"/>
                          </svg>
                          {d.to}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${sCls}`}>
                        {sLbl}
                      </span>
                    </td>

                    {/* Trips */}
                    <td className="px-3 py-3.5 text-[12px] font-medium">{d.trips}</td>

                    {/* Rating */}
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
                        <StarIcon filled size={12} />
                        {d.rating}
                      </span>
                    </td>

                    {/* Compliance */}
                    <td className="px-3 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                        style={{ color: COMPLIANCE_COLOR[d.compliance.cls] }}
                      >
                        <ComplianceIcon cls={d.compliance.cls} />
                        {d.compliance.label}
                      </span>
                    </td>

                    {/* Msg */}
                    <td className="px-1.5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <button className="inline-flex items-center justify-center cursor-pointer rounded-lg hover:bg-ink-04" style={{ width:28, height:28 }}>
                        <ChatIcon />
                      </button>
                    </td>

                    {/* More */}
                    <td className="pr-3 pl-1 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="relative" ref={isOpen ? menuRef : undefined}>
                        <button
                          onClick={() => setOpenMenuId(isOpen ? null : d.id)}
                          onMouseEnter={() => setHoveredMenuId(d.id)}
                          onMouseLeave={() => setHoveredMenuId(null)}
                          className="inline-flex items-center justify-center cursor-pointer"
                          style={{
                            width:28, height:28,
                            borderRadius: 4,
                            border: (isOpen || hoveredMenuId === d.id) ? "1px solid #FF9256" : "1px solid transparent",
                            background: (isOpen || hoveredMenuId === d.id) ? "var(--menu-hover)" : "transparent",
                          }}
                        >
                          <DotsIcon open={isOpen || hoveredMenuId === d.id} />
                        </button>

                        {isOpen && (
                          <div
                            className="absolute z-20 bg-surface border border-ink-06 p-1.5"
                            style={{
                              right:0, top:34,
                              borderRadius:14,
                              boxShadow:"0 14px 40px rgba(0,0,0,0.10)",
                              width:200,
                            }}
                          >
                            {MENU_ITEMS.map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center gap-2.5 rounded-lg text-[12px] font-medium cursor-pointer"
                                style={{
                                  padding:"9px 10px",
                                  background: item.highlight ? "var(--control-active-bg)" : "transparent",
                                  color:      item.highlight ? "var(--color-orange-active)" : "inherit",
                                }}
                                onMouseEnter={(e) => {
                                  if (!item.highlight) (e.currentTarget as HTMLDivElement).style.background = "var(--menu-hover)";
                                }}
                                onMouseLeave={(e) => {
                                  if (!item.highlight) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                                }}
                              >
                                {item.icon}
                                {item.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {Array.from({ length: ROWS_PER_PAGE - pagedDrivers.length }).map((_, i) => (
                <tr key={`filler-${i}`} className="border-b border-ink-04">
                  {Array.from({ length: 10 }).map((__, j) => (
                    <td key={j} className="px-3 py-3.5">&nbsp;</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Footer */}
          <div className="pagination-row flex items-center justify-between px-3 py-3 border-t border-ink-04">
            <span className="text-[12px] font-medium pl-3" style={{ color:"var(--ink)" }}>
              Showing {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(1)} disabled={page === 1} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>‹</button>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} className="inline-flex items-center justify-center text-[12px]" style={{ width:32, height:32, color:"var(--ink-40)" }}>…</span>
                  : <button key={p} onClick={() => setPage(p as number)} className="inline-flex items-center justify-center text-[12px] font-normal cursor-pointer" style={{ width:32, height:32, borderRadius:8, background: page === p ? "#FF9256" : "var(--surface)", color: page === p ? "#ffffff" : "var(--ink)", border:"1px solid var(--ink-04)" }}>{p}</button>
              )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>»</button>
            </div>
          </div>
        </div>

      </div>

      {/* -- Driver profile drawer -------------------------------------------- */}
      {drawerDriver && (
        <DriverDrawer driver={drawerDriver} onClose={() => setDrawerDriver(null)} />
      )}
    </div>
  );
}


// --- Pagination button --------------------------------------------------------
function PaginationBtn({
  children,
  active,
  disabled,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40"
      style={{
        width:32, height:32, borderRadius:8,
        background: active ? "#FF9256" : "var(--surface)",
        color:      active ? "#ffffff" : "var(--ink)",
        border:"1px solid rgba(18,18,18,0.05)",
      }}
    >
      {children}
    </button>
  );
}
