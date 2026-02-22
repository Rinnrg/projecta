"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useAutoTranslate } from "@/lib/auto-translate-context"
import { Bell, Menu, Moon, Sun, Search, LogOut, User, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchDropdown } from "@/components/layout/search-dropdown"
import { SearchDialog } from "@/components/layout/search-dialog"
import { ActivityDropdown } from "@/components/layout/activity-dropdown"
import { SweetAlert } from "@/components/ui/sweet-alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

interface HeaderProps {
  onMenuClick: () => void
  isMobile: boolean
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useAutoTranslate()
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false)
  const [showSearchDialog, setShowSearchDialog] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    logout()
    setShowLogoutConfirm(false)
    setShowLogoutSuccess(true)
    
    setTimeout(() => {
      setShowLogoutSuccess(false)
      router.push("/login")
    }, 1500)
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border/50 bg-background/95 px-3 sm:px-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-2xl">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="h-9 w-9 shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop Search - Dropdown */}
        {!isMobile && (
          <div className="flex-1 max-w-md">
            <SearchDropdown />
          </div>
        )}

        {/* Mobile Search - Button to open dialog */}
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearchDialog(true)}
            className="flex-1 justify-start gap-2 text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">{t("Cari")}...</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {/* BAGIAN DROPDOWN ROLE TELAH DIHAPUS DARI SINI */}

        {/* Language Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-primary transition-colors duration-150"
            >
              <Languages className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-150 hover:scale-110" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 animate-scale-in">
            <DropdownMenuItem
              onClick={() => setLocale("id")}
              className={`text-sm cursor-pointer ${locale === "id" ? "bg-primary/10 text-primary" : ""}`}
            >
              <span className="mr-2">🇮🇩</span>
              Indonesia
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLocale("en")}
              className={`text-sm cursor-pointer ${locale === "en" ? "bg-primary/10 text-primary" : ""}`}
            >
              <span className="mr-2">🇬🇧</span>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-primary transition-colors duration-150"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        </Button>

        <ActivityDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="ml-2 h-8 sm:h-9 gap-2 sm:gap-2.5 px-2 hover:ring-2 hover:ring-primary/20 transition-all duration-150"
            >
              <Avatar className="h-6 w-6 sm:h-7 sm:w-7 ring-2 ring-transparent transition-all duration-150 group-hover:ring-primary/30">
                <AvatarImage src={user?.foto || "/placeholder.svg"} alt={user?.nama} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user ? getInitials(user.nama) : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs sm:text-sm font-medium sm:block">{user?.nama.split(" ")[0]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-52 animate-scale-in">
            <div className="flex items-center gap-2 sm:gap-2.5 px-2 py-2">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={user?.foto || "/placeholder.svg"} alt={user?.nama} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                  {user ? getInitials(user.nama) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{user?.nama}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">{user?.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-xs sm:text-sm cursor-pointer">
              <Link href="/profile">
                <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t("Profil")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs sm:text-sm text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t("Keluar")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Search Dialog */}
      <SearchDialog open={showSearchDialog} onOpenChange={setShowSearchDialog} />

      {/* Logout Confirmation Dialog */}
      <SweetAlert
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        type="question"
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin keluar?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        showCancelButton={true}
        onConfirm={handleConfirmLogout}
      />

      {/* Logout Success Dialog */}
      <SweetAlert
        open={showLogoutSuccess}
        onOpenChange={setShowLogoutSuccess}
        type="success"
        title="Berhasil!"
        description="Anda telah logout."
        confirmText="OK"
      />
    </header>
  )
}