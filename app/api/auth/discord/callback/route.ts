import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Forward the code parameter to the main Discord auth route
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  
  const params = new URLSearchParams()
  if (code) params.set("code", code)
  if (state) params.set("state", state)
  
  return NextResponse.redirect(new URL(`/api/auth/discord?${params.toString()}`, request.url))
}
