import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Separator } from '@/components/ui/separator'
import { SimpleTooltip } from '@/components/ui/tooltip'
import { logoSvg } from '../../assets'

export const Navbar = ({ activeTab = 'dashboard', setActiveTab, onTabChange, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const auth = useAuth?.() || {}
  const handleLogout = onLogout || auth.logout

  const handleTabSelect = (tabId) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tabId)
    }
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabId)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'invoice', label: 'Invoice' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'reports', label: 'Rapor' },
    { id: 'certificates', label: 'Sertifikat' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'modules', label: 'Modules' },
  ]

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] no-print ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs py-2 lg:py-2.5'
          : 'bg-white/90 lg:bg-transparent backdrop-blur-xs lg:backdrop-blur-none border-b border-neutral-200/70 lg:border-transparent py-2.5 lg:py-3.5'
      }`}
    >
      <div className="w-full max-w-[98%] xl:max-w-[96%] mx-auto px-2.5 sm:px-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">
        
        {/* BARIS ATAS (MOBILE) / SISI KIRI (DESKTOP): LOGO & TOMBOL KELUAR MOBILE */}
        <div className="flex items-center justify-between w-full lg:w-auto shrink-0">
          <SimpleTooltip content="Kavio Edu Dashboard" side="bottom">
            <div 
              onClick={() => handleTabSelect('dashboard')}
              className="flex items-center cursor-pointer select-none group reanimated-widget"
            >
              <img
                src={logoSvg}
                alt="Kavio Edu"
                className="h-6 sm:h-7 lg:h-8 w-auto max-h-8 object-contain hover-item-icon dark:invert"
              />
            </div>
          </SimpleTooltip>

          {/* Tombol Logout khusus Mobile (< lg) di pojok kanan atas */}
          {handleLogout && (
            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden px-3 py-1 text-xs font-semibold rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 reanimated-widget select-none whitespace-nowrap cursor-pointer"
            >
              Keluar
            </button>
          )}
        </div>

        {/* BARIS BAWAH (MOBILE) / SISI KANAN (DESKTOP): TOMBOL NAVIGASI */}
        <div className="flex items-center w-full lg:w-auto min-w-0 border-t border-neutral-100 pt-1.5 lg:border-t-0 lg:pt-0">
          {/* Mobile: flex + shrink-0 (anti-tumpuk, smooth scroll). Desktop (lg+): inline-grid auto-cols-fr (lebar seragam) */}
          <nav className="flex lg:inline-grid lg:grid-flow-col lg:auto-cols-fr gap-1 items-center overflow-x-auto no-scrollbar w-full lg:w-auto py-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === 'invoice' && activeTab === 'invoices')
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    handleTabSelect(item.id)
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
                  }}
                  className={`relative shrink-0 lg:shrink lg:w-full text-center px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-full reanimated-widget select-none whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'bg-transparent text-black hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      transition={{
                        type: 'spring',
                        damping: 28,
                        stiffness: 380,
                        mass: 0.7,
                      }}
                      className="absolute inset-0 bg-black rounded-full shadow-xs -z-10"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Pemisah Vertikal (Desktop) */}
          <Separator className="hidden lg:block h-5 mx-2.5 bg-neutral-200 shrink-0" orientation="vertical"/>

          {/* Tombol Logout Teks Merah (Desktop) */}
          {handleLogout && (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden lg:inline-flex px-3.5 py-1.5 text-xs font-semibold rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 reanimated-widget select-none whitespace-nowrap cursor-pointer shrink-0"
            >
              Keluar
            </button>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar
