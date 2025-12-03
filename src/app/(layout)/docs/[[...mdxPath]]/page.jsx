import { PdfDocViewerWrapper } from '@/components/common/PdfDocViewerWrapper'

export const metadata = {
  title: 'Zenith Documentation',
  description: 'Complete documentation for Zenith modules',
}

export default function Page() {
  return <PdfDocViewerWrapper pdfUrl="/test-file.pdf" />
}
