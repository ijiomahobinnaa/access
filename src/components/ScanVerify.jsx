import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

const API = import.meta.env.VITE_API || '/api'

export default function ScanVerify() {
  const scannerRef = useRef(null)
  const [token, setToken] = useState('')
  const [result, setResult] = useState(null)
  const lastScanRef = useRef({ t: '', at: 0 })

  async function verify(t) {
    if (!t) return
    const res = await fetch(`${API}/verify/${encodeURIComponent(t)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const json = await res.json()
    setResult({ token: t, ...json })
  }

  useEffect(() => {
    const id = 'qr-scanner'
    const scanner = new Html5QrcodeScanner(id, { fps: 10, qrbox: 250 }, false)
    scanner.render(
      (decoded) => {
        const text = String(decoded || '').trim()
        const now = Date.now()
        const { t: lt, at } = lastScanRef.current
        // throttle duplicates within 1500ms
        if (lt === text && now - at < 1500) return
        lastScanRef.current = { t: text, at: now }
        setToken(text)
        verify(text)
      },
      (_) => {}
    )
    scannerRef.current = scanner
    return () => {
      try { scannerRef.current?.clear() } catch {}
    }
  }, [])

  return (
    <div className="card">
      <div style={{ marginBottom: 8 }}>
        <label>Manual token</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ flex: 1 }} value={token} onChange={e => setToken(e.target.value)} placeholder="Paste token here" />
          <button onClick={() => verify(token)}>Verify</button>
        </div>
      </div>
      <div id="qr-scanner" style={{ width: '100%' }} />

      {result && (
        <div style={{ marginTop: 12, padding: 10, border: '1px solid #ddd', borderRadius: 8 }}>
          <div><strong>Token:</strong> {result.token}</div>
          <div><strong>Status:</strong> {result.status || (result.ok ? 'ok' : 'error')}</div>
          {result.usedAt && <div><strong>Used At:</strong> {new Date(result.usedAt).toLocaleString()}</div>}
          {typeof result.scanCount !== 'undefined' && <div><strong>Scanned:</strong> {result.scanCount} time{result.scanCount !== 1 ? 's' : ''}</div>}
          {result.error && <div style={{ color: 'crimson' }}><strong>Error:</strong> {result.error}</div>}
        </div>
      )}
    </div>
  )
}
