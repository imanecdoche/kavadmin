import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export const UpcomingSessions = ({
  sessionsData,
  onOpenDetail,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Normalize data from getUpcomingSessions3DaysValidated or default structure
  const defaultDays = [
    {
      id: 'today',
      tag: 'Hari Ini',
      dateLabel: 'Jumat, 4 Sep',
      isToday: true,
      sessions: [],
    },
    {
      id: 'tomorrow',
      tag: 'Besok',
      dateLabel: 'Sabtu, 5 Sep',
      isToday: false,
      sessions: [
        { id: '1', time: '09.00', studentName: 'Alya', packageTier: 'GROW' },
      ],
    },
    {
      id: 'dayAfter',
      tag: 'Lusa',
      dateLabel: 'Minggu, 6 Sep',
      isToday: false,
      sessions: [
        { id: '2', time: '09.00', studentName: 'Hana', packageTier: 'GROW' },
      ],
    },
  ];

  const normalizedDays = sessionsData
    ? sessionsData.map((day, idx) => {
        const isToday = day.isToday ?? (day.dateLabel === 'Hari Ini' || idx === 0);
        const tag = day.tag || day.dateLabel || (idx === 0 ? 'Hari Ini' : idx === 1 ? 'Besok' : 'Lusa');
        const dateLabel = day.dateFormatted || day.dateLabel || '';
        const sessions = (day.sessions || []).map((s, sIdx) => ({
          id: s.id || s.student?.id || `${idx}-${sIdx}`,
          time: s.time || (s.timeLabel ? s.timeLabel.split(' ')[0] : '09.00'),
          studentName: s.studentName || s.student?.name || 'Siswa',
          packageTier: s.packageTier || s.student?.programTier || s.student?.packageType || 'GROW',
        }));

        return {
          id: day.id || `day-${idx}`,
          tag,
          dateLabel,
          isToday,
          sessions,
        };
      })
    : defaultDays;

  const days = normalizedDays;
  const totalSessionsCount = days.reduce((acc, day) => acc + (day.sessions?.length || 0), 0);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden group">
      {/* 1. COMPACT MASTER HEADER (Zero Outline Strokes) */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-white flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 text-current" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#111111] dark:text-white leading-tight">
              Sesi Mendatang (3 Hari)
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Ringkasan sesi bimbingan belajar 3 hari ke depan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 text-xs font-semibold px-3 py-1 rounded-md border-none whitespace-nowrap flex-shrink-0">
            Total {totalSessionsCount} Sesi
          </span>

          {onOpenDetail && (
            <button
              type="button"
              className="h-8 px-3.5 text-xs font-semibold bg-[#f5f5f5] hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#111111] dark:text-white gap-1.5 rounded-md flex items-center border-none cursor-pointer whitespace-nowrap flex-shrink-0 shadow-2xs transition-colors"
              onClick={onOpenDetail}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Detail</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-[#f5f5f5] dark:hover:bg-neutral-800 hover:text-[#111111] dark:hover:text-white border-none cursor-pointer transition-colors"
            title={isExpanded ? 'Tutup Sesi' : 'Buka Sesi'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. THREE DAYS GRID CARDS (Solid-Filled Only, Zero Outline Strokes) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {days.map((day) => {
                  const sessionCount = day.sessions?.length || 0;

                  return (
                    <div
                      key={day.id}
                      className={`rounded-lg p-4 border border-neutral-100 dark:border-neutral-800 shadow-2xs transition-all flex flex-col justify-between ${
                        day.isToday
                          ? 'bg-[#f0f0f0] dark:bg-neutral-800'
                          : 'bg-[#f5f5f5] dark:bg-neutral-800/60'
                      }`}
                    >
                      {/* Row Header Hari */}
                      <div className="flex items-center justify-between gap-2 pb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border-none whitespace-nowrap flex-shrink-0 ${
                              day.isToday
                                ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                                : 'bg-[#e5e5e5] text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
                            }`}
                          >
                            {day.tag}
                          </span>
                          <span className="text-xs font-bold text-[#111111] dark:text-white whitespace-nowrap">
                            {day.dateLabel}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border-none px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0">
                          {sessionCount} Sesi
                        </span>
                      </div>

                      {/* List Sesi Per Hari */}
                      <div className="pt-2 space-y-2 min-h-[64px] flex flex-col justify-center">
                        {sessionCount > 0 ? (
                          day.sessions.map((s, idx) => (
                            <div
                              key={s.id || idx}
                              className="flex items-center justify-between p-2.5 rounded-md border-none bg-white dark:bg-neutral-900 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 truncate mr-2">
                                <span className="text-[11px] font-mono font-bold text-[#111111] dark:text-neutral-200 bg-[#f5f5f5] dark:bg-neutral-800 px-2 py-0.5 rounded-md border-none whitespace-nowrap flex-shrink-0">
                                  {s.time}
                                </span>
                                <span className="text-xs font-semibold text-[#111111] dark:text-white truncate whitespace-nowrap">
                                  {s.studentName}
                                </span>
                              </div>
                              <span className="bg-[#111111] text-white dark:bg-neutral-700 font-mono text-[10px] font-bold tracking-wider uppercase shrink-0 px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0">
                                {s.packageTier}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="py-3.5 px-3 border-none rounded-md text-center bg-white dark:bg-neutral-900">
                            <p className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">
                              Tidak ada sesi bimbingan
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpcomingSessions;
