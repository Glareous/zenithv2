'use client'

import React from 'react'

import { NumericFormat } from 'react-number-format'

// Define a type for the format object
type FormatOptions = {
  thousandSeparator: string
  decimalSeparator: string
  decimalScale: number
  placeholder: string
}

// Custom input for money formatting
const MoneyInput: React.FC<{
  value: string
  format: FormatOptions
  onChange: (value: string) => void
}> = ({ value, format, onChange }) => {
  return (
    <NumericFormat
      value={value}
      thousandSeparator={format.thousandSeparator}
      decimalSeparator={format.decimalSeparator}
      decimalScale={format.decimalScale}
      fixedDecimalScale={true}
      onValueChange={(values) => onChange(values.formattedValue)}
      className="form-input"
      placeholder={format.placeholder}
    />
  )
}

const MoneyInputs: React.FC = () => {
  const [value1, setValue1] = React.useState<string>('99999')
  const [value2, setValue2] = React.useState<string>('12000.69')
  const [value3, setValue3] = React.useState<string>('99999.69')
  const [value4, setValue4] = React.useState<string>('12000.6911')

  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Money Inputs</h6>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-space">
          <div>
            <label htmlFor="moneyInput1" className="form-label">
              Here is a fully functioning money input mask:
            </label>
            <MoneyInput
              // id="moneyInput1"
              value={value1}
              format={{
                thousandSeparator: ',',
                decimalSeparator: '.',
                decimalScale: 0,
                placeholder: '0',
              }}
              onChange={setValue1}
            />
          </div>
          <div>
            <label htmlFor="moneyInput2" className="form-label">
              If you wish to swap the periods for commas and vice versa (as is
              required in certain currencies), you can do so using the second
              optional parameter:
            </label>
            <MoneyInput
              // id="moneyInput2"
              value={value2}
              format={{
                thousandSeparator: '.',
                decimalSeparator: ',',
                decimalScale: 2,
                placeholder: '0.0000.00',
              }}
              onChange={setValue2}
            />
          </div>
          <div>
            <label htmlFor="moneyInput3" className="form-label">
              You may also choose to override the thousands separator by
              supplying a third optional argument:
            </label>
            <MoneyInput
              // id="moneyInput3"
              value={value3}
              format={{
                thousandSeparator: ' ',
                decimalSeparator: '.',
                decimalScale: 2,
                placeholder: '0.00',
              }}
              onChange={setValue3}
            />
          </div>
          <div>
            <label htmlFor="moneyInput4" className="form-label">
              You can also override the default precision of 2 digits by using
              any desired number of digits as the fourth optional argument:
            </label>
            <MoneyInput
              // id="moneyInput4"
              value={value4}
              format={{
                thousandSeparator: ',',
                decimalSeparator: '.',
                decimalScale: 4,
                placeholder: '00,000.0000',
              }}
              onChange={setValue4}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoneyInputs
