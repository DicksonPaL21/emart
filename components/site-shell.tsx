"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { clearSession } from "@/src/lib/api"

const routes = ["dashboard", "history", "setting"]

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const page = (pathname ?? "/login").split("/").filter(Boolean).pop() || "login"
  const login = page === "login"
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {!login && <nav aria-label="Primary navigation">
      {routes.map((route, index) => <span key={route}>
        {index > 0 && <span aria-hidden="true" style={{ color: "#3C3F41" }}>|</span>}
        <Link className={`${page === route ? "active " : ""}f-1`} href={`/${route}`}>{route[0].toUpperCase() + route.slice(1)}</Link>
      </span>)}
      <button className="f-1" type="button" onClick={() => { clearSession(); router.push("/login") }}>Logout</button>
    </nav>}
    <main id="main-content" className="wrapper">
      {!login && <div className="row"><div className="col-12"><h1 className="header title">{page.toUpperCase()}</h1></div></div>}
      {children}
    </main>
    <footer>
      <div className="footer"><ul><li className="f-2"><b>EMART</b> &copy; 2018</li><li className="f-2"><Link href="/about">About Us</Link></li></ul></div>
      <p className="sub-section-attribution f-3">All Rights Reserved. Energy Meter Analysis and Reporting Technology</p>
    </footer>
  </>
}
