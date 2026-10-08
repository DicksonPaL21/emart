"use client"
import Setting from "@/components/pages/Setting"
import { ClientPage } from "@/components/client-page"
export default function Page() { return <ClientPage>{(notify) => <Setting notify={notify} />}</ClientPage> }


