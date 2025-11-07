'use client'

import React from 'react'

import PrismCode from '@src/components/common/Prism'

const installation = `npm install remixicon --save
`

const Installtion = () => (
  <PrismCode language="javascript" code={installation} />
)

export { Installtion }
