"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useLayoutEffect } from "react";

type NavEntry = {
  label: string;
  href: string;
  icon: string;
  activeIcon?: string;
  disabled?: boolean;
};

const navMain: NavEntry[] = [
  { label: "Overview",     href: "/",            icon: "/icons/overview.svg",      activeIcon: "/icons/overview-active.svg" },
  { label: "Fleet status", href: "/fleet-status", icon: "/icons/fleet-status.svg", activeIcon: "/icons/fleet-status-active.svg" },
  { label: "Drivers",      href: "/drivers",      icon: "/icons/driver.svg",        activeIcon: "/icons/drivers-active.svg" },
  { label: "Analytics",    href: "/analytics",    icon: "/icons/analytics.svg",     disabled: true },
];

const navOps: NavEntry[] = [
  { label: "Shipments", href: "/shipments", icon: "/icons/shipments.svg", disabled: true },
  { label: "Routes",    href: "/routes",    icon: "/icons/routes.svg",    disabled: true },
];

const navResources: NavEntry[] = [
  { label: "Documents", href: "/documents", icon: "/icons/documents.svg", disabled: true },
  { label: "Inventory", href: "/inventory", icon: "/icons/inventory.svg", disabled: true },
];

const navFinance: NavEntry[] = [
  { label: "Finance", href: "/finance", icon: "/icons/finance.svg", disabled: true },
];

const navSupport: NavEntry[] = [
  { label: "User guide", href: "/guide",    icon: "/icons/user-guide.svg", disabled: true },
  { label: "FAQ",        href: "/faq",      icon: "/icons/faqs.svg",       disabled: true },
  { label: "Help",       href: "/help",     icon: "/icons/help.svg",       disabled: true },
  { label: "Settings",   href: "/settings", icon: "/icons/settings.svg",   disabled: true },
];

function sidebarWidthForVw(vw: number): number {
  if (vw >= 768 && vw < 1280) return 56;
  if (vw >= 1280) return Math.min(220, Math.max(180, Math.round(180 + 0.25 * (vw - 1280))));
  return 180;
}

function NavItem({ label, href, icon, activeIcon, disabled, collapsed }: NavEntry & { collapsed: boolean }) {
  const pathname = usePathname();
  const active = !disabled && (pathname === href || (href !== "/" && pathname.startsWith(href)));
  const iconSrc = active && activeIcon ? activeIcon : icon;

  if (disabled) {
    return (
      <div
        className={`flex items-center rounded-lg text-xs font-medium text-ink-40 ${collapsed ? "justify-center p-2" : "gap-1.5 px-2 py-2"}`}
        title={collapsed ? label : undefined}
      >
        <img src={iconSrc} alt={label} className="w-4 h-4 icon-adaptive shrink-0" />
        {!collapsed && <span>{label}</span>}
      </div>
    );
  }

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={[
        "flex items-center rounded-lg text-xs font-medium transition-colors",
        collapsed
          ? `justify-center p-2 ${active ? "bg-surface border border-ink-04 text-orange-active" : "text-ink-40 hover:bg-ink-03"}`
          : active
            ? "gap-1.5 bg-surface border border-ink-04 text-orange-active px-[7px] py-[7px]"
            : "gap-1.5 text-ink-40 hover:bg-ink-03 px-2 py-2",
      ].join(" ")}
    >
      <img src={iconSrc} alt={label} className={`w-4 h-4 shrink-0 ${!active ? "icon-adaptive" : ""}`} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return null;
  return <div className="px-2 text-xs text-ink mb-2">{label}</div>;
}

export default function Sidebar() {
  // null = not yet measured (SSR); useLayoutEffect fires synchronously before paint
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const update = () => setWidth(sidebarWidthForVw(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const collapsed = width !== null && width <= 60;

  return (
    <aside
      className="sidebar-root shrink-0 bg-canvas border-r border-ink-04 flex flex-col py-5"
      style={width !== null ? { width } : undefined}
    >
      {/* Brand */}
      <div className={`flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        <img src="/icons/logo.png" alt="Fleetops" className={collapsed ? "h-5 w-auto" : "h-[18px] w-auto"} />
        {!collapsed && (
          <img src="/icons/skip-forward-mini-fill.svg" alt="Collapse sidebar" className="w-4 h-4 cursor-pointer icon-adaptive" />
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="mt-5 h-10 bg-surface border-y border-ink-04 flex items-center px-4 gap-2">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5 text-ink-30">
            <circle cx="6" cy="6" r="4.5" /><path d="M10 10l3 3" />
          </svg>
          <span className="text-xs text-ink-40 flex-1 font-medium">Search</span>
          <img src="/icons/command-k.png" alt="⌘K" className="h-4 w-auto icon-adaptive" />
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 flex flex-col px-2 pt-5 gap-5 overflow-y-auto">
        <div>
          <SectionLabel label="Main menu" collapsed={collapsed} />
          <div className="flex flex-col gap-1.5">
            {navMain.map((item) => <NavItem key={item.href} {...item} collapsed={collapsed} />)}
          </div>
        </div>
        <div className="border-t border-ink-03 pt-5">
          <SectionLabel label="Operations" collapsed={collapsed} />
          <div className="flex flex-col gap-1.5">
            {navOps.map((item) => <NavItem key={item.href} {...item} collapsed={collapsed} />)}
          </div>
        </div>
        <div className="border-t border-ink-03 pt-5">
          <SectionLabel label="Resources" collapsed={collapsed} />
          <div className="flex flex-col gap-1.5">
            {navResources.map((item) => <NavItem key={item.href} {...item} collapsed={collapsed} />)}
          </div>
        </div>
        <div className="border-t border-ink-03 pt-5">
          <div className="flex flex-col gap-1.5">
            {navFinance.map((item) => <NavItem key={item.href} {...item} collapsed={collapsed} />)}
          </div>
        </div>
        <div className="border-t border-ink-03 pt-5 mt-auto pb-2">
          <SectionLabel label="Support" collapsed={collapsed} />
          <div className="flex flex-col gap-1.5">
            {navSupport.map((item) => <NavItem key={item.href} {...item} collapsed={collapsed} />)}
          </div>
        </div>
      </nav>
    </aside>
  );
}
