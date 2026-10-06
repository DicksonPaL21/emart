import { render } from "preact"
import { lazy, Suspense } from "preact/compat"
import { useEffect, useMemo, useState } from "preact/hooks"
import { clearSession, getCookieSession, isDebug } from "./lib/api.js"
import "./styles.css"

const pages = {
  login: lazy(() => import("./pages/Login.jsx")),
  dashboard: lazy(() => import("./pages/Dashboard.jsx")),
  history: lazy(() => import("./pages/History.jsx")),
  setting: lazy(() => import("./pages/Setting.jsx")),
  about: lazy(() => import("./pages/About.jsx")),
  error: lazy(() => import("./pages/Error.jsx")),
}

function normalize(pathname) {
  const raw = pathname.split("/").filter(Boolean).pop() || "login"
  return raw.replace(".html", "") || "login"
}

function Footer() {
  return (
    <footer>
      <div class='footer'>
        <ul>
          <li class='f-2'>
            <b>EMART</b> &copy; 2018
          </li>
          <li class='f-2'>
            <a href='#/about'>About Us</a>
          </li>
        </ul>
      </div>
      <p class='sub-section-attribution f-3'>
        All Rights Reserved. Energy Meter Analysis and Reporting Technology
      </p>
    </footer>
  )
}

function Nav({ page, go }) {
  if (page === "login") return null
  const authed = isDebug || getCookieSession()
  return (
    <nav>
      {authed ? (
        <>
          {["dashboard", "history", "setting"].map((item, index) => (
            <>
              {index > 0 && <span style='color:#3C3F41'>|</span>}
              <a
                class={`${page === item ? "active " : ""}f-1`}
                href={`#/${item}`}
                onClick={() => go(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </a>
            </>
          ))}
          <a
            class='f-1'
            href='#/login'
            onClick={() => {
              clearSession()
              go("login")
            }}
          >
            Logout
          </a>
        </>
      ) : (
        <a class='f-1' href='#/login' onClick={() => go("login")}>
          Login
        </a>
      )}
    </nav>
  )
}

function Header({ page }) {
  if (page === "login") return null
  return (
    <div class='row'>
      <div class='col-12'>
        <h1 class='header title'>{page.toUpperCase()}</h1>
      </div>
    </div>
  )
}

function Notifications({ messages }) {
  return (
    <div class='notification-field'>
      {messages.map((message) => (
        <div key={message.id} class='msg f-1'>
          {message.text}
        </div>
      ))}
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(
    () => location.hash.slice(2) || normalize(location.pathname),
  )
  const [messages, setMessages] = useState([])
  const page = pages[route] ? route : "error"
  const Page = pages[page]

  useEffect(() => {
    const onHash = () => setRoute(location.hash.slice(2) || "login")
    addEventListener("hashchange", onHash)
    return () => removeEventListener("hashchange", onHash)
  }, [])

  useEffect(() => {
    const msg = "Energy Meter Analysis and Reporting Technology - "
    let pos = 0
    const timer = window.setInterval(() => {
      document.title = msg.slice(pos) + msg.slice(0, pos)
      pos = pos >= msg.length ? 0 : pos + 1
    }, 500)
    return () => window.clearInterval(timer)
  }, [])

  const notify = useMemo(
    () =>
      (text, closeAfter = 3000) => {
        const id = crypto.randomUUID?.() || String(Date.now() + Math.random())
        setMessages((items) => [...items.slice(-3), { id, text }])
        if (closeAfter)
          window.setTimeout(
            () =>
              setMessages((items) => items.filter((item) => item.id !== id)),
            closeAfter,
          )
      },
    [],
  )

  const go = (next) => {
    location.hash = `/${next}`
    setRoute(next)
  }

  return (
    <>
      <Nav page={page} go={go} />
      <div class='wrapper'>
        <Header page={page} />
        <Suspense
          fallback={
            <div class='container'>
              <span class='loader small'></span>
            </div>
          }
        >
          <Page go={go} notify={notify} />
        </Suspense>
      </div>
      <Notifications messages={messages} />
      <Footer />
    </>
  )
}

render(<App />, document.getElementById("app"))
