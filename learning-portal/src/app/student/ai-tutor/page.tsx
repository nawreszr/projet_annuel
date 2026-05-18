'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aiApi } from '@/lib/api'
import { 
  Bot, 
  Send, 
  Sparkles, 
  BrainCircuit,
  MessageSquare,
  Zap,
  Loader2
} from 'lucide-react'

export default function AiTutorPage() {
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      const role = parsedUser.role?.toLowerCase()
      if (role === 'instructor' || role === 'admin') {
        router.push('/instructor/dashboard')
        return
      }
    } else {
      router.push('/login')
    }
  }, [])

  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Nexus AI Tutor. How can I help you with your learning today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await aiApi.ask(input)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.answer 
      }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please make sure the AI service is running and try again." 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-8 animate-in fade-in duration-700">
      <div className="flex-1 glass-card flex flex-col overflow-hidden border-white/5">
        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-bold text-white">Nexus AI Assistant</h1>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Online & Ready to help
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Powered by Nexus GPT</span>
             <button className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5">
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] p-5 rounded-2xl shadow-xl ${
                msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs text-slate-400 font-medium italic">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your courses..."
              className="w-full bg-background border border-white/10 rounded-2xl py-5 pl-8 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white shadow-2xl group-hover:border-white/20 disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="w-80 space-y-6 hidden xl:block">
        <div className="glass-card p-8 space-y-6 border-white/5">
          <h2 className="font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            AI Capabilities
          </h2>
          <div className="space-y-4">
            {[
              { icon: MessageSquare, text: 'Instant Explanations', color: 'text-blue-400', desc: 'Complex concepts simplified.' },
              { icon: Zap, text: 'Code Assistance', color: 'text-orange-400', desc: 'Debug and write code faster.' },
              { icon: Sparkles, text: 'Personalized Summaries', color: 'text-emerald-400', desc: 'Summarize long course modules.' },
            ].map((item, i) => (
              <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3 mb-1">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs text-white font-bold">{item.text}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
