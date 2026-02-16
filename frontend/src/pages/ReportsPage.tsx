import { useState, useEffect, useMemo } from 'react'

const API_URL =
  'https://script.google.com/macros/s/AKfycbz7mJma9PeJzlCNr-1EQgqI2-JbMwx-LTSznDt0v3vB8BMhEBIYYLY7TtA6Ir6IkSjmlw/exec'

interface VisitRecord {
  Timestamp: string
  'Email Address': string
  District: string
  'Select D1 Locale': string
  'Select D2 Locale': string
  'Select D3 Locale': string
  'Number of Families Visited': number
  'Number Of Locale Choir Groups Present': number
  'Date of Visit': string
  'Reported By': string
}

function formatDate(input: string): string {
  if (!input) return ''
  const d = new Date(input)
  if (isNaN(d.getTime())) return input
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getLocales(record: VisitRecord): string {
  return [
    record['Select D1 Locale'],
    record['Select D2 Locale'],
    record['Select D3 Locale'],
  ]
    .filter(Boolean)
    .join(', ')
}

function ReportsPage() {
  const [data, setData] = useState<VisitRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        const rows: string[][] = json.data
        const headers = rows[0]
        const records = rows.slice(1).map((row) => {
          const obj: Record<string, string | number> = {}
          headers.forEach((h, i) => (obj[h] = row[i]))
          return obj as unknown as VisitRecord
        })
        setData(records)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const raw = row['Date of Visit']
      if (!raw) return false
      const visit = raw.slice(0, 10) // extract YYYY-MM-DD from ISO string
      if (startDate && visit < startDate) return false
      if (endDate && visit > endDate) return false
      return true
    })
  }, [data, startDate, endDate])

  const summary = useMemo(() => {
    const totalFamilies = filtered.reduce(
      (sum, r) => sum + Number(r['Number of Families Visited'] || 0),
      0,
    )
    const totalGroups = filtered.reduce(
      (sum, r) => sum + Number(r['Number Of Locale Choir Groups Present'] || 0),
      0,
    )
    const districts = new Set(filtered.map((r) => r.District).filter(Boolean))
    return { totalVisits: filtered.length, totalFamilies, totalGroups, districtCount: districts.size }
  }, [filtered])

  if (loading) return <div className="loading">Loading reports...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="reports-page">
      <h1>Harana Visit Reports</h1>

      <div className="filters">
        <label>
          From
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button className="btn-clear" onClick={() => { setStartDate(''); setEndDate('') }}>
          Clear
        </button>
      </div>

      <div className="summary-cards">
        <div className="card">
          <div className="card-value">{summary.totalVisits}</div>
          <div className="card-label">Total Visits</div>
        </div>
        <div className="card">
          <div className="card-value">{summary.totalFamilies}</div>
          <div className="card-label">Families Visited</div>
        </div>
        <div className="card">
          <div className="card-value">{summary.totalGroups}</div>
          <div className="card-label">Choir Groups</div>
        </div>
        <div className="card">
          <div className="card-value">{summary.districtCount}</div>
          <div className="card-label">Districts</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date of Visit</th>
              <th>District</th>
              <th>Locale(s)</th>
              <th>Families</th>
              <th>Choir Groups</th>
              <th>Reported By</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">No records found for the selected date range.</td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i}>
                  <td>{formatDate(row['Date of Visit'])}</td>
                  <td>{row.District}</td>
                  <td>{getLocales(row)}</td>
                  <td className="num">{row['Number of Families Visited']}</td>
                  <td className="num">{row['Number Of Locale Choir Groups Present']}</td>
                  <td>{row['Reported By']}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportsPage
