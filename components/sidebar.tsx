"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Bird,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  FileText,
  Settings,
  User,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Animals", href: "/animals", icon: Bird },
  { name: "Production", href: "/production", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Expenses", href: "/expenses", icon: TrendingDown },
  { name: "Income", href: "/income", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Employees", href: "/employees", icon: UsersIcon },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex h-full flex-col bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bird className="h-8 w-8 text-primary flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-xl font-bold text-foreground">FarmPro</span>
          )}
        </div>
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary flex-shrink-0">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Farm Owner</p>
              <p className="text-xs text-muted-foreground">admin@farm.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
