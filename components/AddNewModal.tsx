"use client";

import { useState, useEffect, useRef } from "react";

type Screen =
  | "add-new"
  | "new-shipment"
  | "add-vehicle"
  | "upload"
  | "upload-extracting"
  | "upload-review";

/* -- Shared primitives ----------------------------------- */
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

const BackBtn = ({ onBack }: { onBack: () => void }) => (
  <button
    onClick={onBack}
    className="w-8 h-8 rounded-full bg-surface border border-ink-04 inline-flex items-center justify-center cursor-pointer shrink-0 hover:bg-canvas"
  >
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
      <path d="M9 3L5 7l4 4"/>
    </svg>
  </button>
);

const ModalHead = ({
  title, sub, onClose, onBack,
}: { title: string; sub?: string; onClose: () => void; onBack?: () => void }) => (
  <div className="modal-head px-4 pt-6 pb-5 flex items-start justify-between gap-3 border-b border-ink-04 shrink-0">
    <div className="flex items-center gap-2 min-w-0">
      {onBack && <BackBtn onBack={onBack} />}
      <div className="flex flex-col gap-1.5 min-w-0">
        <h2 className="m-0 text-[18px] font-medium leading-none tracking-[-0.002em]">{title}</h2>
        {sub && <span className="text-sm font-normal leading-none tracking-[-0.004em] text-ink-40">{sub}</span>}
      </div>
    </div>
    <XBtn onClose={onClose} />
  </div>
);

const MBtn = ({
  children, primary, onClick, type = "button",
}: { children: React.ReactNode; primary?: boolean; onClick?: () => void; type?: "button" | "submit" }) => (
  <button
    type={type}
    onClick={onClick}
    className={[
      "h-11 rounded-xl border text-sm font-medium tracking-[-0.008em] cursor-pointer inline-flex items-center justify-center gap-2",
      primary
        ? "bg-orange text-white border-black/[0.06] hover:bg-[#ff8344]"
        : "bg-surface border-ink-04 text-ink hover:bg-canvas",
    ].join(" ")}
  >
    {children}
  </button>
);

const Field = ({
  label, req, children,
}: { label: string; req?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium tracking-[-0.008em]">
      {label}{req && <span className="text-ink"> *</span>}
    </label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="h-11 border border-ink-06 rounded-xl bg-canvas px-3.5 text-sm font-normal tracking-[-0.004em] text-ink outline-none placeholder:text-ink-40 focus:border-orange focus:bg-surface"
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="border border-ink-06 rounded-xl bg-canvas p-3.5 text-sm font-normal tracking-[-0.004em] text-ink outline-none placeholder:text-ink-40 focus:border-orange focus:bg-surface min-h-24 resize-y"
  />
);

const SelectBox = ({ placeholder }: { placeholder: string }) => (
  <div className="h-11 border border-ink-06 rounded-xl bg-canvas flex items-center justify-between px-3.5 text-sm font-normal tracking-[-0.004em] text-ink-40 cursor-pointer hover:border-orange">
    <span>{placeholder}</span>
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5 text-ink shrink-0">
      <path d="M3 5l4 4 4-4"/>
    </svg>
  </div>
);

const BulkBanner = ({ title, sub, onUpload }: { title: string; sub: string; onUpload: () => void }) => (
  <div className="bulk-banner flex items-center gap-3.5 p-3.5 border border-[rgba(255,146,86,0.2)] bg-[rgba(255,146,86,0.06)] rounded-[14px]">
    <span className="w-[42px] h-[42px] rounded-[10px] bg-surface inline-flex items-center justify-center shrink-0">
      <img src="/icons/document-filled.svg" alt="" className="w-[22px] h-[22px]" />
    </span>
    <div className="flex-1 flex flex-col gap-1">
      <span className="text-sm font-medium tracking-[-0.008em]">{title}</span>
      <span className="text-[13px] font-normal tracking-[-0.004em] text-ink-40">{sub}</span>
    </div>
    <button
      onClick={onUpload}
      className="group inline-flex items-center gap-1.5 bg-surface text-orange border border-orange rounded-xl px-3.5 py-2.5 text-sm font-medium tracking-[-0.008em] cursor-pointer hover:bg-orange hover:text-white"
    >
      <img src="/icons/file-upload-filled.svg" alt="" className="w-3.5 h-3.5 group-hover:brightness-0 group-hover:invert" />
      Bulk Upload
    </button>
  </div>
);

const SaveAnother = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className="inline-flex items-center gap-2.5 text-sm font-medium tracking-[-0.008em] cursor-pointer"
  >
    <span className={["w-[18px] h-[18px] rounded-[5px] inline-flex items-center justify-center shrink-0",
      checked ? "bg-orange" : "bg-surface border border-ink-10"].join(" ")}>
      {checked && <svg viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="2" className="w-[11px] h-[11px]"><path d="M2 5.5l2.5 2.5L9 3"/></svg>}
    </span>
    Save and add another
  </button>
);

/* -- Screens --------------------------------------------- */
function PickerScreen({ onSelect }: { onSelect: (s: Screen) => void }) {
  return (
    <div className="modal-body px-4 py-6 overflow-auto flex flex-col gap-5">
      <div className="modal-grid-2 grid grid-cols-2 gap-4">
        {[
          {
            id: "new-shipment" as Screen,
            icon: (
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
                <path d="M9 1.5L15.5 5 9 8.5 2.5 5z"/><path d="M2.5 5v8L9 16.5 15.5 13V5"/><path d="M9 8.5v8"/>
              </svg>
            ),
            title: "Shipment",
            desc: "Create a new delivery with origin, destination, and cargo details",
          },
          {
            id: "add-vehicle" as Screen,
            icon: (
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
                <path d="M2 12V8l1.6-4h9.4L15 8v4"/><path d="M2 12h13v2H2z"/>
                <circle cx="5" cy="14.5" r="1.2" fill="currentColor"/><circle cx="12" cy="14.5" r="1.2" fill="currentColor"/>
              </svg>
            ),
            title: "Vehicle",
            desc: "Register a new truck, van, car or scooter to your fleet",
          },
        ].map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="border border-ink-06 rounded-2xl p-[18px] cursor-pointer flex flex-col gap-3.5 hover:border-orange hover:bg-[#fffaf6] transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-orange inline-flex items-center justify-center text-white shrink-0">
              {c.icon}
            </span>
            <h3 className="m-0 text-base font-medium tracking-[-0.008em]">{c.title}</h3>
            <p className="m-0 text-[13px] font-normal tracking-[-0.004em] text-ink-40 leading-snug">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewShipmentScreen({ onUpload, onClose, onSuccess }: { onUpload: () => void; onClose: () => void; onSuccess: () => void }) {
  const [saveAnother, setSaveAnother] = useState(false);
  return (
    <>
      <div className="modal-body px-4 py-6 overflow-auto flex flex-col gap-5 flex-1">
        <BulkBanner
          title="Got a manifest or list?"
          sub="Upload a CSV to add multiple shipments at once"
          onUpload={onUpload}
        />
        <div className="modal-grid-2 grid grid-cols-2 gap-x-5 gap-y-4">
          <Field label="Reference ID"><Input placeholder="NDI-O93 (Auto generated)" /></Field>
          <Field label="Cargo type" req><SelectBox placeholder="Select cargo" /></Field>
          <Field label="Origin" req><Input placeholder="Select origin" /></Field>
          <Field label="Destination" req><Input placeholder="Select destination" /></Field>
          <Field label="Pickup date" req><Input placeholder="DD/MM/YY" /></Field>
          <Field label="Weight (kg)" req><Input placeholder="Enter weight" /></Field>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4">
          <Field label="Assign driver" req><SelectBox placeholder="Select driver" /></Field>
          <Field label="Notes"><Textarea placeholder="Any special handling instructions" /></Field>
        </div>
        <SaveAnother checked={saveAnother} onToggle={() => setSaveAnother(!saveAnother)} />
      </div>
      <div className="modal-foot border-t border-ink-04 p-[14px_16px] grid grid-cols-2 gap-3 shrink-0">
        <MBtn onClick={onClose}>Cancel</MBtn>
        <MBtn primary onClick={onSuccess}>Create shipment</MBtn>
      </div>
    </>
  );
}

function AddVehicleScreen({ onUpload, onClose, onSuccess }: { onUpload: () => void; onClose: () => void; onSuccess: () => void }) {
  const [saveAnother, setSaveAnother] = useState(false);
  return (
    <>
      <div className="modal-body px-4 py-6 overflow-auto flex flex-col gap-5 flex-1">
        <BulkBanner
          title="Have the registration document?"
          sub="Upload PDF or photo to auto-fill most fields"
          onUpload={onUpload}
        />
        <div className="modal-grid-2 grid grid-cols-2 gap-x-5 gap-y-4">
          <Field label="Vehicle ID" req><Input placeholder="e.g. TRK-069 (Auto generated)" /></Field>
          <Field label="Vehicle type" req><SelectBox placeholder="Select type" /></Field>
          <Field label="Plate number" req><Input placeholder="e.g. LAG-234-XY" /></Field>
          <Field label="Make & model"><Input placeholder="e.g. Mercedes Actros" /></Field>
          <Field label="Year"><Input placeholder="e.g. 2022" /></Field>
          <Field label="Capacity (kg)" req><Input placeholder="e.g. 8000" /></Field>
          <Field label="Home depot" req><SelectBox placeholder="Select depot" /></Field>
          <Field label="Initial driver"><SelectBox placeholder="Select driver" /></Field>
        </div>
        <SaveAnother checked={saveAnother} onToggle={() => setSaveAnother(!saveAnother)} />
      </div>
      <div className="modal-foot border-t border-ink-04 p-[14px_16px] grid grid-cols-2 gap-3 shrink-0">
        <MBtn onClick={onClose}>Cancel</MBtn>
        <MBtn primary onClick={onSuccess}>Create vehicle</MBtn>
      </div>
    </>
  );
}

function UploadScreen({ onNext, onClose }: { onNext: () => void; onClose: () => void }) {
  return (
    <>
      <div className="modal-body px-4 py-6 overflow-auto flex flex-col gap-5 flex-1">
        <div className="border border-dashed border-ink-10 rounded-2xl bg-canvas py-12 px-6 flex flex-col items-center gap-3.5 text-center">
          <span className="w-16 h-16 rounded-full bg-[rgba(255,146,86,0.08)] inline-flex items-center justify-center">
            <img src="/icons/upload-filled.svg" alt="" className="w-[32px] h-[32px]" />
          </span>
          <h3 className="m-0 text-[18px] font-medium tracking-[-0.008em] leading-snug">Drag and drop registration documents here</h3>
          <p className="m-0 text-sm font-normal tracking-[-0.004em] text-ink-40">PDF or photo · Multiple uploads allowed</p>
          <button
            onClick={onNext}
            className="mt-1.5 bg-orange text-white border-none rounded-full px-6 py-3 text-sm font-medium tracking-[-0.008em] cursor-pointer hover:bg-[#ff8344]"
          >
            Add file
          </button>
        </div>
      </div>
      <div className="modal-foot border-t border-ink-04 p-[14px_16px] grid grid-cols-1 gap-3 shrink-0">
        <MBtn onClick={onClose}>Cancel</MBtn>
      </div>
    </>
  );
}

const FILE_LIST = [
  { name: "Cargo_Manifest.pdf",   size: "1.2 mb", pct: 44, isPdf: true  },
  { name: "Truck_photo.png",      size: "1.5 mb", pct: 68, isPdf: false },
  { name: "Warehouse_photo.png",  size: "1.1 mb", pct: 44, isPdf: false },
  { name: "Delivery_Order.pdf",   size: "1.3 mb", pct: 68, isPdf: true  },
];

function UploadExtractingScreen({ onNext, onClose }: { onNext: () => void; onClose: () => void }) {
  const [pcts, setPcts] = useState(FILE_LIST.map((f) => f.pct));

  useEffect(() => {
    const id = setInterval(() => {
      setPcts((prev) => {
        const next = prev.map((p) => Math.min(p + 4, 100));
        if (next.every((p) => p === 100)) clearInterval(id);
        return next;
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  const allDone = pcts.every((p) => p === 100);

  return (
    <>
      <div className="modal-body px-4 py-6 overflow-auto flex flex-col gap-5 flex-1">
        <div className="border border-dashed border-ink-10 rounded-2xl bg-canvas py-14 px-6 flex flex-col items-center gap-2.5">
          {allDone ? (
            <span className="w-8 h-8 rounded-full bg-green-soft inline-flex items-center justify-center">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-green">
                <path d="M2 7l3.5 3.5L12 3"/>
              </svg>
            </span>
          ) : (
            <img
              src="/icons/loading-spinner.svg"
              alt=""
              className="w-8 h-8"
              style={{ animation: "spin 1s linear infinite" }}
            />
          )}
          <h3 className="m-0 text-[18px] font-medium tracking-[-0.008em]">
            {allDone ? "Extraction complete" : "Extracting information...."}
          </h3>
          <p className="m-0 text-sm font-normal tracking-[-0.004em] text-ink-40">
            {allDone ? "Review the extracted fields before saving" : "This might take a moment"}
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          {FILE_LIST.map((f, i) => (
            <div key={f.name} className="bg-canvas rounded-xl p-3 px-3.5 grid gap-3 items-center" style={{ gridTemplateColumns: "36px 1fr auto" }}>
              <span className="w-9 h-9 rounded-lg bg-surface border border-ink-06 inline-flex items-center justify-center text-ink-60 shrink-0">
                {f.isPdf ? (
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]">
                    <path d="M3 2h8l4 4v10H3z"/><path d="M11 2v4h4M6 11l3-2 3 3 3-3"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[18px] h-[18px]">
                    <rect x="2" y="3" width="14" height="12" rx="1"/><circle cx="6.5" cy="7.5" r="1.5"/><path d="M3 14l4-4 3 3 4-5 3 3"/>
                  </svg>
                )}
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium tracking-[-0.008em]">{f.name}</span>
                <span className="text-xs font-normal text-ink-40">{f.size}</span>
              </div>
              <span className="text-xs font-medium text-ink justify-self-end">{pcts[i]}%</span>
              <div className="col-span-3 h-1.5 rounded-full bg-ink-04 overflow-hidden mt-1.5">
                <div className="h-full bg-orange rounded-full transition-all duration-100" style={{ width: `${pcts[i]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="modal-foot border-t border-ink-04 p-[14px_16px] grid grid-cols-1 gap-3 shrink-0">
        <MBtn primary={allDone} onClick={allDone ? onNext : onClose}>
          {allDone ? "Review extracted data" : "Cancel"}
        </MBtn>
      </div>
    </>
  );
}

const REVIEW_DOCS = [
  {
    name: "TRK-068-cert.pdf", desc: "All fields extracted", status: "ok" as const, isPdf: true,
    fields: [
      { label: "Vehicle ID",    value: "TRK-068",                warn: false },
      { label: "Vehicle type",  value: "Heavy truck",            warn: false, isSelect: true },
      { label: "Plate number",  value: "LAG-234-XY",             warn: false },
      { label: "Make & model",  value: "Mercedes Actros 2640",   warn: false },
      { label: "Year",          value: "2022",                   warn: false },
      { label: "Capacity (kg)", value: "8000",                   warn: false },
    ],
  },
  {
    name: "truck-cert.jpg", desc: "Some fields need review", status: "warn" as const, isPdf: false,
    fields: [
      { label: "Vehicle ID",    value: "VAN-019",        warn: false },
      { label: "Vehicle type",  value: "Delivery van",   warn: false, isSelect: true },
      { label: "Plate number",  value: "ABJ-781-LK",     warn: true  },
      { label: "Make & model",  value: "Ford Transit 350", warn: false },
      { label: "Year",          value: "2021",           warn: false },
      { label: "Capacity (kg)", value: "1500",           warn: false },
    ],
  },
];

function UploadReviewScreen({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <>
      <div className="modal-body px-4 py-6 overflow-auto flex flex-col gap-5 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium tracking-[-0.008em]">3 documents added</span>
          <button className="inline-flex items-center gap-1.5 border border-orange rounded-full px-3.5 py-[7px] text-[13px] font-medium text-orange bg-surface cursor-pointer hover:bg-orange hover:text-white">
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3 h-3">
              <path d="M6.5 2v9M2 6.5h9"/>
            </svg>
            Add more
          </button>
        </div>
        {REVIEW_DOCS.map((doc) => (
          <div key={doc.name} className="border border-ink-06 rounded-[14px] bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-3 bg-canvas border-b border-ink-06">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-surface border border-ink-06 inline-flex items-center justify-center text-ink-60 shrink-0">
                  {doc.isPdf ? (
                    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
                      <path d="M3 2h8l4 4v10H3z"/><path d="M11 2v4h4"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
                      <rect x="2" y="3" width="14" height="12" rx="1"/><circle cx="6.5" cy="7.5" r="1.5"/><path d="M3 14l4-4 3 3 4-5 3 3"/>
                    </svg>
                  )}
                </span>
                <div>
                  <div className="text-sm font-medium tracking-[-0.008em]">{doc.name}</div>
                  <div className="text-xs font-normal text-ink-40 mt-1">{doc.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={["px-2.5 py-1 rounded-full text-xs font-medium tracking-[-0.004em]",
                  doc.status === "ok" ? "bg-green-soft text-green-deep" : "bg-amber-soft text-amber-deep"].join(" ")}>
                  {doc.status === "ok" ? "Ready" : "Needs review"}
                </span>
                <button className="w-6 h-6 rounded-full border border-ink-06 bg-surface inline-flex items-center justify-center cursor-pointer hover:bg-canvas">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[11px] h-[11px]">
                    <path d="M3 3l8 8M11 3l-8 8"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="modal-grid-2 p-4 grid grid-cols-2 gap-x-5 gap-y-4">
              {doc.fields.map((f) => (
                <div key={f.label} className="flex flex-col gap-2">
                  <label className="text-sm font-medium tracking-[-0.008em]">{f.label}</label>
                  {f.isSelect ? (
                    <div className="h-11 border border-ink-06 rounded-xl bg-canvas flex items-center justify-between px-3.5 text-sm text-ink cursor-pointer">
                      <span>{f.value}</span>
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5 shrink-0"><path d="M3 5l4 4 4-4"/></svg>
                    </div>
                  ) : (
                    <input
                      defaultValue={f.value}
                      className={["h-11 border rounded-xl px-3.5 text-sm font-normal tracking-[-0.004em] text-ink outline-none focus:border-orange",
                        f.warn ? "bg-[#fff5e8] border-[#f6c884]" : "bg-canvas border-ink-06 focus:bg-surface"].join(" ")}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="modal-foot border-t border-ink-04 p-[14px_16px] grid grid-cols-2 gap-3 shrink-0">
        <MBtn onClick={onClose}>Cancel</MBtn>
        <MBtn primary onClick={onSuccess}>Save all</MBtn>
      </div>
    </>
  );
}

const FLEET_VEHICLES = ["/icons/TRK-001.png", "/icons/SCT-029.png", "/icons/TRK-009.png", "/icons/CAR-092.png"];

/* -- Main component -------------------------------------- */
export default function AddNewModal({ initialScreen, menuItem = false }: { initialScreen?: Screen; menuItem?: boolean } = {}) {
  const [screen,  setScreen]  = useState<Screen | null>(null);
  const [toast,   setToast]   = useState<string | null>(null);
  const [vehicle, setVehicle] = useState(FLEET_VEHICLES[0]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => setScreen(initialScreen ?? "add-new");
  const close = () => setScreen(null);
  const go = (s: Screen) => setScreen(s);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setVehicle(FLEET_VEHICLES[Math.floor(Math.random() * FLEET_VEHICLES.length)]);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const screenTitle: Partial<Record<Screen, { title: string; sub?: string; back?: Screen }>> = {
    "new-shipment":       { title: "New shipment",                  sub: "Fields marked * are required",                                 back: "add-new"    },
    "add-vehicle":        { title: "Add vehicle",                   sub: "Fields marked * are required",                                 back: initialScreen === "add-vehicle" ? undefined : "add-new" },
    "upload":             { title: "Upload registration documents", sub: "We'll extract the details and you review before adding",       back: "add-vehicle" },
    "upload-extracting":  { title: "Upload registration documents", sub: "We'll extract the details and you review before adding",       back: "upload"     },
    "upload-review":      { title: "Upload registration documents", sub: "We'll extract the details and you review before adding",       back: "upload-extracting" },
  };

  const meta = screen ? screenTitle[screen] : null;

  return (
    <>
      <button
        onClick={open}
        className={menuItem
          ? "w-full bg-transparent border-none flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium tracking-[-0.004em] text-ink hover:bg-canvas cursor-pointer text-left"
          : "btn btn-primary"}
      >
        {menuItem ? (
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0">
            <path d="M7 2.5v9M2.5 7h9" strokeLinecap="round"/>
          </svg>
        ) : (
          <img src="/icons/plus-circle.svg" alt="" className="w-3.5 h-3.5" />
        )}
        {initialScreen === "add-vehicle" ? "Add vehicle" : "Add new"}
      </button>

      {screen && (
        <div
          className="addnew-modal-wrap modal-overlay-wrap fixed inset-0 z-50 flex items-center justify-center px-5 py-10 bg-black/[0.35] backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="modal-shell max-w-full max-h-[calc(100vh-80px)] bg-surface rounded-[24px] flex flex-col overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.18)]" style={{ width: "clamp(580px, calc(100vw - 680px), 700px)" }}>
            {screen === "add-new" ? (
              <>
                <ModalHead title="Add new" sub="What would you like to create?" onClose={close} />
                <PickerScreen onSelect={go} />
              </>
            ) : meta ? (
              <>
                <ModalHead
                  title={meta.title}
                  sub={meta.sub}
                  onClose={close}
                  onBack={meta.back ? () => go(meta.back!) : undefined}
                />
                {screen === "new-shipment"      && <NewShipmentScreen      onUpload={() => go("upload")} onClose={close} onSuccess={() => { close(); showToast("Shipment created successfully"); }} />}
                {screen === "add-vehicle"       && <AddVehicleScreen       onUpload={() => go("upload")} onClose={close} onSuccess={() => { close(); showToast("Vehicle created successfully"); }} />}
                {screen === "upload"            && <UploadScreen           onNext={() => go("upload-extracting")} onClose={close} />}
                {screen === "upload-extracting" && <UploadExtractingScreen onNext={() => go("upload-review")}    onClose={close} />}
                {screen === "upload-review"     && <UploadReviewScreen     onClose={close} onSuccess={() => { close(); showToast("Fleet updated successfully"); }} />}
              </>
            ) : null}
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
            {/* Scrolling road dashes */}
            <div style={{
              position: "absolute", bottom: 9, left: 0, right: 0, height: 2,
              backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.45) 0 18px, transparent 18px 36px)",
              backgroundSize: "36px 100%",
              animation: "road-scroll 0.32s linear infinite",
            }} />
            {/* Car horizontal journey */}
            <div style={{ position: "absolute", bottom: 5, animation: "car-journey 3.5s forwards" }}>
              {/* Engine idle on child */}
              <div style={{ position: "relative", animation: "car-idle 0.16s ease-in-out infinite" }}>
                {/* Speed lines - fade in/out with motion */}
                <div style={{
                  position: "absolute", right: "100%", top: "18%", bottom: "18%", width: 40,
                  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.55))",
                  animation: "speed-opacity 3.5s linear forwards",
                }} />
                {/* Exhaust puffs */}
                <div style={{ position: "absolute", right: "88%", top: "28%", width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "exhaust 1.1s 0.78s ease-out infinite" }} />
                <div style={{ position: "absolute", right: "88%", top: "38%", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.25)", animation: "exhaust 1.1s 1.18s ease-out infinite" }} />
                {/* Car */}
                <img src={vehicle} style={{
                  width: 60, height: 32, objectFit: "contain",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.55)) brightness(1.1)",
                }} />
                {/* Headlight cone */}
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
            <span className="text-[13px] font-semibold text-white tracking-[-0.008em]">{toast}</span>
            <span className="toast-desc text-[13px] font-normal tracking-[-0.004em]" style={{ color: "rgba(255,255,255,0.7)" }}>
              {toast.startsWith("Shipment") ? "— Your shipment has been added to the system." : toast.startsWith("Vehicle") ? "— Your vehicle has been registered in the fleet." : "— All vehicles have been saved to the system."}
            </span>
          </div>
          <button
            onClick={() => setToast(null)}
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
        @keyframes spin { to { transform: rotate(360deg); } }
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
