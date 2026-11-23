import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { REANIMATED_CASCADE_CONTAINER, REANIMATED_CASCADE_ITEM } from '@/lib/reanimatedMotion';
import { getStudentSessionStatus } from '@/utils/studentStatusHelper';

export const StudentsStats = ({
  students = [],
  onAddStudent,
}) => {
  const safeStudents = Array.isArray(students) ? students : [];
  
  // Evaluasi status sesi setiap siswa:
  // - Siswa Aktif: Masih ada sisa sesi bimbingan belajar (remainingSessions > 0)
  // - Siswa Selesai: Seluruh sesi telah tuntas dijalani (remainingSessions === 0 / isCompleted)
  const evaluatedStudents = safeStudents.map((s) => ({
    student: s,
    sessionInfo: getStudentSessionStatus(s),
  }));

  const activeStudents = evaluatedStudents.filter((item) => item.sessionInfo.isActive);
  const activeCount = activeStudents.length;

  const completedStudents = evaluatedStudents.filter((item) => item.sessionInfo.isCompleted);
  const completedCount = completedStudents.length;

  const totalCount = safeStudents.length;
  const activePct = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION (Daftar Siswa & Tambah Siswa) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white">
              Data Siswa
            </h1>
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Manajemen direktori siswa terdaftar, kuota sesi aktif, dan status kelulusan.
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

      {/* 2. STATS GRID (3 KARTU: SISWA AKTIF, SISWA SELESAI, TOTAL SISWA) */}
      <motion.div
        variants={REANIMATED_CASCADE_CONTAINER}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
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
                {activeCount}
              </span>
              <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">Siswa</span>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">Status Sesi</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                Masih Ada Sesi ({activePct}%)
              </span>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: SISWA SELESAI */}
        <motion.div
          variants={REANIMATED_CASCADE_ITEM}
          className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between"
        >
          <div className="pb-3">
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase whitespace-nowrap">
              Siswa Selesai
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white whitespace-nowrap">
                {completedCount}
              </span>
              <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">Siswa</span>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">Kelulusan</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                {completedCount > 0 ? 'Semua Sesi Tuntas' : 'Nihil'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* CARD 3: TOTAL SISWA */}
        <motion.div
          variants={REANIMATED_CASCADE_ITEM}
          className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between"
        >
          <div className="pb-3">
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase whitespace-nowrap">
              Total Siswa
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white whitespace-nowrap">
                {totalCount}
              </span>
              <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">Siswa</span>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">Akumulasi Database</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                Semua Siswa Terdaftar
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentsStats;
