import React from 'react'
import { LayoutDashboard, FileText, MessageSquare, BookOpen, GraduationCap } from 'lucide-react'

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoice', label: 'Invoice', icon: FileText },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'roadmap', label: 'Roadmap', icon: BookOpen },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-fluent-border shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand Header */}
          <div className="flex items-center">
            <img src="/logo.svg" alt="Kavio Edu Logo" className="h-8 w-auto object-contain" />
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-fluent transition-all duration-150 ${isActive
                      ? 'bg-fluent-blue text-white shadow-sm'
                      : 'text-fluent-text hover:bg-fluent-subtle hover:text-fluent-blue'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="sm:hidden flex border-t border-fluent-border bg-white justify-around py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center px-2 py-1 text-xs font-medium rounded-fluent ${isActive ? 'text-fluent-blue font-semibold' : 'text-fluent-textSecondary'
                }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{tab.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}
