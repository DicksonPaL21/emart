import { Navigation } from "@/components/layout/navigation";
export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1140px] flex-1 px-[2%]">
        {children}
      </main>
    </>
  );
}
