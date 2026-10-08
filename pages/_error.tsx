import type { NextPageContext } from "next"

export default function ErrorPage({ statusCode }: { statusCode?: number }) {
  return <p>{statusCode ? `An error ${statusCode} occurred on the server` : "An error occurred in the browser"}</p>
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => ({ statusCode: res?.statusCode ?? err?.statusCode ?? 404 })
