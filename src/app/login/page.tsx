"use client"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import Login from "@/components/pages/Login"
import { ClientPage } from "@/components/client-page"
export default function Page() { const router = useRouter(); const go = useCallback((route: string) => router.push(`/${route}`), [router]); return <ClientPage>{(notify) => <Login notify={notify} go={go} />}</ClientPage> }


