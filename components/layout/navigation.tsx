"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { DEBUG_MODE } from "@/lib/device";
const subscribe = () => () => {};
const hasCookie = () => Boolean(document.cookie);
const serverCookie = () => false;

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const previousPath = useRef(pathname);
  const authenticated = useSyncExternalStore(subscribe, hasCookie, serverCookie);
  useEffect(() => {
    if (!DEBUG_MODE && !document.cookie && !["/about", "/error"].includes(pathname))
      router.replace("/login");
    if (previousPath.current !== pathname) document.querySelector<HTMLElement>("main")?.focus();
    previousPath.current = pathname;
  }, [pathname, router]);
  if (!DEBUG_MODE && !authenticated)
    return (
      <nav aria-label="Main navigation" className="bg-card p-3">
        <Link href="/login" prefetch={false}>Login</Link>
      </nav>
    );
  return (
    <nav
      aria-label="Main navigation"
      className="flex min-h-12 flex-wrap items-center gap-1 bg-card px-2.5 py-2 text-card-foreground"
    >
      {["Dashboard", "History", "Setting"].map((label) => (
        <Link
          key={label}
          prefetch={false}
          href={`/${label.toLowerCase()}`}
          aria-current={pathname === `/${label.toLowerCase()}` ? "page" : undefined}
          className="rounded-sm px-2 py-2 hover:bg-background aria-[current=page]:bg-background"
        >
          {label}
        </Link>
      ))}
      <Link
        prefetch={false}
        href="/login"
        className="ml-auto rounded-sm px-2 py-2 hover:bg-background"
        onClick={() => {
          document.cookie = "EMARTSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        }}
      >
        Logout
      </Link>
    </nav>
  );
}
