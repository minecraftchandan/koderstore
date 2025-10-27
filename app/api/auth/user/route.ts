import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("discord_user")

  if (!userCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = JSON.parse(userCookie.value)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Invalid user data" }, { status: 400 })
  }
}
