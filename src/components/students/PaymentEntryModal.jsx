import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CreditCard, AlertCircle, UploadCloud, CheckCircle2, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { formatRupiah, parseRupiah } from '@/lib/currencyUtils';
import { recordNewPayment } from '@/services/billingLedgerService';
import { compressImageFile } from '@/utils/imageCompressor';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const PaymentEntryModal = ({
  isOpen = false,
  onClose,
  student,
  onSuccess,
}) => {
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [payerName, setPayerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank (Blu / BCA)');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState(null); // { dataUrl, sizeInKb }
  const [isCompressing, setIsCompressing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  const fileInputRef = useRef(null);

  const grandTotal = student?.totalBill !== undefined ? student.totalBill : (student?.valPerMonth ? student.valPerMonth * (student.durationMonths || 1) : 0);
  const currentPaid = student?.paidAmount !== undefined ? student.paidAmount : (student?.paid || 0);
  const currentRemaining = student?.remainingAmount !== undefined ? student.remainingAmount : Math.max(0, grandTotal - currentPaid);

  useEffect(() => {
    if (student) {
      setPaymentAmount(currentRemaining > 0 ? currentRemaining : 0);
      setPayerName(student?.parentName || student?.name || '');
      setPaymentMethod('Transfer Bank (Blu / BCA)');
      setNotes('');
      setProofImage(null);
      setErrorMessage('');
      setSuccessReceipt(null);
    }
  }, [student, currentRemaining, isOpen]);

  // Handle instant client-side image compression
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setIsCompressing(true);

    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.75,
        mimeType: 'image/jpeg',
      });
      setProofImage({
        dataUrl: compressed.dataUrl,
        sizeInKb: compressed.sizeInKb,
        name: file.name,
      });
    } catch (err) {
      console.error('Gagal mengompresi gambar:', err);
      setErrorMessage(err.message || 'Gagal memproses gambar bukti bayar.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeProofImage = () => {
    setProofImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Kalkulasi sisa pasca bayar
  const preview = useMemo(() => {
    const payNum = Number(paymentAmount) || 0;
    const newPaid = currentPaid + payNum;
    const newRemaining = Math.max(0, grandTotal - newPaid);
    const isLunas = newRemaining <= 0;

    return {
      newPaid,
      newRemaining,
      isLunas,
      statusLabel: isLunas ? 'TELAH LUNAS' : 'DITERIMA SEBAGIAN',
    };
  }, [paymentAmount, currentPaid, grandTotal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (Number(paymentAmount) <= 0) {
      setErrorMessage('Nominal pembayaran harus lebih besar dari Rp 0.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await recordNewPayment({
        studentId: student.id,
        invoiceId: student.masterInvoiceId || null,
        paymentAmount: Number(paymentAmount),
        paymentMethod: paymentMethod,
        proofImageUrl: proofImage?.dataUrl || null,
        payerName: (payerName || '').trim() || student?.parentName || student?.name,
        studentName: student.name,
        programTier: student.programTier || student.packageType || 'GROW',
        currentPaidAmount: currentPaid,
        grandTotal: grandTotal,
        notes: notes,
      });

      setSuccessReceipt(result);
      if (onSuccess) onSuccess();
      
      // Auto close after brief confirmation or immediate
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Gagal mencatat pembayaran:', err);
      setErrorMessage(err.message || 'Gagal menyimpan transaksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none p-0 overflow-hidden border-none bg-white dark:bg-neutral-900 font-sans text-slate-900 dark:text-slate-100 flex flex-col m-0">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Catat Pembayaran Masuk
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-none">
                Siswa: <span className="font-semibold text-slate-800 dark:text-slate-200">{student?.name}</span>
              </p>
            </div>
          </div>
        </div>

        {successReceipt ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pembayaran Berhasil Dicatat!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Kuitansi resmi <span className="font-mono font-bold">{successReceipt.receiptNumber}</span> telah otomatis diterbitkan dan sisa tagihan terpotong.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-5 sm:p-6 space-y-4">
              {errorMessage && (
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Rangkuman Status Tagihan Saat Ini */}
              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 grid grid-cols-3 gap-2 text-center shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Grand Total</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block mt-0.5 whitespace-nowrap">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Sudah Masuk</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5 whitespace-nowrap">
                    Rp {currentPaid.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Sisa Tagihan</span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 block mt-0.5 whitespace-nowrap">
                    Rp {currentRemaining.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Input Nominal Pembayaran Diterima */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nominal Pembayaran Diterima (Rp) *</Label>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(currentRemaining)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    Set Lunas Penuh
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">Rp</span>
                  <Input
                    type="text"
                    value={formatRupiah(paymentAmount)}
                    onChange={(e) => setPaymentAmount(parseRupiah(e.target.value))}
                    className="text-xs pl-9 font-mono font-bold text-emerald-600 dark:text-emerald-400 h-9 bg-white dark:bg-slate-800 rounded-xl"
                  />
                </div>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Metode Pembayaran</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="Transfer Bank (Blu / BCA)">Transfer Bank (Blu by BCA - 007187161271)</option>
                  <option value="Transfer Mandiri / BRI / BNI">Transfer Bank Lain (Mandiri / BRI / BNI)</option>
                  <option value="E-Wallet (GoPay / DANA)">E-Wallet (GoPay / DANA - 082111500190)</option>
                  <option value="QRIS Kavio Edu">QRIS Kavio Edu</option>
                  <option value="Tunai / Cash">Tunai / Cash Langsung</option>
                </select>
              </div>

              {/* Upload Bukti Pembayaran Terkompresi Otomatis */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bukti Pembayaran (Auto-Kompresi &lt;100KB)
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {proofImage ? (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={proofImage.dataUrl}
                        alt="Bukti Transfer"
                        className="w-10 h-10 object-cover rounded-lg border border-emerald-200 shrink-0"
                      />
                      <div className="text-left overflow-hidden">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {proofImage.name || 'Bukti Transfer'}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">
                          {proofImage.sizeInKb} KB • Terkompresi Aman
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeProofImage}
                      title="Hapus Bukti"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isCompressing}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 transition-all flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium"
                  >
                    {isCompressing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Mengompresi Gambar...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-slate-500" />
                        <span>Unggah Foto Bukti Transfer / Resi</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Input Nama Penyetor / Wali */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Diterima Dari (Nama Penyetor / Wali)</Label>
                <Input
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Nama penyetor / wali murid"
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              {/* Input Catatan Transaksi */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catatan / Keterangan Pembayaran</Label>
                <Input
                  placeholder="Contoh: Pelunasan sisa tagihan batch 1"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              {/* Live Preview Kuitansi yang Akan Terbit */}
              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Pratinjau Kuitansi yang Akan Terbit:
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Status Kuitansi:</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ${
                      preview.isLunas
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {preview.statusLabel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400">Sisa Tagihan Pasca Transaksi:</span>
                  <span className={`font-bold ${preview.isLunas ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {preview.isLunas ? 'LUNAS (Rp 0)' : `Rp ${preview.newRemaining.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:px-6 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full shadow-2xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || isCompressing}
                className="h-9 px-5 text-xs font-semibold bg-[#111111] hover:bg-[#2b2b2b] text-white rounded-full shadow-xs transition-colors"
              >
                {isLoading ? 'Menerbitkan Kuitansi...' : 'Simpan Pembayaran & Terbitkan Kuitansi'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentEntryModal;
