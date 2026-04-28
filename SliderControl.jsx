import React from 'react'

function SliderControl({ label, min, max, step, value, unit, onChange }) {
  return (
    <div className="control">
      <div className="control-header">
        <span className="control-label">{label}</span>
        <span className="control-value">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="control-range">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default SliderControl
