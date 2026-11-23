import React, { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { logoSvg } from '@/assets';

export const Sidebar = ({
  activeTab = 'dashboard',
  setActiveTab,
  onTabChange,
  onLogout,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleTabSelect = (tabId) => {
    if (typeof onTabChange === 'function') onTabChange(tabId);
    if (typeof setActiveTab === 'function') setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '/nav-icons/dashboard.png' },
    { id: 'students', label: 'Siswa', icon: '/nav-icons/students.png' },
    { id: 'schedule', label: 'Jadwal', icon: '/nav-icons/calendar.png' },
    { id: 'invoice', label: 'Invoice', icon: '/nav-icons/invoice.png' },
    { id: 'roadmap', label: 'Roadmap', icon: '/nav-icons/roadmap.png' },
    { id: 'reports', label: 'Rapor', icon: '/nav-icons/reports.png' },
    { id: 'certificates', label: 'Sertifikat', icon: '/nav-icons/certificates.png' },
    { id: 'modules', label: 'Modul', icon: '/nav-icons/modules.png' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '/nav-icons/whatsapp.png' },
  ];

  return (
    <>
      {/* 1. TOP MOBILE HEADER (< md) */}
      <header className="md:hidden sticky top-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2.5 flex items-center justify-between no-print">
        <div 
          onClick={() => handleTabSelect('dashboard')}
          className="flex items-center cursor-pointer select-none"
        >
          <img
            src={logoSvg}
            alt="Kavio Edu"
            className="h-7 w-auto object-contain dark:invert"
          />
        </div>

        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1 text-xs font-semibold rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
            >
              Keluar
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. MOBILE DRAWER OVERLAY (< md) - Zero Animation & Solid Dim Backdrop */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex overflow-hidden">
          {/* Dimmed Backdrop (Zero Blur) */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50"
          />

          {/* Side Drawer Panel */}
          <div className="relative w-64 max-w-[80vw] h-full bg-white dark:bg-neutral-900 z-50 flex flex-col p-4 shadow-2xl border-r border-neutral-200 dark:border-neutral-800">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-3">
              <img
                src={logoSvg}
                alt="Kavio Edu"
                className="h-7 w-auto object-contain cursor-pointer dark:invert"
                onClick={() => handleTabSelect('dashboard')}
              />
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav List */}
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar py-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id || (item.id === 'invoice' && activeTab === 'invoices');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabSelect(item.id)}
                    className={`group w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      className={`w-4 h-4 object-contain shrink-0 ${
                        isActive ? 'brightness-0 invert' : 'opacity-80 group-hover:opacity-100 dark:invert'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout Mobile */}
            {onLogout && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. DESKTOP SIDEPANEL (>= md) - FIXED LEFT SIDEBAR */}
      <aside className="hidden md:flex md:w-56 lg:w-60 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-40 select-none no-print">
        {/* Top Logo Branding */}
        <div className="h-16 px-5 flex items-center border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div 
            onClick={() => handleTabSelect('dashboard')}
            className="flex items-center cursor-pointer select-none"
            title="Kavio Edu Workspace"
          >
            <img
              src={logoSvg}
              alt="Kavio Edu"
              className="h-7 lg:h-8 w-auto object-contain hover:opacity-90 transition-opacity dark:invert"
            />
          </div>
        </div>

        {/* Vertical Nav Items List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'invoice' && activeTab === 'invoices');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSelect(item.id)}
                className={`group w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-md transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'
                }`}
              >
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className={`w-4 h-4 object-contain shrink-0 ${
                    isActive ? 'brightness-0 invert' : 'opacity-80 group-hover:opacity-100 dark:invert'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout Button */}
        {onLogout && (
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 mt-auto shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
