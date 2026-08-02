import React from 'react'
import { LayoutDashboard, FileText, MessageSquare, BookOpen } from 'lucide-react'

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoice', label: 'Invoice', icon: FileText },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'roadmap', label: 'Roadmap', icon: BookOpen },
  ]

  return (
    <>
      {/* MOBILE ONLY: Top Header with Logo Only (Scrolls with Parent) */}
      <div className="sm:hidden bg-white border-b border-fluent-border py-3 px-4 flex items-center justify-center no-print">
        <img src="/logo.svg" alt="Kavio Edu Logo" className="h-8 w-auto object-contain" />
      </div>

      {/* MOBILE ONLY: Sticky Navbar Header (Stops at Top) */}
      <div className="sm:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-fluent-border shadow-xs no-print">
        <nav className="flex justify-around py-2 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center px-3 py-1 text-xs font-medium rounded-fluent transition-colors ${
                  isActive
                    ? 'text-fluent-blue font-bold border-b-2 border-fluent-blue pb-0.5'
                    : 'text-fluent-textSecondary hover:text-fluent-text'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[11px] tracking-tight">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* DESKTOP ONLY: Combined Top Header & Navbar (Sticky) */}
      <header className="hidden sm:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-fluent-border shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand Header */}
            <div className="flex items-center">
              <img src="/logo.svg" alt="Kavio Edu Logo" className="h-8 w-auto object-contain" />
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-fluent transition-all duration-150 ${
                      isActive
                        ? 'bg-fluent-blue text-white shadow-xs font-semibold'
                        : 'text-fluent-text hover:bg-fluent-subtle hover:text-fluent-blue'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>

          </div>
        </div>
      </header>
    </>
  )
}
