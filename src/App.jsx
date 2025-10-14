import React, { useState } from 'react'
import Generate from './components/Generate.jsx'
import ScanVerify from './components/ScanVerify.jsx'

export default function App() {
  const [tab, setTab] = useState('generate')
  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1>Invitation QR System</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('generate')}>Generate & PDF</button>
        <button onClick={() => setTab('scan')}>Scan & Verify</button>
      </div>
      {tab === 'generate' ? <Generate /> : <ScanVerify />}
    </div>
  )
}
