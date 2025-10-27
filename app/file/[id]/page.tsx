"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Edit, Save, X, Github } from "lucide-react"
import { useRouter } from "next/navigation"

interface FileData {
  name: string
  content: string
  type: string
}

export default function FilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isAdminView, setIsAdminView] = useState(false)
  const [adminUserId, setAdminUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check URL params for admin context
    const urlParams = new URLSearchParams(window.location.search)
    const isAdmin = urlParams.get('admin') === 'true'
    const userId = urlParams.get('user')
    
    setIsAdminView(isAdmin)
    setAdminUserId(userId)
    
    params.then(({ id }) => {
      const decodedFileName = decodeURIComponent(id)
      setFileName(decodedFileName)
      loadFile(decodedFileName, isAdmin, userId)
    })
  }, [params])

  const loadFile = async (fileName: string, isAdmin?: boolean, userId?: string | null) => {
    try {
      let url = `/api/files/preview/dummy?file=${encodeURIComponent(fileName)}`
      if (isAdmin && userId) {
        url += `&admin=true&user=${userId}`
      }
      
      const response = await fetch(url)
      const content = await response.text()
      const fileType = getFileType(fileName)
      
      setFileData({ name: fileName, content, type: fileType })
      setEditedContent(content)
    } catch (error) {
      console.error("Failed to load file:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFileType = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || ""
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image"
    if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video"
    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio"
    if (["pdf"].includes(ext)) return "pdf"
    if (["txt", "md", "json", "csv", "js", "ts", "jsx", "tsx", "html", "css", "py", "java", "cpp", "c", "xml", "yaml", "yml"].includes(ext)) return "text"
    return "other"
  }

  const handleEdit = () => setIsEditing(true)

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value)
    setHasChanges(e.target.value !== fileData?.content)
  }

  const handleSave = async () => {
    if (!fileData) return
    setIsSaving(true)
    try {
      const response = await fetch("/api/files/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: fileData.name, content: editedContent })
      })
      
      if (response.ok) {
        setFileData({ ...fileData, content: editedContent })
        setHasChanges(false)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedContent(fileData?.content || "")
    setHasChanges(false)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!fileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">File not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => {
              if (isAdminView && adminUserId) {
                window.location.href = `/admin/user/${adminUserId}`
              } else {
                router.back()
              }
            }}>
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
              <h1 className="font-semibold">{fileName || "Loading..."}</h1>
              <p className="text-sm text-muted-foreground">
                {fileData?.type || ""} file
                {isAdminView && ` • User: ${adminUserId}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {fileData.type === "text" && !isAdminView && (
              <>
                {!isEditing ? (
                  <Button onClick={handleEdit} size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={!hasChanges || isSaving} 
                      size="sm"
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </>
                )}
              </>
            )}
            {isAdminView && (
              <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
                Read-only (Admin View)
              </span>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {fileData.type === "image" && (
          <div className="flex justify-center">
            <img 
              src={`/api/files/preview/dummy?file=${encodeURIComponent(fileData.name)}`} 
              alt={fileData.name} 
              className="max-w-full max-h-[80vh] object-contain rounded border"
            />
          </div>
        )}

        {fileData.type === "video" && (
          <div className="flex justify-center">
            <video controls className="max-w-full max-h-[80vh] rounded border">
              <source src={`/api/files/preview/dummy?file=${encodeURIComponent(fileData.name)}`} />
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {fileData.type === "audio" && (
          <div className="flex justify-center py-20">
            <audio controls className="w-full max-w-md">
              <source src={`/api/files/preview/dummy?file=${encodeURIComponent(fileData.name)}`} />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {fileData.type === "pdf" && (
          <iframe 
            src={`/api/files/preview/dummy?file=${encodeURIComponent(fileData.name)}`} 
            className="w-full h-[80vh] rounded border" 
            title={fileData.name} 
          />
        )}

        {fileData.type === "text" && (
          <div className="max-w-6xl mx-auto">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={handleContentChange}
                className="w-full h-[80vh] p-4 bg-muted rounded border text-sm font-mono resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <pre className="w-full h-[80vh] p-4 bg-muted rounded border text-sm font-mono overflow-auto whitespace-pre-wrap">
                {fileData.content}
              </pre>
            )}
          </div>
        )}

        {fileData.type === "other" && (
          <div className="flex items-center justify-center h-[60vh] text-center">
            <div>
              <p className="text-muted-foreground text-lg">📄 {fileData.name.split(".").pop()?.toUpperCase()} File</p>
              <p className="text-sm text-muted-foreground mt-2">Preview not available. Download to view this file.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}