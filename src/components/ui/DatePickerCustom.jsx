import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';

const INDO_DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDO_DAY_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const INDO_MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const formatIndonesianDateDisplay = (dateStr) => {
  if (!dateStr) return 'Pilih Tanggal';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const y = parts[0];
  const mIndex = parseInt(parts[1], 10) - 1;
  const d = String(parseInt(parts[2], 10)).padStart(2, '0');
  const monthName = INDO_MONTH_NAMES[mIndex] || parts[1];
  return `${d} ${monthName} ${y}`; // DD MMMM YYYY standar Indonesia
};

export const formatIndonesianDateNumeric = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const y = parts[0];
  const m = String(parts[1]).padStart(2, '0');
  const d = String(parts[2]).padStart(2, '0');
  return `${d}-${m}-${y}`; // DD-MM-YYYY standar Indonesia
};

export const DatePickerCustom = ({
  value = '',
  onChange,
  recommendedDays = [],
  label = 'Tanggal Sesi Perdana',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial selected date or default to today
  const parsedDate = useMemo(() => {
    if (value && typeof value === 'string') {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dt = new Date(y, m, d);
        if (!isNaN(dt.getTime())) return dt;
      }
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  // Update view when value changes from outside
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setViewYear(y);
          setViewMonth(m);
        }
      }
    }
  }, [value]);

  // Click outside to close popover
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Build grid days for the month (Monday-first: 0 = Mon, 6 = Sun)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    const totalDaysInMonth = lastDayOfMonth.getDate();

    // In JS: 0=Sun, 1=Mon, ..., 6=Sat
    // We want Monday = 0, Sunday = 6
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const days = [];

    // Trailing days from previous month
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        month: viewMonth === 0 ? 11 : viewMonth - 1,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        year: viewYear,
        month: viewMonth,
      });
    }

    // Leading days of next month to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      days.push({
        dayNumber: n,
        isCurrentMonth: false,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        month: viewMonth === 11 ? 0 : viewMonth + 1,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const handleSelectDate = (item) => {
    const y = item.year;
    const m = String(item.month + 1).padStart(2, '0');
    const d = String(item.dayNumber).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    if (onChange) onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    if (onChange) onChange(todayStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 rounded-lg flex items-center justify-between text-left text-xs font-medium text-[#111111] dark:text-neutral-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2 truncate">
          <img 
            src="/nav-icons/calendar.png" 
            alt="Kalender" 
            className="w-3.5 h-3.5 object-contain opacity-75 shrink-0" 
          />
          <span className="truncate">
            {value ? formatIndonesianDateDisplay(value) : 'Pilih Tanggal Sesi Perdana...'}
          </span>
          {value && (
            <span className="text-[10px] font-mono text-neutral-400 shrink-0">
              ({formatIndonesianDateNumeric(value)})
            </span>
          )}
        </div>
        <span className="text-[10px] uppercase font-bold text-neutral-400 shrink-0 ml-2">
          Ubah
        </span>
      </button>

      {/* Calendar Popover (Zero Animation, Clean B&W Token) */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl p-3.5 font-sans select-none"
          style={{ minWidth: '280px' }}
        >
          {/* Header Month / Year */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-bold text-xs text-[#111111] dark:text-white">
              {INDO_MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center text-[10px] font-bold text-neutral-400">
            {INDO_DAY_SHORT.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              const itemDateStr = `${item.year}-${String(item.month + 1).padStart(2, '0')}-${String(item.dayNumber).padStart(2, '0')}`;
              const isSelected = value === itemDateStr;
              const isToday = todayStr === itemDateStr;

              // Check if day matches any recommended slots (e.g. 'Selasa')
              const dayOfWeekIndex = (new Date(item.year, item.month, item.dayNumber).getDay());
              const dayName = INDO_DAY_NAMES[dayOfWeekIndex];
              const isRecommendedSlot = Array.isArray(recommendedDays) && recommendedDays.includes(dayName);

              return (
                <button
                  key={`${itemDateStr}-${idx}`}
                  type="button"
                  onClick={() => handleSelectDate(item)}
                  className={`relative w-8 h-8 rounded-full text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                    !item.isCurrentMonth
                      ? 'text-neutral-300 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                      : isSelected
                      ? 'bg-black text-white font-bold shadow-xs'
                      : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  } ${isToday && !isSelected ? 'font-bold ring-1 ring-neutral-400 dark:ring-neutral-500' : ''}`}
                >
                  <span>{item.dayNumber}</span>
                  {/* Visual Recommendation Indicator for slot matching day */}
                  {isRecommendedSlot && !isSelected && (
                    <span 
                      title={`Cocok dengan hari slot: ${dayName}`}
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" 
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-semibold cursor-pointer"
            >
              Hari Ini
            </button>
            {recommendedDays && recommendedDays.length > 0 && (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Slot: {recommendedDays.join(' & ')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerCustom;
