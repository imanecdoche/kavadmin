import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { pdf } from '@react-pdf/renderer';
import {
  FileText,
  Award,
  BookOpen,
  GraduationCap,
  MessageSquare,
  ExternalLink,
  Plus,
  Download,
  Receipt,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SimpleTooltip } from '@/components/ui/tooltip';

import { PaymentEntryModal } from './PaymentEntryModal';
import { ReceiptPdfTemplate } from '@/components/documents/ReceiptPdfTemplate';
import { InvoicePdfTemplate } from '@/components/documents/InvoicePdfTemplate';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import { angkaKeTerbilang } from '@/lib/currencyUtils';
import { getStudentReceipts } from '@/services/billingLedgerService';
import { getStudentSessionStatus } from '@/utils/studentStatusHelper';

export const StudentDetailModal = ({
  isOpen = false,
  onClose,
  student: incomingStudent,
  onOpenInvoice,
  onOpenReport,
  onOpenRoadmap,
  onOpenCertificate,
  onPaymentSuccess,
}) => {
  // 1. SEMUA HOOKS DI PALING ATAS
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const lastStudentRef = React.useRef(incomingStudent);
  if (incomingStudent) {
    lastStudentRef.current = incomingStudent;
  }
  const student = incomingStudent || lastStudentRef.current;

  // 2. useEffect DIJALANKAN TANPA KONDISIONAL PEMBUNGKUS / EARLY RETURN
  useEffect(() => {
    let isMounted = true;

    if (isOpen && (student?.id || student?.masterInvoiceId)) {
      setIsLoadingReceipts(true);
      try {
        const receiptsCol = collection(db, 'receipts');
        let q;
        if (student?.masterInvoiceId) {
          q = query(receiptsCol, where('invoiceId', '==', student.masterInvoiceId));
        } else {
          q = query(receiptsCol, where('studentId', '==', student.id));
        }

        const unsub = onSnapshot(
          q,
          (snap) => {
            if (!isMounted) return;
            const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            docs.sort((a, b) => (a.receiptIndex || 0) - (b.receiptIndex || 0));
            if (docs.length > 0) {
              setReceipts(docs);
            } else if (student?.receipts && Array.isArray(student.receipts) && student.receipts.length > 0) {
              setReceipts(student.receipts);
            } else {
              setReceipts([]);
            }
            setIsLoadingReceipts(false);
          },
          (err) => {
            console.warn('Receipts onSnapshot fallback:', err);
            if (student?.receipts && Array.isArray(student.receipts) && student.receipts.length > 0) {
              setReceipts(student.receipts);
              setIsLoadingReceipts(false);
            } else {
              getStudentReceipts(student?.masterInvoiceId, student?.id).then((res) => {
                if (isMounted) {
                  setReceipts(res || student?.receipts || []);
                  setIsLoadingReceipts(false);
                }
              });
            }
          }
        );

        return () => {
          isMounted = false;
          unsub();
        };
      } catch (e) {
        if (student?.receipts && Array.isArray(student.receipts) && student.receipts.length > 0) {
          setReceipts(student.receipts);
          setIsLoadingReceipts(false);
        } else {
          getStudentReceipts(student?.masterInvoiceId, student?.id).then((res) => {
            if (isMounted) {
              setReceipts(res || student?.receipts || []);
              setIsLoadingReceipts(false);
            }
          });
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, student?.id, student?.masterInvoiceId]);

  // 3. PROSES DATA DENGAN FALLBACK AMAN
  const name = student?.name || 'Nama Siswa';
  const parentName = student?.parentName || 'Wali / Orang Tua';
  const parentPhone = student?.parentPhone || '6287772130407';
  const studentPhone = student?.studentPhone || '6283833287361';
  const programTier = student?.programTier || student?.packageType || 'GROW';

  const valPerMonth = student?.valPerMonth || student?.pricePerMonth || 200000;
  const durationMonths = student?.durationMonths || 1;
  const sessionsPerMonth = student?.sessionsPerMonth || (programTier === 'SEED' ? 3 : programTier === 'BOOST' || programTier === 'MASTER' ? 8 : 4);
  const minutesPerSession = student?.minutesPerSession || (programTier === 'MASTER' ? 90 : 60);

  const totalBill = student?.totalBill !== undefined ? student.totalBill : (valPerMonth * durationMonths);
  const paidAmount = student?.paidAmount !== undefined ? student.paidAmount : (student?.paid || 0);
  const remainingBill = student?.remainingAmount !== undefined ? student.remainingAmount : (student?.remainingBill !== undefined ? student.remainingBill : Math.max(0, totalBill - paidAmount));
  const isPaidOff = student?.isPaidOff !== undefined ? student.isPaidOff : (remainingBill <= 0 && totalBill > 0);
  const paidPct = totalBill > 0 ? Math.min(100, Math.round((paidAmount / totalBill) * 100)) : 0;

  const paymentStatus = student?.paymentStatus || (isPaidOff ? 'LUNAS (100%)' : (paidAmount > 0 ? `DP (${paidPct}%)` : 'BELUM DIBAYAR'));

  const totalSessions = student?.totalSessions || (sessionsPerMonth * durationMonths);
  const totalMinutes = student?.totalMinutes || (totalSessions * minutesPerSession);
  const totalHours = student?.totalHours !== undefined ? student.totalHours : (totalMinutes / 60);

  const gender = student?.gender || 'Perempuan';
  const age = student?.age ? (String(student.age).includes('Tahun') ? student.age : `${student.age} Tahun`) : '-';
  const grade = student?.grade || '-';
  const domicile = student?.domicile || student?.address || 'Pandeglang, Banten';
  const learningTarget = student?.learningTarget || '-';

  const courseDuration = student?.courseDuration || `${durationMonths} Bulan`;
  const sessionFrequency = student?.sessionFrequency || `${sessionsPerMonth} Sesi/Bln (${minutesPerSession} Menit/Sesi)`;
  const classSchedule = student?.classSchedule || student?.schedule || 'Belum diatur';

  const cleanPhone = (phone) => (phone || '').toString().replace(/\D/g, '');

  // Handle Preview Master Invoice (Formal Bank-Ledger WYSIWYG)
  const handlePreviewMasterInvoice = () => {
    setPreviewDoc({
      type: 'invoice',
      data: {
        invoiceNo: student?.invoiceNumber || (student?.masterInvoiceId ? `INV/KEEN/${student.masterInvoiceId.slice(0, 8).toUpperCase()}` : 'INV/KEEN/202611/0001'),
        invoiceDate: student?.startDate || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        dueDate: '7 Hari sejak diterbitkan',
        parentName: parentName,
        studentName: name,
        parentPhone: parentPhone,
        studentPhone: studentPhone,
        address: domicile,
        packageType: programTier,
        valPerMonth: valPerMonth,
        durationMonths: durationMonths,
        sessionsPerMonth: sessionsPerMonth,
        totalInvestment: totalBill,
        paidAmount: paidAmount,
        remainingAmount: remainingBill,
        paymentMethod: student?.paymentMethod || 'Tunai / Cash',
      }
    });
  };

  // Handle Preview Kuitansi (Formal Bank-Ledger WYSIWYG)
  const handlePreviewReceipt = (rcpt) => {
    setPreviewDoc({
      type: 'receipt',
      data: {
        receiptNumber: rcpt?.receiptNumber || 'KW/KEEN/202611/0001',
        paymentDate: rcpt?.paymentDate || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        payerName: rcpt?.payerName || parentName || name || 'Siswa',
        parentName: parentName || '',
        studentName: rcpt?.studentName || name,
        totalBill: rcpt?.totalBill || totalBill,
        amountPaid: rcpt?.amountPaid || rcpt?.paidAmount || 0,
        remainingOutstanding: rcpt?.remainingOutstanding !== undefined ? rcpt?.remainingOutstanding : remainingBill,
        paymentMethod: rcpt?.paymentMethod || student?.paymentMethod || 'Tunai / Cash',
        description: rcpt?.description || rcpt?.notes || `Pembayaran Program Belajar Paket ${programTier} (${durationMonths} Bulan)`,
      }
    });
  };

  // Handle Download Kuitansi PDF
  const handleDownloadReceipt = async (rcpt) => {
    setDownloadingId(rcpt.id);
    try {
      const docData = {
        receiptNumber: rcpt.receiptNumber || 'KW/KEEN/202609/0001',
        date: rcpt.paymentDate || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        payerName: rcpt.payerName || parentName || name || 'Siswa',
        parentName: parentName || '',
        studentName: rcpt.studentName || name,
        totalBill: rcpt.totalBill || totalBill,
        paidAmount: rcpt.amountPaid || 0,
        remainingAmount: rcpt.remainingOutstanding !== undefined ? rcpt.remainingOutstanding : Math.max(0, totalBill - (rcpt.amountPaid || 0)),
        paymentMethod: rcpt.paymentMethod || student?.paymentMethod || 'Tunai / Cash',
        terbilang: angkaKeTerbilang(rcpt.amountPaid || 0),
        description: rcpt.description || `Pembayaran Bimbingan Belajar Paket ${programTier}`,
      };

      const blob = await pdf(<ReceiptPdfTemplate data={docData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KUITANSI_${(rcpt.receiptNumber || 'DOC').replace(/[\/\\]/g, '_')}_${(name || 'Siswa').replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh kuitansi PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Download Master Invoice PDF (Dengan Riwayat Pembayaran Terkonfirmasi)
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState(null);

  const handleDownloadMasterInvoice = async () => {
    setIsDownloadingInvoice(true);
    try {
      const docData = {
        invoiceNumber: student?.invoiceNumber || (student?.masterInvoiceId ? `INV/KEEN/${student.masterInvoiceId.slice(0, 8).toUpperCase()}` : 'INV/KEEN/202609/0001'),
        date: student?.startDate || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        dueDate: '7 Hari sejak diterbitkan',
        studentName: name,
        parentName: parentName,
        programTier: programTier,
        batchName: student?.batchName || 'BATCH 1',
        totalPeriods: durationMonths,
        pricePerPeriod: valPerMonth,
        subtotal: valPerMonth * durationMonths,
        grandTotal: totalBill,
        paidAmount: paidAmount,
        remainingAmount: remainingBill,
        receipts: receipts,
      };

      const blob = await pdf(<InvoicePdfTemplate data={docData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `INVOICE_${(docData.invoiceNumber || 'DOC').replace(/[\/\\]/g, '_')}_${(name || 'Siswa').replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh invoice PDF:', err);
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
        <DialogContent className="fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none p-0 overflow-hidden border-none bg-white dark:bg-neutral-900 font-sans text-[#111111] dark:text-neutral-100 flex flex-col m-0">
          {/* 1. HEADER SECTION (Solid Tokens, Zero Outline Strokes) */}
          <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-none">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#111111] text-white dark:bg-white dark:text-[#111111] border-none whitespace-nowrap">
                  Paket {programTier}
                </span>
                {(() => {
                  const sInfo = getStudentSessionStatus(student);
                  return (
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border-none whitespace-nowrap ${
                      sInfo.isCompleted
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {sInfo.isCompleted ? 'Selesai (Semua Sesi Tuntas)' : `Aktif (Sisa ${sInfo.remainingSessions} Sesi)`}
                    </span>
                  );
                })()}
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 border-none whitespace-nowrap">
                  {paymentStatus}
                </span>
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-white leading-tight">
                {name}
              </DialogTitle>
              <p className="text-xs text-neutral-500 mt-1">
                Wali / Orang Tua: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{parentName || '-'}</span>
              </p>
            </div>

            {/* Tombol Catat Pembayaran Masuk (Solid-Filled) */}
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-[#111111] hover:bg-[#2b2b2b] text-white rounded-md text-xs font-semibold px-4 h-9 shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-center border-none cursor-pointer whitespace-nowrap transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Pembayaran</span>
            </button>
          </div>

          {/* SCROLLABLE BODY CONTENT (Flex 1) */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto overscroll-contain">
            {/* 2. THREE STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stat 1: Total Jam Belajar */}
              <div className="p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-[#f5f5f5] dark:bg-neutral-800/60 shadow-2xs">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                  Total Jam Belajar
                </span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">
                    {Number(totalHours).toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Jam</span>
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 block">
                  ({totalMinutes} Mins / {totalSessions} Sesi)
                </span>
              </div>

              {/* Stat 2: Terbayar */}
              <div className="p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-[#f5f5f5] dark:bg-neutral-800/60 shadow-2xs">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                  Terbayar (Paid)
                </span>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  Rp {Number(paidAmount || 0).toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 block">
                  Total: Rp {Number(totalBill || 0).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Stat 3: Outstanding */}
              <div className="p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-[#f5f5f5] dark:bg-neutral-800/60 shadow-2xs">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                  Outstanding
                </span>
                <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  Rp {Number(remainingBill || 0).toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 block font-medium">
                  {remainingBill <= 0 ? 'Lunas Penuh' : 'Sisa Tagihan'}
                </span>
              </div>
            </div>

            {/* 2.5 SEKSI RIWAYAT PEMBAYARAN & KUITANSI (LEDGER) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                  Riwayat Pembayaran & Kuitansi Resmi ({receipts.length})
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePreviewMasterInvoice}
                    className="text-xs font-semibold text-[#111111] dark:text-white hover:underline flex items-center gap-1.5 cursor-pointer"
                    title="Pratinjau Master Invoice"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Invoice</span>
                  </button>
                  <button
                    type="button"
                    disabled={isDownloadingInvoice}
                    onClick={handleDownloadMasterInvoice}
                    className="text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
                    title="Unduh Master Invoice PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloadingInvoice ? 'Menyiapkan...' : 'Unduh Master Invoice'}</span>
                  </button>
                </div>
              </div>

              {isLoadingReceipts ? (
                <div className="p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-[#f5f5f5] dark:bg-neutral-800/40 text-center text-xs text-neutral-500">
                  Memuat riwayat kuitansi...
                </div>
              ) : receipts.length > 0 ? (
                <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xs">
                  {receipts.map((rcpt, idx) => {
                    const isRcptLunas = Number(rcpt.remainingOutstanding) <= 0;
                    return (
                      <div
                        key={rcpt.id || idx}
                        className="p-3.5 flex items-center justify-between hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-9 h-9 rounded-md bg-[#111111]/5 text-[#111111] dark:bg-white/10 dark:text-white flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                                {rcpt.receiptNumber || `KW #0${idx + 1}`}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                  isRcptLunas
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-none'
                                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-none'
                                }`}
                              >
                                {rcpt.paymentStatus || (isRcptLunas ? 'TELAH LUNAS' : 'DITERIMA SEBAGIAN')}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                              {rcpt.paymentDate || '-'} • Diterima: <span className="font-semibold text-neutral-800 dark:text-neutral-200">Rp {Number(rcpt.amountPaid || 0).toLocaleString('id-ID')}</span>
                              {(rcpt.paymentMethod || student?.paymentMethod) ? ` • ${rcpt.paymentMethod || student.paymentMethod}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {rcpt.proofImageUrl && (
                            <button
                              type="button"
                              onClick={() => setViewProofUrl(rcpt.proofImageUrl)}
                              className="h-8 px-2.5 text-[11px] font-semibold bg-white dark:bg-neutral-800 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-1 text-neutral-700 dark:text-neutral-300 shadow-2xs border-none"
                              title="Lihat Bukti Transfer"
                            >
                              <ExternalLink className="w-3 h-3 text-emerald-600" />
                              <span>Bukti</span>
                            </button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewReceipt(rcpt)}
                            className="h-8 px-2.5 text-[11px] font-semibold border-none bg-[#f5f5f5] dark:bg-neutral-800 rounded-md shrink-0 flex items-center gap-1.5 hover:bg-[#111111] hover:text-white transition-colors shadow-2xs cursor-pointer"
                            title="Pratinjau Kuitansi Resmi"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewReceipt(rcpt)}
                            className="h-8 px-3 text-[11px] font-semibold border-none bg-[#f5f5f5] dark:bg-neutral-800 rounded-md shrink-0 flex items-center gap-1.5 hover:bg-[#111111] hover:text-white transition-colors shadow-2xs cursor-pointer"
                            title="Buka & Unduh Kuitansi PDF"
                          >
                            <Download className="w-3 h-3" />
                            <span>Kuitansi PDF</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/20 text-center text-neutral-500 text-xs">
                  <Receipt className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
                  <p className="font-medium text-neutral-700 dark:text-neutral-300">Belum ada riwayat kuitansi tercatat</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Klik tombol "Catat Pembayaran" di atas untuk menerbitkan kuitansi baru.
                  </p>
                </div>
              )}
            </div>

            {/* 3. KONTAK WHATSAPP */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                Kontak Langsung WhatsApp
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Wali */}
                <a
                  href={parentPhone ? `https://wa.me/${cleanPhone(parentPhone)}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        WhatsApp Wali ({parentName || 'Wali'})
                      </p>
                      <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {parentPhone ? `+${cleanPhone(parentPhone)}` : '-'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600 shrink-0" />
                </a>

                {/* WhatsApp Siswa */}
                <a
                  href={studentPhone ? `https://wa.me/${cleanPhone(studentPhone)}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <div className="w-9 h-9 rounded-md bg-[#6442D6]/10 text-[#6442D6] dark:text-[#8b6ff0] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        WhatsApp Siswa ({name})
                      </p>
                      <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {studentPhone ? `+${cleanPhone(studentPhone)}` : '-'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#6442D6] shrink-0" />
                </a>
              </div>
            </div>

            <Separator className="bg-neutral-100 dark:bg-neutral-800" />

            {/* 4. PROFIL & DEMOGRAFI */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                Profil & Demografi Siswa
              </span>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block">Jenis Kelamin:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white mt-0.5 block">{gender}</span>
                </div>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block">Usia:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white mt-0.5 block">{age}</span>
                </div>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block">Jenjang / Kelas:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white mt-0.5 block">{grade}</span>
                </div>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block">Domisili / Alamat:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white mt-0.5 block">{domicile}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1.5 font-medium">
                  Target Belajar Siswa:
                </span>
                <div className="p-3.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-[#f5f5f5] dark:bg-neutral-800/40 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {learningTarget || '-'}
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            {/* 5. BIMBINGAN & JADWAL */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Bimbingan & Jadwal
              </span>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Paket Kursus:</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{programTier}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Durasi Kursus:</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{courseDuration}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Sesi & Menit Belajar:</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{sessionFrequency}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Jadwal Kelas:</span>
                  <Badge variant="secondary" className="mt-1 font-semibold rounded-full px-2.5 py-0.5">
                    {classSchedule}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 6. MODAL FOOTER & SHORTCUT ACTIONS (Sticky, Solid Tokens, Zero Outline Strokes) */}
          <div className="p-4 sm:px-6 bg-[#f5f5f5] dark:bg-neutral-800/80 border-none flex items-center justify-between sticky bottom-0 inset-x-0 z-10 mt-auto">
            <div className="flex items-center gap-2">
              <SimpleTooltip content="Invoice / Pembayaran">
                <button
                  type="button"
                  onClick={() => onOpenInvoice && onOpenInvoice(student || { name, programTier })}
                  className="h-8 w-8 rounded-md text-[#111111] dark:text-white bg-white dark:bg-neutral-700 hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] border-none flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </SimpleTooltip>

              <SimpleTooltip content="Rapor Pembelajaran">
                <button
                  type="button"
                  onClick={() => onOpenReport && onOpenReport(student || { name, programTier })}
                  className="h-8 w-8 rounded-md text-[#111111] dark:text-white bg-white dark:bg-neutral-700 hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] border-none flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  <GraduationCap className="w-4 h-4" />
                </button>
              </SimpleTooltip>

              <SimpleTooltip content="Roadmap Belajar">
                <button
                  type="button"
                  onClick={() => onOpenRoadmap && onOpenRoadmap(student || { name, programTier })}
                  className="h-8 w-8 rounded-md text-[#111111] dark:text-white bg-white dark:bg-neutral-700 hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] border-none flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </SimpleTooltip>

              <SimpleTooltip content="Sertifikat Kelulusan">
                <button
                  type="button"
                  onClick={() => onOpenCertificate && onOpenCertificate(student || { name, programTier })}
                  className="h-8 w-8 rounded-md text-[#111111] dark:text-white bg-white dark:bg-neutral-700 hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] border-none flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  <Award className="w-4 h-4" />
                </button>
              </SimpleTooltip>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-9 px-5 text-xs font-semibold bg-[#111111] hover:bg-[#2b2b2b] text-white rounded-md border-none cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors shadow-xs"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL CATAT PEMBAYARAN */}
      <PaymentEntryModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        student={student}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          if (onPaymentSuccess) onPaymentSuccess();
        }}
      />

      {/* MODAL PRATINJAU DOKUMEN (KUITANSI / INVOICE WYSIWYG) */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        type={previewDoc?.type || 'receipt'}
        data={previewDoc?.data || {}}
        student={student}
      />

      {/* LIGHTBOX BUKTI PEMBAYARAN */}
      {viewProofUrl && (
        <Dialog open={Boolean(viewProofUrl)} onOpenChange={(open) => !open && setViewProofUrl(null)}>
          <DialogContent className="fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none p-6 bg-black/95 border-none flex flex-col items-center justify-center m-0">
            <DialogTitle className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              Bukti Transfer Pembayaran
            </DialogTitle>
            <div className="rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center max-h-[70vh]">
              <img
                src={viewProofUrl}
                alt="Bukti Transfer"
                className="max-h-[68vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="pt-3 text-right">
              <button
                type="button"
                onClick={() => setViewProofUrl(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#111111] text-white rounded-full"
              >
                Tutup
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default StudentDetailModal;
