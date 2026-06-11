"use client";

import { useState, useRef, useEffect } from "react";
import { STATUS_CLS, STATUS_LABEL } from "@/lib/fleet-data";
import Topbar from "@/components/Topbar";
import CountUp from "@/components/CountUp";
import ExportReportModal from "@/components/ExportReportModal";
import AddNewModal from "@/components/AddNewModal";
import ActionsOverflow from "@/components/ActionsOverflow";

// --- Types --------------------------------------------------------------
type VehStatus = "transit" | "delayed" | "idle" | "upcoming";
type VehType   = "car" | "van" | "truck" | "scooter";
type ViewMode  = "cards" | "table" | "map";

type FleetVehicle = {
  id: string; vehType: VehType; driver: string; initials: string; avCls: string; avatar?: string;
  from: string; to: string; status: VehStatus;
  fuel: number; load: number;
  service: string; serviceCls: "green" | "amber" | "red";
  lastCheckIn: string; region: string; vehicleType: string;
  mapPos: { l: string; t: string };
};

// --- Data ---------------------------------------------------------------
const VEHICLES: FleetVehicle[] = [
  { id:"CAR-041", vehType:"car",     driver:"Ngozi Eze",     initials:"NE", avCls:"a1", avatar:"/icons/ngozi.svg",  from:"Oshodi",  to:"Ikeja",           status:"transit",  fuel:89,  load:33,  service:"In 11 days", serviceCls:"green", lastCheckIn:"2 mins ago",  region:"Lagos",         vehicleType:"Sedan car",    mapPos:{l:"60%",t:"18%"} },
  { id:"VAN-007", vehType:"van",     driver:"Emeka Okeke",   initials:"EO", avCls:"a4", avatar:"/icons/emeka.svg",  from:"Ikorodu", to:"Victoria Island", status:"transit",  fuel:61,  load:99,  service:"In 8 days",  serviceCls:"green", lastCheckIn:"4 mins ago",  region:"Lagos",         vehicleType:"Delivery van", mapPos:{l:"34%",t:"24%"} },
  { id:"TRK-055", vehType:"truck",   driver:"Fatima Bello",  initials:"FB", avCls:"a3", from:"Yaba",    to:"Surulere",        status:"delayed",  fuel:87,  load:89,  service:"In 2 days",  serviceCls:"amber", lastCheckIn:"8 mins ago",  region:"Lagos",         vehicleType:"Heavy truck",  mapPos:{l:"48%",t:"32%"} },
  { id:"SCT-014", vehType:"scooter", driver:"Segun Adebayo", initials:"SA", avCls:"a2", avatar:"/icons/segun.svg",  from:"Tin Can", to:"Ajah",            status:"idle",     fuel:100, load:32,  service:"Overdue",    serviceCls:"red",   lastCheckIn:"10 mins ago", region:"Lagos",         vehicleType:"Scooter",      mapPos:{l:"23%",t:"36%"} },
  { id:"TRK-017", vehType:"truck",   driver:"Nkechi Obi",    initials:"NO", avCls:"a5", from:"Apapa",   to:"Lekki",           status:"transit",  fuel:69,  load:44,  service:"In 21 days", serviceCls:"green", lastCheckIn:"12 mins ago", region:"Kano",          vehicleType:"Heavy truck",  mapPos:{l:"20%",t:"50%"} },
  { id:"TRK-029", vehType:"truck",   driver:"Chidi Okoro",   initials:"CO", avCls:"a4", avatar:"/icons/chidi.svg",  from:"Kano",    to:"Zaria",           status:"upcoming", fuel:64,  load:100, service:"In 18 days", serviceCls:"green", lastCheckIn:"16 mins ago", region:"Kano",          vehicleType:"Heavy truck",  mapPos:{l:"30%",t:"54%"} },
  { id:"TRK-222", vehType:"truck",   driver:"Halima Bala",   initials:"HB", avCls:"a3", from:"PH",      to:"Aba",             status:"upcoming", fuel:68,  load:24,  service:"In 4 days",  serviceCls:"amber", lastCheckIn:"20 mins ago", region:"Port Harcourt", vehicleType:"Heavy truck",  mapPos:{l:"65%",t:"46%"} },
  { id:"SCT-333", vehType:"scooter", driver:"Tunde Usman",   initials:"TU", avCls:"a2", from:"Benue",   to:"Katsina",         status:"upcoming", fuel:35,  load:20,  service:"In 33 days", serviceCls:"green", lastCheckIn:"24 mins ago", region:"Abuja",         vehicleType:"Scooter",      mapPos:{l:"54%",t:"62%"} },
  { id:"VAN-012", vehType:"van",     driver:"May Adewale",   initials:"MA", avCls:"a5", from:"Kogi",    to:"Kwara",           status:"upcoming", fuel:23,  load:61,  service:"Overdue",    serviceCls:"red",   lastCheckIn:"29 mins ago", region:"Kaduna",        vehicleType:"Delivery van", mapPos:{l:"42%",t:"74%"} },
  { id:"CAR-444", vehType:"car",     driver:"Sule Dangiwa",  initials:"SD", avCls:"a2", from:"Yobe",    to:"Ondo",            status:"upcoming", fuel:69,  load:43,  service:"In 24 days", serviceCls:"green", lastCheckIn:"46 mins ago", region:"Ibadan",        vehicleType:"Sedan car",    mapPos:{l:"34%",t:"88%"} },
  { id:"CAR-555", vehType:"car",     driver:"Ibrahim Baba",  initials:"IB", avCls:"a4", from:"Ogun",    to:"Ekiti",           status:"upcoming", fuel:54,  load:54,  service:"In 5 days",  serviceCls:"amber", lastCheckIn:"56 mins ago", region:"Lagos",         vehicleType:"Sedan car",    mapPos:{l:"78%",t:"54%"} },
  { id:"VAN-088", vehType:"van",     driver:"Funke Hassan",  initials:"FH", avCls:"a3", from:"Osun",    to:"Taraba",          status:"upcoming", fuel:52,  load:78,  service:"Overdue",    serviceCls:"red",   lastCheckIn:"1 hr ago",    region:"Accra",         vehicleType:"Delivery van", mapPos:{l:"75%",t:"62%"} },
  { id:"TRK-666", vehType:"truck",   driver:"Bayo Williams", initials:"BW", avCls:"a4", from:"Gombe",   to:"Adamawa",         status:"upcoming", fuel:32,  load:91,  service:"In 10 days", serviceCls:"green", lastCheckIn:"2 hr ago",    region:"Nairobi",       vehicleType:"Heavy truck",  mapPos:{l:"90%",t:"70%"} },
];

const KPI_CELLS = [
  { icon: <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path d="M4.8084 1.76748C4.95847 1.80508 5.08745 1.90075 5.16698 2.03345C5.24651 2.16614 5.27007 2.325 5.23248 2.47506L2.89915 11.8084C2.88166 11.8838 2.84932 11.955 2.80401 12.0179C2.75871 12.0807 2.70136 12.1338 2.63529 12.1743C2.56922 12.2147 2.49577 12.2415 2.41922 12.2532C2.34267 12.265 2.26455 12.2613 2.18941 12.2426C2.11428 12.2238 2.04364 12.1902 1.98161 12.1438C1.91958 12.0975 1.86741 12.0392 1.82813 11.9725C1.78886 11.9057 1.76327 11.8318 1.75286 11.7551C1.74244 11.6783 1.74742 11.6003 1.76748 11.5255L4.10082 2.19215C4.11937 2.11779 4.15239 2.04782 4.198 1.98623C4.24361 1.92464 4.3009 1.87264 4.36661 1.8332C4.43233 1.79376 4.50516 1.76766 4.58097 1.75638C4.65677 1.74511 4.73405 1.74888 4.8084 1.76748ZM9.89915 2.19156L12.2325 11.5249C12.2526 11.5997 12.2575 11.6777 12.2471 11.7545C12.2367 11.8312 12.2111 11.9051 12.1718 11.9719C12.1326 12.0386 12.0804 12.0969 12.0184 12.1433C11.9563 12.1896 11.8857 12.2232 11.8106 12.242C11.7354 12.2608 11.6573 12.2644 11.5807 12.2527C11.5042 12.2409 11.4307 12.2141 11.3647 12.1737C11.2986 12.1333 11.2413 12.0801 11.196 12.0173C11.1506 11.9545 11.1183 11.8833 11.1008 11.8078L8.76748 2.47448C8.74741 2.39968 8.74244 2.32163 8.75286 2.24489C8.76327 2.16815 8.78886 2.09425 8.82813 2.0275C8.86741 1.96075 8.91958 1.90249 8.98161 1.85612C9.04364 1.80975 9.11428 1.77619 9.18941 1.75741C9.26455 1.73862 9.34267 1.73499 9.41922 1.74672C9.49577 1.75844 9.56922 1.7853 9.63529 1.82571C9.70135 1.86612 9.75871 1.91929 9.80401 1.9821C9.84932 2.04491 9.88166 2.11612 9.89915 2.19156ZM6.99998 9.91665C7.14286 9.91667 7.28076 9.96912 7.38753 10.0641C7.4943 10.159 7.56252 10.2898 7.57923 10.4317L7.58332 10.5V11.6666C7.58315 11.8153 7.52622 11.9583 7.42416 12.0664C7.32209 12.1746 7.18259 12.2396 7.03417 12.2483C6.88575 12.257 6.7396 12.2088 6.62558 12.1133C6.51157 12.0179 6.43829 11.8825 6.42073 11.7349L6.41665 11.6666V10.5C6.41665 10.3453 6.47811 10.1969 6.5875 10.0875C6.6969 9.97811 6.84527 9.91665 6.99998 9.91665ZM6.99998 5.83331C7.15469 5.83331 7.30307 5.89477 7.41246 6.00417C7.52186 6.11357 7.58332 6.26194 7.58332 6.41665V7.58331C7.58332 7.73802 7.52186 7.8864 7.41246 7.99579C7.30307 8.10519 7.15469 8.16665 6.99998 8.16665C6.84527 8.16665 6.6969 8.10519 6.5875 7.99579C6.47811 7.8864 6.41665 7.73802 6.41665 7.58331V6.41665C6.41665 6.26194 6.47811 6.11357 6.5875 6.00417C6.6969 5.89477 6.84527 5.83331 6.99998 5.83331ZM6.99998 1.74998C7.14286 1.75 7.28076 1.80246 7.38753 1.8974C7.4943 1.99234 7.56252 2.12317 7.57923 2.26506L7.58332 2.33331V3.49998C7.58315 3.64866 7.52622 3.79167 7.42416 3.89978C7.32209 4.00789 7.18259 4.07295 7.03417 4.08166C6.88575 4.09038 6.7396 4.04209 6.62558 3.94666C6.51157 3.85123 6.43829 3.71587 6.42073 3.56823L6.41665 3.49998V2.33331C6.41665 2.1786 6.47811 2.03023 6.5875 1.92084C6.6969 1.81144 6.84527 1.74998 6.99998 1.74998Z" fill="currentColor"/></svg>, title:"In transit",      value:<><CountUp target={47} /><span style={{ color:"var(--ink-40)" }}> / 64</span></>, bars:[55,75,90,72,40,35,80,68,52,30] },
  { icon: <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M6.40216 1.75123C6.43631 1.90207 6.40916 2.0603 6.32668 2.19112C6.2442 2.32195 6.11315 2.41467 5.96233 2.4489C5.84785 2.4749 5.73441 2.50526 5.62224 2.5399C5.54905 2.5625 5.47212 2.57046 5.39585 2.56332C5.31957 2.55619 5.24545 2.53411 5.17772 2.49833C5.10998 2.46255 5.04996 2.41378 5.00107 2.35481C4.95218 2.29583 4.91538 2.2278 4.89279 2.15461C4.87019 2.08141 4.86223 2.00448 4.86936 1.92821C4.87649 1.85194 4.89858 1.77782 4.93436 1.71008C4.97013 1.64234 5.0189 1.58232 5.07788 1.53343C5.13685 1.48454 5.20488 1.44775 5.27808 1.42515C5.41808 1.38198 5.56041 1.34348 5.70391 1.3114C5.77864 1.2944 5.85598 1.2923 5.93153 1.30521C6.00707 1.31812 6.07933 1.34579 6.14417 1.38663C6.20902 1.42748 6.26518 1.4807 6.30944 1.54326C6.35371 1.60582 6.38522 1.67649 6.40216 1.75123ZM7.59799 1.75123C7.63222 1.60041 7.72494 1.46936 7.85577 1.38688C7.9866 1.3044 8.14482 1.27725 8.29566 1.3114C10.8938 1.90056 12.834 4.2234 12.834 7.00006C12.834 10.2218 10.2218 12.8334 7.00066 12.8334C4.22341 12.8334 1.90058 10.8938 1.31141 8.29565C1.28117 8.1463 1.31057 7.99105 1.39331 7.8631C1.47606 7.73515 1.60558 7.64466 1.75419 7.61098C1.90279 7.57729 2.05868 7.60309 2.18851 7.68286C2.31834 7.76263 2.4118 7.89003 2.44891 8.03781C2.63454 8.85084 3.03464 9.59927 3.60759 10.2052C4.18053 10.8112 4.9054 11.2526 5.70676 11.4834C6.50812 11.7142 7.35669 11.7261 8.1642 11.5178C8.97171 11.3095 9.70865 10.8886 10.2983 10.2989C10.888 9.70922 11.3089 8.97228 11.5172 8.16477C11.7255 7.35727 11.7137 6.50869 11.4828 5.70733C11.252 4.90597 10.8106 4.1811 10.2047 3.60816C9.5987 3.03521 8.85027 2.63511 8.03724 2.44948C7.88641 2.41513 7.75539 2.32227 7.67302 2.19132C7.59064 2.06038 7.56366 1.90207 7.59799 1.75123ZM3.85824 2.7534C3.91041 2.80957 3.951 2.87547 3.97768 2.94733C4.00436 3.0192 4.01662 3.09562 4.01375 3.17222C4.01088 3.24883 3.99293 3.32412 3.96095 3.39378C3.92896 3.46345 3.88355 3.52612 3.82733 3.57823C3.74099 3.65756 3.65816 3.74098 3.57824 3.82673C3.47228 3.93699 3.32725 4.00123 3.17438 4.00562C3.02152 4.01 2.87304 3.95418 2.76093 3.85017C2.64881 3.74617 2.58203 3.60229 2.57495 3.44953C2.56787 3.29676 2.62106 3.14733 2.72308 3.0334C2.82224 2.92606 2.92608 2.82223 3.03341 2.72248C3.08958 2.67031 3.15548 2.62973 3.22735 2.60304C3.29921 2.57636 3.37563 2.56411 3.45224 2.56698C3.52884 2.56985 3.60413 2.58779 3.67379 2.61978C3.74346 2.65177 3.80614 2.69717 3.85824 2.7534ZM7.00008 3.50006C7.15479 3.50006 7.30316 3.56152 7.41256 3.67092C7.52195 3.78032 7.58341 3.92869 7.58341 4.0834V6.75856L9.16249 8.33765C9.26875 8.44767 9.32755 8.59502 9.32622 8.74796C9.32489 8.90091 9.26354 9.04722 9.15539 9.15538C9.04723 9.26353 8.90093 9.32488 8.74798 9.32621C8.59503 9.32754 8.44768 9.26874 8.33766 9.16248L6.58766 7.41248C6.47826 7.30311 6.41678 7.15476 6.41674 7.00006V4.0834C6.41674 3.92869 6.4782 3.78032 6.5876 3.67092C6.69699 3.56152 6.84537 3.50006 7.00008 3.50006ZM2.15433 4.89306C2.30214 4.93865 2.4258 5.04107 2.4981 5.17781C2.57041 5.31455 2.58545 5.47441 2.53991 5.62223C2.50528 5.7344 2.47492 5.84784 2.44891 5.96231C2.4118 6.1101 2.31834 6.2375 2.18851 6.31727C2.05868 6.39704 1.90279 6.42284 1.75419 6.38915C1.60558 6.35547 1.47606 6.26498 1.39331 6.13702C1.31057 6.00907 1.28117 5.85383 1.31141 5.70448C1.34408 5.5604 1.38199 5.41865 1.42516 5.27865C1.47074 5.13084 1.57316 5.00718 1.7099 4.93487C1.84664 4.86256 2.0065 4.84753 2.15433 4.89306Z" fill="currentColor"/></svg>, title:"Idle",            value:<CountUp target={218} />, bars:[45,50,42,80,50,38,42,55,48,35] },
  { icon: <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M3.96547 1.68223C4.6815 1.39544 5.46409 1.31726 6.2227 1.45673C6.9813 1.59621 7.68491 1.94763 8.25211 2.47033C8.81931 2.99304 9.22691 3.66567 9.42774 4.41039C9.62858 5.1551 9.61444 5.94146 9.38697 6.67848L11.9501 8.84731C12.181 9.04352 12.3688 9.28543 12.5015 9.5578C12.6342 9.83017 12.7091 10.1271 12.7214 10.4298C12.7336 10.7326 12.683 11.0346 12.5728 11.3168C12.4625 11.599 12.295 11.8553 12.0807 12.0696C11.8665 12.2838 11.6102 12.4514 11.328 12.5616C11.0457 12.6719 10.7437 12.7225 10.441 12.7102C10.1383 12.6979 9.84133 12.6231 9.56896 12.4903C9.29659 12.3576 9.05468 12.1699 8.85847 11.939L6.69022 9.37581C5.95314 9.60336 5.16669 9.61753 4.42189 9.41668C3.67709 9.21582 3.0044 8.80816 2.48166 8.24087C1.95893 7.67359 1.60752 6.96987 1.46812 6.21116C1.32873 5.45245 1.40703 4.66978 1.69397 3.95373C1.9028 3.43223 2.5573 3.36631 2.89739 3.73615L4.7658 5.76498L5.6093 5.59698L5.77847 4.75173L3.74847 2.88623C3.37864 2.54615 3.44339 1.89106 3.96547 1.68223ZM5.13622 2.57823L6.74797 4.0599C6.9358 4.23256 7.0198 4.4904 6.96964 4.73948L6.69547 6.11265C6.66722 6.25396 6.59774 6.38374 6.49578 6.48559C6.39383 6.58744 6.26398 6.65679 6.12264 6.6849L4.7518 6.95731C4.62912 6.98171 4.50222 6.97413 4.3833 6.93531C4.26439 6.89649 4.15746 6.82773 4.0728 6.73565L2.5888 5.12448C2.5284 5.62623 2.59935 6.13507 2.79471 6.60116C2.99006 7.06725 3.30313 7.4746 3.70324 7.78333C4.10335 8.09206 4.57679 8.29157 5.07719 8.36233C5.57758 8.43309 6.08778 8.37267 6.5578 8.18698C6.70036 8.13041 6.85706 8.11997 7.00586 8.15712C7.15466 8.19426 7.28806 8.27713 7.3873 8.39406L9.7498 11.1859C9.84143 11.2946 9.95464 11.3831 10.0823 11.4458C10.2099 11.5085 10.3491 11.544 10.4912 11.55C10.6332 11.5561 10.775 11.5326 10.9075 11.481C11.04 11.4294 11.1603 11.3508 11.2608 11.2503C11.3614 11.1497 11.4399 11.0294 11.4915 10.8969C11.5431 10.7644 11.5667 10.6227 11.5606 10.4806C11.5546 10.3386 11.5191 10.1993 11.4564 10.0717C11.3937 9.94406 11.3052 9.83085 11.1965 9.73923L8.40522 7.37673C8.28829 7.27749 8.20542 7.14408 8.16827 6.99528C8.13113 6.84648 8.14157 6.68978 8.19814 6.54723C8.38401 6.07721 8.44457 5.56696 8.37388 5.06648C8.3032 4.56601 8.1037 4.09249 7.79493 3.69233C7.48616 3.29216 7.07872 2.97909 6.61254 2.78378C6.14636 2.58848 5.63743 2.51765 5.13564 2.57823H5.13622Z" fill="currentColor"/></svg>, title:"Maintenance",     value:<CountUp target={91.4} decimals={1} suffix="%" />, bars:[28,42,75,40,80,42,30,82,42,30] },
  { icon: <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M7.58326 1.75C7.87759 1.74991 8.16109 1.86107 8.37691 2.06121C8.59273 2.26134 8.72493 2.53566 8.74701 2.82917L8.74992 2.91667V7H9.33326C9.62759 6.99991 9.91109 7.11107 10.1269 7.31121C10.3427 7.51134 10.4749 7.78566 10.497 8.07917L10.4999 8.16667V9.625C10.4998 9.69788 10.5269 9.76818 10.5761 9.82204C10.6252 9.8759 10.6926 9.90942 10.7652 9.91601C10.8378 9.9226 10.9102 9.90177 10.9682 9.85762C11.0262 9.81348 11.0656 9.74922 11.0786 9.6775L11.0833 9.625V7C10.8498 6.9994 10.6217 6.92935 10.4282 6.79875C10.1762 6.62769 10.0011 6.36487 9.94024 6.06644C9.87942 5.768 9.93771 5.45761 10.1027 5.20158L10.1464 5.138L9.50417 4.49633C9.39844 4.3916 9.33674 4.25042 9.33169 4.10168C9.32665 3.95294 9.37864 3.8079 9.47703 3.69624C9.57542 3.58459 9.71276 3.51476 9.86095 3.50105C10.0091 3.48734 10.157 3.53079 10.2742 3.6225L10.329 3.67092L11.9081 5.25C12.1018 5.44368 12.2211 5.69933 12.2453 5.97217L12.2499 6.07483V9.625C12.2508 10.0041 12.1041 10.3687 11.8408 10.6414C11.5775 10.9142 11.2183 11.0737 10.8394 11.0861C10.4606 11.0985 10.0917 10.9629 9.81108 10.7081C9.53046 10.4532 9.36012 10.099 9.33617 9.72067L9.33326 9.625V8.16667H8.74992V11.0833C8.8986 11.0835 9.04161 11.1404 9.14972 11.2425C9.25783 11.3446 9.32289 11.4841 9.33161 11.6325C9.34032 11.7809 9.29203 11.9271 9.1966 12.0411C9.10117 12.1551 8.96581 12.2284 8.81817 12.2459L8.74992 12.25H1.74992C1.60124 12.2498 1.45824 12.1929 1.35013 12.0908C1.24201 11.9888 1.17695 11.8493 1.16824 11.7009C1.15953 11.5524 1.20782 11.4063 1.30324 11.2923C1.39867 11.1782 1.53403 11.105 1.68167 11.0874L1.74992 11.0833V2.91667C1.74983 2.62233 1.86099 2.33884 2.06113 2.12301C2.26127 1.90719 2.53558 1.77499 2.82909 1.75292L2.91659 1.75H7.58326ZM7.58326 7.58333H2.91659V11.0833H7.58326V7.58333ZM7.58326 2.91667H2.91659V6.41667H7.58326V2.91667Z" fill="currentColor"/></svg>, title:"Fleet efficiency",value:<CountUp target={87} suffix="%" />, bars:[35,30,55,35,30,30,40,38,42,30] },
];

// --- Helpers ------------------------------------------------------------
function fuelColor(pct: number) {
  if (pct >= 70) return "#0ab86d";
  if (pct >= 40) return "#ee9b32";
  return "#fd514e";
}
function loadColor(pct: number) {
  if (pct >= 70) return "#037847";
  if (pct >= 40) return "#A15A00";
  return "#BB2422";
}

// --- Icon components ----------------------------------------------------
function VehicleTypeIcon({ type, className = "w-3.5 h-3.5" }: { type: VehType; className?: string }) {
  if (type === "van") return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M5.22925 10.5001C5.08772 11.4895 4.23681 12.2501 3.20825 12.2501C2.1797 12.2501 1.32879 11.4895 1.18726 10.5001H0.583252V3.50008C0.583252 3.17792 0.844422 2.91675 1.16659 2.91675H9.33325C9.65543 2.91675 9.91659 3.17792 9.91659 3.50008V4.66675H11.6666L13.4166 7.03257V10.5001H12.2293C12.0877 11.4895 11.2368 12.2501 10.2083 12.2501C9.17972 12.2501 8.32881 11.4895 8.18724 10.5001H5.22925ZM8.74992 4.08341H1.74992V8.77954C2.12049 8.40137 2.63697 8.16675 3.20825 8.16675C4.0227 8.16675 4.72576 8.64362 5.05344 9.33342H8.36305C8.46088 9.1275 8.59219 8.94048 8.74992 8.77954V4.08341ZM9.91659 7.58342H12.2499V7.41717L11.0784 5.83342H9.91659V7.58342ZM10.2083 11.0834C10.5892 11.0834 10.9133 10.8399 11.0334 10.5001C11.0657 10.4088 11.0833 10.3107 11.0833 10.2084C11.0833 9.72518 10.6915 9.33342 10.2083 9.33342C9.72502 9.33342 9.33325 9.72518 9.33325 10.2084C9.33325 10.3107 9.35081 10.4088 9.38307 10.5001C9.50318 10.8399 9.82728 11.0834 10.2083 11.0834ZM4.08325 10.2084C4.08325 9.72518 3.6915 9.33342 3.20825 9.33342C2.725 9.33342 2.33325 9.72518 2.33325 10.2084C2.33325 10.3107 2.3508 10.4088 2.38304 10.5001C2.50316 10.8399 2.82727 11.0834 3.20825 11.0834C3.58923 11.0834 3.91334 10.8399 4.03346 10.5001C4.06571 10.4088 4.08325 10.3107 4.08325 10.2084Z" fill="currentColor"/>
    </svg>
  );
  if (type === "scooter") return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M9.33341 0.583252C9.65559 0.583252 9.91675 0.844422 9.91675 1.16659V1.74992H12.8334V5.24992H11.6558L13.2576 9.65053C13.3603 9.91355 13.4167 10.1999 13.4167 10.4993C13.4167 11.788 12.3721 12.8327 11.0834 12.8327C9.99637 12.8327 9.08299 12.0893 8.82376 11.0833H6.34325C6.08419 12.0896 5.17065 12.8333 4.08341 12.8333C2.94913 12.8333 2.00388 12.0239 1.79368 10.9512C1.42106 10.7564 1.16675 10.3662 1.16675 9.91658V4.08325C1.16675 3.76109 1.42792 3.49992 1.75008 3.49992H5.83341C6.15559 3.49992 6.41675 3.76109 6.41675 4.08325V6.99992C6.41675 7.32209 6.67791 7.58325 7.00008 7.58325H8.16675C8.48892 7.58325 8.75008 7.32209 8.75008 6.99992V1.74992H7.00008V0.583252H9.33341ZM4.08341 9.33325C3.43908 9.33325 2.91675 9.85557 2.91675 10.4999C2.91675 11.1443 3.43908 11.6666 4.08341 11.6666C4.72775 11.6666 5.25008 11.1443 5.25008 10.4999C5.25008 9.85557 4.72775 9.33325 4.08341 9.33325ZM11.0834 9.33267C10.4391 9.33267 9.91675 9.85499 9.91675 10.4993C9.91675 11.1437 10.4391 11.666 11.0834 11.666C11.7278 11.666 12.2501 11.1437 12.2501 10.4993C12.2501 10.3592 12.2253 10.2247 12.18 10.1002L12.1705 10.0749C12.0007 9.64044 11.578 9.33267 11.0834 9.33267ZM10.4143 5.24992H9.91675V6.99992C9.91675 7.96644 9.13327 8.74992 8.16675 8.74992H7.00008C6.03356 8.74992 5.25008 7.96644 5.25008 6.99992H2.33341V8.95654C2.76096 8.47214 3.38651 8.16658 4.08341 8.16658C5.17065 8.16658 6.08419 8.91022 6.34325 9.91658H8.82346C9.08229 8.90993 9.99596 8.166 11.0834 8.166C11.2215 8.166 11.3569 8.17802 11.4884 8.20106L10.4143 5.24992ZM5.25008 4.66658H2.33341V5.83325H5.25008V4.66658ZM11.6667 2.91659H9.91675V4.08325H11.6667V2.91659Z" fill="currentColor"/>
    </svg>
  );
  if (type === "truck") return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C10.8793 6.41666 10.9528 6.40249 11.0217 6.37495C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.62576 5.68559 2.6116 5.75912 2.6116 5.83333C2.6116 6.1555 2.87277 6.41666 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.55913 9.91666 8.51188 9.90482 8.46959 9.88219C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="currentColor"/>
    </svg>
  );
  // car (default)
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667ZM11.6667 10.5V7.58333H2.33333V10.5H11.6667ZM3.19493 6.41666H10.8051C10.8793 6.41666 10.9528 6.40249 11.0217 6.37495C11.3208 6.25531 11.4664 5.91581 11.3467 5.61668L10.5 3.49999H3.5L2.65333 5.61668C2.62576 5.68559 2.6116 5.75912 2.6116 5.83333C2.6116 6.1555 2.87277 6.41666 3.19493 6.41666ZM2.91667 8.16666C4.26809 8.16666 5.17923 8.60696 5.6501 9.4875C5.72605 9.62954 5.67244 9.80624 5.53041 9.88219C5.4881 9.90482 5.44087 9.91666 5.39289 9.91666H3.5C3.17784 9.91666 2.91667 9.6555 2.91667 9.33333V8.16666ZM11.0833 8.16666V9.33333C11.0833 9.6555 10.8222 9.91666 10.5 9.91666H8.60708C8.55913 9.91666 8.51188 9.90482 8.46959 9.88219C8.32755 9.80624 8.274 9.62954 8.34995 9.4875C8.82082 8.60696 9.73192 8.16666 11.0833 8.16666Z" fill="currentColor"/>
    </svg>
  );
}

// --- Sub-components ------------------------------------------------------
const VEH_CLS: Record<VehType, string> = { car:"veh-car", van:"veh-van", truck:"veh-truck", scooter:"veh-scooter" };

function VehicleChip({ type }: { type: VehType }) {
  return (
    <span className={`w-5 h-[14px] rounded-[3px] inline-flex items-center justify-center shrink-0 ${VEH_CLS[type]}`}>
      <VehicleTypeIcon type={type} className="w-3 h-3" />
    </span>
  );
}

function Avatar({ initials, avCls, avatar, size = 20 }: { initials: string; avCls: string; avatar?: string; size?: number }) {
  if (avatar) return (
    <img src={avatar} alt={initials} className="rounded-full shrink-0" style={{ width: size, height: size }} />
  );
  return (
    <span
      className={`rounded-full inline-flex items-center justify-center text-white font-medium shrink-0 avatar-${avCls.slice(1)}`}
      style={{ width: size, height: size, fontSize: size <= 20 ? "9px" : "11px", border: "1px solid rgba(0,0,0,0.04)" }}
    >
      {initials}
    </span>
  );
}

function SparkBars({ bars }: { bars: number[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div
      style={{ display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:"5px", alignItems:"end", height:"64px", padding:"0 2px" }}
      onMouseLeave={() => setHovered(null)}
    >
      {bars.map((h, i) => (
        <div key={i} style={{ position:"relative", height:`${h}%`, minHeight:"8px" }} onMouseEnter={() => setHovered(i)}>
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

function FuelDots({ pct }: { pct: number }) {
  const color = loadColor(pct);
  const filled = Math.round((pct / 100) * 8);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex gap-[3px] items-end">
        {Array.from({ length: 8 }, (_, i) => {
          const size = 3 + (i / 7) * 3;
          return (
            <span key={i} className="rounded-full shrink-0" style={{ width: size, height: size, background: i < filled ? color : "var(--dot-empty)" }} />
          );
        })}
      </span>
      <span className="text-[12px] font-medium" style={{ color }}>{pct}%</span>
    </span>
  );
}

function LoadBar({ pct }: { pct: number }) {
  const color = loadColor(pct);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 rounded-full overflow-hidden" style={{ minWidth:"90px", background:"var(--dot-empty)" }}>
        <span className="block h-full rounded-full" style={{ width:`${pct}%`, background:color }} />
      </span>
      <span className="text-[12px] font-medium" style={{ color }}>{pct}%</span>
    </span>
  );
}

function OverdueIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3 h-3">
      <path d="M7 1l6.5 11.3H.5L7 1z"/>
      <rect x="6.2" y="5" width="1.6" height="4" rx=".4" fill="white"/>
      <rect x="6.2" y="9.5" width="1.6" height="1.6" rx=".4" fill="white"/>
    </svg>
  );
}

function ServiceLabel({ service, cls }: { service: string; cls: "green" | "amber" | "red" }) {
  const color = cls === "green" ? "#037847" : cls === "amber" ? "#A15A00" : "#BB2422";
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color }}>
      {cls === "red" && <OverdueIcon />}
      {service}
    </span>
  );
}

// --- Filter dropdown -----------------------------------------------------
type FilterItem = { value: string; label: string; icon?: React.ReactNode };

function FilterDropdown({ icon, prefix, defaultLabel, value, items, onSelect, searchable = false, alignRight = false, btnStyle }: {
  icon: React.ReactNode;
  prefix?: string;
  defaultLabel?: string;
  value: string;
  items: FilterItem[];
  onSelect: (v: string) => void;
  searchable?: boolean;
  alignRight?: boolean;
  btnStyle?: React.CSSProperties;
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
        style={{ background:"var(--color-canvas)", ...btnStyle }}
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
        <div className={`absolute top-[calc(100%+6px)] z-30 bg-surface border border-ink-06 rounded-2xl p-2 shadow-[0_12px_32px_rgba(0,0,0,0.10)] min-w-[210px] max-h-[340px] overflow-auto ${alignRight ? "right-0" : "left-0"}`}>
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
              <span className="inline-flex items-center gap-2.5">
                {item.icon && <span className="inline-flex w-4 h-4">{item.icon}</span>}
                {item.label}
              </span>
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

// --- Filter item sets ----------------------------------------------------
const DATE_ITEMS: FilterItem[]   = [{ value:"Today", label:"Today" }, { value:"Yesterday", label:"Yesterday" }, { value:"This week", label:"This week" }, { value:"This month", label:"This month" }, { value:"Custom range", label:"Custom range" }];
const TYPE_ITEMS: FilterItem[]   = [{ value:"all", label:"All" }, { value:"Heavy truck", label:"Heavy truck" }, { value:"Delivery van", label:"Delivery van" }, { value:"Scooter", label:"Scooter" }, { value:"Sedan car", label:"Sedan car" }];
const REGION_ITEMS: FilterItem[] = [{ value:"all", label:"All regions" }, { value:"Lagos", label:"🇳🇬 Lagos" }, { value:"Abuja", label:"🇳🇬 Abuja" }, { value:"Port Harcourt", label:"🇳🇬 Port Harcourt" }, { value:"Kano", label:"🇳🇬 Kano" }, { value:"Ibadan", label:"🇳🇬 Ibadan" }, { value:"Kaduna", label:"🇳🇬 Kaduna" }, { value:"Accra", label:"🇬🇭 Accra" }, { value:"Nairobi", label:"🇰🇪 Nairobi" }];
const STATUS_ITEMS: FilterItem[] = [{ value:"all", label:"All" }, { value:"transit", label:"In transit" }, { value:"delayed", label:"Delayed" }, { value:"idle", label:"Idle" }];

// --- VehicleImage ---------------------------------------------------------
const TRUCK_IMGS = ["/icons/truuck.png", "/icons/Truck.png", "/icons/truuuck.png"];

function VehicleImage({ type, seed = 0 }: { type: VehType; seed?: number }) {
  const src =
    type === "car"     ? "/icons/Sedan.png" :
    type === "van"     ? "/icons/Van.png" :
    type === "scooter" ? "/icons/bike.png" :
    TRUCK_IMGS[seed % 3];

  return <img src={src} alt={type} style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />;
}

// --- KPI band -------------------------------------------------------------
function KpiBand() {
  return (
    <div className="fleet-status-kpi-band bg-surface border border-ink-06 rounded-xl p-[14px] grid grid-cols-4">
      {KPI_CELLS.map((k, i) => (
        <div key={k.title} className={`flex flex-col gap-3.5 pb-2 ${i > 0 ? "border-l pl-5" : ""} ${i < 3 ? "pr-5" : ""}`} style={{ borderLeftColor: "var(--ink-04)" }}>

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[-0.004em]">
              {k.icon}{k.title}
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

// --- Vehicle card ---------------------------------------------------------
function VehicleCard({ v }: { v: FleetVehicle }) {
  const sCls  = STATUS_CLS[v.status];
  const sLbl  = STATUS_LABEL[v.status];
  const strip = fuelColor(v.fuel);
  const svcColor = v.serviceCls === "green" ? "#037847" : v.serviceCls === "amber" ? "#A15A00" : "#BB2422";
  const truckSeed = parseInt(v.id.replace(/\D/g, ""), 10) || 0;

  return (
    <div className="bg-surface border border-ink-06 rounded-xl overflow-hidden flex flex-col" style={{ height:"354px" }}>
      {/* Header */}
      <div className="px-3.5 pt-3.5 pb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-medium tracking-[-0.008em]" style={{ color:"var(--ink)" }}>
          <VehicleTypeIcon type={v.vehType} />
          {v.id}
        </span>
        <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-medium tracking-[-0.004em] ${v.status === "upcoming" ? "text-ink-60" : sCls}`} style={{ width:64, height:24, ...(v.status === "upcoming" ? { background:"var(--surface)", border:"1px solid var(--ink-04)" } : {}) }}>{sLbl}</span>
      </div>

      {/* Image with more button overlaid */}
      <div className="relative" style={{ height: "160px", overflow: "hidden", background: "#F8F7F7", padding: "12px 20px" }}>
        <VehicleImage type={v.vehType} seed={truckSeed} />
        <button className="absolute right-2 top-2 z-10 rounded-lg inline-flex items-center justify-center cursor-pointer" style={{ width:30, height:30, borderRadius:8, background:"var(--surface-raised)", border:"1px solid var(--ink-06)" }}>
          <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5"><circle cx="7" cy="3" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="7" cy="11" r="1"/></svg>
        </button>
      </div>

      {/* Fuel strip */}
      <div style={{ height:"6px", background:"var(--track-bg)" }}>
        <span style={{ display:"block", height:"100%", width:`${v.fuel}%`, background:strip }} />
      </div>

      {/* Body */}
      <div className="px-3.5 pt-3.5 pb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium tracking-[-0.008em]">{v.driver}</span>
          <span className="inline-flex items-center gap-1 text-[12px] font-normal tracking-[-0.004em]">
            <span style={{ color:"#f66211" }}>{v.from}</span>
            <span className="text-ink-40">→</span>
            <span>{v.to}</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-ink-40 tracking-[-0.004em]">Fuel</span>
            <span className="text-sm font-medium tracking-[-0.008em]" style={{ color:fuelColor(v.fuel) }}>{v.fuel}%</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-ink-40 tracking-[-0.004em]">Load</span>
            <span className="text-sm font-medium tracking-[-0.008em]" style={{ color:fuelColor(v.load) }}>{v.load}%</span>
          </div>
          <div className="flex flex-col gap-1.5 items-end text-right">
            <span className="text-[11px] font-medium text-ink-40 tracking-[-0.004em]">Service</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium tracking-[-0.008em]" style={{ color:svcColor }}>
              {v.serviceCls === "red" && <OverdueIcon />}
              {v.service}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink-04 pt-2.5">
          <span className="text-[11px] font-medium text-ink-40 tracking-[-0.004em]">Last check in</span>
          <span className="text-[11px] font-medium tracking-[-0.004em]">{v.lastCheckIn}</span>
        </div>
      </div>
    </div>
  );
}

// --- Table view ------------------------------------------------------------
function TableView({ vehicles, fillerCount }: { vehicles: FleetVehicle[]; fillerCount: number }) {
  const DOT: Record<VehStatus, string> = { transit:"#0ab86d", delayed:"#fd514e", idle:"#ee9b32", upcoming:"#667085" };
  return (
    <div className="fleet-table-scroll">
      <table className="fleet-status-table w-full border-collapse">
        <thead>
          <tr>
            {(["Driver","Vehicle","Status","Route","Load","Last check in","Fuel","Service",""] as const).map((h,i) => {
              const minW = [175, 115, 105, 145, 95, 115, 80, 95, 40][i];
              return (
                <th key={i} className="text-left px-3 py-3.5 text-[11px] font-medium text-ink-40 tracking-[-0.004em] border-b border-ink-04 bg-canvas whitespace-nowrap first:pl-4" style={{ minWidth: minW }}>{h}</th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v, idx) => {
            const sCls = STATUS_CLS[v.status];
            const sLbl = STATUS_LABEL[v.status];
            return (
              <tr key={v.id} style={{ backgroundColor: idx % 2 === 0 ? "var(--surface)" : "var(--canvas)" }} className="hover:bg-canvas">
                <td className="pl-4 pr-3 py-3.5 border-b border-ink-04">
                  <span className="inline-flex items-center gap-2.5">
                    <Avatar initials={v.initials} avCls={v.avCls} avatar={v.avatar} size={28} />
                    <span className="text-[13px] font-medium tracking-[-0.004em]">{v.driver}</span>
                  </span>
                </td>
                <td className="px-3 py-3.5 border-b border-ink-04">
                  <span className="inline-flex items-center gap-1.5" style={{ color:"var(--ink-40)" }}>
                    <span className="inline-flex items-center justify-center shrink-0"><VehicleTypeIcon type={v.vehType} className="w-3.5 h-3.5" /></span>
                    <span className="text-[12px] font-medium">{v.id}</span>
                  </span>
                </td>
                <td className="px-3 py-3.5 border-b border-ink-04">
                  <span className={`inline-flex items-center px-2.5 h-5 rounded-full text-[11px] font-medium tracking-[-0.004em] ${sCls}`}>{sLbl}</span>
                </td>
                <td className="px-3 py-3.5 border-b border-ink-04">
                  <div className="flex flex-col gap-1 relative">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color:"var(--ink)" }}>
                      <span className="w-3 h-3 inline-flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: DOT[v.status] }} />
                      </span>
                      {v.from}
                    </span>
                    <svg width="1" viewBox="0 0 1 159" fill="none" preserveAspectRatio="none" style={{ position:"absolute", left:"5.5px", top:"12px", height:"calc(100% - 24px)", zIndex:0, transform:"rotate(-180deg)" }}>
                      <path d="M0.5 0V158.5" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="30 40"/>
                    </svg>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color:"var(--ink-40)" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink:0 }}>
                        <g clipPath="url(#loc-clip-fs)">
                          <path fillRule="evenodd" clipRule="evenodd" d="M6 1.00024C7.19347 1.00024 8.33807 1.47435 9.18198 2.31826C10.0259 3.16218 10.5 4.30677 10.5 5.50024C10.5 7.03724 9.662 8.29524 8.779 9.19774C8.33776 9.64369 7.85639 10.0481 7.341 10.4057L7.128 10.5507L7.028 10.6172L6.8395 10.7372L6.6715 10.8397L6.4635 10.9607C6.32225 11.0411 6.16252 11.0834 6 11.0834C5.83748 11.0834 5.67775 11.0411 5.5365 10.9607L5.3285 10.8397L5.0685 10.6797L4.9725 10.6172L4.7675 10.4807C4.21149 10.1044 3.69353 9.6747 3.221 9.19774C2.338 8.29474 1.5 7.03724 1.5 5.50024C1.5 4.30677 1.97411 3.16218 2.81802 2.31826C3.66193 1.47435 4.80653 1.00024 6 1.00024ZM6 2.00024C5.07174 2.00024 4.1815 2.36899 3.52513 3.02537C2.86875 3.68175 2.5 4.57199 2.5 5.50024C2.5 6.66124 3.136 7.68024 3.9355 8.49824C4.27931 8.84619 4.65087 9.16558 5.0465 9.45324L5.2755 9.61624C5.3495 9.66774 5.4205 9.71574 5.489 9.76024L5.684 9.88524L5.8555 9.98974L6 10.0742L6.2275 9.93974L6.411 9.82474C6.5085 9.76274 6.6135 9.69324 6.7245 9.61624L6.9535 9.45324C7.34913 9.16558 7.72069 8.84619 8.0645 8.49824C8.864 7.68074 9.5 6.66124 9.5 5.50024C9.5 4.57199 9.13125 3.68175 8.47487 3.02537C7.8185 2.36899 6.92826 2.00024 6 2.00024ZM6 3.50024C6.53043 3.50024 7.03914 3.71096 7.41421 4.08603C7.78929 4.4611 8 4.96981 8 5.50024C8 6.03068 7.78929 6.53939 7.41421 6.91446C7.03914 7.28953 6.53043 7.50024 6 7.50024C5.46957 7.50024 4.96086 7.28953 4.58579 6.91446C4.21071 6.53939 4 6.03068 4 5.50024C4 4.96981 4.21071 4.4611 4.58579 4.08603C4.96086 3.71096 5.46957 3.50024 6 3.50024ZM6 4.50024C5.73478 4.50024 5.48043 4.6056 5.29289 4.79314C5.10536 4.98067 5 5.23503 5 5.50024C5 5.76546 5.10536 6.01981 5.29289 6.20735C5.48043 6.39489 5.73478 6.50024 6 6.50024C6.26522 6.50024 6.51957 6.39489 6.70711 6.20735C6.89464 6.01981 7 5.76546 7 5.50024C7 5.23503 6.89464 4.98067 6.70711 4.79314C6.51957 4.6056 6.26522 4.50024 6 4.50024Z" fill="currentColor" fillOpacity="0.4"/>
                        </g>
                        <defs>
                          <clipPath id="loc-clip-fs"><rect width="12" height="12" fill="white"/></clipPath>
                        </defs>
                      </svg>
                      {v.to}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3.5 border-b border-ink-04"><LoadBar pct={v.load} /></td>
                <td className="px-3 py-3.5 border-b border-ink-04 text-[12px] font-medium whitespace-nowrap" style={{ color:"var(--ink-40)" }}>{v.lastCheckIn}</td>
                <td className="px-3 py-3.5 border-b border-ink-04"><FuelDots pct={v.fuel} /></td>
                <td className="px-3 py-3.5 border-b border-ink-04"><ServiceLabel service={v.service} cls={v.serviceCls} /></td>
                <td className="px-2 py-3.5 border-b border-ink-04">
                  <button className="w-7 h-7 rounded-lg inline-flex items-center justify-center hover:bg-canvas cursor-pointer">
                    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5"><circle cx="7" cy="3" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="7" cy="11" r="1"/></svg>
                  </button>
                </td>
              </tr>
            );
          })}
          {Array.from({ length: fillerCount }).map((_, i) => (
            <tr key={`filler-${i}`} className="border-b border-ink-04">
              {Array.from({ length: 9 }).map((__, j) => (
                <td key={j} className="px-3 py-3.5">&nbsp;</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Map popup ------------------------------------------------------------
function MapPopup({ v }: { v: FleetVehicle }) {
  const sCls = STATUS_CLS[v.status];
  const sLbl = STATUS_LABEL[v.status];
  const statusColor = v.status === "transit" ? "#037847" : v.status === "idle" ? "#A15A00" : v.status === "delayed" ? "#BB2422" : "#667085";
  const rows = [
    { k: "Driver",        val: v.driver,       color: undefined },
    { k: "Load",          val: `${v.load}%`,   color: loadColor(v.load) },
    { k: "Last check in", val: v.lastCheckIn,  color: undefined },
    { k: "Fuel",          val: `${v.fuel}%`,   color: loadColor(v.fuel) },
    { k: "Service",       val: v.service,      color: v.serviceCls === "green" ? "#037847" : v.serviceCls === "amber" ? "#A15A00" : "#BB2422" },
  ];
  return (
    <div className="bg-surface border border-ink-06 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)] pointer-events-none flex flex-col" style={{ width:229 }}>
      {/* Top section */}
      <div className="flex items-center justify-between shrink-0 px-3" style={{ height:50, background:"var(--canvas)" }}>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--ink-40)" }}>
          <VehicleTypeIcon type={v.vehType} className="w-3 h-3" />
          {v.id}
        </span>
        <span className={`inline-flex items-center px-2 h-4 rounded-full text-[10px] font-medium ${sCls}`}>{sLbl}</span>
      </div>
      {/* Separator */}
      <div style={{ height:1, background:"var(--ink-06)" }} />
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

// --- Map view -------------------------------------------------------------
function MapView({ vehicles }: { vehicles: FleetVehicle[] }) {
  const PIN_BG: Record<VehStatus, string> = { transit:"#0ab86d", delayed:"#fd514e", idle:"#ee9b32", upcoming:"#667085" };
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = hoveredId ?? selectedId;
  const panelRef = useRef<HTMLDivElement>(null);
  const [mapW, setMapW] = useState(745);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setMapW(Math.min(745, Math.max(560, Math.round(w * 0.65))));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={panelRef} className="fleet-map-panel overflow-hidden p-3 grid" style={{ gridTemplateColumns: `${mapW}px minmax(0,1fr)`, height:"768px" }}>
      <div className="map-bg-light relative overflow-hidden fleet-map-surface" style={{ borderRadius:12 }}>

        {vehicles.map(v => {
          const isActive = activeId === v.id;
          const lNum = parseFloat(v.mapPos.l);
          const tNum = parseFloat(v.mapPos.t);
          const showRight = lNum <= 55;
          const showBelow = tNum <= 50;
          const popupStyle: React.CSSProperties = {
            ...(showRight ? { left: "38px" } : { right: "38px" }),
            ...(showBelow ? { top: 0 } : { bottom: 0 }),
          };
          return (
            <div key={v.id} className="absolute" style={{ left:v.mapPos.l, top:v.mapPos.t, transform:"translate(-50%,-50%)", zIndex: isActive ? 20 : 10 }}
              onMouseEnter={() => setHoveredId(v.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedId(id => id === v.id ? null : v.id)}
            >
              <div style={{ width:30, height:30, borderRadius:"50%", background:PIN_BG[v.status], boxShadow:"0 8px 18px rgba(0,0,0,0.18)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transform: isActive ? "scale(1.15)" : "scale(1)", transition:"transform 0.1s" }}>
                <span style={{ color:"#fff", display:"inline-flex" }}>
                  <VehicleTypeIcon type={v.vehType} className="w-3.5 h-3.5" />
                </span>
              </div>
              {isActive && (
                <div className="fleet-hover-popup absolute z-30" style={popupStyle}>
                  <div className="relative">
                    <MapPopup v={v} />
                    {/* Arrow pointing toward the pin */}
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

        {/* Mobile tap popup (<768px) */}
        {(() => {
          const sel = vehicles.find(v => v.id === selectedId);
          if (!sel) return null;
          return (
            <div className="fleet-map-mobile-popup">
              <div className="mobile-map-popup-head">
                <span className="mobile-map-order">
                  <span className="mobile-popup-dot" style={{ background: PIN_BG[sel.status] }}>
                    <VehicleTypeIcon type={sel.vehType} className="w-[9px] h-[9px]" />
                  </span>
                  {sel.id}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className={`mobile-map-status ${STATUS_CLS[sel.status]}`}>{STATUS_LABEL[sel.status]}</span>
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
                <span>Driver</span><strong>{sel.driver}</strong>
                <span>Location</span><strong><em>{sel.from}</em> <span>→</span> {sel.to}</strong>
                <span>Last check in</span><strong>{sel.lastCheckIn}</strong>
                <span>Fuel</span><strong style={{ color: loadColor(sel.fuel) }}>{sel.fuel}%</strong>
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        <div className="absolute left-3.5 bottom-3.5 z-10 flex gap-1 bg-surface border border-ink-06 rounded-full px-2 py-1 text-[10px] font-medium tracking-[-0.004em] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          {[
            { label:"In transit", dot:"bg-green"     },
            { label:"Delayed",    dot:"bg-red"        },
            { label:"Idle",       dot:"bg-amber"      },
            { label:"Upcoming",   dot:"bg-[#667085]"  },
          ].map((l, i, arr) => (
            <span key={l.label} className="inline-flex items-center gap-[3px]">
              <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${l.dot}`} />
              {l.label}
              {i < arr.length - 1 && <span className="ml-0.5 text-ink-10">·</span>}
            </span>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="absolute right-3.5 bottom-3.5 z-10 flex flex-col gap-1.5">
          {["+","−"].map(l => (
            <span key={l} className="w-7 h-7 rounded-lg bg-surface border border-ink-06 inline-flex items-center justify-center cursor-pointer text-sm font-medium shadow-sm">{l}</span>
          ))}
        </div>
      </div>

      {/* Side list */}
      <div className="fleet-map-side-list border-l border-ink-04 overflow-y-auto pt-3.5 px-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth:"none" }}>
        <div className="text-sm font-medium tracking-[-0.008em] px-2 pb-3.5">Active vehicles</div>
        {vehicles.map(v => {
          const sCls = STATUS_CLS[v.status];
          const sLbl = STATUS_LABEL[v.status];
          return (
            <div key={v.id} onClick={() => setSelectedId(id => id === v.id ? null : v.id)} className={`bg-surface border flex flex-col mb-2.5 cursor-pointer hover:border-orange transition-colors overflow-hidden w-full ${selectedId === v.id ? "border-orange" : "border-ink-06"}`} style={{ height:158, borderRadius:12 }}>
              {/* Top section */}
              <div className="flex items-center justify-between shrink-0 w-full" style={{ height:50, padding:"0 12px", background:"var(--color-canvas)" }}>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: v.status === "transit" ? "#037847" : v.status === "idle" ? "#A15A00" : v.status === "delayed" ? "#BB2422" : "#667085" }}>
                  <VehicleTypeIcon type={v.vehType} className="w-3 h-3" />
                  {v.id}
                </span>
                <span className={`inline-flex items-center px-2 h-4 rounded-full text-[10px] font-medium ${sCls}`}>{sLbl}</span>
              </div>
              {/* Full-width separator */}
              <div style={{ height:1, background:"var(--ink-06)", width:"100%" }} />
              {/* Bottom section */}
              <div className="flex flex-col flex-1" style={{ paddingLeft:8, paddingRight:8, paddingBottom:14 }}>
                <div className="flex items-center justify-between text-[11px] font-medium" style={{ paddingTop:12, paddingBottom:14 }}>
                  <span className="text-ink-40">{v.driver}</span>
                  <span><span style={{ color:"#f66211" }}>{v.from}</span><span className="text-ink-40 mx-1">→</span>{v.to}</span>
                </div>
                <div style={{ height:1, background:"var(--ink-06)" }} />
                <div className="flex items-start justify-between" style={{ paddingTop:14, paddingBottom:8 }}>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[11px] font-medium text-ink-40">Fuel</span>
                    <span className="text-[11px] font-medium" style={{ color:loadColor(v.fuel) }}>{v.fuel}%</span>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[11px] font-medium text-ink-40">Load</span>
                    <span className="text-[11px] font-medium" style={{ color:loadColor(v.load) }}>{v.load}%</span>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[11px] font-medium text-ink-40">Service</span>
                    <span className="text-[11px] font-medium" style={{ color: v.serviceCls === "green" ? "#037847" : v.serviceCls === "amber" ? "#A15A00" : "#BB2422" }}>{v.service}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[11px] font-medium text-ink-40">Last check in</span>
                    <span className="text-[11px] font-medium">{v.lastCheckIn}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Main export ----------------------------------------------------------
export default function FleetStatusContent() {
  const [view,         setView]         = useState<ViewMode>("cards");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [dateFilter,   setDateFilter]   = useState("Today");
  const [search,       setSearch]       = useState("");
  const [cardPage,     setCardPage]     = useState(1);
  const [tablePage,    setTablePage]    = useState(1);
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const filterWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    const h = (e: MouseEvent) => {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target as Node)) setFiltersOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [filtersOpen]);

  const activeFilterCount =
    [statusFilter, typeFilter, regionFilter].filter(v => v !== "all").length +
    (dateFilter !== "Today" ? 1 : 0);

  const filtered = VEHICLES.filter(v => {
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (typeFilter   !== "all" && v.vehicleType !== typeFilter) return false;
    if (regionFilter !== "all" && v.region !== regionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${v.id} ${v.driver} ${v.from} ${v.to} ${v.region}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const clearFilters = () => { setStatusFilter("all"); setTypeFilter("all"); setRegionFilter("all"); setSearch(""); setCardPage(1); setTablePage(1); };

  const CARDS_PER_PAGE = 6;
  const totalCardPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const pagedCards = filtered.slice((cardPage - 1) * CARDS_PER_PAGE, cardPage * CARDS_PER_PAGE);

  const TABLE_ROWS_PER_PAGE = 10;
  const totalTablePages = Math.max(1, Math.ceil(filtered.length / TABLE_ROWS_PER_PAGE));
  const pagedVehicles = filtered.slice((tablePage - 1) * TABLE_ROWS_PER_PAGE, tablePage * TABLE_ROWS_PER_PAGE);

  function getPageNumbers(current: number, total: number): (number | "…")[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, "…", total];
    if (current >= total - 2) return [1, "…", total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
  }

  return (
    <div className="fleet-status-shell flex-1 flex flex-col bg-canvas">
      <Topbar crumb="Fleet status" />
      <div className="p-4 flex flex-col gap-4">

        {/* Row head */}
        <div className="page-head flex items-end justify-between gap-6">
          <div>
            <h1 className="m-0 text-[18px] font-medium leading-none tracking-[-0.008em]">You have 64 vehicles across 4 zones</h1>
            <div className="op-ai-banner mt-3 inline-flex items-center gap-1.5 rounded-[6px] px-1.5 py-[3px] text-orange-deep text-xs font-normal leading-none tracking-[-0.008em]" style={{ background:"rgba(255,146,86,0.20)" }}>
              <img src="/icons/op-ai.svg" alt="" className="w-3.5 h-3.5 icon-adaptive" />
              <b className="font-semibold tracking-[-0.016em]">Op AI:</b>
              <span>TRK-008 is overdue for service by 2 days and TRK-029 needs an oil change within 3 days, dispatching either risks a breakdown.</span>
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

        {/* KPI band */}
        <KpiBand />

        {/* Filter row + views container */}
        <div className="bg-surface border border-ink-06 rounded-xl flex flex-col overflow-hidden">

          {/* Filter row */}
          <div className="fleet-filter-row flex items-center gap-2.5 px-4 py-3 border-b border-ink-06" style={{ position:"relative", zIndex:20 }}>
            {/* Search */}
            <div className="flex items-center gap-2 border border-ink-06 px-3.5 shrink-0" style={{ width:"160px", height:"38px", borderRadius:"12px", background:"var(--search-bg)" }}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5 text-ink-30 shrink-0"><circle cx="6" cy="6" r="4.5"/><path d="M10 10l3 3"/></svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setTablePage(1); }} placeholder="Search vehicle, driver, plate, zone" className="border-none outline-none bg-transparent text-[12px] font-medium text-ink placeholder:text-ink-40 flex-1 min-w-0" />
            </div>

            {/* Single "Filter" toggle — shown ≤1023px only */}
            <div ref={filterWrapRef} className="filter-collapse">
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className={`filter-toggle-btn h-[38px] px-3.5 items-center gap-1.5 border rounded-[12px] text-[12px] font-medium tracking-[-0.004em] cursor-pointer select-none ${filtersOpen ? "border-orange" : "border-ink-06"}`}
              style={{ background:"var(--color-canvas)" }}
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
              icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="2.5" width="11" height="10" rx="1"/><path d="M1.5 5h11M4 1.2v2.4M10 1.2v2.4"/></svg>}
              value={dateFilter} items={DATE_ITEMS} onSelect={setDateFilter}
            />

            <FilterDropdown
              icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="5" width="9" height="6" rx="1"/><path d="M10 7h2.5L13 9.5V11h-5"/><circle cx="4" cy="12" r="1.1"/><circle cx="11" cy="12" r="1.1"/></svg>}
              defaultLabel="Type" value={typeFilter} items={TYPE_ITEMS} onSelect={v => { setTypeFilter(v); setTablePage(1); }}
            />

            <FilterDropdown
              icon={<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 1c2.5 0 4.5 2 4.5 4.5C11.5 9 7 13 7 13S2.5 9 2.5 5.5C2.5 3 4.5 1 7 1z"/><circle cx="7" cy="5.5" r="1.7"/></svg>}
              defaultLabel="Region" value={regionFilter} items={REGION_ITEMS} onSelect={v => { setRegionFilter(v); setTablePage(1); }}
              searchable alignRight
            />

            <FilterDropdown
              icon={<img src="/icons/status-filter.svg" alt="" className="w-3.5 h-3.5 icon-adaptive" />}
              prefix="Status: " value={statusFilter} items={STATUS_ITEMS} onSelect={v => { setStatusFilter(v); setTablePage(1); }}
              alignRight
            />
            </div>
            </div>

            {/* View switcher */}
            <div className="view-switcher ml-auto flex items-center bg-canvas border border-ink-06 rounded-[10px] p-[3px] gap-0.5">
              {([
                { key:"table" as ViewMode, label:"Table", icon: (
                  <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path d="M4.58374 8.83325V12.1663H2.33374C1.89171 12.1663 1.46759 11.9905 1.15503 11.678C0.842647 11.3655 0.666834 10.9421 0.666748 10.5002V8.83325H4.58374ZM9.24976 8.83325V12.1663H4.74976V8.83325H9.24976ZM13.3337 8.83325V10.5002C13.3337 10.942 13.1577 11.3655 12.8455 11.678C12.5329 11.9905 12.1088 12.1663 11.6667 12.1663H9.41675V8.83325H13.3337ZM4.58374 5.33325V8.66626H0.666748V5.33325H4.58374ZM9.24976 5.33325V8.66626H4.74976V5.33325H9.24976ZM13.3337 5.33325V8.66626H9.41675V5.33325H13.3337ZM4.58374 1.83325V5.16626H0.666748V3.50024L0.674561 3.33521C0.712434 2.95365 0.881527 2.59504 1.15503 2.32153C1.46759 2.00897 1.89171 1.83325 2.33374 1.83325H4.58374ZM9.24976 1.83325V5.16626H4.74976V1.83325H9.24976ZM11.6667 1.83325C12.1088 1.83325 12.5329 2.00897 12.8455 2.32153C13.1579 2.63408 13.3337 3.05829 13.3337 3.50024V5.16626H9.41675V1.83325H11.6667Z" stroke="currentColor"/></svg>
                )},
                { key:"cards" as ViewMode, label:"Cards", icon: (
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M3.05333 2.03133C2.56467 2.12467 2.12 2.57867 2.02867 3.078C2.01 3.18267 2 3.92867 2 5.28467V7.33333H7.33333V2L5.26 2.00267C4.07333 2.00467 3.13 2.01667 3.05333 2.03133ZM8.66667 4.66667V7.33333H14V5.28467C14 3.92867 13.99 3.18267 13.9713 3.078C13.8773 2.566 13.434 2.12267 12.922 2.02867C12.8173 2.01 12.0713 2 10.7153 2H8.66667V4.66667ZM2 10.7153C2 12.0713 2.01 12.8173 2.02867 12.922C2.12267 13.434 2.566 13.8773 3.078 13.9713C3.18267 13.99 3.92867 14 5.28467 14H7.33333V8.66667H2V10.7153ZM8.66667 11.3333V14H10.7153C12.0713 14 12.8173 13.99 12.922 13.9713C13.1814 13.9212 13.419 13.7925 13.6027 13.6027C13.7925 13.419 13.9212 13.1814 13.9713 12.922C13.99 12.8173 14 12.0713 14 10.7153V8.66667H8.66667V11.3333Z" fill="currentColor"/></svg>
                )},
                { key:"map" as ViewMode, label:"Map", icon: (
                  <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M9.15152 1.10182C9.04485 1.04849 8.92235 1.03765 8.80818 1.07182L5.25 2.18765L1.84818 1.10182C1.49485 0.987653 1.16668 1.25265 1.16668 1.61682V11.0835C1.16668 11.3302 1.32418 11.5485 1.55818 11.6252L5.05818 12.7585C5.18485 12.7994 5.31518 12.7994 5.44185 12.7585L8.75002 11.7027L12.1518 12.8977C12.5052 13.0119 12.8333 12.7469 12.8333 12.3827V2.91602C12.8333 2.66935 12.6758 2.45102 12.4418 2.37435L9.15152 1.10182ZM8.16668 2.46932V10.6318L5.83335 11.3652V3.20268L8.16668 2.46932ZM4.66668 3.35602V11.4068L2.33335 10.6735V2.62268L4.66668 3.35602ZM9.33335 10.5277V2.53435L11.6667 3.42185V11.4127L9.33335 10.5277Z" fill="currentColor"/></svg>
                )},
              ]).map(opt => (
                <button key={opt.key} onClick={() => setView(opt.key)} title={opt.label} className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12px] font-medium tracking-[-0.004em] cursor-pointer ${view === opt.key ? "bg-orange text-white" : "text-ink-40 hover:bg-canvas"}`}>
                  {opt.icon}
                  <span className="view-switch-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 text-ink-30"><circle cx="21" cy="21" r="14"/><path d="M31 31l10 10"/></svg>
              <div className="text-base font-medium tracking-[-0.008em] mt-1.5">No vehicles match these filters</div>
              <div className="text-[13px] text-ink-40">Try clearing a filter or searching something else</div>
              <button onClick={clearFilters} className="btn mt-2">Clear all filters</button>
            </div>
          )}

          {/* Cards view */}
          {filtered.length > 0 && view === "cards" && (
            <div className="flex flex-col px-4 pb-4 pt-5" style={{ gap:24 }}>
              <div className="fleet-cards-grid grid gap-4 grid-cols-3" style={{ minHeight:"724px", alignContent:"start" }}>
                {pagedCards.map(v => <VehicleCard key={v.id} v={v} />)}
              </div>

              {/* Pagination row */}
              <div className="pagination-row flex items-center justify-between">
                <span className="text-[12px] font-medium pl-3" style={{ color:"var(--ink)" }}>
                  Showing {(cardPage - 1) * CARDS_PER_PAGE + 1}–{Math.min(cardPage * CARDS_PER_PAGE, filtered.length)} of {filtered.length} entries
                </span>
                <div className="flex items-center gap-1.5">
                  {/* First */}
                  <button onClick={() => setCardPage(1)} disabled={cardPage === 1} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>«</button>
                  {/* Prev */}
                  <button onClick={() => setCardPage(p => Math.max(1, p - 1))} disabled={cardPage === 1} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>‹</button>
                  {/* Pages */}
                  {getPageNumbers(cardPage, totalCardPages).map((p, i) =>
                    p === "…"
                      ? <span key={`e${i}`} className="inline-flex items-center justify-center text-[12px]" style={{ width:32, height:32, color:"var(--ink-40)" }}>…</span>
                      : <button key={p} onClick={() => setCardPage(p as number)} className="inline-flex items-center justify-center text-[12px] font-normal cursor-pointer" style={{ width:32, height:32, borderRadius:8, background: cardPage === p ? "#FF9256" : "var(--surface)", color: cardPage === p ? "#ffffff" : "var(--ink)", border:`1px solid var(--ink-04)` }}>{p}</button>
                  )}
                  {/* Next */}
                  <button onClick={() => setCardPage(p => Math.min(totalCardPages, p + 1))} disabled={cardPage === totalCardPages} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>›</button>
                  {/* Last */}
                  <button onClick={() => setCardPage(totalCardPages)} disabled={cardPage === totalCardPages} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>»</button>
                </div>
              </div>
            </div>
          )}

          {/* Table view */}
          {filtered.length > 0 && view === "table" && (
            <>
              <TableView vehicles={pagedVehicles} fillerCount={TABLE_ROWS_PER_PAGE - pagedVehicles.length} />
              <div className="pagination-row flex items-center justify-between px-3 py-3 border-t border-ink-04">
                <span className="text-[12px] font-medium pl-3" style={{ color:"var(--ink)" }}>
                  Showing {Math.min((tablePage - 1) * TABLE_ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(tablePage * TABLE_ROWS_PER_PAGE, filtered.length)} of {filtered.length} entries
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setTablePage(1)} disabled={tablePage === 1} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>«</button>
                  <button onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>‹</button>
                  {getPageNumbers(tablePage, totalTablePages).map((p, i) =>
                    p === "…"
                      ? <span key={`e${i}`} className="inline-flex items-center justify-center text-[12px]" style={{ width:32, height:32, color:"var(--ink-40)" }}>…</span>
                      : <button key={p} onClick={() => setTablePage(p as number)} className="inline-flex items-center justify-center text-[12px] font-normal cursor-pointer" style={{ width:32, height:32, borderRadius:8, background: tablePage === p ? "#FF9256" : "var(--surface)", color: tablePage === p ? "#ffffff" : "var(--ink)", border:"1px solid var(--ink-04)" }}>{p}</button>
                  )}
                  <button onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))} disabled={tablePage === totalTablePages} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>›</button>
                  <button onClick={() => setTablePage(totalTablePages)} disabled={tablePage === totalTablePages} className="inline-flex items-center justify-center text-[12px] font-medium cursor-pointer disabled:opacity-40" style={{ width:32, height:32, borderRadius:8, background:"var(--surface)", border:"1px solid var(--ink-04)" }}>»</button>
                </div>
              </div>
            </>
          )}

          {/* Map view */}
          {filtered.length > 0 && view === "map" && <MapView vehicles={filtered} />}

        </div>

      </div>
    </div>
  );
}
