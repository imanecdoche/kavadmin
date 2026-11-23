import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import '../../services/pdfTypography';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 36, fontSize: 9, color: '#0f172a', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1.5, borderBottomColor: '#0f172a', paddingBottom: 12, marginBottom: 16 },
  brandTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', letterSpacing: 2, color: '#0f172a' },
  brandSubtitle: { fontSize: 8.5, color: '#0284c7', marginTop: 2 },
  metaRight: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  metaText: { fontSize: 8.5, color: '#64748b', marginTop: 2 },
  infoSection: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, marginBottom: 16 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase' },
  infoValueBold: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginTop: 2 },
  infoValue: { fontSize: 8.5, color: '#334155', marginTop: 2 },
  table: { marginTop: 6, marginBottom: 16 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#0f172a', paddingBottom: 6, fontFamily: 'Helvetica-Bold', fontSize: 8.5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', paddingVertical: 7, fontSize: 8.5 },
  colDesc: { flex: 4 },
  colQty: { flex: 1.5, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  historyTitle: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 5, letterSpacing: 0.5 },
  historyTable: { marginBottom: 14, borderWidth: 0.5, borderColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  historyHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 5, paddingHorizontal: 8, fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#334155' },
  historyRow: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#e2e8f0', paddingVertical: 5, paddingHorizontal: 8, fontSize: 8, alignItems: 'center' },
  colReceiptNum: { flex: 2.5 },
  colReceiptDate: { flex: 2 },
  colReceiptMethod: { flex: 2.5 },
  colReceiptAmount: { flex: 2, textAlign: 'right', fontFamily: 'Helvetica-Bold', color: '#16a34a' },
  totalSection: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  totalBox: { width: 240, borderTopWidth: 1, borderTopColor: '#0f172a', paddingTop: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalLabel: { fontSize: 8.5, color: '#475569' },
  totalValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.8, borderTopColor: '#cbd5e1', paddingTop: 4, marginTop: 4 },
  grandTotal: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  statusBadge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, fontSize: 7.5, fontFamily: 'Helvetica-Bold', alignSelf: 'flex-start', marginTop: 4 },
  paymentBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 0.8,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  paymentHeader: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  paymentCol: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 6,
  },
  paymentLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  paymentAccount: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginTop: 1,
  },
  paymentHolder: {
    fontSize: 7.5,
    color: '#334155',
    marginTop: 1,
  },
  paymentNotes: {
    fontSize: 7.5,
    color: '#475569',
    lineHeight: 1.3,
    marginTop: 2,
  },
  footer: { marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 0.5, borderTopColor: '#cbd5e1', paddingTop: 10 },
  footerSign: { alignItems: 'flex-end' },
});

export const InvoicePdfTemplate = ({ data }) => {
  const {
    invoiceNumber = 'INV/KEEN/202609/0001',
    date = '04 September 2026',
    dueDate = '11 September 2026',
    studentName = 'Nama Siswa',
    parentName = 'Nama Orang Tua',
    programTier = 'GROW',
    batchName = 'BATCH 1',
    totalPeriods = 1,
    itemDescription = '',
    pricePerPeriod = 200000,
    subtotal = 200000,
    discountType = 'percent',
    discountValue = 0,
    discountAmount = 0,
    grandTotal = 200000,
    paidAmount = 0,
    remainingAmount = 200000,
    receipts = [],
    paymentInfo = {
      bankName: 'Blu by BCA Digital',
      bankAccount: '007187161271',
      ewalletNumber: '082111500190',
      accountHolder: 'Fatih Farhat Asshidiq',
    },
  } = data || {};

  const isLunas = remainingAmount <= 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>KAVIO EDU</Text>
            <Text style={styles.brandSubtitle}>Private English Class & Academic Mentoring</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.invoiceTitle}>INVOICE TAGIHAN</Text>
            <Text style={styles.metaText}>No: {invoiceNumber}</Text>
            <Text style={styles.metaText}>Tanggal: {date}</Text>
            <Text style={styles.metaText}>Jatuh Tempo: {dueDate}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Tagihan Kepada:</Text>
            <Text style={styles.infoValueBold}>{parentName || studentName}</Text>
            {parentName && studentName ? (
              <Text style={styles.infoValue}>Siswa: {studentName}</Text>
            ) : null}
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Program & Periode:</Text>
            <Text style={styles.infoValueBold}>Paket {programTier}</Text>
            <Text style={styles.infoValue}>{batchName} • {totalPeriods} Bulan</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Deskripsi Program / Layanan</Text>
            <Text style={styles.colQty}>Periode</Text>
            <Text style={styles.colPrice}>Harga / Bulan</Text>
            <Text style={styles.colTotal}>Subtotal</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>
              {itemDescription || (programTier === 'CUSTOM'
                ? 'Bimbingan Belajar Bahasa Inggris (Program Terarah)'
                : `Bimbingan Belajar Bahasa Inggris Paket ${programTier} (${totalPeriods} Bulan)`)}
            </Text>
            <Text style={styles.colQty}>{totalPeriods} Bulan</Text>
            <Text style={styles.colPrice}>Rp {pricePerPeriod.toLocaleString('id-ID')}</Text>
            <Text style={styles.colTotal}>Rp {subtotal.toLocaleString('id-ID')}</Text>
          </View>
        </View>

        {/* Tabel Riwayat Pembayaran Terkonfirmasi */}
        {receipts && receipts.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.historyTitle}>Riwayat Pembayaran Terkonfirmasi</Text>
            <View style={styles.historyTable}>
              <View style={styles.historyHeader}>
                <Text style={styles.colReceiptNum}>No. Kuitansi</Text>
                <Text style={styles.colReceiptDate}>Tanggal Bayar</Text>
                <Text style={styles.colReceiptMethod}>Metode / Bukti</Text>
                <Text style={styles.colReceiptAmount}>Nominal</Text>
              </View>
              {receipts.map((rc, idx) => (
                <View key={rc.id || idx} style={styles.historyRow}>
                  <Text style={styles.colReceiptNum}>{rc.receiptNumber || `KW/KEEN/${idx + 1}`}</Text>
                  <Text style={styles.colReceiptDate}>{rc.paymentDate || '-'}</Text>
                  <Text style={styles.colReceiptMethod}>{rc.paymentMethod || 'Tunai / Cash'}</Text>
                  <Text style={styles.colReceiptAmount}>Rp {(Number(rc.amountPaid) || 0).toLocaleString('id-ID')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>Rp {subtotal.toLocaleString('id-ID')}</Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#e11d48' }]}>
                  Diskon {discountType === 'percent' ? `(${discountValue}%)` : '(Nominal)'}:
                </Text>
                <Text style={[styles.totalValue, { color: '#e11d48' }]}>
                  - Rp {discountAmount.toLocaleString('id-ID')}
                </Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotal}>TOTAL TAGIHAN:</Text>
              <Text style={styles.grandTotal}>Rp {grandTotal.toLocaleString('id-ID')}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Jumlah Terbayar:</Text>
              <Text style={[styles.totalValue, { color: '#16a34a' }]}>
                Rp {paidAmount.toLocaleString('id-ID')}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { fontFamily: 'Helvetica-Bold', color: isLunas ? '#16a34a' : '#d97706' }]}>
                {isLunas ? 'Status Pembayaran:' : 'Sisa Tagihan (Outstanding):'}
              </Text>
              <Text style={[styles.totalValue, { color: isLunas ? '#16a34a' : '#d97706' }]}>
                {isLunas ? 'LUNAS' : `Rp ${remainingAmount.toLocaleString('id-ID')}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Kotak Instruksi Pembayaran Resmi */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentHeader}>INSTRUKSI PEMBAYARAN RESMI KAVIO EDU</Text>
          
          <View style={styles.paymentGrid}>
            {/* Option 1: Rekening Blu */}
            <View style={styles.paymentCol}>
              <Text style={styles.paymentLabel}>Transfer Bank ({paymentInfo.bankName || 'Blu by BCA Digital'})</Text>
              <Text style={styles.paymentAccount}>{paymentInfo.bankAccount || '007187161271'}</Text>
              <Text style={styles.paymentHolder}>a/n {paymentInfo.accountHolder || 'Fatih Farhat Asshidiq'}</Text>
            </View>

            {/* Option 2: E-Wallet */}
            <View style={styles.paymentCol}>
              <Text style={styles.paymentLabel}>E-Wallet (DANA / GoPay)</Text>
              <Text style={styles.paymentAccount}>{paymentInfo.ewalletNumber || '082111500190'}</Text>
              <Text style={styles.paymentHolder}>a/n {paymentInfo.accountHolder || 'Fatih Farhat Asshidiq'}</Text>
            </View>
          </View>

          <Text style={styles.paymentNotes}>
            • Harap mencantumkan nama siswa atau nomor invoice pada berita transfer/catatan transaksi.
          </Text>
          <Text style={styles.paymentNotes}>
            • Konfirmasikan bukti transfer ke kontak WhatsApp resmi Kavio Edu untuk validasi dan penerbitan kuitansi lunas.
          </Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={{ fontSize: 7.5, color: '#64748b' }}>Kavio Edu Academic System • Dokumen Resmi Elektronik</Text>
          </View>
          <View style={styles.footerSign}>
            <Text style={{ fontSize: 8, color: '#334155' }}>Pandeglang, {date}</Text>
            <View style={{ height: 26 }} />
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>Fatih Farhat Asshidiq</Text>
            <Text style={{ fontSize: 7.5, color: '#64748b' }}>Founder & Academic Director</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePdfTemplate;
