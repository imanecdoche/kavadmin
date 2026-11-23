import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserPlus, ArrowLeftRight, Check, AlertCircle, Lock, UploadCloud, Trash2, Loader2 } from 'lucide-react';
import { formatRupiah, parseRupiah } from '@/lib/currencyUtils';
import { registerStudentWithBilling } from '@/services/billingLedgerService';
import { compressImageFile } from '@/utils/imageCompressor';
import DatePickerCustom from '@/components/ui/DatePickerCustom';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const TIME_SLOTS = ['09.00 WIB', '13.00 WIB', '15.00 WIB'];
const PACKAGE_PRICES = { SEED: 150000, GROW: 200000, BOOST: 350000, MASTER: 500000 };

export const AddStudentModal = ({
  isOpen = true,
  onClose,
  onSuccess,
  onSubmit,
  existingStudents = [],
  students = [],
  editingStudent = null,
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const allStudentsList = existingStudents && existingStudents.length > 0 ? existingStudents : students;

  // 1. Data Profil & Kontak
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Laki-laki',
    age: '',
    grade: '',
    address: '',
    learningTarget: '',
    parentName: '',
    parentPhone: '',
    studentPhone: '',
    programTier: 'GROW',
    durationMonths: 3,
  });

  // 2. Data Finansial
  const [discountType, setDiscountType] = useState('nominal'); // 'percent' | 'nominal'
  const [discountValue, setDiscountValue] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [initialPayment, setInitialPayment] = useState(200000);
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank (Blu / BCA)');
  const [proofImage, setProofImage] = useState(null); // { dataUrl, sizeInKb, name }
  const [isCompressingProof, setIsCompressingProof] = useState(false);
  const proofInputRef = useRef(null);

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingProof(true);
    setErrorMessage('');
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
      console.error('Gagal mengompresi bukti bayar:', err);
      setErrorMessage(err.message || 'Gagal memproses gambar bukti bayar.');
    } finally {
      setIsCompressingProof(false);
      if (proofInputRef.current) proofInputRef.current.value = '';
    }
  };

  // 3. Slot Matrix State & Sesi Perdana
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [firstSessionDate, setFirstSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const isMultiSlotPackage = formData.programTier === 'BOOST' || formData.programTier === 'MASTER';
  const requiredSlotsCount = isMultiSlotPackage ? 2 : 1;

  useEffect(() => {
    if (editingStudent) {
      const tier = editingStudent.programTier || editingStudent.packageType || 'GROW';
      const neededCount = (tier === 'BOOST' || tier === 'MASTER') ? 2 : 1;

      let initialSlots = [];
      if (Array.isArray(editingStudent.scheduleSlots) && editingStudent.scheduleSlots.length > 0) {
        initialSlots = editingStudent.scheduleSlots;
      } else if (Array.isArray(editingStudent.selectedSlots) && editingStudent.selectedSlots.length > 0) {
        initialSlots = editingStudent.selectedSlots.map((slotStr) => {
          const parts = slotStr.split(' ');
          const day = parts[0];
          const time = parts.slice(1).join(' ');
          return { day, time };
        });
      } else if (editingStudent.schedule) {
        const parts = editingStudent.schedule.split(' ');
        const day = parts[0];
        const time = parts.slice(1).join(' ');
        if (day && time) initialSlots = [{ day, time }];
      }

      setFormData({
        name: editingStudent.name || '',
        gender: editingStudent.gender || 'Laki-laki',
        age: editingStudent.age || '',
        grade: editingStudent.grade || '',
        address: editingStudent.address || '',
        learningTarget: editingStudent.learningTarget || '',
        parentName: editingStudent.parentName || '',
        parentPhone: editingStudent.parentPhone || '',
        studentPhone: editingStudent.studentPhone || '',
        programTier: tier,
        durationMonths: editingStudent.durationMonths || 1,
      });
      setInitialPayment(editingStudent.paidAmount !== undefined ? editingStudent.paidAmount : (editingStudent.paid || 0));
      setSelectedSlots(initialSlots.slice(0, neededCount));
      setFirstSessionDate(editingStudent.firstSessionDate || editingStudent.startDate || new Date().toISOString().split('T')[0]);
      setActiveTab('profile');
      setErrorMessage('');
    } else {
      setFormData({
        name: '',
        gender: 'Laki-laki',
        age: '',
        grade: '',
        address: '',
        learningTarget: '',
        parentName: '',
        parentPhone: '',
        studentPhone: '',
        programTier: 'GROW',
        durationMonths: 3,
      });
      setDiscountType('nominal');
      setDiscountValue(0);
      setTaxPercent(0);
      setInitialPayment(200000);
      setSelectedSlots([]);
      setFirstSessionDate(new Date().toISOString().split('T')[0]);
      setActiveTab('profile');
      setErrorMessage('');
    }
  }, [editingStudent, isOpen]);

  // KALKULASI FINANSIAL REAL-TIME
  const calculations = useMemo(() => {
    const monthlyPrice = PACKAGE_PRICES[formData.programTier] || 200000;
    const months = Math.max(1, Number(formData.durationMonths) || 1);
    const subtotal = monthlyPrice * months;

    let discountAmount = 0;
    const disc = Number(discountValue) || 0;
    if (discountType === 'percent') {
      discountAmount = Math.round((subtotal * Math.min(100, Math.max(0, disc))) / 100);
    } else {
      discountAmount = Math.min(subtotal, Math.max(0, disc));
    }

    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxP = Math.max(0, Number(taxPercent) || 0);
    const taxAmount = Math.round((taxableBase * taxP) / 100);

    const grandTotal = taxableBase + taxAmount;
    const dp = Number(initialPayment) || 0;
    const remaining = Math.max(0, grandTotal - dp);

    let paymentBadge = { label: 'BELUM BAYAR (0%)', variant: 'outline', className: 'text-neutral-500' };
    if (dp >= grandTotal && grandTotal > 0) {
      paymentBadge = { label: 'LUNAS (100%)', variant: 'outline', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (dp > 0) {
      const pct = Math.round((dp / grandTotal) * 100);
      paymentBadge = { label: `DP (${pct}%)`, variant: 'outline', className: 'bg-amber-50 text-amber-700 border-amber-200 font-bold' };
    }

    const sessionsPerWeek = requiredSlotsCount;
    const totalSessions = months * 4 * sessionsPerWeek;
    const totalHours = totalSessions * (formData.programTier === 'MASTER' ? 1.5 : 1.0);

    return {
      monthlyPrice,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      dp,
      remaining,
      paymentBadge,
      totalSessions,
      totalHours,
    };
  }, [formData.programTier, formData.durationMonths, discountType, discountValue, taxPercent, initialPayment, requiredSlotsCount]);

  // Handle pergantian paket
  const handlePackageChange = (tier) => {
    setFormData((prev) => ({ ...prev, programTier: tier }));
    const newRequiredCount = (tier === 'BOOST' || tier === 'MASTER') ? 2 : 1;
    if (selectedSlots.length > newRequiredCount) {
      setSelectedSlots(selectedSlots.slice(0, newRequiredCount));
    }
  };

  // Cek apakah slot sudah dipakai
  const getSlotOccupant = (day, time) => {
    if (!Array.isArray(allStudentsList)) return null;
    return allStudentsList.find((s) => {
      if (!s || s.isActive === false) return false;
      if (editingStudent && s.id === editingStudent.id) return false;

      if (Array.isArray(s.scheduleSlots)) {
        return s.scheduleSlots.some(
          (slot) => slot.day?.toLowerCase() === day.toLowerCase() && slot.time?.toLowerCase() === time.toLowerCase()
        );
      }
      const sDay = s.scheduleDay || (s.schedule ? s.schedule.split(' ')[0] : '');
      const sTime = s.scheduleTime || (s.schedule ? s.schedule.split(' ').slice(1).join(' ') : '');
      const dayMatch = sDay?.trim().toLowerCase() === day.trim().toLowerCase();
      const cleanTimeA = time.replace(/\s*WIB/i, '').trim();
      const cleanTimeB = sTime.replace(/\s*WIB/i, '').trim();
      return dayMatch && cleanTimeA === cleanTimeB;
    });
  };

  const handleToggleSlot = (day, time) => {
    setErrorMessage('');
    const occ = getSlotOccupant(day, time);
    if (occ) {
      setErrorMessage(`Slot ${day} pukul ${time} sudah terkunci oleh ${occ.name}.`);
      return;
    }

    const alreadyIdx = selectedSlots.findIndex((s) => s.day === day && s.time === time);
    if (alreadyIdx > -1) {
      setSelectedSlots(selectedSlots.filter((_, i) => i !== alreadyIdx));
    } else {
      if (requiredSlotsCount === 1) {
        setSelectedSlots([{ day, time }]);
      } else {
        if (selectedSlots.length >= 2) {
          setErrorMessage('Paket ini dibatasi tepat 2 slot sesi.');
          return;
        }
        setSelectedSlots([...selectedSlots, { day, time }]);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setActiveTab('profile');
      setErrorMessage('Nama siswa wajib diisi.');
      return;
    }

    if (selectedSlots.length !== requiredSlotsCount) {
      setActiveTab('package');
      setErrorMessage(`Wajib memilih tepat ${requiredSlotsCount} sesi bimbingan pada matriks.`);
      return;
    }

    setIsLoading(true);
    try {
      const studentPayload = {
        ...formData,
        startDate: firstSessionDate,
        firstSessionDate: firstSessionDate,
        scheduleSlots: selectedSlots,
        selectedSlots: selectedSlots.map((s) => `${s.day} ${s.time}`),
        scheduleDay: selectedSlots.map((s) => s.day).join(' & '),
        scheduleTime: selectedSlots.map((s) => `${s.day} ${s.time}`).join(' | '),
        schedule: selectedSlots.map((s) => `${s.day} ${s.time}`).join(' & '),
        packageType: formData.programTier,
        valPerMonth: calculations.monthlyPrice,
        sessionsPerMonth: 4 * requiredSlotsCount,
        minutesPerSession: formData.programTier === 'MASTER' ? 90 : 60,
        totalSessions: calculations.totalSessions,
        totalHours: calculations.totalHours,
        paymentMethod: paymentMethod,
      };

      const billingPayload = {
        subtotal: calculations.subtotal,
        discountType,
        discountValue: Number(discountValue) || 0,
        discountAmount: calculations.discountAmount,
        taxPercent: Number(taxPercent) || 0,
        taxAmount: calculations.taxAmount,
        grandTotal: calculations.grandTotal,
        initialPayment: calculations.dp,
        paymentMethod: paymentMethod,
        proofImageUrl: proofImage?.dataUrl || null,
      };

      if (editingStudent) {
        if (onSubmit) {
          await onSubmit({
            ...editingStudent,
            ...studentPayload,
            totalBill: calculations.grandTotal,
            paidAmount: calculations.dp,
            remainingAmount: calculations.remaining,
            paid: calculations.dp,
            paymentMethod: paymentMethod,
          });
        }
      } else {
        const result = await registerStudentWithBilling(studentPayload, billingPayload);
        
        // Buat record kuitansi awal (DP) terstruktur jika ada pembayaran awal
        const initialReceipts = calculations.dp > 0 ? [
          {
            id: result.firstReceiptId || `kw-${Date.now()}`,
            receiptNumber: result.firstReceiptNumber || `KW/KEEN/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/0001`,
            invoiceId: result.invoiceId,
            studentId: result.studentId,
            receiptIndex: 1,
            paymentDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
            payerName: studentPayload.parentName || studentPayload.name,
            studentName: studentPayload.name,
            paymentMethod: paymentMethod,
            amountPaid: calculations.dp,
            totalBill: calculations.grandTotal,
            remainingOutstanding: calculations.remaining,
            paymentStatus: calculations.remaining === 0 ? 'TELAH LUNAS' : 'DITERIMA SEBAGIAN',
            description: `Pembayaran Awal (DP) Paket ${studentPayload.programTier} (${studentPayload.durationMonths} Bulan)`,
          }
        ] : [];

        if (onSubmit) {
          await onSubmit({
            ...studentPayload,
            id: result.studentId,
            masterInvoiceId: result.invoiceId,
            totalBill: calculations.grandTotal,
            paidAmount: calculations.dp,
            remainingAmount: calculations.remaining,
            paid: calculations.dp,
            paymentMethod: paymentMethod,
            paymentStatus: calculations.remaining === 0 ? 'LUNAS' : `DP ${Math.round((calculations.dp / calculations.grandTotal) * 100)}%`,
            isPaidOff: calculations.remaining === 0,
            receipts: initialReceipts,
            invoices: [
              {
                invoiceNo: result.invoiceNumber || `INV/KEEN/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/0001`,
                invoiceDate: firstSessionDate || new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                studentName: studentPayload.name,
                parentName: studentPayload.parentName || '',
                totalInvestment: calculations.grandTotal,
                paidAmount: calculations.dp,
                status: calculations.remaining === 0 ? 'LUNAS' : `DP ${Math.round((calculations.dp / calculations.grandTotal) * 100)}%`,
                packageType: studentPayload.programTier,
                durationMonths: studentPayload.durationMonths,
                paymentMethod: paymentMethod,
              }
            ]
          });
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Pendaftaran gagal:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none p-0 overflow-hidden border-none bg-white dark:bg-neutral-900 font-sans text-[#111111] dark:text-neutral-100 flex flex-col m-0">
        <div className="p-5 sm:p-6 flex items-center justify-between border-none">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-white flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4 text-current" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-[#111111] dark:text-white tracking-tight leading-none">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </DialogTitle>
              <p className="text-xs text-neutral-500 mt-1 leading-none">
                Pendaftaran siswa, pembuatan invoice resmi, dan kuitansi pembayaran awal
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
          <div className="px-5 sm:px-6 pt-2">
            <TabsList className="grid grid-cols-3 w-full bg-[#f5f5f5] dark:bg-neutral-800 p-1 h-10 rounded-full border-none">
              <TabsTrigger
                value="profile"
                className="text-xs font-semibold rounded-full border-none data-[state=active]:bg-[#111111] data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#111111] transition-all"
              >
                1. Profil
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="text-xs font-semibold rounded-full border-none data-[state=active]:bg-[#111111] data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#111111] transition-all"
              >
                2. Kontak & Wali
              </TabsTrigger>
              <TabsTrigger
                value="package"
                className="text-xs font-semibold rounded-full border-none data-[state=active]:bg-[#111111] data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#111111] transition-all"
              >
                3. Paket & Jadwal
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto overscroll-contain space-y-4">
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TAB 1: PROFIL */}
              <TabsContent value="profile" className="space-y-4 m-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-neutral-700">Nama Siswa *</Label>
                    <Input
                      placeholder="Contoh: Alya Rahma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-xs h-9"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-neutral-700">Jenis Kelamin</Label>
                    <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki" className="text-xs">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan" className="text-xs">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-neutral-700">Usia (Tahun)</Label>
                    <Input
                      type="number"
                      placeholder="Contoh: 17"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-neutral-700">Jenjang / Kelompok</Label>
                    <Input
                      placeholder="Contoh: 12 SMA"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700">Alamat Lengkap</Label>
                  <Input
                    placeholder="Contoh: Pandeglang, Banten"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700">Target Belajar</Label>
                  <Input
                    placeholder="Contoh: Speaking Confidence & PTN"
                    value={formData.learningTarget}
                    onChange={(e) => setFormData({ ...formData, learningTarget: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              </TabsContent>

              {/* TAB 2: KONTAK & WALI */}
              <TabsContent value="contact" className="space-y-4 m-0">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700">Nama Wali / Orang Tua</Label>
                  <Input
                    placeholder="Contoh: Ibu Aan"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-neutral-700">WhatsApp Wali</Label>
                    <Input
                      placeholder="Contoh: 087772130407"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-neutral-700">WhatsApp Siswa</Label>
                    <Input
                      placeholder="Contoh: 083833287361"
                      value={formData.studentPhone}
                      onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: PAKET, JADWAL & STRUKTUR FINANSIAL */}
              <TabsContent value="package" className="space-y-4 m-0">
                {/* 1. Paket & Durasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-neutral-700">Pilihan Paket</Label>
                    <Select value={formData.programTier} onValueChange={handlePackageChange}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEED" className="text-xs">SEED (Rp 150.000/bln • 1 Sesi/Pkn)</SelectItem>
                        <SelectItem value="GROW" className="text-xs">GROW (Rp 200.000/bln • 1 Sesi/Pkn)</SelectItem>
                        <SelectItem value="BOOST" className="text-xs">BOOST (Rp 350.000/bln • 2 Sesi/Pkn)</SelectItem>
                        <SelectItem value="MASTER" className="text-xs">MASTER (Rp 500.000/bln • 2 Sesi/Pkn)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-neutral-700">Durasi Kursus (Bulan)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                {/* 2. Rincian Diskon & Pajak (Tax %) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50">
                  {/* Diskon Switchable */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-semibold text-neutral-700">Diskon Tagihan</Label>
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType(discountType === 'percent' ? 'nominal' : 'percent');
                          setDiscountValue(0);
                        }}
                        className="flex items-center gap-1 text-[10px] text-neutral-600 font-bold hover:text-black bg-white px-2 py-0.5 rounded border border-neutral-200 transition-colors"
                      >
                        <ArrowLeftRight className="w-2.5 h-2.5" />
                        {discountType === 'percent' ? 'Mode: %' : 'Mode: Rp'}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">
                        {discountType === 'percent' ? '%' : 'Rp'}
                      </span>
                      <Input
                        type="text"
                        value={discountType === 'percent' ? discountValue : formatRupiah(discountValue)}
                        onChange={(e) => {
                          if (discountType === 'percent') {
                            setDiscountValue(Math.min(100, Math.max(0, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)));
                          } else {
                            setDiscountValue(parseRupiah(e.target.value));
                          }
                        }}
                        className="text-xs pl-8 font-mono h-9 bg-white"
                        placeholder={discountType === 'percent' ? '0 - 100' : '0'}
                      />
                    </div>
                  </div>

                  {/* Pajak (Tax %) */}
                  <div>
                    <Label className="text-xs font-semibold text-neutral-700 block mb-1.5">Pajak / PPN (%)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">%</span>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(e.target.value)}
                        className="text-xs pl-8 font-mono h-9 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Tanggal Sesi Perdana (Custom UI Date Picker Standar Indonesia) */}
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/40 space-y-1.5">
                  <DatePickerCustom
                    label="Tanggal Sesi Perdana"
                    value={firstSessionDate}
                    onChange={setFirstSessionDate}
                    recommendedDays={selectedSlots.map((s) => s.day)}
                  />
                  <p className="text-[11px] text-neutral-500">
                    Menentukan tanggal dimulainya pertemuan pertama. Jadwal kurikulum roadmap dan jatuh tempo tagihan akan terhitung otomatis dari tanggal ini.
                  </p>
                </div>

                {/* 3. Matriks Slot Jadwal */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-neutral-900">
                      Pilih Slot Jadwal Bimbingan ({selectedSlots.length}/{requiredSlotsCount}) *
                    </Label>
                    {selectedSlots.length === requiredSlotsCount ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold gap-1">
                        <Check className="w-3 h-3" /> Kuota Terpenuhi
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold">
                        Pilih {requiredSlotsCount - selectedSlots.length} slot lagi
                      </Badge>
                    )}
                  </div>

                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="grid grid-cols-4 bg-neutral-50/80 border-b border-neutral-200 p-2 text-center text-[11px] font-bold text-neutral-600">
                      <div className="text-left pl-2">Hari</div>
                      <div>09.00 WIB</div>
                      <div>13.00 WIB</div>
                      <div>15.00 WIB</div>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {DAYS.map((day) => (
                        <div key={day} className="grid grid-cols-4 items-center p-1.5 hover:bg-neutral-50/40">
                          <div className="text-xs font-bold text-neutral-900 pl-2">{day}</div>
                          {TIME_SLOTS.map((time) => {
                            const occ = getSlotOccupant(day, time);
                            const isSelected = selectedSlots.some((s) => s.day === day && s.time === time);
                            if (occ) {
                              return (
                                <div key={time} className="p-1">
                                  <div
                                    title={`Terkunci oleh ${occ.name}`}
                                    className="w-full h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center gap-1 text-[10px] font-semibold text-rose-600 cursor-not-allowed select-none"
                                  >
                                    <Lock className="w-3 h-3 text-rose-500 shrink-0" />
                                    <span className="truncate max-w-[58px]">{occ.name}</span>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div key={time} className="p-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(day, time)}
                                  className={`hover-item-slot w-full h-8 rounded-lg text-[11px] font-semibold transition-all border flex items-center justify-center gap-1 ${
                                    isSelected
                                      ? 'bg-black text-white border-black shadow-xs font-bold'
                                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                  <span>{isSelected ? 'Terpilih' : 'Pilih'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Input Pembayaran Awal (DP) & Badge Status */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-neutral-700">Pembayaran Awal / DP (Rp)</Label>
                    <Badge variant={calculations.paymentBadge.variant} className={calculations.paymentBadge.className}>
                      {calculations.paymentBadge.label}
                    </Badge>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">Rp</span>
                    <Input
                      type="text"
                      value={formatRupiah(initialPayment)}
                      onChange={(e) => setInitialPayment(parseRupiah(e.target.value))}
                      className="text-xs pl-8 font-mono font-bold text-neutral-900 h-9 bg-white"
                    />
                  </div>
                </div>

                {/* Rincian Metode & Bukti Bayar jika ada Pembayaran Awal */}
                {calculations.dp > 0 && (
                  <div className="space-y-3 p-3 bg-neutral-100/70 rounded-xl border border-neutral-200/80">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-neutral-700">Metode Pembayaran Awal (Kuitansi #1)</Label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full text-xs h-9 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none"
                      >
                        <option value="Transfer Bank (Blu / BCA)">Transfer Bank (Blu by BCA - 007187161271)</option>
                        <option value="Transfer Mandiri / BRI / BNI">Transfer Bank Lain (Mandiri / BRI / BNI)</option>
                        <option value="E-Wallet (GoPay / DANA)">E-Wallet (GoPay / DANA - 082111500190)</option>
                        <option value="QRIS Kavio Edu">QRIS Kavio Edu</option>
                        <option value="Tunai / Cash">Tunai / Cash Langsung</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-neutral-700">
                        Bukti Transfer Awal (Opsional - Auto-Kompresi &lt;100KB)
                      </Label>
                      <input
                        ref={proofInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleProofUpload}
                        className="hidden"
                      />

                      {proofImage ? (
                        <div className="p-2.5 rounded-lg border border-emerald-200 bg-white flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={proofImage.dataUrl}
                              alt="Bukti Transfer"
                              className="w-8 h-8 object-cover rounded border border-emerald-200 shrink-0"
                            />
                            <div className="text-left overflow-hidden">
                              <span className="text-xs font-semibold text-neutral-900 truncate block">
                                {proofImage.name || 'Bukti Transfer'}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-mono block">
                                {proofImage.sizeInKb} KB • Terkompresi
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProofImage(null);
                              if (proofInputRef.current) proofInputRef.current.value = '';
                            }}
                            className="p-1 text-neutral-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isCompressingProof}
                          onClick={() => proofInputRef.current?.click()}
                          className="w-full py-2.5 px-3 border border-dashed border-neutral-300 hover:border-neutral-400 rounded-lg bg-white flex items-center justify-center gap-2 text-xs text-neutral-600 font-medium"
                        >
                          {isCompressingProof ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                              <span>Mengompresi Gambar...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Pilih Foto Bukti Transfer</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Live Summary Finansial Card */}
                <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 space-y-2">
                  <div className="flex justify-between text-xs text-neutral-600">
                    <span>Subtotal Tagihan ({formData.durationMonths} Bulan):</span>
                    <span className="font-mono font-semibold">Rp {calculations.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {calculations.discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-rose-600">
                      <span>Potongan Diskon:</span>
                      <span className="font-mono font-semibold">- Rp {calculations.discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {calculations.taxAmount > 0 && (
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>Pajak PPN ({taxPercent}%):</span>
                      <span className="font-mono font-semibold">+ Rp {calculations.taxAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-neutral-900 pt-1.5 border-t border-neutral-200">
                    <span>Grand Total Invoice:</span>
                    <span className="font-mono">Rp {calculations.grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-700">
                    <span>Sisa Outstanding Pasca-Pendaftaran:</span>
                    <span className={`font-mono font-bold ${calculations.remaining === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {calculations.remaining === 0 ? 'LUNAS (Rp 0)' : `Rp ${calculations.remaining.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* FOOTER ACTIONS (Sticky at bottom, Solid Tokens) */}
            <div className="p-4 sm:px-6 bg-[#f5f5f5] dark:bg-neutral-800/80 border-none flex items-center justify-end gap-2 sticky bottom-0 inset-x-0 z-10 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold bg-white dark:bg-neutral-700 hover:bg-[#e5e5e5] dark:hover:bg-neutral-600 text-[#111111] dark:text-white rounded-full border-none cursor-pointer whitespace-nowrap transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || (activeTab === 'package' && selectedSlots.length !== requiredSlotsCount)}
                className="h-9 px-5 text-xs font-semibold bg-[#111111] hover:bg-[#2b2b2b] text-white rounded-full border-none cursor-pointer whitespace-nowrap transition-colors shadow-xs disabled:opacity-50"
              >
                {isLoading ? 'Mendaftarkan & Menerbitkan...' : editingStudent ? 'Simpan Perubahan' : 'Daftarkan Siswa & Terbitkan Dokumen'}
              </button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
