'use client'

import React from 'react'

import PrismCode from '@src/components/common/Prism'

const installation =
  "@import '../libs/line-awesome/line-awesome/css/line-awesome.css';"

const Style = () => <PrismCode language="javascript" code={installation} />

export { Style }
