import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const discordUser = cookieStore.get("discord_user")

  if (!discordUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const githubToken = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_STORAGE_OWNER
  const repoName = process.env.GITHUB_STORAGE_REPO

  if (!githubToken || !owner || !repoName) {
    return NextResponse.json({ error: "GitHub storage not configured" }, { status: 500 })
  }

  try {
    const user = JSON.parse(discordUser.value)
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("file")
    const isAdmin = searchParams.get("admin") === "true"
    const adminUserId = searchParams.get("user")
    
    if (!fileName) {
      return NextResponse.json({ error: "File name required" }, { status: 400 })
    }

    // Determine which user folder to access
    let targetUserId = user.id
    if (isAdmin && adminUserId) {
      // Check if current user is admin
      const adminIds = process.env.ADMIN_DISCORD_IDS?.split(",") || []
      if (adminIds.includes(user.id)) {
        targetUserId = adminUserId
      }
    }

    const userFolder = `users/${targetUserId}`
    const filePath = `${userFolder}/${fileName}`

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileData = await response.json()
    const content = Buffer.from(fileData.content, "base64")
    
    // Determine content type based on file extension
    const ext = fileName.split(".").pop()?.toLowerCase()
    const contentType = getContentType(ext || "")

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Preview error:", error)
    return NextResponse.json({ error: "Failed to load preview" }, { status: 500 })
  }
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    // Videos
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    // Documents
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
    json: "application/json",
    js: "text/javascript",
    ts: "text/typescript",
    html: "text/html",
    css: "text/css",
    xml: "text/xml",
  }
  return types[ext] || "application/octet-stream"
}