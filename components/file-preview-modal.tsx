"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Download } from "lucide-react"

function TextPreview({ fileName, fileId }: { fileName: string; fileId: string }) {
  const [content, setContent] = useState("Loading...")
  const [editedContent, setEditedContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/files/preview/${fileId}?file=${encodeURIComponent(fileName)}`)
      .then(res => res.text())
      .then(text => {
        setContent(text)
        setEditedContent(text)
      })
      .catch(() => setContent("Failed to load content"))
  }, [fileName, fileId])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value)
    setHasChanges(e.target.value !== content)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/files/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, content: editedContent })
      })
      
      if (response.ok) {
        setContent(editedContent)
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
    setEditedContent(content)
    setHasChanges(false)
    setIsEditing(false)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">{fileName}</h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit} size="sm">Edit</Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isSaving} 
                size="sm"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={handleContentChange}
          className="flex-1 w-full p-4 bg-muted rounded text-sm font-mono resize-none border-0 focus:ring-2 focus:ring-primary"
          style={{ minHeight: "400px" }}
        />
      ) : (
        <pre className="flex-1 bg-muted p-4 rounded text-sm overflow-auto whitespace-pre-wrap font-mono">
          {content}
        </pre>
      )}
    </div>
  )
}

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: number
  modified: string
  url?: string
  content?: string
}

interface FilePreviewModalProps {
  file: FileItem
  onClose: () => void
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getFileExtension = (name: string) => {
    return name.split(".").pop()?.toLowerCase() || ""
  }

  const getFileType = (ext: string) => {
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image"
    if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video"
    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio"
    if (["pdf"].includes(ext)) return "pdf"
    if (["txt", "md", "json", "csv", "js", "ts", "jsx", "tsx", "html", "css", "py", "java", "cpp", "c", "xml", "yaml", "yml"].includes(ext)) return "text"
    if (["doc", "docx"].includes(ext)) return "document"
    if (["xls", "xlsx"].includes(ext)) return "spreadsheet"
    if (["ppt", "pptx"].includes(ext)) return "presentation"
    return "other"
  }

  const ext = getFileExtension(file.name)
  const fileType = getFileType(ext)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      // Implement download logic
      console.log("Downloading:", file.name)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full border-border/40 bg-card ${fileType === "text" ? "max-w-6xl h-[90vh]" : "max-w-2xl"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold truncate">{file.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {file.size && `${file.size} MB`} • {file.modified}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className={`p-6 bg-background/50 ${fileType === "text" ? "flex-1 overflow-hidden" : "min-h-96"}`}>
          {fileType === "image" && (
            <div className="flex items-center justify-center h-full">
              <img src={`/api/files/preview/${file.id}?file=${encodeURIComponent(file.name)}`} alt={file.name} className="max-w-full max-h-full object-contain rounded" />
            </div>
          )}
          
          {fileType === "video" && (
            <div className="flex items-center justify-center h-full">
              <video controls className="max-w-full max-h-full rounded">
                <source src={`/api/files/preview/${file.id}?file=${encodeURIComponent(file.name)}`} type={`video/${ext}`} />
                Your browser does not support video playback.
              </video>
            </div>
          )}
          
          {fileType === "audio" && (
            <div className="flex items-center justify-center h-full">
              <audio controls className="w-full max-w-md">
                <source src={`/api/files/preview/${file.id}?file=${encodeURIComponent(file.name)}`} type={`audio/${ext}`} />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
          
          {fileType === "pdf" && (
            <div className="w-full h-full">
              <iframe src={`/api/files/preview/${file.id}?file=${encodeURIComponent(file.name)}`} className="w-full h-96 rounded border" title={file.name} />
            </div>
          )}
          
          {fileType === "text" && (
            <TextPreview fileName={file.name} fileId={file.id} />
          )}
          
          {["document", "spreadsheet", "presentation"].includes(fileType) && (
            <div className="flex items-center justify-center h-full text-center space-y-4">
              <div>
                <p className="text-muted-foreground">📄 {ext.toUpperCase()} Document</p>
                <p className="text-sm text-muted-foreground mt-2">Office documents can be downloaded and opened with appropriate software</p>
              </div>
            </div>
          )}
          
          {fileType === "other" && (
            <div className="flex items-center justify-center h-full text-center space-y-4">
              <div>
                <p className="text-muted-foreground">📎 {ext.toUpperCase()} File</p>
                <p className="text-sm text-muted-foreground mt-2">Preview not available. Download to view this file.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/40">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload} disabled={isLoading} className="gap-2">
            <Download className="w-4 h-4" />
            {isLoading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
