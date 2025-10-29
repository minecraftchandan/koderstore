import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const discordUser = cookieStore.get("discord_user")

  if (!discordUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Check if user is admin
  const user = JSON.parse(discordUser.value)
  const adminIds = process.env.ADMIN_DISCORD_IDS?.split(",") || []
  
  if (!adminIds.includes(user.id)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const githubToken = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_STORAGE_OWNER
  const repoName = process.env.GITHUB_STORAGE_REPO

  if (!githubToken || !owner || !repoName) {
    return NextResponse.json({ error: "GitHub storage not configured" }, { status: 500 })
  }

  try {
    const { id: userId } = await params
    const userFolder = `users/${userId}`

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${userFolder}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (response.status === 404) {
      return NextResponse.json([])
    }

    const files = await response.json()
    return NextResponse.json(files)
  } catch (error) {
    console.error("Failed to fetch user files:", error)
    return NextResponse.json({ error: "Failed to fetch user files" }, { status: 500 })
  }
}