import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicVectorMap from '@src/views/Maps/Vector/BasicVectorMap'
import BasicVectorMapWithMarkers from '@src/views/Maps/Vector/DataSeriesMap'
import ImageMarkerMap from '@src/views/Maps/Vector/ImageMarkerVEctorMap'
import LineStyleMap from '@src/views/Maps/Vector/LineMarkMap'
import UserLocationMap from '@src/views/Maps/Vector/LocationMap'
import MarkersVectorMap from '@src/views/Maps/Vector/MarkersVectorMap'
import ToolTipMap from '@src/views/Maps/Vector/TooltipMap'

const VectorMaps: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Vector" subTitle="Maps" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div id="basicMap" className="h-96 flex justify-center">
              <BasicVectorMap />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Markers</h6>
          </div>
          <div className="card-body">
            <div id="markersMap" className="h-96">
              <MarkersVectorMap />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Image Marker</h6>
          </div>
          <div className="card-body">
            <div id="imageMarkersMap" className="h-96">
              <ImageMarkerMap />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Line Style</h6>
          </div>
          <div className="card-body">
            <div id="lineStyleMap" className="h-96">
              <LineStyleMap />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">With Tooltip</h6>
          </div>
          <div className="card-body">
            <div id="tooltipMap" className="h-96">
              <ToolTipMap />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Data Series</h6>
          </div>
          <div className="card-body">
            <div id="dataSeriesMap" className="h-96">
              <BasicVectorMapWithMarkers />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Reflect user location</h6>
          </div>
          <div className="card-body">
            <UserLocationMap />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default VectorMaps
