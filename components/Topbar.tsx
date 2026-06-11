"use client";

import { useState, useRef, useEffect } from "react";

interface TopbarProps {
  crumb: string;
}

type Theme = "light" | "dark";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1, type: "critical" as const, read: false,
    title: "CAR-041 running 18 min behind",
    desc: "On-time rate may dip below 90% today. Ikeja → VI route affected.",
    time: "2m ago",
  },
  {
    id: 2, type: "warn" as const, read: false,
    title: "TRK-001 overdue for service",
    desc: "Full service overdue by 2 days. Immediate scheduling recommended.",
    time: "14m ago",
  },
  {
    id: 3, type: "success" as const, read: false,
    title: "Shipment #NDI-1047 delivered",
    desc: "Ngozi Eze completed Oshodi → Ikeja on time.",
    time: "32m ago",
  },
  {
    id: 4, type: "warn" as const, read: true,
    title: "SCT-029 oil change overdue",
    desc: "1 day overdue. Schedule at next available slot.",
    time: "1h ago",
  },
  {
    id: 5, type: "info" as const, read: true,
    title: "Emeka Okeke started shift",
    desc: "Ikorodu → Victoria Island route now active.",
    time: "2h ago",
  },
  {
    id: 6, type: "success" as const, read: true,
    title: "Fleet utilisation hit 85%",
    desc: "Up from 79% yesterday — highest this week.",
    time: "3h ago",
  },
];

type NotifType = "critical" | "warn" | "success" | "info";

const TYPE_ICON: Record<NotifType, React.ReactNode> = {
  critical: (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.76496 1.43025C6.60807 1.47615 6.46694 1.56458 6.35721 1.68575C6.22888 1.83392 1.17371 10.602 1.12821 10.7548C1.07487 10.9601 1.09171 11.1774 1.17605 11.372C1.29621 11.6182 1.5383 11.8019 1.80663 11.8515C1.90346 11.869 3.46213 11.8766 7.00005 11.8766C10.538 11.8766 12.0966 11.869 12.1935 11.8515C12.3292 11.8247 12.457 11.7668 12.5667 11.6824C12.6764 11.598 12.7651 11.4894 12.8258 11.365C12.9063 11.1964 12.9255 10.9374 12.8713 10.7548C12.8229 10.5892 7.76596 1.82692 7.6318 1.67525C7.55866 1.5942 7.46979 1.52888 7.37062 1.48325C7.27144 1.43762 7.16401 1.41264 7.05488 1.40983C6.95776 1.40291 6.86015 1.40979 6.76496 1.43025ZM7.19838 4.70508C7.34596 4.75583 7.49413 4.904 7.54488 5.05158C7.57871 5.15133 7.58338 5.31292 7.58338 6.41658C7.58338 7.8335 7.58513 7.816 7.40838 7.99275C7.32075 8.0808 7.207 8.13815 7.08409 8.15623C6.96119 8.17432 6.83574 8.15216 6.72646 8.09308C6.59064 8.01765 6.48833 7.89368 6.44005 7.746C6.42371 7.68533 6.4173 7.21983 6.42196 6.36467L6.42838 5.07492L6.49313 4.96467C6.5601 4.8441 6.66813 4.75158 6.79756 4.70394C6.92699 4.65631 7.06922 4.65671 7.19838 4.70508ZM7.19838 8.78842C7.41363 8.86192 7.58338 9.10225 7.58338 9.33325C7.58338 9.47442 7.51396 9.63717 7.40896 9.74217C7.34589 9.80574 7.26893 9.85381 7.18413 9.88262C7.09934 9.91143 7.00902 9.92019 6.92028 9.9082C6.83153 9.89622 6.74677 9.86382 6.67265 9.81356C6.59854 9.76329 6.53709 9.69652 6.49313 9.6185C6.43771 9.52458 6.42838 9.48258 6.42838 9.33325C6.42838 9.18392 6.43771 9.14192 6.49313 9.048C6.5601 8.92744 6.66813 8.83492 6.79756 8.78728C6.92699 8.73964 7.06922 8.74004 7.19838 8.78842Z" fill="currentColor"/>
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path d="M11.0833 11.6667H2.91667V12.25C2.91667 12.5722 2.6555 12.8333 2.33333 12.8333H1.75C1.42784 12.8333 1.16667 12.5722 1.16667 12.25V7.87499L0.441854 7.69381C0.182173 7.62889 0 7.39555 0 7.12786V6.70833C0 6.54727 0.130584 6.41666 0.291667 6.41666H1.16667L2.61363 3.04042C2.79747 2.61146 3.21926 2.33333 3.68596 2.33333H10.314C10.7808 2.33333 11.2025 2.61146 11.3864 3.04042L12.8333 6.41666H13.7083C13.8694 6.41666 14 6.54727 14 6.70833V7.12786C14 7.39555 13.8178 7.62889 13.5581 7.69381L12.8333 7.87499V12.25C12.8333 12.5722 12.5722 12.8333 12.25 12.8333H11.6667C11.3445 12.8333 11.0833 12.5722 11.0833 12.25V11.6667Z" fill="currentColor"/>
    </svg>
  ),
  success: (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.57981 1.18062C5.34956 1.28854 4.25872 1.72079 3.33589 2.46454C2.35881 3.25262 1.63956 4.37787 1.34322 5.58304C1.21722 6.09696 1.18164 6.40554 1.18164 6.99996C1.18164 7.59437 1.21722 7.90296 1.34322 8.41687C1.86006 10.521 3.58264 12.2097 5.69314 12.6816C6.18547 12.7919 6.44389 12.8193 6.99981 12.8193C7.55572 12.8193 7.81414 12.7919 8.30647 12.6816C10.417 12.2097 12.1396 10.521 12.6564 8.41687C12.7806 7.90996 12.8174 7.59262 12.8186 7.01162C12.8191 6.44229 12.7935 6.19262 12.6815 5.69329C12.4143 4.49804 11.7143 3.34537 10.7798 2.56137C9.71581 1.66829 8.49606 1.20746 7.12814 1.18004C6.9454 1.17483 6.76254 1.17502 6.57981 1.18062ZM9.34481 4.73429C9.29259 4.7496 9.24184 4.76951 9.19314 4.79379C9.14822 4.81654 8.44997 5.49554 7.64147 6.30229L6.17089 7.76995L5.54147 7.13821C4.83272 6.42771 4.77556 6.38512 4.52647 6.38512C4.35731 6.38454 4.25872 6.42421 4.13331 6.54146C4.04246 6.6267 3.98208 6.7394 3.96142 6.86226C3.94077 6.98511 3.96099 7.11136 4.01897 7.22162C4.09831 7.37446 5.77306 9.04745 5.91947 9.12095C6.03964 9.18104 6.28289 9.18746 6.41122 9.13379C6.52264 9.08829 9.92056 5.70204 9.98997 5.56787C10.0389 5.46771 10.0592 5.35596 10.0486 5.24498C10.038 5.134 9.99694 5.02811 9.92989 4.93904C9.81264 4.78504 9.52972 4.68587 9.34481 4.73429Z" fill="currentColor"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.57967 1.18062C4.04442 1.42912 2.05317 3.47529 1.86325 6.01812C1.65742 8.76587 3.66925 11.1895 6.39217 11.6349C6.58617 11.6666 6.79192 11.6833 6.99967 11.6833C9.71092 11.6833 11.9163 9.63304 12.1213 6.93179C12.3272 4.18404 10.3153 1.76037 7.59242 1.31504C7.25617 1.25962 6.91575 1.24979 6.57967 1.18062ZM7.58325 9.33329C7.58325 9.65546 7.32208 9.91663 6.99992 9.91663C6.67775 9.91663 6.41658 9.65546 6.41658 9.33329V6.41663C6.41658 6.09446 6.67775 5.83329 6.99992 5.83329C7.32208 5.83329 7.58325 6.09446 7.58325 6.41663V9.33329ZM6.99992 4.08329C6.67775 4.08329 6.41658 4.34446 6.41658 4.66663C6.41658 4.98879 6.67775 5.24996 6.99992 5.24996C7.32208 5.24996 7.58325 4.98879 7.58325 4.66663C7.58325 4.34446 7.32208 4.08329 6.99992 4.08329Z" fill="currentColor"/>
    </svg>
  ),
};

const TYPE_COLORS: Record<NotifType, { bg: string; color: string }> = {
  critical: { bg: "bg-red-soft",   color: "text-red"   },
  warn:     { bg: "bg-amber-soft", color: "text-amber" },
  success:  { bg: "bg-green-soft", color: "text-green" },
  info:     { bg: "bg-ink-04",     color: "text-ink-40" },
};

export default function Topbar({ crumb }: TopbarProps) {
  const [refreshing, setRefreshing]       = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") return current;
    return "light";
  });

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => window.location.reload(), 700);
  };

  const handleTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("fleetops-theme", nextTheme);
  };

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const today    = notifications.slice(0, 3);
  const earlier  = notifications.slice(3);

  return (
    <>
    <div className="h-[60px] px-4 py-0 flex items-center justify-between bg-canvas border-b border-ink-04">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => window.dispatchEvent(new Event("fleetops:nav-toggle"))}
          className="topbar-menu-btn w-8 h-8 rounded-full bg-surface border border-ink-04 items-center justify-center text-ink cursor-pointer hover:bg-ink-04 transition-colors shrink-0"
          title="Menu"
          aria-label="Toggle navigation"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="w-3.5 h-3.5">
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
          </svg>
        </button>
        <img src="/icons/logo-mark.svg" alt="Fleetops" className="topbar-logo w-[18px] h-[18px] shrink-0" />
        <span className="inline text-xs text-ink truncate">{crumb}</span>
      </div>

      <div className="flex items-center gap-2">

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="flex w-8 h-8 rounded-full bg-surface border border-ink-04 items-center justify-center text-ink cursor-pointer hover:bg-ink-04 transition-colors"
          title="Refresh"
        >
          <svg
            viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"
            style={{
              transform: refreshing ? "rotate(360deg)" : "rotate(0deg)",
              transition: refreshing ? "transform 0.65s cubic-bezier(0.4,0,0.2,1)" : "none",
            }}
          >
            <path d="M3.64188 2.955C4.81054 1.94451 6.33396 1.33325 8.00016 1.33325C11.682 1.33325 14.6668 4.31802 14.6668 7.99992C14.6668 9.42399 14.2203 10.7438 13.4596 11.827L11.3335 7.99992H13.3335C13.3335 5.0544 10.9457 2.66659 8.00016 2.66659C6.56671 2.66659 5.26534 3.2321 4.30698 4.1522L3.64188 2.955ZM12.3584 13.0449C11.1898 14.0553 9.66636 14.6666 8.00016 14.6666C4.31826 14.6666 1.3335 11.6818 1.3335 7.99992C1.3335 6.57583 1.78002 5.25603 2.5407 4.17288L4.66683 7.99992H2.66683C2.66683 10.9455 5.05464 13.3333 8.00016 13.3333C9.43363 13.3333 10.735 12.7677 11.6934 11.8477L12.3584 13.0449Z" fill="currentColor"/>
          </svg>
        </button>

        {/* Theme toggle */}
        <div className="theme-toggle inline-flex" role="group" aria-label="Theme">
          <button
            type="button"
            onClick={() => handleTheme("dark")}
            className={`theme-toggle-opt ${theme === "dark" ? "active" : ""}`}
            aria-pressed={theme === "dark"}
            title="Dark mode"
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M8.66667 6.91667C8.66667 9.17183 10.4948 11 12.75 11C13.8924 11 14.9253 10.5308 15.6664 9.77471C15.6667 9.79425 15.6667 9.81379 15.6667 9.83333C15.6667 13.055 13.055 15.6667 9.83333 15.6667C6.61167 15.6667 4 13.055 4 9.83333C4 6.61167 6.61167 4 9.83333 4C9.85288 4 9.87242 4 9.89196 4.00029C9.13584 4.74141 8.66667 5.77425 8.66667 6.91667ZM5.16667 9.83333C5.16667 12.4107 7.256 14.5 9.83333 14.5C11.6173 14.5 13.1676 13.4989 13.9528 12.0279C13.5635 12.1192 13.1604 12.1667 12.75 12.1667C9.85048 12.1667 7.5 9.81618 7.5 6.91667C7.5 6.50628 7.54744 6.10319 7.63878 5.71383C6.16773 6.49913 5.16667 8.04933 5.16667 9.83333Z" fill="currentColor"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleTheme("light")}
            className={`theme-toggle-opt ${theme === "light" ? "active" : ""}`}
            aria-pressed={theme === "light"}
            title="Light mode"
          >
            <svg viewBox="0 0 21 21" fill="none">
              <path d="M10.4167 13.9167C8.48367 13.9167 6.91667 12.3497 6.91667 10.4167C6.91667 8.48367 8.48367 6.91667 10.4167 6.91667C12.3497 6.91667 13.9167 8.48367 13.9167 10.4167C13.9167 12.3497 12.3497 13.9167 10.4167 13.9167ZM9.83333 4H11V5.75H9.83333V4ZM9.83333 15.0833H11V16.8333H9.83333V15.0833ZM5.46692 6.29188L6.29188 5.46692L7.52931 6.70436L6.70436 7.52931L5.46692 6.29188ZM13.304 14.129L14.129 13.304L15.3664 14.5415L14.5415 15.3664L13.304 14.129ZM14.5415 5.46692L15.3664 6.29188L14.129 7.52931L13.304 6.70436L14.5415 5.46692ZM6.70436 13.304L7.52931 14.129L6.29188 15.3664L5.46692 14.5415L6.70436 13.304ZM16.8333 9.83333V11H15.0833V9.83333H16.8333ZM5.75 9.83333V11H4V9.83333H5.75Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative w-8 h-8 rounded-full bg-surface border border-ink-04 flex items-center justify-center cursor-pointer hover:bg-ink-04 transition-colors shadow-none"
            title="Notifications"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <g clipPath="url(#notif-clip)">
                <g filter="url(#notif-shadow)">
                  <path d="M7.81592 12.7498C7.6474 13.0244 7.34535 13.2087 6.99951 13.2087C6.65369 13.2086 6.35154 13.0245 6.18311 12.7498H7.81592ZM2.8335 5.83374C2.8335 3.53266 4.69847 1.66692 6.99951 1.66675C9.30071 1.66675 11.1665 3.53255 11.1665 5.83374V11.0554L11.2495 11.1667H2.74951L2.8335 11.0554V5.83374Z" stroke="currentColor" shapeRendering="crispEdges"/>
                </g>
              </g>
              <defs>
                <filter id="notif-shadow" x="-1.9585" y="1.16675" width="17.9165" height="20.5417" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="4"/>
                  <feGaussianBlur stdDeviation="2"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <clipPath id="notif-clip"><rect width="14" height="14" fill="white"/></clipPath>
              </defs>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[14px] h-[14px] rounded-full bg-orange border-2 border-canvas flex items-center justify-center text-[8px] font-bold text-white leading-none">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-panel absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] bg-surface border border-ink-06 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-ink-04">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tracking-[-0.008em]">Notifications</span>
                  {unread > 0 && (
                    <span className="inline-flex items-center px-1.5 h-4 rounded-full bg-orange text-white text-[10px] font-semibold leading-none">
                      {unread} new
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-ink-40 hover:text-ink cursor-pointer transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Today */}
              <div className="px-2 pt-3 pb-1">
                <span className="px-2 text-[10px] font-semibold text-ink-30 tracking-[0.04em] uppercase">Today</span>
                <div className="mt-1.5 flex flex-col">
                  {today.map(n => {
                    const { bg, color } = TYPE_COLORS[n.type];
                    return (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`flex items-start gap-3 px-2 py-2.5 rounded-xl cursor-pointer transition-colors ${!n.read ? "hover:bg-ink-03" : "opacity-60 hover:bg-ink-03"}`}
                      >
                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${bg} ${color}`}>
                          {TYPE_ICON[n.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[12px] font-medium tracking-[-0.004em] leading-snug">{n.title}</span>
                            <span className="text-[10px] text-ink-30 font-medium shrink-0 mt-px">{n.time}</span>
                          </div>
                          <span className="text-[11px] text-ink-40 leading-snug mt-0.5 block">{n.desc}</span>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Earlier */}
              <div className="px-2 pt-2 pb-2">
                <span className="px-2 text-[10px] font-semibold text-ink-30 tracking-[0.04em] uppercase">Earlier</span>
                <div className="mt-1.5 flex flex-col">
                  {earlier.map(n => {
                    const { bg, color } = TYPE_COLORS[n.type];
                    return (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className="flex items-start gap-3 px-2 py-2.5 rounded-xl cursor-pointer transition-colors opacity-60 hover:opacity-100 hover:bg-ink-03"
                      >
                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${bg} ${color}`}>
                          {TYPE_ICON[n.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[12px] font-medium tracking-[-0.004em] leading-snug">{n.title}</span>
                            <span className="text-[10px] text-ink-30 font-medium shrink-0 mt-px">{n.time}</span>
                          </div>
                          <span className="text-[11px] text-ink-40 leading-snug mt-0.5 block">{n.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-ink-04 px-4 py-3 flex items-center justify-center">
                <button className="text-[12px] font-medium text-orange hover:text-[#ff8344] transition-colors cursor-pointer">
                  View all notifications
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
    </>
  );
}
