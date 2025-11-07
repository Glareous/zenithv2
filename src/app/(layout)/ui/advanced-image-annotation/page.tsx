'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AnnotationImage from '@src/views/UiAdvanced/uiAdvancedImageAnnotation/annotationImage'

const ImageAnnotation: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Images Annotation" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <AnnotationImage />
        </div>
      </div>
    </React.Fragment>
  )
}

export default ImageAnnotation
