import React from 'react'
import DocumentPreviewModal from './documents/DocumentPreviewModal'

/**
 * 🧾 ReceiptModal (Kuitansi Resmi Kavio Edu)
 * Menggunakan arsitektur DocumentPreviewModal formal bank ledger dengan font JetBrains Mono.
 */
export default function ReceiptModal({ isOpen, onClose, data }) {
  return (
    <DocumentPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      type="receipt"
      data={data}
    />
  )
}
