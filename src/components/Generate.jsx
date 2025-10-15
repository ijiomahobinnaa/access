import React, { useState } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

export default function Generate() {
  const [count, setCount] = useState(10)
  const [ttl, setTtl] = useState(0)
  const [prefix, setPrefix] = useState('INV')
  const [names, setNames] = useState('') // one per line
  const [batch, setBatch] = useState(null)

  async function handleGenerate() {
    const inviteeNames = names.split('\n').map(s => s.trim()).filter(Boolean)
    const res = await fetch(`${API}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, ttlMinutes: Number(ttl), prefix, inviteeNames })
    })
    const json = await res.json()
    if (!json.ok) return alert('Failed: ' + (json.error || 'unknown'))
    setBatch(json)
  }

  function pdfUrl() {
    if (!batch?.batchId) return '#'
    return `${API.replace(/\/$/, '')}/batch/${encodeURIComponent(batch.batchId)}/labels.pdf`
  }

  return (
    <div className="card">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div>
          <label>Count</label>
          <input type="number" min={1} max={1000} value={count} onChange={e=>setCount(e.target.value)} />
        </div>
        <div>
          <label>TTL (minutes, 0 = none)</label>
          <input type="number" min={0} value={ttl} onChange={e=>setTtl(e.target.value)} />
        </div>
        <div>
          <label>Prefix</label>
          <input value={prefix} onChange={e=>setPrefix(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Invitee names (optional, one per line; matched in order)</label>
        <textarea rows={6} value={names} onChange={e=>setNames(e.target.value)} style={{ width: '100%' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={handleGenerate}>Generate</button>
        {batch?.batchId && <a href={pdfUrl()} target="_blank" rel="noreferrer"><button>Download PDF</button></a>}
      </div>

      {batch && (
        <div style={{ marginTop: 16 }}>
          <div><strong>Batch:</strong> {batch.batchId}</div>
          <div><strong>Generated:</strong> {batch.count}</div>
          <details style={{ marginTop: 8 }}>
            <summary>Show tokens</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{batch.items.map(i => (i.inviteeName ? `${i.inviteeName} — ${i.token}` : i.token)).join('\n')}</pre>
          </details>
        </div>
      )}
    </div>
  )
}
