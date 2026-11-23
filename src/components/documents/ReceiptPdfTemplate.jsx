import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import '../../services/pdfTypography';

const styles = StyleSheet.create({
  page: { 
    fontFamily: 'Helvetica', 
    padding: 30, 
    fontSize: 9, 
    color: '#0f172a', 
    backgroundColor: '#ffffff' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    borderBottomWidth: 1.2, 
    borderBottomColor: '#0f172a', 
    paddingBottom: 10, 
    marginBottom: 14 
  },
  brand: { 
    fontSize: 18, 
    fontFamily: 'Helvetica-Bold', 
    letterSpacing: 2, 
    color: '#0f172a' 
  },
  subBrand: { 
    fontSize: 8, 
    color: '#0284c7', 
    marginTop: 1 
  },
  titleRight: { 
    alignItems: 'flex-end' 
  },
  receiptTitle: { 
    fontSize: 11, 
    fontFamily: 'Helvetica-Bold', 
    color: '#0f172a' 
  },
  metaText: { 
    fontSize: 8, 
    color: '#64748b', 
    marginTop: 2 
  },
  body: { 
    paddingVertical: 6 
  },
  row: { 
    flexDirection: 'row', 
    marginBottom: 7, 
    alignItems: 'flex-start' 
  },
  label: { 
    width: 140, 
    fontSize: 8.5, 
    color: '#475569' 
  },
  colon: { 
    width: 12, 
    fontSize: 8.5, 
    color: '#475569' 
  },
  value: { 
    flex: 1, 
    fontSize: 9, 
    fontFamily: 'Helvetica-Bold', 
    color: '#0f172a' 
  },
  amountContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  amountMainRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    letterSpacing: 0.5,
  },
  amountText: { 
    fontSize: 15, 
    fontFamily: 'Helvetica-Bold', 
    color: '#0f172a' 
  },
  footer: { 
    marginTop: 'auto', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    borderTopWidth: 0.5, 
    borderTopColor: '#e2e8f0', 
    paddingTop: 8 
  },
});

export const ReceiptPdfTemplate = ({ data }) => {
  const {
    receiptNumber = 'KW/KEEN/202609/0001',
    date = '05 September 2026',
    payerName = '',
    parentName = '',
    studentName = 'Nama Siswa',
    totalBill = 200000,
    paidAmount = 200000,          // Nominal yang diterima pada pembayaran ini
    remainingAmount = 0,          // Sisa outstanding
    paymentMethod = '',
    terbilang = 'Dua Ratus Ribu Rupiah',
    description = 'Pembayaran Bimbingan Belajar Bahasa Inggris - Paket GROW (1 Bulan)',
  } = data || {};

  // Acuan Mutlak: Menggunakan nama wali jika ada, jika tidak ada baru nama siswa
  const resolvedPayer = (payerName || parentName || '').trim() || studentName;
  const isPayerParent = resolvedPayer !== studentName && (parentName || (payerName && payerName !== studentName));

  return (
    <Document>
      <Page orientation="landscape" size="A5" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>KAVIO EDU</Text>
            <Text style={styles.subBrand}>Private English Class & Academic Mentoring</Text>
          </View>
          <View style={styles.titleRight}>
            <Text style={styles.receiptTitle}>KUITANSI PEMBAYARAN RESMI</Text>
            <Text style={styles.metaText}>No: {receiptNumber}</Text>
            <Text style={styles.metaText}>Tanggal: {date}</Text>
          </View>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.label}>Telah Diterima Dari</Text>
            <Text style={styles.colon}>:</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.value}>{resolvedPayer}</Text>
              {isPayerParent && studentName ? (
                <Text style={{ fontSize: 8, color: '#64748b', marginTop: 1.5 }}>
                  Siswa: {studentName}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Uang Sejumlah</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={[styles.value, { fontFamily: 'Helvetica-Oblique' }]}>
              "{terbilang} Rupiah"
            </Text>
          </View>
          {paymentMethod && (
            <View style={styles.row}>
              <Text style={styles.label}>Metode Pembayaran</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{paymentMethod}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Untuk Pembayaran</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{description} — a/n {studentName}</Text>
          </View>
        </View>

        {/* NOMINAL BOX - HANYA PEMBAYARAN DITERIMA */}
        <View style={styles.amountContainer}>
          <View style={styles.amountMainRow}>
            <Text style={styles.amountLabel}>
              PEMBAYARAN DITERIMA
            </Text>
            <Text style={styles.amountText}>
              Rp {Number(paidAmount).toLocaleString('id-ID')},-
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={{ fontSize: 7.5, color: '#64748b' }}>
            Bukti transaksi sah yang diterbitkan oleh sistem Kavio Edu.
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 8, color: '#475569' }}>Pandeglang, {date}</Text>
            <View style={{ height: 22 }} />
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
              Fatih Farhat Asshidiq
            </Text>
            <Text style={{ fontSize: 7.5, color: '#64748b' }}>Kavio Edu Academic System</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPdfTemplate;
