/**
 * @fileoverview Main navigation header component with user authentication and menu
 * @author Offer Hub Team
 */

"use client"

import Link from "next/link"
import "@/styles/colors.css"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export default function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const router = useRouter()


  const handleProfileClick = () => {
    // Always navigate to verification page with profile tab
    router.push("/user-management/verification?tab=profile")
  }

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logout clicked")
  }

  return (
    <header className="bg-[var(--color-background)] border-b border-[var(--color-border)] sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo and menu button */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button onClick={onMenuClick} className="md:hidden p-2 rounded-md text-[var(--color-text-secondary)]">
              <Menu size={24} />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl text-[var(--color-text-primary)]">
            <img src="/logo.svg" alt="Offer Hub Logo" className="w-10 h-10" />
            <span>Offer Hub</span>
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center ml-auto gap-4">
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-[var(--color-background-hover)] p-1 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/verificationImage.svg" alt="User" />
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-[var(--color-destructive)] cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
