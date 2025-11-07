'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { Clipboard } from 'lucide-react'

const Clipboards: NextPageWithLayout = () => {
  const inputRef = useRef<null | HTMLInputElement>(null)
  const textareaRef = useRef<null | HTMLTextAreaElement>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {})
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  const handleCopyClick = () => {
    if (inputRef.current) {
      copyToClipboard(inputRef.current.value)
    }
  }

  const handleCutClick = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      textarea.select()
      document.execCommand('cut')
    }
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Clipboard" subTitle="Forms & Tables" />
      <div className="grid grid-cols-12">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Input with Clipboard</h6>
          </div>
          <div className="card-body">
            <div className="relative">
              <input
                type="text"
                id="basicClipboard"
                className="ltr:pr-8 rtl:pl-8 form-input"
                defaultValue="https://github.com/zenorocha/clipboard.js.git"
                ref={inputRef}
              />
              <button
                onClick={handleCopyClick}
                className="absolute inset-y-0 flex items-center p-0 text-gray-500 dark:text-dark-500 ltr:right-3 dark:hover:text-primary-500 hover:text-primary-500 focus:text-primary-500 dark:focus:text-primary-500 rtl:left-3 focus:outline-hidden btn focus:outline-0">
                <Clipboard className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Textarea with Clipboard</h6>
          </div>
          <div className="card-body">
            <div className="relative">
              <textarea
                id="bar"
                className="h-auto form-input"
                defaultValue="Utility classes help you work within the constraints of a system instead of littering your stylesheets with arbitrary values. They make it easy to be consistent with color choices, spacing, typography, shadows, and everything else that makes up a well-engineered design system."
                ref={textareaRef}
              />
              <div className="ltr:text-right rtl:text-left">
                <button
                  onClick={handleCutClick}
                  className="mt-4 btn btn-primary">
                  Cut to clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Clipboards
