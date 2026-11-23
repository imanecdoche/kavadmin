import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { REANIMATED_CASCADE_CONTAINER, REANIMATED_CASCADE_ITEM } from '@/lib/reanimatedMotion';
import { isStudentActive } from '@/utils/studentStatusHelper';

export const DashboardStudentStats = ({
  students = [],
  paidRevenue = 0,
  outstandingRevenue = 0,
  totalHours = 0,
  totalSessions = 0,
  paidPercentage = 0,
  pendingCount = 0,
  onAddStudent,
}) => {
  const activeStudentsCount = (students || []).filter(isStudentActive).length;

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white">
              Dashboard
            </h1>
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Manajemen data siswa, reservasi slot, dan status pembayaran real-time.
          </p>
        </div>

        <button
          type="button"
          className="bg-[#111111] hover:bg-[#2b2b2b] text-white border-none font-semibold text-xs px-4 h-9 rounded-md shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors"
          onClick={onAddStudent}
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="whitespace-nowrap">Tambah Siswa</span>
        </button>
      </div>

      {/* 2. STATS GRID (4 CARDS) - Small Corner Radius (8px / rounded-lg) + Subtle Drop Shadow */}
      <motion.div
        variants={REANIMATED_CASCADE_CONTAINER}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        
        {/* CARD 1: SISWA AKTIF */}
        <motion.div
          variants={REANIMATED_CASCADE_ITEM}
          className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between"
        >
          <div className="pb-3">
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase whitespace-nowrap">
              Siswa Aktif
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white whitespace-nowrap">
                {activeStudentsCount}
              </span>
              <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">Siswa</span>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">Status Sesi</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                {students.length > 0 ? `${Math.round((activeStudentsCount / students.length) * 100)}% Masih Ada Sesi` : 'Nihil'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: PENDAPATAN TERBAYAR */}
        <motion.div
          variants={REANIMATED_CASCADE_ITEM}
          className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between"
        >
          <div className="pb-3">
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase whitespace-nowrap">
              Pendapatan Terbayar
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white truncate whitespace-nowrap flex-shrink-0">
              Rp {Number(paidRevenue || 0).toLocaleString('id-ID')}
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-full bg-[#f5f5f5] dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#111111] dark:bg-neutral-300 h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" 
                    style={{ width: `${Math.min(100, Math.max(0, paidPercentage))}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#111111] dark:text-neutral-300 whitespace-nowrap">{paidPercentage}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CARD 3: OUTSTANDING */}
        <motion.div
          variants={REANIMATED_CASCADE_ITEM}
          className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between"
        >
          <div className="pb-3">
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase whitespace-nowrap">
              Outstanding
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white truncate whitespace-nowrap flex-shrink-0">
              Rp {Number(outstandingRevenue || 0).toLocaleString('id-ID')}
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">{pendingCount} Menunggu</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                {pendingCount > 0 ? 'Belum Lunas' : 'Nihil'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* CARD 4: TOTAL JAM BELAJAR */}
        <motion.div
          variants={REANIMATED_CASCADE_ITEM}
          className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between"
        >
          <div className="pb-3">
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase whitespace-nowrap">
              Total Jam Belajar
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white whitespace-nowrap">
                {Number(totalHours || 0).toFixed(1)}
              </span>
              <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">Jam</span>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">Akumulasi Kuota</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                {totalSessions} Sesi
              </span>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default DashboardStudentStats;
