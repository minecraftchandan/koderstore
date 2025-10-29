"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Cloud, Users, BarChart3, ChevronDown } from "lucide-react"
import Link from "next/link"

interface SidebarProps {
  user?: any
}

export function Sidebar({ user }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems = [
    { icon: Cloud, label: "My Files", href: "/dashboard", active: true },
  ]

  return (
    <aside
      className={`border-r border-border/40 bg-sidebar transition-all duration-300 flex flex-col ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${!isExpanded && "justify-center w-full"}`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Github className="w-5 h-5 text-primary-foreground" />
          </div>
          {isExpanded && <span className="font-bold text-sm">GitDrive</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${!isExpanded && "justify-center px-0"}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>{item.label}</span>}
            </Button>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/40 space-y-3">
        {user && isExpanded && (
          <div className="px-3 py-2 rounded-lg bg-card/50 text-sm">
            <p className="font-medium truncate">{user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}

        <Button
          variant="outline"
          className={`w-full gap-2 ${!isExpanded && "justify-center px-0"}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${!isExpanded && "rotate-90"}`} />
          {isExpanded && "Collapse"}
        </Button>
      </div>
    </aside>
  )
}
