import React from 'react'

function Header({ onRunSimulation, wsConnected }) {
  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1 className="header-title">🛣️ Virtual Road Lab</h1>
          <p className="header-subtitle">Accident Prevention Scenario Designer</p>
        </div>
      </div>
      <div className="header-right">
        <span style={{
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '999px',
          background: wsConnected ? 'rgba(52,211,153,0.15)' : 'rgba(156,163,175,0.1)',
          color: wsConnected ? '#34d399' : '#6b7280',
          border: `1px solid ${wsConnected ? '#34d39940' : '#374151'}`,
        }}>
          {wsConnected ? '● WS Live' : '○ REST Mode'}
        </span>
        <button className="primary-button" onClick={onRunSimulation}>
          <span>▶</span>
          <span>Run Simulation</span>
        </button>
      </div>
    </header>
  )
}

export default Header
