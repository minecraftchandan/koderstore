"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { File, Folder, MoreVertical, Trash2, Download, Eye, Upload } from "lucide-react"
import { FilePreviewModal } from "./file-preview-modal"
import { UploadModal } from "./upload-modal"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: number
  modified: string
  icon?: string
  sha?: string
}

interface FileExplorerProps {
  searchQuery: string
  currentPath: string
  onPathChange: (path: string) => void
  showUploadModal?: boolean
  setShowUploadModal?: (show: boolean) => void
}

export function FileExplorer({ searchQuery, currentPath, onPathChange, showUploadModal, setShowUploadModal }: FileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [internalShowUploadModal, setInternalShowUploadModal] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const isUploadModalOpen = showUploadModal !== undefined ? showUploadModal : internalShowUploadModal
  const setUploadModalOpen = setShowUploadModal || setInternalShowUploadModal
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Load files from GitHub on component mount
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/files/list")
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
      console.error("Failed to load files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatSize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
    return `${mb.toFixed(1)} MB`
  }

  const handleDelete = async (file: FileItem) => {
    setIsDeleting(file.id)
    try {
      // Call GitHub API to delete file
      // await deleteFromGitHub(owner, repo, file.name, file.sha)
      setFiles(files.filter((f) => f.id !== file.id))
    } catch (error) {
      console.error("Failed to delete file:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleDownload = (file: FileItem) => {
    // Implement download logic
    console.log("Downloading:", file.name)
  }

  const handleUploadComplete = (newFile: FileItem) => {
    setFiles([...files, newFile])
    setShowUploadModal(false)
    // Reload files to get updated list from GitHub
    loadFiles()
  }

  return (
    <div className="space-y-4">


      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 text-center border-border/40 bg-card/50">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading files...</p>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && filteredFiles.length === 0 && (
        <Card className="p-12 text-center border-border/40 bg-card/50">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {searchQuery ? "No files match your search" : "No files yet. Upload your first file to get started."}
          </p>
        </Card>
      )}

      {/* File Grid */}
      {!isLoading && filteredFiles.length > 0 && (
        <div>
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border/40 mb-4">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-3">Modified</div>
            <div className="col-span-1"></div>
          </div>

          {/* Desktop Files */}
          <div className="hidden md:block space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-colors items-center group"
              >
                <div 
                  className="col-span-6 flex items-center gap-3 cursor-pointer hover:text-primary"
                  onClick={() => file.type === "file" && (window.location.href = `/file/${encodeURIComponent(file.name)}`)}
                >
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
                        <>
                          <DropdownMenuItem onClick={() => window.location.href = `/file/${encodeURIComponent(file.name)}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(file)}
                        disabled={isDeleting === file.id}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting === file.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Files */}
          <div className="md:hidden space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-colors"
                onClick={() => file.type === "file" && (window.location.href = `/file/${encodeURIComponent(file.name)}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {file.type === "folder" ? (
                      <Folder className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {file.type === "file" && file.size && (
                          <span>{formatSize(file.size)}</span>
                        )}
                        <span>{file.modified}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {file.type === "file" && (
                        <>
                          <DropdownMenuItem onClick={() => window.location.href = `/file/${encodeURIComponent(file.name)}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(file)}
                        disabled={isDeleting === file.id}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting === file.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {isUploadModalOpen && (
        <UploadModal onClose={() => setUploadModalOpen(false)} onUploadComplete={handleUploadComplete} />
      )}
    </div>
  )
}
