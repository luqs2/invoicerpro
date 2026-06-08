import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function usePdf() {
  async function exportToPdf(elementId: string, filename: string) {
    const el = document.getElementById(elementId)
    if (!el) throw new Error('Preview element not found')

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pdfWidth  = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${filename}.pdf`)
  }

  return { exportToPdf }
}
