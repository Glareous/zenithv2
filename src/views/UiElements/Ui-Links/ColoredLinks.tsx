'use client'

import React from 'react'

import Link from 'next/link'

const ColoredLinks = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-4 card">
        <div className="card-header">
          <h6 className="card-title">Colored Links</h6>
        </div>
        <div className="flex flex-col gap-3 card-body">
          <Link href="#!" className="link link-primary">
            Primary Basic Links
          </Link>
          <Link href="#!" className="link link-purple">
            Purple Basic Links
          </Link>
          <Link href="#!" className="link link-green">
            Green Basic Links
          </Link>
          <Link href="#!" className="link link-red">
            Red Basic Links
          </Link>
          <Link href="#!" className="link link-yellow">
            Yellow Basic Links
          </Link>
          <Link href="#!" className="link link-sky">
            Sky Basic Links
          </Link>
          <Link href="#!" className="link link-pink">
            Pink Basic Links
          </Link>
          <Link href="#!" className="link link-indigo">
            Indigo Basic Links
          </Link>
          <Link href="#!" className="link link-orange">
            Orange Basic Links
          </Link>
        </div>
      </div>
    </React.Fragment>
  )
}
export default ColoredLinks
