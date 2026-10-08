"use client"
import Dashboard from "@/components/pages/Dashboard"
import { ClientPage } from "@/components/client-page"
export default function Page() { return <ClientPage>{(notify) => <Dashboard notify={notify} />}</ClientPage> }


