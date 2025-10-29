"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Upload, LogOut, Search, Github, HardDrive, Shield } from "lucide-react"
import { FileExplorer } from "@/components/file-explorer"

function AdminButton({ user }: { user: any }) {
  const adminIds = process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS?.split(",") || []
  const isAdmin = user && adminIds.includes(user.id)

  if (!isAdmin) return null

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => window.location.href = "/admin"}
      className="gap-2"
    >
      <Shield className="w-4 h-4" />
      Admin POV
    </Button>
  )
}

function StorageUsage() {
  const [storage, setStorage] = useState({ used: 0, total: 1024, percentage: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/storage/usage")
      .then(res => res.json())
      .then(data => {
        setStorage(data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-card/50 border border-border/40 rounded-md">
        <HardDrive className="w-4 h-4 text-muted-foreground" />
        <div className="w-20 h-2 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-card/50 border border-border/40 rounded-md">
      <HardDrive className="w-4 h-4 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              storage.percentage > 90 ? "bg-red-500" : 
              storage.percentage > 70 ? "bg-yellow-500" : "bg-primary"
            }`}
            style={{ width: `${storage.percentage}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {storage.used}/{storage.total} MB
        </span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPath, setCurrentPath] = useState("/")
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    // Get user from cookie
    const getUserData = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        } else {
          window.location.href = "/"
        }
      } catch (error) {
        console.error("Failed to get user:", error)
        window.location.href = "/"
      } finally {
        setIsLoading(false)
      }
    }

    getUserData()
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = "/dashboard"}
            className="flex items-center gap-3 hover:bg-transparent p-0"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Github className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">
              <span className="text-primary">K</span>
              <span className="text-white">oderstore</span>
            </span>
          </Button>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4 md:mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-10 w-full bg-input border-border/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden md:block">
              <StorageUsage />
            </div>
            <div className="hidden sm:block">
              <AdminButton user={user} />
            </div>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <img 
                    src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '/placeholder-user.jpg'}
                    alt={user?.username || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="sm:hidden border-b border-border/40 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-10 w-full bg-input border-border/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Storage & Admin */}
      <div className="md:hidden border-b border-border/40 p-4 flex gap-2">
        <StorageUsage />
        <AdminButton user={user} />
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-6">
        <FileExplorer 
          searchQuery={searchQuery} 
          currentPath={currentPath} 
          onPathChange={setCurrentPath}
          showUploadModal={showUploadModal}
          setShowUploadModal={setShowUploadModal}
        />
      </div>
    </div>
  )
}
