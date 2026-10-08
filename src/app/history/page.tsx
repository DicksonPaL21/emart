"use client"
import History from "@/components/pages/History"
import { ClientPage } from "@/components/client-page"
export default function Page() { return <ClientPage>{(notify) => <History notify={notify} />}</ClientPage> }


