import { PageHeading } from "@/components/layout/page-heading";
import { Settings } from "@/components/sections/settings";
export const metadata = { title: "Setting" };
export default function SettingPage() {
  return (
    <>
      <PageHeading>Setting</PageHeading>
      <Settings />
    </>
  );
}
