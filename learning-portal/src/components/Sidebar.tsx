'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BarChart3, 
  Bot, 
  Settings,
  LogOut,
  GraduationCap,
  ShieldCheck
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('nexus_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    }

    loadUser()
    window.addEventListener('storage', loadUser)
    window.addEventListener('userUpdated', loadUser)

    return () => {
      window.removeEventListener('storage', loadUser)
      window.removeEventListener('userUpdated', loadUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_user')
    router.push('/login')
  }

  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null;

  // Normalisation du rôle
  const role = user?.role?.toLowerCase() || 'student'
  const isInstructor = role === 'instructor' || role === 'admin'

  const studentNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Courses', href: '/courses', icon: BookOpen },
    { name: 'AI Tutor', href: '/ai-tutor', icon: Bot },
    { name: 'My Profile', href: '/profile', icon: Users },
  ]

  const instructorNav = [
    { name: 'Instructor Studio', href: '/instructor/dashboard', icon: BarChart3 },
    { name: 'Manage Courses', href: '/instructor/courses', icon: BookOpen },
    { name: 'Students', href: '/instructor/students', icon: Users },
    { name: 'Profile', href: '/profile', icon: Users },
  ]

  const navigation = isInstructor ? instructorNav : studentNav

  return (
    <div className="w-64 border-r border-white/5 bg-card/50 backdrop-blur-xl hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Nexus
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <div className="px-4 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-3 h-3 text-blue-400" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isInstructor ? 'Instructor Menu' : 'Student Menu'}
          </p>
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Link href="/settings" className="nav-link mb-2">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <button 
          onClick={handleLogout}
          className="nav-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/5"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
