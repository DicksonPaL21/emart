export const isDebug = import.meta.env.DEV

export function getCookieSession() {
  return document.cookie.includes("EMARTSESSIONID=")
}

export function setSession(value) {
  document.cookie = `EMARTSESSIONID=${encodeURIComponent(value || "emart")}; path=/`
}

export function clearSession() {
  document.cookie =
    "EMARTSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
}

export function money(value, decimals = 2) {
  return `₱ ${Number(value || 0).toFixed(decimals)}`
}

export function fixed(value, decimals = 4) {
  return Number(value || 0).toFixed(decimals)
}

export function decimalsAllocated(value) {
  const n = Number(value || 0)
  return n.toFixed(n < 10 ? 4 : n < 100 ? 3 : n < 1000 ? 2 : n < 10000 ? 1 : 0)
}

export async function requestText(addr, options = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeout || 8000,
  )
  try {
    const response = await fetch(addr, {
      signal: controller.signal,
      method: options.method || "GET",
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function requestJson(addr, fallback) {
  if (isDebug && fallback !== undefined) return fallback
  const text = await requestText(addr)
  return JSON.parse(text)
}

export function sendSave(url, notify) {
  return requestText(url).then((text) => {
    if (text !== "true") throw new Error(`response error ${url.split("?")[0]}`)
    notify?.("Save Successful.", 8000)
    return true
  })
}
