'use client'

import React from 'react'

import PrismCode from '@src/components/common/Prism'

const installation = `<Volume2 className="my-class"></Volume2>
<X />
<Menu />`

const Usage = () => <PrismCode language="javascript" code={installation} />

export { Usage }
