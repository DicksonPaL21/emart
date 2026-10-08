export default function StatCard({ title, rows, action }) {
  return (
    <div className='container'>
      <div style={{ width: "100%", display: "inline-block" }}>
        <div className='col-12'>
          <h6 className='float-left ml-2 f-3' style={{ color: "#BFBFBF" }}>
            {title}
          </h6>
          {action}
        </div>
        {rows.map((row) => (
          <div className='col-12' key={row.label}>
            <h4
              className={`text-left float-left white ${row.small ? "f-2" : "f-1"}`}
            >
              {row.label}
            </h4>
            <h4
              className={`text-right float-right ${row.color || "green"} ${row.small ? "f-2" : "f-1"}`}
            >
              {row.value}
            </h4>
          </div>
        ))}
      </div>
    </div>
  )
}
