'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import {
  defaultSwiches,
  softColoredSwitches,
  softSwitches,
  solidSwitches,
  sqaureSwitches,
  texticonSwitches,
  threeDSwtices,
} from '@src/data'
import { NextPageWithLayout } from '@src/dtos'

const Switches: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Switches" subTitle="Forms" />
      <div className="grid grid-cols-12 gap-x-space">
        {/* Default */}
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Default</h6>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-3 overflow-x-auto">
              {defaultSwiches.map((item) => (
                <label htmlFor={item.id} className="switch-group" key={item.id}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="sr-only peer"
                    />
                    <div className="switch-wrapper"></div>
                    <div
                      className={`switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full ${item.dot}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Soft Switches */}
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Soft Switches</h6>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-3 overflow-x-auto">
              {softSwitches.map((item) => (
                <label
                  htmlFor={item.id}
                  className="switch-group switch-soft"
                  key={item.id}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="sr-only peer"
                    />
                    <div className="switch-wrapper"></div>
                    <div
                      className={`switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full ${item.dot}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Soft Colored Switches */}
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Soft Colored Switches</h6>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-3 overflow-x-auto">
              {softColoredSwitches.map((item) => (
                <label
                  htmlFor={item.id}
                  className="switch-group switch-soft"
                  key={item.id}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="sr-only peer"
                    />
                    <div className={`switch-wrapper ${item.wrapper}`}></div>
                    <div
                      className={`switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full ${item.dot}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Solid Examples */}
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Solid Examples</h6>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-3 overflow-x-auto">
              {solidSwitches.map((item) => (
                <label htmlFor={item.id} className="switch-group" key={item.id}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="sr-only peer"
                    />
                    <div className={`switch-wrapper ${item.wrapper}`}></div>
                    <div
                      className={`switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full ${item.dot}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Text or Icon with Switches Examples */}
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Text or Icon with Switches Examples</h6>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-3 overflow-x-auto">
              {texticonSwitches.map((item) => (
                <label
                  htmlFor={item.id}
                  className="switch-group switch-soft switch-text"
                  key={item.id}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className={item.wrapper}></div>
                    <div
                      className={`switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full ${item.dot}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Square Examples */}
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Square Examples</h6>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-3 overflow-x-auto">
              {sqaureSwitches.map((item) => (
                <label
                  htmlFor={item.id}
                  className={item.container}
                  key={item.id}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className={item.wrapper}></div>
                    <div className={item.dot}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* 3D Switches */}
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">3D Switches</h6>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-3 overflow-x-auto">
              {threeDSwtices.map((item) => (
                <label
                  htmlFor={item.id}
                  className="switch-group switch-3d"
                  key={item.id}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="sr-only peer"
                      defaultChecked={item.checked}
                    />
                    <div className="switch-wrapper"></div>
                    <div
                      className={`switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full ${item.color}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Switches
