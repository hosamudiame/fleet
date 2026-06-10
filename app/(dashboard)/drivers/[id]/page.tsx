import DriverProfileContent from "@/components/DriverProfileContent";

export const metadata = { title: "Driver Profile — Fleetops" };

export default function DriverProfilePage({ params }: { params: { id: string } }) {
  return <DriverProfileContent driverId={params.id} />;
}
