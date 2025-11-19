'use client'

import React from 'react'

import Link from 'next/link'

const BaseExample = () => {
  return (
    <React.Fragment>
      <ul className="breadcrumb *:before:content-['\f2e5']">
        <li className="breadcrumb-item">
          <Link href="#!">Zenith</Link>
        </li>
        <li className="breadcrumb-item">
          <Link href="#!">UI</Link>
        </li>
        <li className="breadcrumb-item active">Breadcrumb</li>
      </ul>

      <ul className="breadcrumb *:before:content-['\f2e5']">
        <li className="breadcrumb-item">
          <Link href="#!">
            <i className="align-middle ri-home-4-line"></i>
          </Link>
        </li>
        <li className="breadcrumb-item">
          <Link href="#!">UI</Link>
        </li>
        <li className="breadcrumb-item active">Breadcrumb</li>
      </ul>
    </React.Fragment>
  )
}
export default BaseExample
