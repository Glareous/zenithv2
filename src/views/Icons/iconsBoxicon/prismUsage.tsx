'use client'

import React from 'react'

import PrismCode from '@src/components/common/Prism'

const installation = `<i className="bx bx-hot"></i></i>
<i className="bx bxs-hot"></i>
<i className="bx bxl-facebook-square"></i>`

const Usage = () => <PrismCode language="javascript" code={installation} />

export { Usage }
