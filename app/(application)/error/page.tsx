import { PageHeading } from "@/components/layout/page-heading";
export const metadata = { title: "Error" };
export default function ErrorPage() {
  return (
    <>
      <PageHeading>Error</PageHeading>
      <p className="mx-auto mt-10 max-w-[200px] text-center text-lg font-bold">
        Page not found ¯\_(ツ)_/¯
      </p>
    </>
  );
}
