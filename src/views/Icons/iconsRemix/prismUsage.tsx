'use client'

import React from 'react'

import PrismCode from '@src/components/common/Prism'

const installation = `<i className="ri-admin-line"></i>
<i className="ri-admin-fill"></i>`

const Usage = () => <PrismCode language="javascript" code={installation} />

export { Usage }
