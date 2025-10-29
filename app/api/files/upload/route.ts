import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
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
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const user = JSON.parse(discordUser.value)
    const userFolder = `users/${user.id}`
    const relativePath = formData.get("relativePath") as string || file.name
    const filePath = `${userFolder}/${relativePath}`

    // Check if repo exists, create if not
    const repoCheckResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: { Authorization: `Bearer ${githubToken}` },
    })

    if (repoCheckResponse.status === 404) {
      // Create repository
      await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: repoName,
          description: "GitDrive file storage",
          private: true,
          auto_init: true,
        }),
      })
    }

    const buffer = await file.arrayBuffer()
    const base64Content = Buffer.from(buffer).toString("base64")

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload ${file.name} for user ${user.username}`,
        content: base64Content,
      }),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
