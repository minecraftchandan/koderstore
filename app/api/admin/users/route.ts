import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
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
    // Get users folder
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/users`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (response.status === 404) {
      return NextResponse.json([])
    }

    const userFolders = await response.json()
    const userStats = []

    for (const folder of userFolders) {
      if (folder.type === "dir") {
        try {
          // Get files in user folder
          const userFilesResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/users/${folder.name}`, {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

          if (userFilesResponse.ok) {
            const files = await userFilesResponse.json()
            const totalSize = files.reduce((sum: number, file: any) => sum + (file.size || 0), 0)
            
            userStats.push({
              id: folder.name,
              username: `User ${folder.name}`,
              fileCount: files.length,
              totalSize: totalSize
            })
          }
        } catch (error) {
          console.error(`Failed to get stats for user ${folder.name}:`, error)
        }
      }
    }

    return NextResponse.json(userStats)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}