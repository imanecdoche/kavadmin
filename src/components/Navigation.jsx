import React from 'react'
import {
  RiDashboard3Line,
  RiFileList3Line,
  RiAwardLine,
  RiGraduationCapLine,
  RiWhatsappLine,
  RiRouteLine,
  RiBookReadLine,
  RiLogoutBoxRLine
} from 'react-icons/ri'
import { logoSvg } from '../assets'

export default function Navigation({ activeTab, setActiveTab, onLogout = null }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: RiDashboard3Line },
    { id: 'invoice', label: 'Invoice', icon: RiFileList3Line },
    { id: 'reports', label: 'Rapor Siswa', icon: RiAwardLine },
    { id: 'certificates', label: 'Sertifikat Kelulusan', icon: RiGraduationCapLine },
    { id: 'whatsapp', label: 'WhatsApp', icon: RiWhatsappLine },
    { id: 'roadmap', label: 'Roadmap', icon: RiRouteLine },
    { id: 'modules', label: 'Modules', icon: RiBookReadLine },
  ]

  return (
    <>
      {/* MOBILE ONLY: Top Header with Logo */}
      <div className="sm:hidden bg-white border-b border-fluent-border py-2.5 px-4 flex items-center justify-between no-print">
        <img src={logoSvg} alt="Kavio Edu Logo" className="h-7 w-auto object-contain" />
        {onLogout && (
          <button
            onClick={onLogout}
            title="Keluar Sesi (Logout)"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
          >
            <RiLogoutBoxRLine className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* MOBILE ONLY: Sticky Navbar Header */}
      <div className="sm:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-fluent-border shadow-xs no-print">
        <nav className="flex justify-around py-2 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                aria-label={tab.label}
                className={`p-2.5 rounded-fluent transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-fluent-blue text-white shadow-xs'
                    : 'text-fluent-textSecondary hover:text-fluent-blue hover:bg-fluent-subtle'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </nav>
      </div>

      {/* DESKTOP ONLY: Combined Top Header & Navbar (Sticky) */}
      <header className="hidden sm:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-fluent-border shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo & Brand Header */}
            <div className="flex items-center">
              <img src={logoSvg} alt="Kavio Edu Logo" className="h-7 w-auto object-contain" />
            </div>

            {/* Desktop Navigation Tabs - Icon Only with Tooltips */}
            <div className="flex items-center space-x-3">
              <nav className="flex items-center space-x-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.label}
                      aria-label={tab.label}
                      className={`p-2.5 rounded-fluent transition-all duration-150 flex items-center justify-center ${
                        isActive
                          ? 'bg-fluent-blue text-white shadow-xs'
                          : 'text-fluent-textSecondary hover:bg-fluent-subtle hover:text-fluent-blue'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  )
                })}
              </nav>

              {onLogout && (
                <div className="pl-2 border-l border-fluent-border">
                  <button
                    onClick={onLogout}
                    title="Keluar Sesi (Logout)"
                    aria-label="Keluar Sesi"
                    className="p-2 rounded-fluent text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center"
                  >
                    <RiLogoutBoxRLine className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  )
}
