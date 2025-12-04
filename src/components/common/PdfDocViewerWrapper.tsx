'use client'

import dynamic from 'next/dynamic'

const PdfDocViewer = dynamic(
  () => import('@/components/common/PdfDocViewer').then((mod) => mod.PdfDocViewer),
  { ssr: false, loading: () => <div className="p-4 text-center">Loading PDF viewer...</div> }
)

interface PdfDocViewerWrapperProps {
  pdfUrl: string
}

export function PdfDocViewerWrapper({ pdfUrl }: PdfDocViewerWrapperProps) {
  return <PdfDocViewer pdfUrl={pdfUrl} />
}
