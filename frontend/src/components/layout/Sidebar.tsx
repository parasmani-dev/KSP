"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Network, 
  Map as MapIcon, 
  Users,
  Settings,
  FileText,
  SearchCode
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Predictions', href: '/predictions', icon: MapIcon },
  { name: 'Network Graph', href: '/network', icon: Network },
  { name: 'Evidence Analyzer', href: '/evidence', icon: FileText },
  { name: 'Citizen Risk', href: '/citizens', icon: Users },
  { name: 'AI Investigation', href: '/investigation', icon: SearchCode },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border/50">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border/50">
        <ShieldAlert className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight text-foreground">CIOS</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border/50 p-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </div>
    </div>
  )
}
