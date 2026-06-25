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
  ShieldCheck,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CopilotWidget } from "@/components/copilot/CopilotWidget"

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Agent Swarm', href: '/multi-agent', icon: BrainCircuit },
  { name: 'Crime Network', href: '/network', icon: Network },
  { name: 'Live Map', href: '/map', icon: MapIcon },
  { name: 'Predictions', href: '/predictions', icon: TrendingUp },
  { name: 'Citizen Risk', href: '/citizens', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)

  return (
    <div className="flex h-full w-64 flex-col bg-[#0B1220]/95 backdrop-blur-xl border-r border-slate-800/60 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-50">
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 text-white">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-blue-400/80 uppercase tracking-wider font-bold">KSP Intelligence</span>
          <span className="text-sm font-extrabold text-white tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">COMMAND CENTER</span>
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
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                isActive 
                  ? "bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-blue-400 border border-blue-500/20 shadow-inner" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
              <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
              {item.name}
              {isActive && (
                <div className="absolute right-3 flex h-1.5 w-1.5 items-center justify-center rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,1)]" />
              )}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800/60 mt-auto flex flex-col gap-3">
        {/* Copilot Sidebar Box */}
        <button 
          onClick={() => setIsCopilotOpen(true)}
          className="flex items-center gap-3 rounded-xl bg-indigo-500/10 px-4 py-3 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)] relative overflow-hidden group hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all text-left w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent blur-xl -z-10 group-hover:from-indigo-500/20 transition-colors" />
          <div className="relative flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-indigo-400 relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-400 rounded-full border border-[#0B1220] shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-indigo-400 tracking-wide truncate">CIOS Copilot</span>
            <span className="text-[10px] text-indigo-300/80 font-medium truncate">Intelligence ready</span>
          </div>
        </button>

        {/* System Status Box */}
        <div className="flex items-center gap-3 rounded-xl bg-green-500/10 px-4 py-3 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)] relative overflow-hidden group hover:bg-green-500/20 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent blur-xl -z-10" />
          <div className="relative flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-green-400 relative z-10" />
            <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-40 animate-pulse" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-green-400 tracking-wide truncate">System Status</span>
            <span className="text-[10px] text-green-500/80 font-medium truncate">All systems operational</span>
          </div>
        </div>
      </div>
      
      {/* Mount the Copilot Widget here */}
      <CopilotWidget isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  )
}
