import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { nextTick } from 'vue'

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

function waitForElement(id: string, timeout = 1000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const el = document.getElementById(id)
    if (el) return resolve(el)

    const start = Date.now()
    const check = () => {
      const el = document.getElementById(id)
      if (el) return resolve(el)
      if (Date.now() - start > timeout) return reject(new Error(`Element #${id} not found within ${timeout}ms`))
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  })
}

async function renderPdf(elementId: string): Promise<jsPDF> {
  await nextTick()
  const el = await waitForElement(elementId)

  // Temporarily size the element to A4 proportions for clean capture
  const origWidth = el.style.width
  const origMinWidth = el.style.minWidth
  const origMaxWidth = el.style.maxWidth
  const targetWidthPx = 794 // ~210mm at 96dpi
  el.style.width = `${targetWidthPx}px`
  el.style.minWidth = `${targetWidthPx}px`
  el.style.maxWidth = `${targetWidthPx}px`
  await nextTick()

  const canvas = await html2canvas(el, {
    scale: 1.25,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: targetWidthPx,
    windowWidth: targetWidthPx,
  })

  // Restore original styles
  el.style.width = origWidth
  el.style.minWidth = origMinWidth
  el.style.maxWidth = origMaxWidth

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const contentW = A4_WIDTH_MM
  const contentH = (canvas.height * contentW) / canvas.width

  if (contentH <= A4_HEIGHT_MM) {
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, contentW, contentH)
  } else {
    // Multi-page: slice the canvas into A4-sized chunks
    const pxPerPage = (A4_HEIGHT_MM / contentH) * canvas.height
    const overlap = 4
    let yPx = 0
    let pageNum = 0

    while (yPx < canvas.height) {
      if (pageNum > 0) pdf.addPage()

      const sliceH = Math.min(pxPerPage, canvas.height - yPx)

      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = Math.round(sliceH)
      const ctx = sliceCanvas.getContext('2d')!
      ctx.drawImage(
        canvas,
        0, Math.round(yPx),
        canvas.width, Math.round(sliceH),
        0, 0,
        canvas.width, Math.round(sliceH),
      )

      const sliceHt = (sliceH * contentW) / canvas.width
      pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, contentW, sliceHt)

      yPx += pxPerPage - overlap
      pageNum++
    }
  }

  return pdf
}

export function usePdf() {
  async function exportToPdf(elementId: string, filename: string) {
    const pdf = await renderPdf(elementId)
    pdf.save(`${filename}.pdf`)
  }

  async function getPdfBase64(elementId: string): Promise<string> {
    const pdf = await renderPdf(elementId)
    return pdf.output('datauristring').split(',')[1]
  }

  async function getPdfBlob(elementId: string): Promise<Blob> {
    const pdf = await renderPdf(elementId)
    return pdf.output('blob')
  }

  return { exportToPdf, getPdfBase64, getPdfBlob }
}
