"use client"

import { useEffect, useState } from "react"
import { requestJson, requestText } from "../../src/lib/api.js"

const fallback = {
  ssidName: "EMART",
  ssidPassword: "password123",
  ssidHidden: false,
  channel: 1,
  macAp: "AA:BB:CC:DD:EE:FF",
  randMacAp: false,
  macInterval: 30,
  serverUsername: "admin",
  serverPassword: "admin",
  wifiStatus: false,
  wifiName: "",
  wifiPassword: "",
}

function Field({ label, children }) {
  return (
    <div className='row'>
      <div className='col-6'>
        <span className='labelFix f-1'>{label}</span>
      </div>
      <div className='col-6'>{children}</div>
    </div>
  )
}

function Check({ id, label, checked, onChange }) {
  return (
    <div className='row'>
      <div className='col-12'>
        <div className='checkbox-group labelFix'>
          <label className='f-1' htmlFor={id}>{label}</label>
          <span className='checkbox-mask ml-3'>
            <input
              id={id}
              type='checkbox'
              checked={checked}
              onChange={(event) => onChange(event.currentTarget.checked)}
            />
            <label className='checkbox' htmlFor={id} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Setting({ notify }) {
  const [config, setConfig] = useState(fallback)
  const [indicator, setIndicator] = useState("")
  const set = (key) => (event) =>
    setConfig({
      ...config,
      [key]:
        event.currentTarget.type === "checkbox"
          ? event.currentTarget.checked
          : event.currentTarget.value,
    })
  const setBool = (key) => (value) => setConfig({ ...config, [key]: value })

  useEffect(() => {
    requestJson("config.json", fallback)
      .then((next) => setConfig({ ...fallback, ...next }))
      .catch(() => notify("Error: getting configuration.", 8000))
  }, [notify])

  const call = async (url, ok = "saved") => {
    try {
      const text = await requestText(url)
      if (text !== "true")
        throw new Error(`response error ${url.split("?")[0]}`)
      setIndicator(ok)
    } catch (error) {
      notify(error.message, 8000)
    }
  }

  const submit = (event) => {
    event.preventDefault()
    setIndicator("saving...")
    const params = new URLSearchParams()
    ;[
      "ssidName",
      "ssidPassword",
      "ssidHidden",
      "channel",
      "randMacAp",
      "serverUsername",
      "serverPassword",
      "wifiStatus",
    ].forEach((key) => params.set(key, config[key]))
    if (config.randMacAp) params.set("macInterval", config.macInterval)
    else params.set("macAp", config.macAp)
    if (config.wifiStatus) {
      params.set("wifiName", config.wifiName)
      params.set("wifiPassword", config.wifiPassword)
    }
    call(`configSave.json?${params}`).then(() =>
      call("restartEMART.json", "saved"),
    )
  }

  return (
    <form onSubmit={submit}>
      <div className='row'>
        <div className='col-12 col-md-6'>
          <div className='label-container f-1'>WiFi Server</div>
          <div className='container' style={{ textAlign: "left" }}>
            <Field label='SSID'>
              <input
                aria-label='WiFi server SSID'
                name='ssidName'
                className='f-1'
                value={config.ssidName}
                minLength='5'
                maxLength='32'
                required
                onInput={set("ssidName")}
              />
            </Field>
            <Field
              label={
                <span>
                  Password (<span className='red'>min.8 chars</span>)
                </span>
              }
            >
              <input
                aria-label='WiFi server password'
                name='ssidPassword'
                type='password'
                autoComplete='new-password'
                className='f-1'
                value={config.ssidPassword}
                minLength='8'
                maxLength='32'
                required
                onInput={set("ssidPassword")}
              />
            </Field>
            <Check
              id='ssidHidden'
              label={
                <span>
                  Hide SSID (
                  <span className='red'>be careful with this setting!</span>)
                </span>
              }
              checked={config.ssidHidden}
              onChange={setBool("ssidHidden")}
            />
            <Field label='Channel'>
              <input
                type='number'
                aria-label='WiFi channel'
                name='channel'
                className='f-1'
                value={config.channel}
                min='1'
                max='14'
                required
                onInput={set("channel")}
              />
            </Field>
            <Field label='MAC'>
              <input
                aria-label='Access point MAC address'
                name='macAp'
                className='upperCase f-1'
                value={config.macAp}
                minLength='17'
                maxLength='17'
                required
                disabled={config.randMacAp}
                onInput={set("macAp")}
              />
            </Field>
            <Check
              id='randMacAp'
              label='Random MAC'
              checked={config.randMacAp}
              onChange={setBool("randMacAp")}
            />
            <Field label='MAC Change Interval'>
              <input
                type='number'
                aria-label='MAC change interval in minutes'
                name='macInterval'
                className='text-center f-1'
                style={{ width: "75px" }}
                value={config.macInterval}
                min='30'
                max='86400'
                required
                disabled={!config.randMacAp}
                onInput={set("macInterval")}
              />{" "}
              <label className='labelFix ml-2 f-1'>min</label>
            </Field>
          </div>
        </div>
        <div className='col-12 col-md-6'>
          <div className='label-container f-1'>WiFi Client</div>
          <div className='container' style={{ textAlign: "left" }}>
            <Check
              id='wifiStatus'
              label='Enable WiFi Client'
              checked={config.wifiStatus}
              onChange={setBool("wifiStatus")}
            />
            <Field label='SSID'>
              <input
                aria-label='WiFi client SSID'
                name='wifiName'
                className='f-1'
                value={config.wifiName}
                minLength='5'
                maxLength='32'
                required={config.wifiStatus}
                disabled={!config.wifiStatus}
                onInput={set("wifiName")}
              />
            </Field>
            <Field label='Password'>
              <input
                aria-label='WiFi client password'
                name='wifiPassword'
                type='password'
                autoComplete='current-password'
                className='f-1'
                value={config.wifiPassword}
                minLength='8'
                maxLength='32'
                required={config.wifiStatus}
                disabled={!config.wifiStatus}
                onInput={set("wifiPassword")}
              />
            </Field>
          </div>
          <div className='label-container f-1'>Web Server</div>
          <div className='container' style={{ textAlign: "left" }}>
            <Field label='Username'>
              <input
                aria-label='Web server username'
                name='serverUsername'
                autoComplete='username'
                className='f-1'
                value={config.serverUsername}
                minLength='5'
                maxLength='16'
                required
                onInput={set("serverUsername")}
              />
            </Field>
            <Field
              label={
                <span>
                  Password (<span className='red'>min.5 chars</span>)
                </span>
              }
            >
              <input
                aria-label='Web server password'
                name='serverPassword'
                type='password'
                autoComplete='current-password'
                className='f-1'
                value={config.serverPassword}
                minLength='5'
                maxLength='32'
                required
                onInput={set("serverPassword")}
              />
            </Field>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-12' style={{ marginTop: "20px" }}>
          <button
            type='button'
            className='red f-2'
            onClick={() =>
              call("configReset.json").then(() => call("restartEMART.json"))
            }
          >
            reset
          </button>
          <button
            type='button'
            className='red f-2'
            onClick={() => call("restartEMART.json")}
          >
            restart
          </button>
          <button type='submit' className='button-primary float-right f-2'>
            save
          </button>
          <div className='float-right' id='indicator'>
            {indicator}
          </div>
        </div>
      </div>
    </form>
  )
}


