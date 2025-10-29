"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Search, File, Folder, MoreVertical, Eye, Download, Trash2, Github } from "lucide-react"
import { useRouter } from "next/navigation"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: number
  modified: string
  sha?: string
}

export default function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [files, setFiles] = useState<FileItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setUserId(id)
      loadUserFiles(id)
    })
  }, [params])

  const loadUserFiles = async (userIdParam: string) => {
    try {
      const response = await fetch(`/api/admin/user/${userIdParam}/files`)
      if (response.ok) {
        const githubFiles = await response.json()
        const formattedFiles = githubFiles.map((file: any) => ({
          id: file.sha,
          name: file.name,
          type: file.type === "dir" ? "folder" : "file",
          size: file.size ? file.size / (1024 * 1024) : undefined,
          modified: "Recently",
          sha: file.sha,
        }))
        setFiles(formattedFiles)
      }
    } catch (error) {
      console.error("Failed to load user files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFiles = files.filter((file) => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatSize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
    return `${mb.toFixed(1)} MB`
  }

  const handlePreview = (file: FileItem) => {
    window.location.href = `/file/${encodeURIComponent(file.name)}?admin=true&user=${userId}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = "/dashboard"}
              className="flex items-center gap-2 hover:bg-transparent p-0"
            >
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Github className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">
                <span className="text-primary">K</span>
                <span className="text-white">oderstore</span>
              </span>
            </Button>
            <div>
              <h1 className="font-semibold">User Files</h1>
              <p className="text-sm text-muted-foreground">User ID: {userId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-10 w-64 bg-input border-border/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery ? "No files match your search" : "No files found for this user"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border/40">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-3">Modified</div>
              <div className="col-span-1"></div>
            </div>

            {/* Files */}
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-colors items-center group"
              >
                <div className="col-span-6 flex items-center gap-3">
                  {file.type === "folder" ? (
                    <Folder className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="font-medium truncate">{file.name}</span>
                </div>

                <div className="col-span-2 text-sm text-muted-foreground">
                  {file.type === "file" && file.size ? formatSize(file.size) : "-"}
                </div>

                <div className="col-span-3 text-sm text-muted-foreground">{file.modified}</div>

                <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {file.type === "file" && (
                        <DropdownMenuItem onClick={() => handlePreview(file)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}