import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
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
    const userFolder = `users/${user.id}`

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${userFolder}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (response.status === 404) {
      return NextResponse.json({ 
        used: 0, 
        total: 1024, // 1GB default limit
        percentage: 0 
      })
    }

    const files = await response.json()
    const totalSize = files.reduce((sum: number, file: any) => sum + (file.size || 0), 0)
    const usedMB = Math.round(totalSize / (1024 * 1024) * 100) / 100
    const totalMB = 1024 // 1GB limit
    const percentage = Math.round((usedMB / totalMB) * 100)

    return NextResponse.json({
      used: usedMB,
      total: totalMB,
      percentage: Math.min(percentage, 100)
    })
  } catch (error) {
    console.error("Failed to get storage usage:", error)
    return NextResponse.json({ error: "Failed to get storage usage" }, { status: 500 })
  }
}