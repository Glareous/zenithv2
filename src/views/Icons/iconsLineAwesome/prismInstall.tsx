'use client'

import React from 'react'

import PrismCode from '@src/components/common/Prism'

const installation = 'npm install line-awesome'

const Installation = () => (
  <PrismCode language="javascript" code={installation} />
)

export { Installation }
