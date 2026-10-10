import Link from "next/link";
export function Footer() {
  return (
    <footer className="mt-12 bg-muted text-xs">
      <div className="flex gap-4 px-[18px] py-4">
        <span className="text-white">
          <b>EMART</b> © 2018
        </span>
        <Link href="/about" prefetch={false} className="text-link hover:underline">
          About Us
        </Link>
      </div>
      <p className="bg-black/15 px-[18px] py-3 text-muted-foreground">
        All Rights Reserved. Energy Meter Analysis and Reporting Technology
      </p>
    </footer>
  );
}
