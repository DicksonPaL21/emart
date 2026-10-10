import { cn } from "@/lib/utils";
export function Panel({
  title,
  action,
  children,
  className,
  id,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-sm border border-border bg-card px-[15px] py-[18px] shadow-sm",
        className,
      )}
    >
      {title && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xs font-normal">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Metric({
  label,
  value,
  tone = "success",
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "destructive" | "info";
}) {
  const colors = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    info: "text-info",
  };
  return (
    <div className="my-2 flex flex-wrap justify-between gap-x-2 gap-y-1">
      <span className="text-white">{label}</span>
      <span className={cn("tabular-nums", colors[tone])}>{value}</span>
    </div>
  );
}
