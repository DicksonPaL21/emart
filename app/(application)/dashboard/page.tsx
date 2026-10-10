import { PageHeading } from "@/components/layout/page-heading";
import { Dashboard } from "@/components/sections/dashboard";
export const metadata = { title: "Dashboard" };
export default function DashboardPage() {
  return (
    <>
      <PageHeading>Dashboard</PageHeading>
      <Dashboard />
    </>
  );
}
