import React from 'react'

function ToggleControl({ label, checked, onChange }) {
  return (
    <div className="control toggle-control">
      <span className="control-label">{label}</span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}

export default ToggleControl
