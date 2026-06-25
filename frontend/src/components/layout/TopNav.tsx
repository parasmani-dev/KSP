"use client"
import { Bell, Search, UserCircle, Menu, ShieldAlert, Activity, Cpu, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TopNav() {
  const router = useRouter()

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      router.push(`/network?search=${encodeURIComponent(e.currentTarget.value.trim())}`)
    }
  }

  return (
    <header className="h-20 w-full bg-[#0B1220]/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 shrink-0 z-50 sticky top-0 shadow-sm">
      
      {/* Center: Empty Space */}
      <div className="hidden lg:flex flex-1"></div>

      {/* Right: Search & Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Premium Search Bar */}
        <div className="hidden md:flex items-center bg-[#0B1220]/50 backdrop-blur border border-slate-700/50 rounded-xl px-4 py-2 w-72 shadow-inner transition-all focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500/50 group">
          <Search className="h-4 w-4 text-slate-400 mr-2 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search citizen, case, vehicle..." 
            className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-slate-500 font-medium"
            onKeyDown={handleSearch}
          />
        </div>
        
        {/* Notification Bell */}
        <button className="relative p-2.5 text-slate-400 hover:text-white transition-all bg-[#0B1220]/50 hover:bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/50 shadow-sm active:scale-95">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.6)] border border-rose-400">
            12
          </span>
        </button>
        
        <div className="h-8 w-px bg-slate-700/50 mx-1"></div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Cmdr. Singh</p>
            <p className="text-[10px] text-blue-400/80 font-medium tracking-wide">SOC Director</p>
          </div>
          {/* Avatar with gradient ring */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-800 to-[#0B1220] border border-slate-700/50 p-[2px] shadow-sm group-hover:border-blue-500/30 transition-colors">
             <div className="w-full h-full rounded-[10px] bg-slate-800 flex items-center justify-center relative overflow-hidden">
               <UserCircle className="h-6 w-6 text-slate-400" />
               <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
          </div>
        </div>
      </div>
    </header>
  )
}
