"use client"

import { useEffect, useRef, useState } from "react"
import Modal from "../../src/components/Modal.jsx"
import StatCard from "../../src/components/StatCard.jsx"
import {
  decimalsAllocated,
  fixed,
  isDebug,
  money,
  requestJson,
  sendSave,
} from "../../src/lib/api.js"

const fallback = {
  capacity: [260, 100, 26000, 99999],
  consumption: [0, 0],
  electricityCost: [0],
  estimatedCost: [0, 0],
  switches: {
    name: ["Switch 1", "Switch 2", "Switch 3", "Switch 4"],
    state: [false, false, false, false],
  },
  chart: [0, 0, 0, 0],
}

function Gauge({ label, color, value, max, unit }) {
  const shownMax = Math.max(max || 1, value || 0)
  const deg = Math.min(180, ((value || 0) / shownMax) * 180)
  const display =
    value < 1000 ? decimalsAllocated(value) : decimalsAllocated(value / 1000)
  const suffix = value < 1000 ? unit : `k${unit}`
  return (
    <div className='col-6 col-md-6 col-lg-3'>
      <div className='GaugeMeter'>
        <figure>
          <div className='gauge' title={`${display}${suffix} / ${shownMax}${unit}`}>
            <div className='value sub-title'>
              {display}
              <small className='f-3'>{suffix}</small>
            </div>
            <div
              className='meter'
              style={{ backgroundColor: color, transform: `rotate(${deg}deg)` }}
            />
          </div>
        </figure>
        <label className='f-1'>{label}</label>
      </div>
    </div>
  )
}

function Chart({ data, capacity }) {
  const canvas = useRef(null)
  const [series, setSeries] = useState([[], [], []])
  const [selected, setSelected] = useState(0)
  const names = ["Voltage", "Current", "Power"]

  useEffect(() => {
    setSeries((old) =>
      old.map((items, index) => [
        ...items.slice(-99),
        Math.min(data[index] || 0, capacity[index] || data[index] || 1),
      ]),
    )
  }, [data, capacity])

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d")
    if (!ctx) return
    const w = (canvas.current.width =
      canvas.current.offsetWidth * devicePixelRatio)
    const h = (canvas.current.height = 180 * devicePixelRatio)
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = "#37373D"
    ctx.lineWidth = 1
    for (let y = 20; y < 180; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    const points = series[selected]
    const max = Math.max(capacity[selected] || 1, ...points, 1)
    ctx.fillStyle = [
      "rgba(245,105,84,.25)",
      "rgba(0,192,239,.25)",
      "rgba(0,166,90,.25)",
    ][selected]
    ctx.strokeStyle = ["#F56954", "#00C0EF", "#00A65A"][selected]
    ctx.beginPath()
    points.forEach((point, index) => {
      const x = (index / 99) * canvas.current.offsetWidth
      const y = 170 - (point / max) * 150
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.lineTo(canvas.current.offsetWidth, 180)
    ctx.lineTo(0, 180)
    ctx.closePath()
    ctx.fill()
  }, [series, selected, capacity])

  return (
    <div className='container'>
      <div className='clearfix p-1'>
        <div className='btn-group float-right'>
          <select
            aria-label='Chart metric'
            className='f-1'
            value={names[selected]}
            onChange={(event) =>
              setSelected(names.indexOf(event.currentTarget.value))
            }
          >
            {names.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className='chart'>
        <canvas ref={canvas} className='chart-canvas' />
        <div className='knob knob-label f-1'>{names[selected].toUpperCase()}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ notify }) {
  const [data, setData] = useState(fallback)
  const [calcOpen, setCalcOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [switchEdit, setSwitchEdit] = useState(false)
  const socket = useRef(null)

  const update = (next) =>
    setData((old) => ({
      ...old,
      ...next,
      switches: next.switches || old.switches,
    }))

  useEffect(() => {
    requestJson("dataDashboard.json", fallback)
      .then(update)
      .catch(() => notify("error loading dataDashboard.json", 8000))
    if (!isDebug) {
      socket.current = new WebSocket(
        `ws://${location.hostname}:81${location.pathname}`,
      )
      socket.current.onmessage = (event) => {
        try {
          update(JSON.parse(event.data))
        } catch {
          notify("error getting data dashboard.", 8000)
        }
      }
      socket.current.onclose = () => location.reload()
      socket.current.onerror = () => location.reload()
      return () => socket.current?.close()
    }
  }, [notify])

  const save = (url) =>
    sendSave(url, notify)
      .then(() => socket.current?.send(""))
      .catch((error) => notify(error.message, 8000))
  const setSwitch = (index, checked) =>
    save(`switchesToggleSave.json?switch${index + 1}=${checked}`)

  return (
    <>
      <div className='row reverse'>
        <div className='col-12 col-md-4 col-lg-3' id='options'>
          <button className='f-2' onClick={() => setCalcOpen(true)}>
            CALCULATOR
          </button>
          <StatCard
            title='Energy Consumption'
            rows={[
              { label: "Today", value: `${fixed(data.consumption?.[0])} kWh` },
              {
                label: "Yesterday",
                value: `${fixed(data.consumption?.[1])} kWh`,
                color: "orange",
                small: true,
              },
            ]}
          />
          <StatCard
            title='Electricity Cost'
            action={
              <button
                type='button'
                className='float-right b-3 mr-2'
                aria-label='Edit electricity cost'
                onClick={() => setEdit("electricityCost")}
              />
            }
            rows={[
              { label: "This Month", value: money(data.electricityCost?.[0]) },
            ]}
          />
          <StatCard
            title='Estimation'
            action={
              <button
                type='button'
                className='float-right b-3 mr-2'
                aria-label='Edit estimation'
                onClick={() => setEdit("estimatedCost")}
              />
            }
            rows={[
              {
                label: "Estimated",
                value: money(data.estimatedCost?.[1]),
                color: "blue",
              },
            ]}
          />
          <div className='container'>
            <div style={{ width: "100%", display: "inline-block" }}>
              <div className='col-12'>
                <h6 className='float-left ml-2 f-3' style={{ color: "#BFBFBF" }}>
                  Control Panel
                </h6>
                <button
                  type='button'
                  className='float-right b-3 mr-2'
                  aria-label='Edit switch names'
                  onClick={() => setSwitchEdit(true)}
                />
              </div>
              {data.switches.name.map((name, index) => (
                <div className='col-12 toggle-group f-1' key={index}>
                  <div className='float-left'>
                    <label className='align-middle white'>{name}</label>
                  </div>
                  <div className='float-right'>
                    <input
                      id={`toggle-${index + 1}`}
                      type='checkbox'
                      checked={data.switches.state[index]}
                      onChange={(event) => setSwitch(index, event.currentTarget.checked)}
                    />
                    <label
                      id={`label-${index + 1}`}
                      htmlFor={`toggle-${index + 1}`}
                      className='align-middle'
                    >
                      <div id={`switch-${index + 1}`} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='col-12 col-md-8 col-lg-9'>
          <div className='container'>
            <div style={{ display: "inline-block", width: "100%" }}>
              <Gauge
                label='VOLTAGE'
                color='#D9534F'
                value={data.chart?.[0]}
                max={data.capacity?.[0]}
                unit='V'
              />
              <Gauge
                label='CURRENT'
                color='#337AB7'
                value={data.chart?.[1]}
                max={data.capacity?.[1]}
                unit='A'
              />
              <Gauge
                label='POWER'
                color='#5CB85C'
                value={data.chart?.[2]}
                max={data.capacity?.[2]}
                unit='W'
              />
              <Gauge
                label='ENERGY'
                color='#F0AD4E'
                value={data.chart?.[3]}
                max={data.capacity?.[3]}
                unit='Wh'
              />
            </div>
          </div>
          <Chart
            data={data.chart || [0, 0, 0]}
            capacity={data.capacity || fallback.capacity}
          />
        </div>
      </div>
      <Calculator
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        energyCost={data.electricityCost?.[0] || 0}
      />
      <EditAmount edit={edit} close={() => setEdit(null)} save={save} />
      <SwitchNames
        open={switchEdit}
        close={() => setSwitchEdit(false)}
        switches={data.switches}
        save={save}
      />
    </>
  )
}

function Calculator({ open, onClose, energyCost }) {
  const [form, setForm] = useState({
    volt: 0,
    load: 0,
    hours: 1,
    cost: energyCost,
    mode: "Amps",
  })
  const power =
    form.mode === "Watts"
      ? Number(form.load)
      : Number(form.volt) * Number(form.load)
  const rows = [
    ["Hour", power],
    ["Day", power * form.hours],
    ["Week", power * form.hours * 7],
    ["Month", power * form.hours * 30],
    ["Year", power * form.hours * 365],
  ]
  const input = (key) => (event) =>
    setForm({ ...form, [key]: event.currentTarget.value })
  return (
    <Modal
      open={open}
      title='Energy Consumption Calculator'
      onClose={onClose}
      footer={
        <>
          <button type='button' className='btn-default f-2' onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className='row'>
        <div className='col-6'>
          <input
            aria-label='Voltage'
            name='voltage'
            className='f-1 mb-1'
            placeholder='V'
            disabled={form.mode === "Watts"}
            value={form.volt}
            onInput={input("volt")}
          />
          <select aria-label='Load unit' name='mode' className='f-1' value={form.mode} onChange={input("mode")}>
            <option>Amps</option>
            <option>Watts</option>
          </select>
        </div>
        <div className='col-6'>
          <input
            aria-label='Electrical load'
            name='load'
            className='f-1 mb-1'
            placeholder='A/W'
            value={form.load}
            onInput={input("load")}
          />
          <input
            type='number'
            aria-label='Hours used per day'
            name='hours'
            className='f-1 mb-1'
            min='1'
            placeholder='Hour'
            value={form.hours}
            onInput={input("hours")}
          />
          <input
            aria-label='Electricity cost per kilowatt-hour'
            name='cost'
            className='f-1'
            placeholder='₱'
            value={form.cost}
            onInput={input("cost")}
          />
        </div>
      </div>
      <table className='th-center'>
        <thead className='f-2'>
          <tr>
            <th>Duration</th>
            <th>Energy</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody className='f-1'>
          {rows.map(([label, watts]) => (
            <tr key={label}>
              <th>{label}</th>
              <th>{decimalsAllocated(watts / 1000)} kWh</th>
              <th>{money((watts / 1000) * form.cost, 4)}</th>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}

function EditAmount({ edit, close, save }) {
  const [value, setValue] = useState("")
  if (!edit) return null
  const inputId = edit
  return (
    <Modal
      open
      title={edit === "estimatedCost" ? "Estimate Cost" : "Electricity Cost"}
      onClose={close}
      footer={
        <>
          <button type='button' className='btn-default f-2' onClick={close}>
            Close
          </button>
          <button
            type='button'
            className='btn-primary f-2'
            onClick={() => {
              save(`${inputId}Save.json?${inputId}=${value}`)
              close()
            }}
          >
            Save changes
          </button>
        </>
      }
    >
      <div className='row'>
        <div className='col-3'>
          <h4 className='labelFix f-1'>Cost</h4>
        </div>
        <div className='col-9 input_field'>
          <input
            aria-label='Amount'
            name={inputId}
            className='f-1'
            placeholder='Amount'
            value={value}
            onInput={(event) => setValue(event.currentTarget.value)}
            autoFocus
          />
        </div>
      </div>
    </Modal>
  )
}

function SwitchNames({ open, close, switches, save }) {
  const [names, setNames] = useState(switches.name)
  useEffect(() => setNames(switches.name), [switches.name])
  if (!open) return null
  const url = `switchesNameSave.json?switchName1=${names[0]}&switchName2=${names[1]}&switchName3=${names[2]}&switchName4=${names[3]}`
  return (
    <Modal
      open
      title='Switch Name'
      onClose={close}
      footer={
        <>
          <button type='button' className='btn-default f-2' onClick={close}>
            Close
          </button>
          <button
            type='button'
            className='btn-primary f-2'
            onClick={() => {
              save(url)
              close()
            }}
          >
            Save changes
          </button>
        </>
      }
    >
      {names.map((name, index) => (
        <div className='row' key={index}>
          <div className='col-4'>
            <h4 className='labelFix f-1'>Switch {index + 1}</h4>
          </div>
          <div className='col-8 input_field'>
            <input
              aria-label={`Switch ${index + 1} name`}
              name={`switchName${index + 1}`}
              className='f-1'
              value={name}
              maxLength='9'
              onInput={(event) =>
                setNames(
                  names.map((old, i) =>
                    i === index ? event.currentTarget.value : old,
                  ),
                )
              }
            />
          </div>
        </div>
      ))}
    </Modal>
  )
}


