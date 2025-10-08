"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className="flex flex-1 flex-col">
        <Topbar onMenuToggle={handleSidebarToggle} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}