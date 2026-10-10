import { PageHeading } from "@/components/layout/page-heading";
import { History } from "@/components/sections/history";
export const metadata = { title: "History" };
export default function HistoryPage() {
  return (
    <>
      <PageHeading>History</PageHeading>
      <History />
    </>
  );
}
