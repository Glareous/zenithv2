'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PdfDocViewerWrapper } from '@/components/common/PdfDocViewerWrapper'

export default function Page() {
  const pathname = usePathname()
  const [pdfUrl, setPdfUrl] = useState('/assets/pdfs/inprogress.pdf')

  useEffect(() => {
    // Map paths to specific PDFs
    const pdfMap = {
      '/docs/pqr': '/assets/pdfs/pqrs.pdf',
      '/docs/lead': '/assets/pdfs/leads.pdf',
      '/docs/nim': '/assets/pdfs/nimfraud.pdf',
      '/docs/forecasting': '/assets/pdfs/forecasting.pdf'
    }

    // Find matching PDF or use default
    const matchedPdf = pdfMap[pathname] || '/assets/pdfs/inprogress.pdf'
    setPdfUrl(matchedPdf)
  }, [pathname])

  return <PdfDocViewerWrapper pdfUrl={pdfUrl} />
}
