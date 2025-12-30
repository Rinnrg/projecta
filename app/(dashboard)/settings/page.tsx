"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Camera, User, Bell, Shield, Palette, Globe, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { AnimateIn } from "@/components/ui/animate-in"
import { AvatarCropDialog } from "@/components/ui/avatar-crop-dialog"
import { uploadProfilePhoto } from "./actions"
import { useRouter } from "next/navigation"
import { useAutoTranslate } from "@/lib/auto-translate-context"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const { t } = useAutoTranslate()
  const { locale, setLocale } = useAutoTranslate()
  const [activeTab, setActiveTab] = useState("profile")
  const [tabKey, setTabKey] = useState(0) // For re-render animation
  const [nama, setNama] = useState(user?.nama || "")
  const [email, setEmail] = useState(user?.email || "")
  const [bio, setBio] = useState("")
  const [saved, setSaved] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { confirm, success, error: showError, AlertComponent } = useSweetAlert()

  const handleSave = () => {
    setSaved(true)
    success(t("Berhasil"), t("Profil berhasil disimpan"))
    setTimeout(() => setSaved(false), 2000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError("File Terlalu Besar", "Ukuran file maksimal 2MB")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
        setCropDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = async (blob: Blob) => {
    if (!user?.id) return
    
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('photo', blob, 'profile.jpg')
      
      const result = await uploadProfilePhoto(user.id, formData)
      
      if (result.success) {
        success(t("Berhasil"), "Foto profil berhasil diperbarui")
        // Refresh user data to get updated photo URL
        await refreshUser()
        // Force re-render of all components
        router.refresh()
      } else {
        showError("Gagal Upload", result.error || "Terjadi kesalahan saat mengupload foto")
      }
    } catch (error) {
      console.error('Error in handleCropComplete:', error)
      showError("Error", "Terjadi kesalahan saat mengupload foto")
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpdatePassword = async () => {
    const confirmed = await confirm(t("Perbarui Kata Sandi"), {
      description: t("Anda yakin ingin memperbarui kata sandi?"),
      confirmText: t("Perbarui"),
      cancelText: t("Batal"),
      type: "question",
    })

    if (confirmed) {
      success(t("Berhasil"), t("Kata sandi berhasil diperbarui"))
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = await confirm(t("Hapus Akun"), {
      description: t("Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen."),
      confirmText: t("Ya, Hapus"),
      cancelText: t("Batal"),
      type: "error",
    })

    if (confirmed) {
      // Handle account deletion
    }
  }

  const notificationItems = [
    {
      title: t("Pengingat Tugas"),
      description: t("Terima notifikasi untuk tugas yang akan datang"),
      defaultChecked: true,
    },
    {
      title: t("Notifikasi Penilaian"),
      description: t("Dapatkan pemberitahuan saat nilai Anda tersedia"),
      defaultChecked: true,
    },
    {
      title: t("Update Proyek"),
      description: t("Notifikasi tentang perubahan proyek dan feedback"),
      defaultChecked: true,
    },
    {
      title: t("Pengumuman Kursus"),
      description: t("Terima pengumuman penting dari instruktur"),
      defaultChecked: false,
    },
    {
      title: t("Notifikasi Email"),
      description: t("Terima notifikasi melalui email"),
      defaultChecked: true,
    },
  ]

  const themeItems = [
    { value: "light", label: t("Terang"), icon: "☀️" },
    { value: "dark", label: t("Gelap"), icon: "🌙" },
    { value: "system", label: t("Sistem"), icon: "💻" },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
      <AlertComponent />

      <AnimateIn stagger={0}>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("Pengaturan")}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{t("Kelola preferensi akun dan pengaturan Anda")}</p>
        </div>
      </AnimateIn>

      <AnimateIn stagger={1}>
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value)
          setTabKey(prev => prev + 1) // Trigger re-render for animation
        }} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="inline-flex w-max sm:w-auto">
              <TabsTrigger value="profile" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{t("navigation.profileMenu")}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{t("Notifikasi")}</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{t("Tampilan")}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{t("Keamanan")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" key={`profile-${tabKey}`} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <AnimateIn stagger={2}>
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">{t("Informasi Profil")}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("Perbarui informasi profil Anda")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        <AvatarImage src={user?.foto || "/placeholder.svg"} />
                        <AvatarFallback className="text-xl sm:text-2xl">
                          {user?.nama
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        aria-label="Upload profile photo"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full sm:h-8 sm:w-8"
                        onClick={handleAvatarClick}
                        disabled={uploading}
                      >
                        <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold">{user?.nama}</h3>
                      <p className="text-xs text-muted-foreground sm:text-sm">{user?.email}</p>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-xs sm:text-sm"
                        onClick={handleAvatarClick}
                        disabled={uploading}
                      >
                        {uploading ? "Mengupload..." : t("Ubah Avatar")}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="nama" className="text-xs sm:text-sm">
                        {t("Nama Lengkap")}
                      </Label>
                      <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className="h-9 sm:h-10" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">
                        {t("Email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="username" className="text-xs sm:text-sm">
                        {t("Username")}
                      </Label>
                      <Input id="username" defaultValue={user?.username || ""} className="h-9 sm:h-10" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="role" className="text-xs sm:text-sm">
                        {t("Peran")}
                      </Label>
                      <Input
                        id="role"
                        value={
                          user?.role === "SISWA" ? t("Siswa") : user?.role === "GURU" ? t("Guru") : t("Admin")
                        }
                        disabled
                        className="h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="bio" className="text-xs sm:text-sm">
                      {t("Bio")}
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder={t("Ceritakan tentang diri Anda...")}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave} size="sm" className="w-full sm:w-auto">
                      {saved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {t("Tersimpan")}
                        </>
                      ) : (
                        t("Simpan Perubahan")
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimateIn>
          </TabsContent>

          <TabsContent value="notifications" key={`notifications-${tabKey}`} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <AnimateIn stagger={2}>
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">{t("Preferensi Notifikasi")}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("Kelola notifikasi dan pemberitahuan Anda")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {notificationItems.map((item, index) => (
                    <div key={index} className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm">{item.title}</Label>
                        <p className="text-xs text-muted-foreground sm:text-sm">{item.description}</p>
                      </div>
                      <Switch defaultChecked={item.defaultChecked} className="shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimateIn>
          </TabsContent>

          <TabsContent value="appearance" key={`appearance-${tabKey}`} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <AnimateIn stagger={2}>
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">{t("Tampilan")}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("Sesuaikan tampilan aplikasi sesuai preferensi Anda")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-sm">{t("Tema")}</Label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {themeItems.map((item) => (
                        <Button
                          key={item.value}
                          variant={theme === item.value ? "default" : "outline"}
                          className={`h-auto flex-col gap-1.5 py-3 sm:gap-2 sm:py-4 ${theme !== item.value ? "bg-transparent" : ""}`}
                          onClick={() => setTheme(item.value)}
                        >
                          <span className="text-xl sm:text-2xl">{item.icon}</span>
                          <span className="text-xs sm:text-sm">{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <Label className="text-sm">{t("Bahasa")}</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                      <Button
                        variant={locale === 'id' ? "default" : "outline"}
                        size="sm"
                        className={`sm:size-auto ${locale !== "id" ? "bg-transparent" : ""}`}
                        onClick={() => setLocale("id")}
                      >
                        🇮🇩 Indonesia
                      </Button>
                      <Button
                        variant={locale === 'en' ? "default" : "outline"}
                        size="sm"
                        className={`sm:size-auto ${locale !== "en" ? "bg-transparent" : ""}`}
                        onClick={() => setLocale("en")}
                      >
                        🇬🇧 English
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimateIn>
          </TabsContent>

          <TabsContent value="security" key={`security-${tabKey}`} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <AnimateIn stagger={2}>
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">{t("Pengaturan Keamanan")}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t("Kelola kata sandi dan keamanan akun Anda")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="current-password" className="text-xs sm:text-sm">
                        {t("Kata Sandi Saat Ini")}
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder={t("Masukkan kata sandi saat ini")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-password" className="text-xs sm:text-sm">
                        {t("Kata Sandi Baru")}
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder={t("Masukkan kata sandi baru")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="confirm-password" className="text-xs sm:text-sm">
                        {t("Konfirmasi Kata Sandi")}
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder={t("Konfirmasi kata sandi baru")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" className="w-full sm:w-auto" onClick={handleUpdatePassword}>
                      {t("Perbarui Kata Sandi")}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm font-semibold text-destructive sm:text-base">{t("Zona Bahaya")}</h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">{t("Tindakan permanen yang tidak dapat dibatalkan")}</p>
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={handleDeleteAccount}>
                      {t("Hapus Akun")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimateIn>
          </TabsContent>
        </Tabs>
      </AnimateIn>

      {/* Avatar Crop Dialog */}
      <AvatarCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
