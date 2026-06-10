import Sidebar from "@/components/Sidebar";
import DesktopGate from "@/components/DesktopGate";

export const metadata = { title: "Overview — Fleetops" };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Small-screen gate — shown below 1024px */}
      <div className="lg:hidden">
        <DesktopGate />
      </div>

      {/* Full dashboard — hidden below 1024px */}
      <div className="hidden lg:flex w-full min-h-screen bg-canvas">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}
