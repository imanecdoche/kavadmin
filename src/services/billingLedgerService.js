import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase';

// Helper pembuat nomor dokumen resmi
export const generateDocumentNumber = (type = 'INV') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${type}/KEEN/${year}${month}/${randomSuffix}`;
};

/**
 * 1. Mendaftarkan Siswa Baru + Generate Master Invoice + Kuitansi #1 (DP)
 */
export const registerStudentWithBilling = async (studentData, billingData) => {
  const {
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxPercent,
    taxAmount,
    grandTotal,
    initialPayment,
  } = billingData;

  // 1. Simpan Data Siswa
  const studentRef = doc(collection(db, 'students'));
  const studentId = studentRef.id;

  const invoiceNumber = generateDocumentNumber('INV');
  const invoiceRef = doc(collection(db, 'invoices'));
  const invoiceId = invoiceRef.id;

  const paidAmount = Number(initialPayment) || 0;
  const remainingAmount = Math.max(0, grandTotal - paidAmount);
  const isPaidOff = remainingAmount <= 0 && grandTotal > 0;

  let paymentStatus = 'BELUM BAYAR';
  if (isPaidOff) {
    paymentStatus = 'LUNAS';
  } else if (paidAmount > 0) {
    const percent = Math.round((paidAmount / grandTotal) * 100);
    paymentStatus = `DP ${percent}%`;
  }

  // Simpan record siswa
  await setDoc(studentRef, {
    ...studentData,
    id: studentId,
    masterInvoiceId: invoiceId,
    totalBill: grandTotal,
    paidAmount: paidAmount,
    remainingAmount: remainingAmount,
    paymentStatus: paymentStatus,
    isPaidOff: isPaidOff,
    isActive: true,
    createdAt: serverTimestamp(),
  });

  // 2. Simpan 1 Master Invoice
  await setDoc(invoiceRef, {
    id: invoiceId,
    studentId: studentId,
    invoiceNumber: invoiceNumber,
    studentName: studentData.name,
    parentName: studentData.parentName || '',
    parentPhone: studentData.parentPhone || '',
    programTier: studentData.programTier,
    durationMonths: studentData.durationMonths,
    subtotal: subtotal,
    discountType: discountType,
    discountValue: discountValue,
    discountAmount: discountAmount,
    taxPercent: taxPercent,
    taxAmount: taxAmount,
    grandTotal: grandTotal,
    paidAmount: paidAmount,
    remainingAmount: remainingAmount,
    status: isPaidOff ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
    createdAt: serverTimestamp(),
  });

  // 3. Jika ada pembayaran awal (DP > 0), terbitkan Kuitansi #1
  let firstReceiptId = null;
  let firstReceiptNumber = null;
  if (paidAmount > 0) {
    const receiptNumber = generateDocumentNumber('KW');
    const receiptRef = doc(collection(db, 'receipts'));
    firstReceiptId = receiptRef.id;
    firstReceiptNumber = receiptNumber;

    await setDoc(receiptRef, {
      id: firstReceiptId,
      receiptNumber: receiptNumber,
      invoiceId: invoiceId,
      studentId: studentId,
      receiptIndex: 1,
      paymentDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      payerName: studentData.parentName || studentData.name,
      studentName: studentData.name,
      paymentMethod: billingData.paymentMethod || 'Tunai / Cash',
      proofImageUrl: billingData.proofImageUrl || null,
      amountPaid: paidAmount,
      totalBill: grandTotal,
      remainingOutstanding: remainingAmount,
      paymentStatus: isPaidOff ? 'TELAH LUNAS' : 'DITERIMA SEBAGIAN',
      description: `Pembayaran Awal (DP) Paket ${studentData.programTier} (${studentData.durationMonths} Bulan)`,
      createdAt: serverTimestamp(),
    });
  }

  return { studentId, invoiceId, invoiceNumber, firstReceiptId, firstReceiptNumber };
};

/**
 * 2. Mencatat Pembayaran Baru / Pelunasan (Generate Kuitansi #N & Update Invoice Master)
 */
export const recordNewPayment = async ({
  studentId,
  invoiceId,
  paymentAmount,
  paymentMethod = 'Tunai / Cash',
  proofImageUrl = null,
  payerName,
  studentName,
  programTier,
  currentPaidAmount,
  grandTotal,
  notes,
}) => {
  const paymentNum = Number(paymentAmount) || 0;
  if (paymentNum <= 0) throw new Error('Nominal pembayaran harus lebih dari 0.');

  const currentPaid = Number(currentPaidAmount) || 0;
  const grandTot = Number(grandTotal) || 0;
  const newTotalPaid = currentPaid + paymentNum;
  const newRemaining = Math.max(0, grandTot - newTotalPaid);
  const isNowPaidOff = newRemaining <= 0;

  // Pastikan invoiceId ada atau fallback cari/buat
  let activeInvoiceId = invoiceId;
  let receiptIndex = 1;

  if (activeInvoiceId) {
    const receiptsQuery = query(
      collection(db, 'receipts'),
      where('invoiceId', '==', activeInvoiceId)
    );
    const snapshot = await getDocs(receiptsQuery);
    receiptIndex = snapshot.size + 1;
  } else {
    // Jika student belum punya masterInvoiceId (legacy data), buatkan master invoice
    const invoiceNumber = generateDocumentNumber('INV');
    const newInvoiceRef = doc(collection(db, 'invoices'));
    activeInvoiceId = newInvoiceRef.id;

    await setDoc(newInvoiceRef, {
      id: activeInvoiceId,
      studentId: studentId,
      invoiceNumber: invoiceNumber,
      studentName: studentName || 'Siswa',
      parentName: payerName || '',
      programTier: programTier || 'GROW',
      grandTotal: grandTot,
      paidAmount: newTotalPaid,
      remainingAmount: newRemaining,
      status: isNowPaidOff ? 'PAID' : 'PARTIAL',
      createdAt: serverTimestamp(),
    });
  }

  // 1. Simpan Kuitansi Baru
  const receiptNumber = generateDocumentNumber('KW');
  const receiptRef = doc(collection(db, 'receipts'));
  const receiptId = receiptRef.id;

  const statusKuitansi = isNowPaidOff ? 'TELAH LUNAS' : 'DITERIMA SEBAGIAN';

  const receiptData = {
    id: receiptId,
    receiptNumber: receiptNumber,
    invoiceId: activeInvoiceId,
    studentId: studentId,
    receiptIndex: receiptIndex,
    paymentDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    payerName: payerName || studentName || 'Siswa',
    studentName: studentName,
    paymentMethod: paymentMethod,
    proofImageUrl: proofImageUrl || null,
    amountPaid: paymentNum,
    totalBill: grandTot,
    remainingOutstanding: newRemaining,
    paymentStatus: statusKuitansi,
    description: notes || `Pembayaran Bimbingan Paket ${programTier || 'GROW'} - Tahap ke-${receiptIndex}`,
    createdAt: serverTimestamp(),
  };

  await setDoc(receiptRef, receiptData);

  // 2. Update Master Invoice
  if (activeInvoiceId) {
    const invoiceDocRef = doc(db, 'invoices', activeInvoiceId);
    await updateDoc(invoiceDocRef, {
      paidAmount: newTotalPaid,
      remainingAmount: newRemaining,
      status: isNowPaidOff ? 'PAID' : 'PARTIAL',
      lastPaymentAt: serverTimestamp(),
      lastReceiptNumber: receiptNumber,
    }).catch(err => console.warn('Could not update invoice doc:', err));
  }

  // 3. Update Profil Siswa
  const studentDocRef = doc(db, 'students', studentId);
  const percent = grandTot > 0 ? Math.round((newTotalPaid / grandTot) * 100) : 100;
  await updateDoc(studentDocRef, {
    masterInvoiceId: activeInvoiceId,
    paidAmount: newTotalPaid,
    remainingAmount: newRemaining,
    isPaidOff: isNowPaidOff,
    paymentStatus: isNowPaidOff ? 'LUNAS' : `DP ${percent}%`,
    lastPaymentAt: serverTimestamp(),
  });

  return { 
    receiptId, 
    receiptNumber, 
    receipt: receiptData,
    isNowPaidOff, 
    newRemaining, 
    newTotalPaid 
  };
};

/**
 * 3. Ambil Seluruh Riwayat Kuitansi Siswa Berdasarkan Master Invoice / Student ID
 */
export const getStudentReceipts = async (invoiceId, studentId = null) => {
  if (!invoiceId && !studentId) return [];
  
  let q;
  if (invoiceId) {
    q = query(
      collection(db, 'receipts'),
      where('invoiceId', '==', invoiceId)
    );
  } else {
    q = query(
      collection(db, 'receipts'),
      where('studentId', '==', studentId)
    );
  }

  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return results.sort((a, b) => (a.receiptIndex || 0) - (b.receiptIndex || 0));
};
