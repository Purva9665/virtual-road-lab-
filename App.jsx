import React, { useState, useEffect, useRef } from 'react'
import Header from './components/Header.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import ScenarioSummary from './components/ScenarioSummary.jsx'
import ViewportPanel from './components/ViewportPanel.jsx'

function App() {
  const [scenario, setScenario] = useState({
    roadRadius: 120,
    roadWidth: 7,
    vehicleSpeed: 60,
    trafficDensity: 'medium',
    weatherMode: 'clear',
    oppositeTraffic: true,
    vehicleCount: 10,
    simulationSpeed: 1,
  })

  const [simResult, setSimResult] = useState(null)
  const [isSimLoading, setSimLoading] = useState(false)
  const [simError, setSimError] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    let ws
    try {
      ws = new WebSocket('ws://127.0.0.1:8000/ws')
      wsRef.current = ws
      ws.onopen = () => { setWsConnected(true); console.log('WS connected') }
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data)
          if (data.type === 'sim_result') { setSimResult(data.payload); setSimLoading(false) }
        } catch (_) {}
      }
      ws.onerror = () => setWsConnected(false)
      ws.onclose = () => setWsConnected(false)
    } catch (_) {}
    return () => ws && ws.close()
  }, [])

  const updateScenario = (key, value) => setScenario(prev => ({ ...prev, [key]: value }))

  const handlePreset = preset => {
    const presets = {
      'clear-day':  { roadRadius:150, roadWidth:7,  vehicleSpeed:60, trafficDensity:'medium', weatherMode:'clear', oppositeTraffic:true,  vehicleCount:12, simulationSpeed:1   },
      'night-curve':{ roadRadius:60,  roadWidth:6,  vehicleSpeed:40, trafficDensity:'low',    weatherMode:'night', oppositeTraffic:true,  vehicleCount:6,  simulationSpeed:1   },
      'heavy-rain': { roadRadius:100, roadWidth:7,  vehicleSpeed:50, trafficDensity:'high',   weatherMode:'rain',  oppositeTraffic:true,  vehicleCount:20, simulationSpeed:0.8 },
    }
    if (presets[preset]) setScenario(presets[preset])
  }

  const handleRunSimulation = async () => {
    setSimLoading(true); setSimError(null); setSimResult(null)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'run_sim', payload: scenario }))
      return
    }
    try {
      const resp = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      })
      if (!resp.ok) throw new Error(`API error: ${resp.status}`)
      setSimResult(await resp.json())
    } catch (err) {
      setSimError('Could not reach backend. Run: uvicorn main:app --reload --port 8000')
    } finally {
      setSimLoading(false)
    }
  }

  return (
    <div className="app-root">
      <Header onRunSimulation={handleRunSimulation} wsConnected={wsConnected} />
      <div className="app-layout">
        <ControlPanel scenario={scenario} onChange={updateScenario} onPresetChange={handlePreset} />
        <ViewportPanel scenario={scenario} />
        <ScenarioSummary scenario={scenario} simResult={simResult} isSimLoading={isSimLoading} simError={simError} />
      </div>
    </div>
  )
}

export default App
