'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { GoogleMap, LoadScript } from '@react-google-maps/api'
import { useJsApiLoader } from '@react-google-maps/api'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { toast } from 'react-toastify'

const mapContainerStyle = {
  height: '400px',
  width: '100%',
}

const defaultCenter = {
  lat: -31.397,
  lng: 125.644,
}

const geoMapCenter = {
  lat: -34.397,
  lng: 150.644,
}

const bounds = {
  north: -25.363882,
  south: -31.203405,
  east: 131.044922,
  west: 125.244141,
}

const secretMessages = ['This', 'is', 'the', 'secret', 'message']

// event

const origin = { lat: -33.871, lng: 151.197 }

const containerStyle = {
  width: '100%',
  height: '400px',
}

const MapComponent: NextPageWithLayout = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [geoMap, setGeoMap] = useState<google.maps.Map | null>(null)
  const [infoWindow] = useState<google.maps.InfoWindow | null>(null)
  const [, setMarkers] = useState<google.maps.Marker[]>([])
  const [, setCurrentLocation] = useState<google.maps.LatLng | null>(null)

  useEffect(() => {
    if (geoMap && infoWindow) {
      const locationButton = document.createElement('button')
      locationButton.textContent = 'Pan to Current Location'
      locationButton.classList.add('custom-map-control-button')
      geoMap.controls[google.maps.ControlPosition.TOP_CENTER].push(
        locationButton
      )

      locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              setCurrentLocation(new google.maps.LatLng(pos.lat, pos.lng))
              infoWindow.setPosition(pos)
              infoWindow.setContent('Location found.')
              infoWindow.open(geoMap)
              geoMap.setCenter(pos)
            },
            () => {}
          )
        }
      })
    }
  }, [geoMap, infoWindow])

  useEffect(() => {
    if (map) {
      const markersArray = secretMessages.map((message) => {
        const marker = new google.maps.Marker({
          position: {
            lat: bounds.south + (bounds.north - bounds.south) * Math.random(),
            lng: bounds.west + (bounds.east - bounds.west) * Math.random(),
          },
          map: map,
        })
        attachSecretMessage(marker, message)
        return marker
      })
      setMarkers(markersArray)
    }
  }, [map])

  const onLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance)
  }

  const onGeoMapLoad = (geoMapInstance: google.maps.Map) => {
    setGeoMap(geoMapInstance)
    const langMap = new google.maps.Map(
      document.getElementById('latlang-map')!,
      {
        zoom: 4,
        center: { lat: -25.363882, lng: 131.044922 },
        mapId: 'AIzaSyB_dQ6dcSGTdhjDI7sGD8R74UnqYdnNK88',
      }
    )
    langMap.fitBounds(bounds)
  }
  const attachSecretMessage = (
    marker: google.maps.Marker,
    secretMessage: string
  ) => {
    const infoWindow = new google.maps.InfoWindow({
      content: secretMessage,
    })
    marker.addListener('click', () => {
      infoWindow.open(marker.getMap(), marker)
    })
  }

  // event
  const mapRef = useRef<google.maps.Map | null>(null)
  const directionsService = useRef<google.maps.DirectionsService | null>(null)
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null)

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    toast.error('please set the GOOGLE_MAPS_API_KEY in .env file', {
      autoClose: 3000,
    })
  }

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '', // Replace with your Google Maps API key
  })

  const handleClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (isIconMouseEvent(event)) {
      event.stop()
      if (event.placeId && typeof event.placeId === 'string') {
        // Ensure placeId is defined and is a string
        calculateAndDisplayRoute(event.placeId)
      } else {
        console.error('Invalid placeId:', event.placeId)
      }
    }
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      directionsService.current = new google.maps.DirectionsService()
      directionsRenderer.current = new google.maps.DirectionsRenderer()
      directionsRenderer.current.setMap(mapRef.current)

      // Listen for clicks on the map.
      mapRef.current.addListener('click', handleClick)
    }
  }, [isLoaded, handleClick])

  const isIconMouseEvent = (
    e: google.maps.MapMouseEvent
  ): e is google.maps.IconMouseEvent => {
    // Use a type predicate to ensure e has placeId
    return 'placeId' in e
  }

  const calculateAndDisplayRoute = (placeId: string) => {
    if (directionsService.current && directionsRenderer.current) {
      directionsService.current.route(
        {
          origin,
          destination: { placeId },
          travelMode: google.maps.TravelMode.WALKING,
        },
        (response, status) => {
          if (status === 'OK') {
            directionsRenderer.current?.setDirections(response)
          } else {
            window.alert('Directions request failed due to ' + status)
          }
        }
      )
    }
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Google Maps" subTitle="Maps" />
      <LoadScript googleMapsApiKey="AIzaSyB_dQ6dcSGTdhjDI7sGD8R74UnqYdnNK88">
        <div className="grid grid-cols-12 gap-x-space">
          <div className="col-span-12 card">
            <div className="card-header">
              <h6 className="card-title">Basic</h6>
            </div>
            <div className="card-body">
              <div id="map" className="w-full">
                <GoogleMap
                  onLoad={onLoad}
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={6}
                />
              </div>
            </div>
          </div>

          <div className="col-span-12 card">
            <div className="card-header">
              <h6 className="card-title">Track your Location</h6>
            </div>
            <div className="card-body">
              <div id="geolocation" className="w-full">
                <GoogleMap
                  onLoad={onGeoMapLoad}
                  mapContainerStyle={mapContainerStyle}
                  center={geoMapCenter}
                  zoom={6}
                />
              </div>
            </div>
          </div>

          <div className="col-span-12 card">
            <div className="card-header">
              <h6 className="card-title">Map with LatLang</h6>
            </div>
            <div className="card-body">
              <div id="latlang-map" style={mapContainerStyle}></div>
            </div>
          </div>

          <div className="col-span-12 card">
            <div className="card-header">
              <h6 className="card-title">POI Click Events</h6>
            </div>
            <div className="card-body">
              <div id="event-map" className="w-full">
                <GoogleMap
                  id="event-map"
                  mapContainerStyle={containerStyle}
                  zoom={18}
                  center={origin}
                  onLoad={(map) => {
                    mapRef.current = map
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </LoadScript>
    </React.Fragment>
  )
}

export default MapComponent
