import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "EMART — Energy Meter Analysis and Reporting Technology",
    template: "%s | EMART",
  },
  description: "EMART, Energy Meter Analysis and Reporting Technology",
  authors: [{ name: "Dickson H. Palomeras" }],
  icons: { icon: "/img/favicon.png" },
};
export const viewport: Viewport = { themeColor: "#36393e" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:bg-card focus:p-3">
          Skip to content
        </a>
        {children}
        <Footer />
      </body>
    </html>
  );
}
