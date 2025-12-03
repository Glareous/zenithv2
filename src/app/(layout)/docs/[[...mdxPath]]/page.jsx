'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PdfDocViewerWrapper } from '@/components/common/PdfDocViewerWrapper'

export default function Page() {
  const pathname = usePathname()
  const [pdfUrl, setPdfUrl] = useState('/test-file.pdf')

  useEffect(() => {
    // Map paths to specific PDFs
    const pdfMap = {
      '/docs': '/test-file.pdf',
      // Add more path mappings here:
      // '/docs/getting-started': '/getting-started.pdf',
      // '/docs/api': '/api-docs.pdf',
    }

    // Find matching PDF or use default
    const matchedPdf = pdfMap[pathname] || '/test-file.pdf'
    setPdfUrl(matchedPdf)
  }, [pathname])

  return <PdfDocViewerWrapper pdfUrl={pdfUrl} />
}
