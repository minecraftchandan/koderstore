import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, message } = await request.json()

    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 })
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    // Send message to Discord webhook
    const discordPayload = {
      embeds: [
        {
          title: "New Contact Message",
          color: 0x5865F2, // Discord blue
          fields: [
            {
              name: "From",
              value: name,
              inline: true
            },
            {
              name: "Message",
              value: message,
              inline: false
            }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordPayload),
    })

    if (!response.ok) {
      throw new Error("Failed to send webhook")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}