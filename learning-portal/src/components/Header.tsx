'use client'

import { useEffect, useState } from 'react'
import { Bell, Search, User } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Function to load user from localStorage
    const loadUser = () => {
      const savedUser = localStorage.getItem('nexus_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    }

    loadUser()

    // Listen for storage changes (in case of profile update in another component)
    window.addEventListener('storage', loadUser)
    
    // Custom event for same-window updates
    window.addEventListener('userUpdated', loadUser)

    return () => {
      window.removeEventListener('storage', loadUser)
      window.removeEventListener('userUpdated', loadUser)
    }
  }, [])
  
  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null;

  return (
    <header className="h-20 border-b border-white/5 bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search courses, students, analytics..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-background"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right">
            <p className="text-sm font-bold text-white">
              {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Guest User'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {user?.role?.toUpperCase() || 'GUEST'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border border-white/10 shadow-lg shadow-blue-500/20">
            <User className="text-white w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  )
}
