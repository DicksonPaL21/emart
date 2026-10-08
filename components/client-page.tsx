"use client"

import { useCallback, useState } from "react"

type Message = { id: string; text: string }

export function ClientPage({ children }: { children: (notify: (text: string, closeAfter?: number) => void) => React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const notify = useCallback((text: string, closeAfter = 3000) => {
    const id = crypto.randomUUID?.() || String(Date.now() + Math.random())
    setMessages((items) => [...items.slice(-3), { id, text }])
    if (closeAfter) window.setTimeout(() => setMessages((items) => items.filter((item) => item.id !== id)), closeAfter)
  }, [])
  return <>{children(notify)}<div className="notification-field" role="status" aria-live="polite">{messages.map((message) => <div key={message.id} className="msg f-1">{message.text}</div>)}</div></>
}
