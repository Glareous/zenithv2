'use client'

import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

interface PdfDocViewerProps {
  pdfUrl: string
}

export function PdfDocViewer({ pdfUrl }: PdfDocViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  )
}
