import { useEffect, useState } from "preact/hooks"
import logo from "../../img/logo.png"
import { getCookieSession, setSession } from "../lib/api.js"

export default function Login({ go, notify }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (getCookieSession()) go("dashboard")
  }, [])

  const clean = (value) => {
    const next = value.replace(/[^a-zA-Z0-9 _.]/g, "")
    if (next !== value)
      notify(
        "Error: This input should not accept any symbols. Letters and Numbers only.",
      )
    return next
  }

  return (
    <div class='row animate-bottom-zoom'>
      <div class='col-12' style='margin-top:100px'>
        <div class='pl-3 pr-3'>
          <form
            class='form-login'
            onSubmit={(event) => {
              event.preventDefault()
              setSession(username || password || "emart")
              go("dashboard")
            }}
          >
            <img
              id='emart'
              class='mb-5'
              src={logo}
              alt='EMART'
              style='height:64px'
            />
            <input
              type='text'
              class='mb-1 f-1'
              placeholder='Username'
              autocomplete='off'
              required
              autofocus
              value={username}
              onInput={(event) => setUsername(clean(event.currentTarget.value))}
            />
            <input
              type='password'
              class='mb-2 f-1'
              placeholder='Password'
              required
              value={password}
              onInput={(event) => setPassword(clean(event.currentTarget.value))}
            />
            <button type='submit' class='w-100 f-2'>
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
