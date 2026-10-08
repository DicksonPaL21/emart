"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import logo from "../../img/logo.png"
import { getCookieSession, setSession } from "../../src/lib/api.js"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

export default function Login({ go, notify }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (getCookieSession()) go("dashboard")
  }, [go])

  const clean = (value) => {
    const next = value.replace(/[^a-zA-Z0-9 _.]/g, "")
    if (next !== value)
      notify(
        "Error: This input should not accept any symbols. Letters and Numbers only.",
      )
    return next
  }

  return (
    <div className='row animate-bottom-zoom'>
      <div className='col-12' style={{ marginTop: "100px" }}>
        <div className='pl-3 pr-3'>
          <form
            className='form-login'
            onSubmit={(event) => {
              event.preventDefault()
              setSession(username || password || "emart")
              go("dashboard")
            }}
          >
            <Image
              id='emart'
              className='mb-5'
              src={logo}
              alt='EMART'
              width={206}
              height={64}
              loading='eager'
              style={{ height: "64px", width: "auto" }}
            />
            <Input
              type='text'
              name='username'
              aria-label='Username'
              className='mb-1 f-1'
              placeholder='Username'
              autoComplete='username'
              required
              autoFocus
              value={username}
              onInput={(event) => setUsername(clean(event.currentTarget.value))}
            />
            <Input
              type='password'
              name='password'
              aria-label='Password'
              autoComplete='current-password'
              className='mb-2 f-1'
              placeholder='Password'
              required
              value={password}
              onInput={(event) => setPassword(clean(event.currentTarget.value))}
            />
            <Button type='submit' fullWidth>
              Log in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}


