"use client"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter, usePathname } from "next/navigation"
import { Send, X, Bot, Mic, ChevronDown, Sparkles, ShieldAlert, Map, Network, Users, TrendingUp, RefreshCw } from "lucide-react"
import { aiApi } from "@/lib/api"

interface Message {
  id: string
  role: "user" | "assistant"
  english: string
  kannada?: string
  source?: string
  confidence?: number
  timestamp: Date
}

interface CopilotWidgetProps {
  isOpen: boolean
  onClose: () => void
  dashboardContext?: Record<string, any>
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  english: "Namaskara. I can guide you through this synthetic research demo. Ask about the map, network, forecasts, patrol overview, or evidence workspace.",
  kannada: "ನಮಸ್ಕಾರ. ಈ ಕೃತಕ ಸಂಶೋಧನಾ ಪ್ರದರ್ಶನದ ಪುಟಗಳನ್ನು ಪರಿಚಯಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
  source: "demo_guide",
  confidence: 0,
  timestamp: new Date(),
}

const SUGGESTION_CHIPS = [
  { icon: Map, label: "Explore the sample map", color: "text-orange-400" },
  { icon: Network, label: "Show the synthetic network", color: "text-blue-400" },
  { icon: TrendingUp, label: "What can forecast review show?", color: "text-purple-400" },
  { icon: ShieldAlert, label: "How does evidence preview work?", color: "text-red-400" },
  { icon: Users, label: "Show patrol overview", color: "text-teal-400" },
]

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  demo_guide: { label: "Demo guide", color: "text-emerald-400" },
  smart_deflection: { label: "Unavailable", color: "text-slate-400" },
}

export function CopilotWidget({ isOpen, onClose, dashboardContext }: CopilotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showKannada, setShowKannada] = useState(true)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startNewConversation = () => {
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }])
    setInput("")
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    setInput("")

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      english: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const payload = {
        message: text,
        language: "both",
        context: {
          page: pathname,
          ...dashboardContext,
        },
      }

      const res = await aiApi.post("/copilot/chat", payload)
      const data = res.data

      // Handle navigation action
      if (data.action?.type === "navigate" && data.action?.target) {
        router.push(data.action.target)
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        english: data.english,
        kannada: data.kannada,
        source: data.source,
        confidence: data.confidence,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        english: "The demo guide is temporarily unavailable. Please try again shortly.",
        kannada: "ಪ್ರದರ್ಶನ ಮಾರ್ಗದರ್ಶಿ ಈಗ ಲಭ್ಯವಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.",
        source: "smart_deflection",
        confidence: 0,
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[100] w-[420px] max-w-[calc(100vw-2rem)] flex flex-col rounded-[24px] border border-slate-700/50 bg-[#0B1220]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden"
      style={{ height: "600px" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-[#0B1220] to-[#0B1220]/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-400 rounded-full border-[2.5px] border-[#0B1220] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-white tracking-wide">CIOS Copilot</p>
            <p className="text-[11px] text-blue-400 font-medium tracking-wide">Kannada Intelligence Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* New Conversation */}
          <button 
            onClick={startNewConversation}
            title="New Conversation"
            className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {/* Kannada toggle */}
          <button
            onClick={() => setShowKannada(p => !p)}
            className={`px-3 py-1.5 ml-1 text-[11px] font-bold rounded-lg border transition-all tracking-wide ${
              showKannada
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-300"
            }`}
          >ಕನ್ನಡ</button>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all ml-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.role === "user" ? (
              <div className="max-w-[85%] px-5 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[14px] font-medium shadow-lg shadow-blue-900/20">
                {msg.english}
              </div>
            ) : (
              <div className="max-w-[90%] w-full flex flex-col gap-2">
                {/* Combined Assistant Bubble */}
                <div className="rounded-2xl rounded-tl-sm bg-slate-800/40 border border-slate-700/50 overflow-hidden shadow-sm backdrop-blur-sm">
                  {/* English response */}
                  <div className="px-5 py-3.5 text-slate-200 text-[14px] leading-relaxed">
                    {msg.english}
                  </div>
                  {/* Kannada response */}
                  {showKannada && msg.kannada && (
                    <div className="px-5 py-3 bg-indigo-500/10 border-t border-indigo-500/20 text-indigo-200 text-[13px] leading-relaxed font-medium">
                      {msg.kannada}
                    </div>
                  )}
                </div>
                {/* Source badge */}
                {msg.source && SOURCE_LABELS[msg.source] && (
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles className="h-3 w-3 text-slate-500" />
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${SOURCE_LABELS[msg.source].color}`}>
                      {SOURCE_LABELS[msg.source].label}
                    </span>
                    {msg.confidence !== undefined && msg.confidence > 0 && (
                      <span className="text-[10px] text-slate-500">· {Math.round(msg.confidence * 100)}% conf</span>
                    )}
                    <span className="text-[10px] text-slate-600 ml-auto">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-slate-800/40 border border-slate-700/50">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestion chips (show only when chat is empty-ish) */}
        {messages.length <= 1 && !isLoading && (
          <div className="pt-4 space-y-2.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1 mb-3">Suggested Queries</p>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => sendMessage(chip.label)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all text-left group"
              >
                <div className={`p-1.5 rounded-lg bg-slate-800/50 group-hover:bg-indigo-500/20 transition-colors`}>
                   <chip.icon className={`h-4 w-4 ${chip.color}`} />
                </div>
                <span className="text-[13px] text-slate-300 group-hover:text-indigo-200 transition-colors font-medium tracking-wide">{chip.label}</span>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50 bg-[#0B1220] shrink-0">
        <div className="relative flex items-center bg-slate-800/50 border border-slate-700/60 rounded-2xl p-1.5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-slate-800/80 transition-all shadow-inner">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask in English or ಕನ್ನಡ..."
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder:text-slate-500 font-medium px-3 h-10"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_10px_rgba(79,70,229,0.3)] shrink-0"
          >
            <Send className="h-4 w-4 text-white ml-0.5" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <Sparkles className="h-3 w-3 text-indigo-500/60" />
          <p className="text-[10px] text-slate-500 font-medium tracking-wide">
            Multi-Layer AI · Context-Aware · Kannada Ready
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
