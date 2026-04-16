import { jsPDF } from 'jspdf'
import type { PdfDraft } from '../types/deepseek'


export const generateSimplePdf = async (draft: PdfDraft) => {
  const pdf = new jsPDF()
  const safeFilename = (draft.filename || 'deepseek-generated').endsWith('.pdf')
    ? draft.filename
    : `${draft.filename || 'deepseek-generated'}.pdf`

  const paragraphs =
    Array.isArray(draft.paragraphs) && draft.paragraphs.some((p) => String(p).trim())
      ? draft.paragraphs
      : ['No content generated. Please provide more details and try again.']

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 14
  const maxWidth = pageWidth - margin * 2
  let y = margin + 4

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  const titleLines = pdf.splitTextToSize(draft.title || 'Generated PDF', maxWidth)
  pdf.text(titleLines, margin, y)
  y += titleLines.length * 8 + 4

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(12)

  for (const paragraph of paragraphs) {
    const lines = pdf.splitTextToSize(String(paragraph), maxWidth)

    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage()
        y = margin + 2
      }
      pdf.text(line, margin, y)
      y += 6.5
    }

    y += 3
  }

  pdf.save(safeFilename)
  return safeFilename
}
