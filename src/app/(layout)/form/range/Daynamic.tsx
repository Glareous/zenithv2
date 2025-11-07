'use client'

import React, { useState } from 'react'

import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const DynamicBounds: React.FC = () => {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [step, setStep] = useState(10)
  const [value, setValue] = useState(1)

  // Update the slider value when the slider changes
  const onSliderChange = (newValue: number) => {
    setValue(newValue)
  }

  const onMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMin(+e.target.value || 0)
  }

  const onMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMax(+e.target.value || 100)
  }

  const onStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStep(+e.target.value || 1)
  }

  const labelStyle = { minWidth: '60px', display: 'inline-block' }
  const inputStyle = { marginBottom: '10px' }

  return (
    <div>
      <label className="form-label" style={labelStyle}>
        Min:
      </label>
      <input
        className="form-input"
        type="number"
        value={min}
        onChange={onMinChange}
        style={inputStyle}
      />
      <br />
      <label className="form-label" style={labelStyle}>
        Max:
      </label>
      <input
        className="form-input"
        type="number"
        value={max}
        onChange={onMaxChange}
        style={inputStyle}
      />
      <br />
      <label className="form-label" style={labelStyle}>
        Step:
      </label>
      <input
        className="form-input"
        type="number"
        value={step}
        onChange={onStepChange}
        style={inputStyle}
      />
      <br />
      <br />
      <label style={labelStyle}>Value: </label>
      <span>{value}</span>
      <br />
      <br />
      <Slider
        min={min}
        max={max}
        step={step}
        onChange={(e) => onSliderChange(e as number)}
      />
    </div>
  )
}

export default DynamicBounds
