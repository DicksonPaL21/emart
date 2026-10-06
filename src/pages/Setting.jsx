import { useEffect, useState } from "preact/hooks"
import { requestJson, requestText } from "../lib/api.js"

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
    <div class='row'>
      <div class='col-6'>
        <label class='labelFix f-1'>{label}</label>
      </div>
      <div class='col-6'>{children}</div>
    </div>
  )
}

function Check({ id, label, checked, onChange }) {
  return (
    <div class='row'>
      <div class='col-12'>
        <div class='checkbox-group labelFix'>
          <label class='f-1'>{label}</label>
          <span class='checkbox-mask ml-3'>
            <input
              id={id}
              type='checkbox'
              checked={checked}
              onChange={(event) => onChange(event.currentTarget.checked)}
            />
            <label class='checkbox' for={id} />
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
  }, [])

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
      <div class='row'>
        <div class='col-12 col-md-6'>
          <div class='label-container f-1'>WiFi Server</div>
          <div class='container' style='text-align:left'>
            <Field label='SSID'>
              <input
                class='f-1'
                value={config.ssidName}
                minlength='5'
                maxlength='32'
                required
                onInput={set("ssidName")}
              />
            </Field>
            <Field
              label={
                <span>
                  Password (<span class='red'>min.8 chars</span>)
                </span>
              }
            >
              <input
                class='f-1'
                value={config.ssidPassword}
                minlength='8'
                maxlength='32'
                required
                onInput={set("ssidPassword")}
              />
            </Field>
            <Check
              id='ssidHidden'
              label={
                <span>
                  Hide SSID (
                  <span class='red'>be careful with this setting!</span>)
                </span>
              }
              checked={config.ssidHidden}
              onChange={setBool("ssidHidden")}
            />
            <Field label='Channel'>
              <input
                type='number'
                class='f-1'
                value={config.channel}
                min='1'
                max='14'
                required
                onInput={set("channel")}
              />
            </Field>
            <Field label='MAC'>
              <input
                class='upperCase f-1'
                value={config.macAp}
                minlength='17'
                maxlength='17'
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
                class='text-center f-1'
                style='width:75px'
                value={config.macInterval}
                min='30'
                max='86400'
                required
                disabled={!config.randMacAp}
                onInput={set("macInterval")}
              />{" "}
              <label class='labelFix ml-2 f-1'>min</label>
            </Field>
          </div>
        </div>
        <div class='col-12 col-md-6'>
          <div class='label-container f-1'>WiFi Client</div>
          <div class='container' style='text-align:left'>
            <Check
              id='wifiStatus'
              label='Enable WiFi Client'
              checked={config.wifiStatus}
              onChange={setBool("wifiStatus")}
            />
            <Field label='SSID'>
              <input
                class='f-1'
                value={config.wifiName}
                minlength='5'
                maxlength='32'
                required={config.wifiStatus}
                disabled={!config.wifiStatus}
                onInput={set("wifiName")}
              />
            </Field>
            <Field label='Password'>
              <input
                class='f-1'
                value={config.wifiPassword}
                minlength='8'
                maxlength='32'
                required={config.wifiStatus}
                disabled={!config.wifiStatus}
                onInput={set("wifiPassword")}
              />
            </Field>
          </div>
          <div class='label-container f-1'>Web Server</div>
          <div class='container' style='text-align:left'>
            <Field label='Username'>
              <input
                class='f-1'
                value={config.serverUsername}
                minlength='5'
                maxlength='16'
                required
                onInput={set("serverUsername")}
              />
            </Field>
            <Field
              label={
                <span>
                  Password (<span class='red'>min.5 chars</span>)
                </span>
              }
            >
              <input
                class='f-1'
                value={config.serverPassword}
                minlength='5'
                maxlength='32'
                required
                onInput={set("serverPassword")}
              />
            </Field>
          </div>
        </div>
      </div>
      <div class='row'>
        <div class='col-12' style='margin-top:20px'>
          <button
            type='button'
            class='red f-2'
            onClick={() =>
              call("configReset.json").then(() => call("restartEMART.json"))
            }
          >
            reset
          </button>
          <button
            type='button'
            class='red f-2'
            onClick={() => call("restartEMART.json")}
          >
            restart
          </button>
          <button type='submit' class='button-primary float-right f-2'>
            save
          </button>
          <div class='float-right' id='indicator'>
            {indicator}
          </div>
        </div>
      </div>
    </form>
  )
}
