"use client"

import { Button } from "@/components/ui/button"
import { Github, BarChart3, Users, Settings } from "lucide-react"
import Link from "next/link"

export function AdminSidebar() {
  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/admin", active: true },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  return (
    <aside className="w-64 border-r border-border/40 bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Github className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-sm">GitDrive</span>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button variant={item.active ? "default" : "ghost"} className="w-full justify-start gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/40">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    </aside>
  )
}
