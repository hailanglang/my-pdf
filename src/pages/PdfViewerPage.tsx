import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { GlobalWorkerOptions, TextLayer, getDocument } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './PdfViewerPage.css'

GlobalWorkerOptions.workerSrc = pdfWorker

type HtmlPage = {
  pageNumber: number
  width: number
  height: number
}

function PdfViewerPage() {
  const cMapUrl = 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/'
  const standardFontDataUrl = 'https://unpkg.com/pdfjs-dist@4.10.38/standard_fonts/'
  const [fileName, setFileName] = useState<string>('')
  const [pages, setPages] = useState<HtmlPage[]>([])
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([])
  const textLayerRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    let isCancelled = false

    const renderCanvasPages = async () => {
      if (!pdfBytes || pages.length === 0) return

      try {
        const pdf = await getDocument({
          data: pdfBytes.slice(),
          cMapUrl,
          cMapPacked: true,
          standardFontDataUrl,
          useSystemFonts: true,
        }).promise

        for (const pageInfo of pages) {
          if (isCancelled) return

          const canvas = canvasRefs.current[pageInfo.pageNumber - 1]
          const textLayerContainer = textLayerRefs.current[pageInfo.pageNumber - 1]
          if (!canvas || !textLayerContainer) continue

          const page = await pdf.getPage(pageInfo.pageNumber)
          const viewport = page.getViewport({ scale: 1.5 })
          const context = canvas.getContext('2d')
          if (!context) continue

          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = `${viewport.width}px`
          canvas.style.height = `${viewport.height}px`
          await page.render({ canvasContext: context, viewport }).promise

          textLayerContainer.innerHTML = ''
          const textContent = await page.getTextContent()
          const textLayer = new TextLayer({
            textContentSource: textContent,
            container: textLayerContainer,
            viewport,
          })
          await textLayer.render()
        }
      } catch (error) {
        console.error(error)
      }
    }

    void renderCanvasPages()

    return () => {
      isCancelled = true
    }
  }, [cMapUrl, pages, pdfBytes, standardFontDataUrl])

  const handleUploadPdf = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      event.target.value = ''
      return
    }

    setIsLoading(true)
    setFileName(file.name)

    try {
      const bytes = await file.arrayBuffer()
      const sourceBytes = new Uint8Array(bytes)
      const pdf = await getDocument({
        data: sourceBytes.slice(),
        cMapUrl,
        cMapPacked: true,
        standardFontDataUrl,
        useSystemFonts: true,
      }).promise
      const nextPages: HtmlPage[] = []

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 1.5 })

        nextPages.push({
          pageNumber,
          width: viewport.width,
          height: viewport.height,
        })
      }

      setPages(nextPages)
      setPdfBytes(sourceBytes.slice())
      event.target.value = ''
    } catch (error) {
      console.error(error)
      alert('Failed to render PDF file.')
      setPages([])
      setPdfBytes(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container">
      <h2>React PDF Viewer</h2>
      <p>Upload and preview PDF files with canvas and text-layer rendering.</p>

      <div className="actions">
        <label className="upload">
          Upload PDF
          <input type="file" accept="application/pdf" onChange={handleUploadPdf} />
        </label>
      </div>

      {isLoading ? (
        <p className="hint">Rendering PDF...</p>
      ) : pages.length > 0 ? (
        <section className="viewer">
          <h3>
            Preview: {fileName} ({pages.length} pages)
          </h3>
          <div className="pages">
            {pages.map((page, pageIndex) => (
              <div
                key={`${fileName}-${pageIndex}`}
                className="page"
                style={{ width: `${page.width}px`, height: `${page.height}px` }}
              >
                <canvas
                  ref={(element) => {
                    canvasRefs.current[pageIndex] = element
                  }}
                  className="page-canvas"
                />
                <div className="text-layer">
                  <div
                    ref={(element) => {
                      textLayerRefs.current[pageIndex] = element
                    }}
                    className="text-layer-content"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="hint">Upload a PDF file to preview it here.</p>
      )}
    </main>
  )
}

export default PdfViewerPage
