import React from 'react'
import { LayoutDashboard, FileText, MessageSquare, BookOpen, Library } from 'lucide-react'
import { logoSvg } from '../assets'

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoice', label: 'Invoice', icon: FileText },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'roadmap', label: 'Roadmap', icon: BookOpen },
    { id: 'modules', label: 'Modules', icon: Library },
  ]

  return (
    <>
      {/* MOBILE ONLY: Top Header with Logo */}
      <div className="sm:hidden bg-white border-b border-fluent-border py-2.5 px-4 flex items-center justify-center no-print">
        <img src={logoSvg} alt="Kavio Edu Logo" className="h-7 w-auto object-contain" />
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

          </div>
        </div>
      </header>
    </>
  )
}
