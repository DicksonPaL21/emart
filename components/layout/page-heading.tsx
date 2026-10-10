export function PageHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-5 mt-5 rounded-sm border-l-[5px] border-primary bg-card px-6 py-1.5 text-[23px] font-extralight text-card-foreground uppercase">
      {children}
    </h1>
  );
}
