"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquareText, Search } from "lucide-react"
import { navigation } from "./Sidebar"
import { CopilotWidget } from "@/components/copilot/CopilotWidget"

export default function TopNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [online, setOnline] = useState<boolean | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)

  useEffect(() => {
    let active = true
    const check = async () => {
      try {
        const res = await fetch('/api/services/ai/health', { cache: 'no-store' })
        if (active) setOnline(res.ok)
      } catch { if (active) setOnline(false) }
    }
    check()
    const timer = setInterval(check, 30000)
    return () => { active = false; clearInterval(timer) }
  }, [])

  const title = navigation.find(item => item.href === pathname)?.name || "Intelligence desk"
  return <header className="border-b border-[#30404a] bg-[#101d25]/95 px-5 lg:px-8">
    <div className="h-[70px] flex items-center justify-between gap-4">
      <div><div className="text-[10px] uppercase tracking-[0.17em] text-[#c1a36f]">KSP / Crime Intelligence Operating System</div><div className="text-lg font-semibold tracking-tight text-[#f5f2eb]">{title}</div></div>
      <div className="flex items-center gap-4">
        <span className="hidden xl:inline rounded border border-[#5b4935] bg-[#2e2924] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e0bf8b]">Demo data</span>
        <button className="lg:hidden text-[#d0ad71]" aria-label="Open copilot" onClick={() => setCopilotOpen(true)}><MessageSquareText size={19} /></button>
        <label className="hidden md:flex items-center gap-2 rounded border border-[#3d4d56] bg-[#16252e] px-3 py-2 text-slate-400 focus-within:border-[#d1aa6c]"><Search size={15} /><input aria-label="Search network" placeholder="Search network" className="w-44 bg-transparent text-xs text-white outline-none placeholder:text-slate-500" onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value.trim()) router.push(`/network?search=${encodeURIComponent(e.currentTarget.value.trim())}`) }} /></label>
        <div aria-live="polite" className="flex items-center gap-2 text-[11px] text-slate-400"><span className={`h-2 w-2 rounded-full ${online === null ? 'bg-slate-500' : online ? 'bg-[#81ad8c]' : 'bg-[#d4a750]'}`} /><span>{online === null ? 'Checking' : online ? 'Demo online' : 'Demo offline'}</span></div>
      </div>
    </div>
    <nav className="flex lg:hidden gap-1 overflow-x-auto pb-2" aria-label="Mobile navigation">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={`shrink-0 rounded px-3 py-1.5 text-xs ${pathname === item.href ? 'bg-[#322e2b] text-[#f0d2a0]' : 'text-slate-400'}`}>{item.name}</Link>)}</nav>
    <CopilotWidget isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
  </header>
}
