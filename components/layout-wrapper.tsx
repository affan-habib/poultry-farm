"use client"

import type React from "react"
import { useState } from "react"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Don't show sidebar on login page
  const showSidebar = pathname !== "/login"

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar}
      />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
