import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { nextTick } from 'vue'

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

export function usePdf() {
  async function exportToPdf(elementId: string, filename: string) {
    await nextTick()
    const el = await waitForElement(elementId)

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfW     = pdf.internal.pageSize.getWidth()   // 210mm
    const pdfH     = pdf.internal.pageSize.getHeight()  // 297mm
    const marginTop = 0
    const marginBottom = 10
    const marginLeft = 0
    const contentW = pdfW - marginLeft * 2
    const contentH = (canvas.height * contentW) / canvas.width
    const usableH  = pdfH - marginTop - marginBottom

    if (contentH <= usableH) {
      // Fits on a single page — draw from top
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', marginLeft, marginTop, contentW, contentH)
    } else {
      // Multi-page: no top margin, bottom margin on each page
      const slicePxPerPage = (usableH / contentH) * canvas.height
      const overlap = 4
      let yPx = 0
      let pageNum = 0

      while (yPx < canvas.height) {
        if (pageNum > 0) pdf.addPage()

        const sliceH = Math.min(slicePxPerPage, canvas.height - yPx)

        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvas.width
        sliceCanvas.height = Math.round(sliceH)
        const ctx = sliceCanvas.getContext('2d')!
        ctx.drawImage(
          canvas,
          0, Math.round(yPx),
          canvas.width, Math.round(sliceH),
          0, 0,
          canvas.width, Math.round(sliceH)
        )

        const sliceHt = (sliceH * contentW) / canvas.width
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', marginLeft, marginTop, contentW, sliceHt)

        yPx += slicePxPerPage - overlap
        pageNum++
      }
    }

    pdf.save(`${filename}.pdf`)
  }

  return { exportToPdf }
}
