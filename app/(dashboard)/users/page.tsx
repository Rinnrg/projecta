"use client"

import { useState } from "react"
import { useUsers } from "@/hooks/use-api"
import type { UserRole } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAutoTranslate } from "@/lib/auto-translate-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  UserCog,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { id as idLocale, enUS } from "date-fns/locale"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { AnimateIn } from "@/components/ui/animate-in"
import { cn } from "@/lib/utils"

export default function UsersPage() {
  const { t, locale: currentLocale, setLocale } = useAutoTranslate()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const { confirm, success, AlertComponent } = useSweetAlert()
  const { users, loading, error, refetch } = useUsers()

  const dateLocale = currentLocale === 'id' ? idLocale : enUS

  const roleConfig: Record<UserRole, { label: string; color: string; icon: typeof Users }> = {
    ADMIN: { label: t("Admin"), color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: UserCog },
    GURU: {
      label: t("Guru"),
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      icon: Users,
    },
    SISWA: {
      label: t("Siswa"),
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: GraduationCap,
    },
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === "ADMIN").length,
    guru: users.filter((u) => u.role === "GURU").length,
    siswa: users.filter((u) => u.role === "SISWA").length,
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = await confirm(t("Hapus Pengguna"), {
      description: t("Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."),
      confirmText: t("Hapus"),
      cancelText: t("Batal"),
      type: "warning",
      onConfirm: async () => {
        // TODO: Implement delete API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        refetch()
      },
    })

    if (confirmed) {
      success(t("Berhasil"), `"${userName}" ${t("berhasil dihapus")}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AlertComponent />

      <AnimateIn stagger={0}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("Manajemen Pengguna")}</h1>
            <p className="text-sm text-muted-foreground">{t("Kelola data pengguna sistem Projecta")}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent sm:flex-none">
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t("Impor Pengguna")}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t("Impor Data Pengguna")}</DialogTitle>
                  <DialogDescription>{t("Upload file CSV atau Excel untuk menambahkan banyak pengguna sekaligus")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 sm:p-8">
                    <Upload className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
                    <p className="mt-2 text-center text-sm text-muted-foreground">{t("Seret dan lepas file di sini")}</p>
                    <p className="text-xs text-muted-foreground">{t("atau")}</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      {t("Pilih File")}
                    </Button>
                  </div>
                  <Button variant="link" className="w-full" asChild>
                    <a href="#">{t("Unduh Template")}</a>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent sm:flex-none">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("Ekspor Pengguna")}</span>
            </Button>
            <Button size="sm" asChild className="flex-1 sm:flex-none">
              <Link href="/users/add">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("Tambah Pengguna")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </AnimateIn>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <AnimateIn stagger={1}>
          <Card>
            <CardContent className="flex items-center gap-2 p-3 sm:gap-4 sm:p-6">
              <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
                <Users className="h-4 w-4 text-primary sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-lg font-bold sm:text-2xl">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground sm:text-sm">{t("Total Pengguna")}</p>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>
        <AnimateIn stagger={2}>
          <Card>
            <CardContent className="flex items-center gap-2 p-3 sm:gap-4 sm:p-6">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2 sm:p-3">
                <UserCog className="h-4 w-4 text-red-600 dark:text-red-400 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-lg font-bold sm:text-2xl">{stats.admin}</p>
                <p className="text-[10px] text-muted-foreground sm:text-sm">{t("Admin")}</p>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>
        <AnimateIn stagger={3}>
          <Card>
            <CardContent className="flex items-center gap-2 p-3 sm:gap-4 sm:p-6">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-lg font-bold sm:text-2xl">{stats.guru}</p>
                <p className="text-[10px] text-muted-foreground sm:text-sm">{t("Guru")}</p>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>
        <AnimateIn stagger={4}>
          <Card>
            <CardContent className="flex items-center gap-2 p-3 sm:gap-4 sm:p-6">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2 sm:p-3">
                <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-lg font-bold sm:text-2xl">{stats.siswa}</p>
                <p className="text-[10px] text-muted-foreground sm:text-sm">{t("courses.students")}</p>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>
      </div>

      <AnimateIn stagger={5}>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("Cari pengguna...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 sm:h-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="h-9 w-full sm:h-10 sm:w-[150px]">
              <SelectValue placeholder={t("Filter berdasarkan role")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("Semua Role")}</SelectItem>
              <SelectItem value="ADMIN">{t("Admin")}</SelectItem>
              <SelectItem value="GURU">{t("Guru")}</SelectItem>
              <SelectItem value="SISWA">{t("Siswa")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AnimateIn>

      <AnimateIn stagger={6}>
        <Card>
          <CardHeader className="pb-2 sm:pb-6">
            <CardTitle className="text-sm sm:text-lg">
              {t("Pengguna")} ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile Card List */}
            <div className="divide-y sm:hidden">
              {filteredUsers.map((user) => {
                const config = roleConfig[user.role as UserRole]
                return (
                  <div key={user.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={user.foto || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {user.nama
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.nama}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <Badge variant="secondary" className={cn("mt-1 text-[10px]", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/users/edit/${user.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("Edit")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteUser(user.id, user.nama)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("Hapus")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto sm:block sm:p-6 sm:pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">{t("Pengguna")}</TableHead>
                    <TableHead>{t("Username")}</TableHead>
                    <TableHead>{t("Role")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("Tanggal Bergabung")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const config = roleConfig[user.role as UserRole]

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.foto || "/placeholder.svg"} />
                              <AvatarFallback className="text-sm">
                                {user.nama
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{user.nama}</p>
                              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.username || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("text-xs", config.color)}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {format(user.createdAt, "MMM d, yyyy", { locale: dateLocale })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/users/edit/${user.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  {t("Edit")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user.id, user.nama)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("Hapus")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </AnimateIn>
    </div>
  )
}
