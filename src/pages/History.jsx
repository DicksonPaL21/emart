import { useEffect, useState } from "preact/hooks"
import StatCard from "../components/StatCard.jsx"
import { fixed, money, requestJson } from "../lib/api.js"

const fallback = {
  electricityCost: [0, 0],
  energyCost: [0, 0, 0, 0],
  consumption: [0, 0, 0, 0],
  totalConsumed: [0, 0],
  history: [],
}

export default function History({ notify }) {
  const [data, setData] = useState(fallback)
  const [page, setPage] = useState(0)

  useEffect(() => {
    requestJson("dataHistory.json", fallback)
      .then((next) => setData({ ...fallback, ...next }))
      .catch(() => notify("error loading dataHistory.json", 8000))
  }, [])

  const pages = Math.max(1, Math.ceil((data.history || []).length / 20))
  const rows = (data.history || []).slice(page * 20, page * 20 + 20)

  return (
    <div class='row'>
      <div id='line' class='col-12 col-sm-3'>
        <StatCard
          title='Electricity Cost'
          rows={[
            { label: "This Month", value: money(data.electricityCost?.[0]) },
            {
              label: "Last Month",
              value: money(data.electricityCost?.[1]),
              color: "orange",
              small: true,
            },
          ]}
        />
        <StatCard
          title='Energy Cost'
          rows={[
            { label: "Yesterday", value: money(data.energyCost?.[1]) },
            {
              label: "This Month",
              value: money(data.energyCost?.[2]),
              color: "orange",
              small: true,
            },
            {
              label: "Last Month",
              value: money(data.energyCost?.[3]),
              color: "red",
              small: true,
            },
          ]}
        />
        <StatCard
          title='Energy Consumption'
          rows={[
            { label: "Yesterday", value: `${fixed(data.consumption?.[1])} kW` },
            {
              label: "This Month",
              value: `${fixed(data.consumption?.[2])} kW`,
              color: "orange",
              small: true,
            },
            {
              label: "Last Month",
              value: `${fixed(data.consumption?.[3])} kW`,
              color: "red",
              small: true,
            },
          ]}
        />
        <StatCard
          title='Total Consumed'
          rows={[
            { label: "Cost", value: money(data.totalConsumed?.[0]) },
            {
              label: "Energy",
              value: `${fixed(data.totalConsumed?.[1])} kW`,
              color: "orange",
              small: true,
            },
          ]}
        />
      </div>
      <div class='col-12 col-sm-9'>
        <div class='container'>
          <div id='table'>
            <table class='th-center'>
              <thead class='f-2'>
                <tr>
                  <th>Date</th>
                  <th>Energy</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody class='f-1'>
                {rows.length ? (
                  rows.map((row) => (
                    <tr key={row[0]}>
                      <th>{new Date(row[0]).toDateString().slice(4)}</th>
                      <th>{fixed(row[1])} kW</th>
                      <th>{money(row[2], 4)}</th>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <th colspan='3'>No history yet</th>
                  </tr>
                )}
              </tbody>
            </table>
            <div class='pagination dark f-2'>
              {Array.from({ length: pages }, (_, index) => (
                <a
                  class={`page dark ${index === page ? "active" : ""}`}
                  href='#table'
                  onClick={(event) => {
                    event.preventDefault()
                    setPage(index)
                  }}
                >
                  {index + 1}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
