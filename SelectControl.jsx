import React from 'react'

function SelectControl({ label, value, options, onChange }) {
  return (
    <div className="control">
      <div className="control-header">
        <span className="control-label">{label}</span>
      </div>
      <select
        className="select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectControl
