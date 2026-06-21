import { Bell, Search, UserCircle, Activity } from "lucide-react"

export default function TopNav() {
  return (
    <header className="h-16 w-full bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Police Intelligence Command Center
        </h2>
        <div className="hidden md:flex items-center bg-background/50 border border-border/50 rounded-md px-3 py-1.5 w-64">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Search citizen, vehicle, case..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
        </button>
        <div className="h-8 w-px bg-border/50"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Cmdr. Singh</p>
            <p className="text-xs text-muted-foreground">SOC Director</p>
          </div>
          <UserCircle className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
