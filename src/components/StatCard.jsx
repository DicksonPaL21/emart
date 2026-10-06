export default function StatCard({ title, rows, action }) {
  return (
    <div class='container'>
      <div style='width:100%;display:inline-block'>
        <div class='col-12'>
          <h6 class='float-left ml-2 f-3' style='color:#BFBFBF'>
            {title}
          </h6>
          {action}
        </div>
        {rows.map((row) => (
          <div class='col-12' key={row.label}>
            <h4
              class={`text-left float-left white ${row.small ? "f-2" : "f-1"}`}
            >
              {row.label}
            </h4>
            <h4
              class={`text-right float-right ${row.color || "green"} ${row.small ? "f-2" : "f-1"}`}
            >
              {row.value}
            </h4>
          </div>
        ))}
      </div>
    </div>
  )
}
