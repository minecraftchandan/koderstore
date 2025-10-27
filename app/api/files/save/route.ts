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
    const { fileName, content } = await request.json()
    const user = JSON.parse(discordUser.value)
    const userFolder = `users/${user.id}`
    const filePath = `${userFolder}/${fileName}`

    // Get current file to get SHA for update
    const currentFileResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!currentFileResponse.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const currentFile = await currentFileResponse.json()
    const base64Content = Buffer.from(content).toString("base64")

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update ${fileName}`,
        content: base64Content,
        sha: currentFile.sha,
      }),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Save error:", error)
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}