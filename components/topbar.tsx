"use client"

import { useState } from "react"
import { useOutsideClick } from "@/hooks/use-outside-click"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu, User, LogOut } from "lucide-react"
// @ts-ignore
import { useAuth } from "@/hooks/use-auth" // Assuming a useAuth hook exists for user info and logout
import { useRouter } from "next/navigation"

interface TopbarProps {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, signOut } = useAuth() // Assuming useAuth provides user object and signOut function
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const ref = useOutsideClick(() => setIsDropdownOpen(false))

  const handleLogout = async () => {
    await signOut()
    router.push("/login") // Redirect to login page after logout
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4">
      <Button variant="ghost" size="icon" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-8 w-8 rounded-full"
            onClick={toggleDropdown}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </Button>
          
          {isDropdownOpen && (
            <div ref={ref} className="absolute right-0 top-10 z-50 min-w-[12rem] rounded-md border border-border bg-popover p-1 shadow-md">
              <div className="px-2 py-1.5 text-sm font-medium text-popover-foreground">
                My Account
              </div>
              <div className="mx-1 my-1 h-px bg-border"></div>
              <button
                className="flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                onClick={() => {
                  router.push("/profile")
                  setIsDropdownOpen(false)
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </button>
              <button
                className="flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                onClick={() => {
                  handleLogout()
                  setIsDropdownOpen(false)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}