"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Upload, CheckCircle } from "lucide-react"

interface UploadModalProps {
  onClose: () => void
  onUploadComplete: (file: any) => void
}

export function UploadModal({ onClose, onUploadComplete }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("repo", "gitdrive-storage")
        formData.append("owner", "user") // Will be replaced with actual user

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          console.error("Upload error:", errorData)
          throw new Error(errorData.error || "Upload failed")
        }

        const result = await response.json()
        setUploadedFiles([...uploadedFiles, file.name])
        onUploadComplete({
          id: result.content?.sha || Math.random().toString(),
          name: file.name,
          type: "file",
          size: file.size / (1024 * 1024),
          modified: "Just now",
          sha: result.content?.sha,
        })
        
        setUploadProgress(100)
      } catch (error) {
        console.error("Upload failed:", error)
        alert(`Upload failed: ${error.message}`)
      }
    }

    setIsUploading(false)
    setUploadProgress(0)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-lg font-bold">Upload Files</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isUploading}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging ? "border-primary bg-primary/5" : "border-border/40 bg-background/50"
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Drag files here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">Supported: All file types</p>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
            variant="outline"
          >
            {isUploading ? "Uploading..." : "Select Files"}
          </Button>

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">{uploadProgress}% uploaded</p>
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploaded Files:</p>
              {uploadedFiles.map((fileName) => (
                <div key={fileName} className="flex items-center gap-2 p-2 rounded bg-background/50">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm truncate">{fileName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/40">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            {uploadedFiles.length > 0 ? "Done" : "Cancel"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
