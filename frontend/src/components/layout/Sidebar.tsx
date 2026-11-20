"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrainCircuit, LayoutDashboard, Map, MessageSquareText, Network, Radar, Shield, Users } from "lucide-react"
import { useState } from "react"
import { CopilotWidget } from "@/components/copilot/CopilotWidget"
import { cn } from "@/lib/utils"

export const navigation = [
  { name: "Command overview", href: "/", icon: LayoutDashboard },
  { name: "Geospatial map", href: "/map", icon: Map },
  { name: "Network analysis", href: "/network", icon: Network },
  { name: "Forecast review", href: "/predictions", icon: Radar },
  { name: "Subject profiles", href: "/citizens", icon: Users },
  { name: "Evidence workspace", href: "/multi-agent", icon: BrainCircuit },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [copilotOpen, setCopilotOpen] = useState(false)

  return (
    <aside className="flex h-full w-[252px] flex-col border-r border-[#30404a] bg-[#101d25]">
      <Link href="/" className="flex items-center gap-3 px-5 py-6 border-b border-[#30404a]">
        <div className="relative grid h-12 w-12 shrink-0 place-items-center text-[#d0ad71]"><Shield size={44} strokeWidth={1.3} /><span className="absolute top-[14px] text-[13px] font-bold tracking-tight">K</span></div>
        <div className="min-w-0"><div lang="kn" className="text-[9px] tracking-[0.06em] text-[#c7a770]">ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್</div><div className="truncate text-[13px] font-bold text-[#f5f2eb]">Karnataka State Police</div><div className="text-[9px] uppercase tracking-[0.18em] text-slate-500">CIOS · research prototype</div></div>
      </Link>
      <div className="px-6 pt-8 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c8e79]">Operations desk</div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navigation.map(item => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cn("flex items-center gap-3 rounded px-3 py-2.5 text-[13px] transition-colors border-l-2", active ? "bg-[#322e2b] text-[#f0d2a0] border-[#c09a60]" : "border-transparent text-[#aeb7b9] hover:bg-[#20303a] hover:text-white")}><item.icon size={17} strokeWidth={1.8} />{item.name}</Link>
        })}
      </nav>
      <div className="m-4 border-t border-[#30404a] pt-4"><button onClick={() => setCopilotOpen(true)} className="mb-4 flex w-full items-center gap-2 rounded border border-[#715b40] bg-[#302b27] px-3 py-2 text-xs text-[#ead0a4] hover:bg-[#423429]"><MessageSquareText size={16} /> Open copilot</button><div className="border-l-2 border-[#8b4d47] pl-3 text-[11px] leading-relaxed text-[#9ea9ad]">Research prototype<br />Synthetic records only</div></div>
      <CopilotWidget isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </aside>
  )
}
