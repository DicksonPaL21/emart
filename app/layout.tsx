import type { Metadata, Viewport } from "next"
import "./globals.css"
import { SiteShell } from "@/components/site-shell"

export const metadata: Metadata = {
  title: { default: "EMART", template: "%s | EMART" },
  description: "Energy Meter Analysis and Reporting Technology",
}

export const viewport: Viewport = { themeColor: "#27272b" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteShell>{children}</SiteShell></body></html>
}




