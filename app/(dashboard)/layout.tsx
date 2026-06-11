import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Fleetops | Live Fleet Command Center",
  description: "Run vehicles, drivers, routes, and exceptions from one sharp operations desk.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
