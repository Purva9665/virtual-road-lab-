import React from 'react'
import SliderControl from './SliderControl.jsx'
import SelectControl from './SelectControl.jsx'
import ToggleControl from './ToggleControl.jsx'

function ControlPanel({ scenario, onChange, onPresetChange }) {
  return (
    <aside className="panel panel-left">
      <h2 className="panel-title">Scenario Controls</h2>

      <SliderControl
        label="Road radius"
        min={20}
        max={500}
        step={5}
        value={scenario.roadRadius}
        unit="m"
        onChange={value => onChange('roadRadius', value)}
      />

      <SliderControl
        label="Road width"
        min={3}
        max={20}
        step={0.5}
        value={scenario.roadWidth}
        unit="m"
        onChange={value => onChange('roadWidth', value)}
      />

      <SliderControl
        label="Vehicle speed"
        min={10}
        max={120}
        step={5}
        value={scenario.vehicleSpeed}
        unit="km/h"
        onChange={value => onChange('vehicleSpeed', value)}
      />

      <SelectControl
        label="Traffic density"
        value={scenario.trafficDensity}
        onChange={value => onChange('trafficDensity', value)}
        options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ]}
      />

      <SelectControl
        label="Weather mode"
        value={scenario.weatherMode}
        onChange={value => onChange('weatherMode', value)}
        options={[
          { value: 'clear', label: 'Clear' },
          { value: 'rain', label: 'Rain' },
          { value: 'fog', label: 'Fog' },
          { value: 'night', label: 'Night' },
        ]}
      />

      <SliderControl
        label="Vehicle count"
        min={1}
        max={50}
        step={1}
        value={scenario.vehicleCount}
        unit=""
        onChange={value => onChange('vehicleCount', value)}
      />

      <SliderControl
        label="Simulation speed"
        min={0.5}
        max={3}
        step={0.1}
        value={scenario.simulationSpeed}
        unit="x"
        onChange={value => onChange('simulationSpeed', value)}
      />

      <ToggleControl
        label="Opposite direction traffic"
        checked={scenario.oppositeTraffic}
        onChange={value => onChange('oppositeTraffic', value)}
      />

      <div className="preset-buttons">
        <button onClick={() => onPresetChange('clear-day')}>Clear Day</button>
        <button onClick={() => onPresetChange('night-curve')}>Night Curve</button>
        <button onClick={() => onPresetChange('heavy-rain')}>Heavy Rain</button>
      </div>
    </aside>
  )
}

export default ControlPanel
