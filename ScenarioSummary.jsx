import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

function RiskChart({ simResult }) {
  if (!simResult) return null
  const { stopping_distance, reaction_distance, braking_distance, available_sight_distance } = simResult
  const data = {
    labels: ['Reaction', 'Braking', 'Stopping', 'Sight'],
    datasets: [{
      label: 'Distance (m)',
      data: [reaction_distance, braking_distance, stopping_distance, available_sight_distance],
      borderColor: '#c4e636',
      backgroundColor: 'rgba(196,230,54,0.08)',
      pointBackgroundColor: (ctx) => {
        const v = ctx.dataset.data[ctx.dataIndex]
        return v > available_sight_distance ? '#f97373' : '#c4e636'
      },
      tension: 0.4,
      fill: true,
    }],
  }
  const opts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { color: '#1e293b' } },
    },
  }
  return (
    <div style={{ marginTop: '10px' }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Distance analysis (m)</p>
      <Line data={data} options={opts} />
    </div>
  )
}

function ScenarioSummary({ scenario, simResult, isSimLoading, simError }) {
  const riskLevel = simResult?.risk_level ?? null
  const riskColor = riskLevel === 'Low' ? '#34d399' : riskLevel === 'Medium' ? '#fbbf24' : riskLevel === 'High' ? '#f97373' : '#9ca3af'

  return (
    <aside className="panel panel-right">
      <h2 className="panel-title">Scenario Summary</h2>

      {isSimLoading && (
        <p style={{ color: 'var(--accent)', fontSize: '13px' }}>⏳ Running simulation…</p>
      )}
      {simError && (
        <p style={{ color: 'var(--danger)', fontSize: '12px', lineHeight: '1.5' }}>⚠️ {simError}</p>
      )}

      {simResult && (
        <>
          <div className="summary-card">
            <p style={{ marginBottom: '6px' }}>
              <strong>Risk level:</strong>{' '}
              <span style={{ color: riskColor, fontWeight: 600 }}>{riskLevel}</span>
            </p>
            <p><strong>Stopping distance:</strong> {simResult.stopping_distance} m</p>
            <p><strong>Reaction distance:</strong> {simResult.reaction_distance} m</p>
            <p><strong>Braking distance:</strong> {simResult.braking_distance} m</p>
            <p><strong>Sight distance:</strong> {simResult.available_sight_distance} m</p>
          </div>

          <div className="safety-metrics-card">
            <h3>Safety Metrics</h3>
            <p>Time to collision: <strong>{simResult.time_to_collision} s</strong></p>
            <p>Warning time: <strong>{simResult.warning_time} s</strong></p>
            <p>Safe speed: <strong>{simResult.safe_speed} km/h</strong></p>
            <p>
              Design:{' '}
              <span className={simResult.design_ok ? 'badge-safe' : 'badge-unsafe'}>
                {simResult.design_ok ? '✓ Safe' : '✗ Unsafe'}
              </span>
            </p>
          </div>

          <RiskChart simResult={simResult} />
        </>
      )}

      <div className="summary-card" style={{ marginTop: '8px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current scenario</p>
        <ul className="summary-list">
          <li>Radius: {scenario.roadRadius} m</li>
          <li>Width: {scenario.roadWidth} m</li>
          <li>Speed: {scenario.vehicleSpeed} km/h</li>
          <li>Traffic: {scenario.trafficDensity}</li>
          <li>Weather: {scenario.weatherMode}</li>
          <li>Vehicles: {scenario.vehicleCount}</li>
          <li>Opposite: {scenario.oppositeTraffic ? 'On' : 'Off'}</li>
          <li>Sim speed: {scenario.simulationSpeed}×</li>
        </ul>
      </div>
    </aside>
  )
}

export default ScenarioSummary
