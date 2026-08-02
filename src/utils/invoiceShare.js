// Utility for encoding/decoding shareable invoice links

export function generateInvoiceShareLink(invoiceData) {
  if (!invoiceData) return window.location.href

  try {
    const payload = {
      invoiceNo: invoiceData.invoiceNo,
      invoiceDate: invoiceData.invoiceDate,
      studentName: invoiceData.studentName,
      parentName: invoiceData.parentName,
      packageType: invoiceData.packageType,
      durationMonths: invoiceData.durationMonths,
      valPerMonth: invoiceData.valPerMonth,
      totalSessions: invoiceData.totalSessions,
      subtotal: invoiceData.subtotal,
      discountPercent: invoiceData.discountPercent,
      discountAmount: invoiceData.discountAmount,
      totalInvestment: invoiceData.totalInvestment,
      paidAmount: invoiceData.paidAmount,
      outstandingBalance: invoiceData.outstandingBalance,
      status: invoiceData.status,
      notes: invoiceData.notes
    }

    const jsonStr = JSON.stringify(payload)
    const base64 = btoa(encodeURIComponent(jsonStr))
    const baseUrl = window.location.origin + window.location.pathname

    return `${baseUrl}?inv=${encodeURIComponent(invoiceData.invoiceNo || '')}&data=${base64}`
  } catch (err) {
    console.error('Error generating share link:', err)
    return window.location.href
  }
}

export function parseInvoiceShareLink() {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const dataParam = params.get('data')

  if (!dataParam) return null

  try {
    const jsonStr = decodeURIComponent(atob(dataParam))
    return JSON.parse(jsonStr)
  } catch (err) {
    console.error('Error parsing share link data:', err)
    return null
  }
}
