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
    <header className="h-20 w-full bg-[#0B1220] border-b border-border/20 flex items-center justify-between px-6 shrink-0 z-10">
      
      {/* Left: Hamburger */}
      <div className="flex items-center">
        <button className="p-2 text-muted-foreground hover:text-white transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Center: Metric Widgets - Removed as per user request */}
      <div className="hidden lg:flex flex-1"></div>

      {/* Right: Search & Profile */}
      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center bg-[#121A2F] border border-border/30 rounded-full px-4 py-2 w-64">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Search citizen, case, vehicle..." 
            className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-muted-foreground"
            onKeyDown={handleSearch}
          />
        </div>
        
        <button className="relative p-2 text-muted-foreground hover:text-white transition-colors bg-[#121A2F] rounded-full border border-border/30">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-[#0B1220]">
            12
          </span>
        </button>
        
        <div className="h-8 w-px bg-border/20"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">Cmdr. Singh</p>
            <p className="text-[10px] text-muted-foreground">SOC Director</p>
          </div>
          {/* Use a placeholder image for avatar or an icon */}
          <div className="h-9 w-9 rounded-full bg-[#121A2F] border border-border/30 overflow-hidden flex items-center justify-center">
             <UserCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}
