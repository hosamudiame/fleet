export type VehicleIcon = "car" | "van" | "scooter";
export type Status = "transit" | "delayed" | "idle" | "delivered" | "upcoming" | "cancelled";

export type VehicleType = "Sedan car" | "Delivery van" | "Heavy truck" | "Scooter";
export type Region = "Lagos" | "Abuja" | "Port Harcourt" | "Kano" | "Ibadan" | "Kaduna";

export type ShipmentRow = {
  id: string;
  vehIcon: VehicleIcon;
  veh: string;
  av: string;
  avCls: string;
  avatar: string;
  driver: string;
  from: string;
  to: string;
  eta: string;
  status: Status;
  dotStyle?: { from: string; to: string };
  mapPos: { l: string; t: string };
  load: string;
  fuel: string;
  lastCheckIn: string;
  service: string;
  region: Region;
  vehicleType: VehicleType;
};

export const ROWS: ShipmentRow[] = [
  { id: "#NDI-9318", vehIcon: "car",     veh: "CAR-041", av: "NE", avCls: "",   avatar: "/icons/ngozi.svg",  driver: "Ngozi Eze",     from: "Oshodi",  to: "Ikeja",    eta: "Today, 10:15am", status: "transit",   dotStyle: undefined,                          mapPos: { l: "34%", t: "54%" }, load: "72%",  fuel: "91%",  lastCheckIn: "4 mins ago",  service: "In 5 days",  region: "Lagos",         vehicleType: "Sedan car"    },
  { id: "#NDI-9319", vehIcon: "van",     veh: "VAN-007", av: "EO", avCls: "a4", avatar: "/icons/emeka.svg",  driver: "Emeka Okeke",   from: "Ikorodu", to: "VI",       eta: "Today, 11:30am", status: "transit",   dotStyle: undefined,                          mapPos: { l: "18%", t: "34%" }, load: "89%",  fuel: "78%",  lastCheckIn: "8 mins ago",  service: "In 2 days",  region: "Lagos",         vehicleType: "Delivery van" },
  { id: "#NDI-9320", vehIcon: "van",     veh: "TRK-055", av: "FB", avCls: "a3", avatar: "",                  driver: "Fatima Bello",  from: "Yaba",    to: "Surulere", eta: "Today, 01:00pm", status: "delayed",   dotStyle: undefined,                          mapPos: { l: "42%", t: "22%" }, load: "65%",  fuel: "55%",  lastCheckIn: "12 mins ago", service: "In 7 days",  region: "Lagos",         vehicleType: "Heavy truck"  },
  { id: "#NDI-9321", vehIcon: "scooter", veh: "SCT-014", av: "SA", avCls: "a2", avatar: "/icons/segun.svg",  driver: "Segun Adebayo", from: "Tin Can", to: "Ajah",     eta: "Today, 12:45pm", status: "idle",      dotStyle: undefined,                          mapPos: { l: "23%", t: "62%" }, load: "40%",  fuel: "83%",  lastCheckIn: "2 mins ago",  service: "In 14 days", region: "Lagos",         vehicleType: "Scooter"      },
  { id: "#NDI-9322", vehIcon: "van",     veh: "TRK-017", av: "AM", avCls: "a5", avatar: "",                  driver: "Aisha Musa",    from: "Apapa",   to: "Lekki",    eta: "Today, 03:20pm", status: "delivered", dotStyle: { from: "#f66211", to: "#f66211" }, mapPos: { l: "60%", t: "30%" }, load: "100%", fuel: "62%",  lastCheckIn: "1 min ago",   service: "Overdue",    region: "Lagos",         vehicleType: "Heavy truck"  },
  { id: "#NDI-9323", vehIcon: "van",     veh: "TRK-029", av: "CO", avCls: "a4", avatar: "/icons/chidi.svg",  driver: "Chidi Okoro",   from: "Kano",    to: "Zaria",    eta: "09 Mar, 2026",   status: "upcoming",  dotStyle: { from: "#667085", to: "#667085" }, mapPos: { l: "78%", t: "64%" }, load: "0%",   fuel: "100%", lastCheckIn: "N/A",         service: "In 11 days", region: "Kano",          vehicleType: "Heavy truck"  },
  { id: "#NDI-9324", vehIcon: "van",     veh: "VAN-012", av: "AN", avCls: "a6", avatar: "",                  driver: "Adaeze Nnamdi", from: "PH",      to: "Aba",      eta: "10 Mar, 2026",   status: "cancelled", dotStyle: { from: "#667085", to: "#667085" }, mapPos: { l: "53%", t: "60%" }, load: "0%",   fuel: "88%",  lastCheckIn: "N/A",         service: "In 8 days",  region: "Port Harcourt", vehicleType: "Delivery van" },
];

export const STATUS_COLOR: Record<Status, string> = {
  transit:   "#0ab86d",
  delayed:   "#fd514e",
  idle:      "#ee9b32",
  delivered: "#0ab86d",
  upcoming:  "#667085",
  cancelled: "#fd514e",
};

export const STATUS_LABEL: Record<Status, string> = {
  transit:   "In transit",
  delayed:   "Delayed",
  idle:      "Idle",
  delivered: "Delivered",
  upcoming:  "Upcoming",
  cancelled: "Cancelled",
};

export const STATUS_CLS: Record<Status, string> = {
  transit:   "bg-green-soft text-green-deep",
  delayed:   "bg-red-soft text-red-deep",
  idle:      "bg-amber-soft text-amber-deep",
  delivered: "bg-green-soft text-green-deep",
  upcoming:  "bg-ink-04 text-ink-60",
  cancelled: "bg-red-soft text-red-deep",
};
