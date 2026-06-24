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
  SearchCode,
  TrendingUp,
  BrainCircuit,
  BellRing,
  CarFront,
  BarChart2,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Agent Swarm', href: '/multi-agent', icon: BrainCircuit },
  { name: 'Crime Network', href: '/network', icon: Network },
  { name: 'Live Map', href: '/map', icon: MapIcon },
  { name: 'Predictions', href: '/predictions', icon: TrendingUp },
  { name: 'Citizen Risk', href: '/citizens', icon: Users },
  { name: 'Case Reports', href: '/cases', icon: FileText },
  { name: 'Alerts & Notifications', href: '/alerts', icon: BellRing },
  { name: 'Patrol Dispatch', href: '/patrol', icon: CarFront },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-[#0B1220] border-r border-border/20 shrink-0">
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Police Intelligence</span>
          <span className="text-sm font-bold text-white tracking-wide">COMMAND CENTER</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-blue-400" : "text-muted-foreground group-hover:text-white")} />
              {item.name}
              {isActive && (
                <div className="absolute right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-border/10">
        <div className="flex items-center gap-3 rounded-md bg-green-500/10 px-3 py-3 border border-green-500/20">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-green-400">System Status</span>
            <span className="text-[10px] text-green-500/70">AI systems operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}
