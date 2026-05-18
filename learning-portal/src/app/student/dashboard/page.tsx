'use client'

import { useEffect, useState } from 'react'
import { courseApi } from '@/lib/api'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Play, 
  ChevronRight, 
  Loader2,
  TrendingUp,
  Award,
  BookMarked
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const savedUser = localStorage.getItem('nexus_user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
          const role = parsedUser.role?.toLowerCase()
          if (role === 'instructor' || role === 'admin') {
            router.push('/instructor/dashboard')
            return
          }
        }
        
        const data = await courseApi.getCourses(undefined, true)
        setEnrolledCourses(data)
      } catch (error) {
        console.error('Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    )
  }

  const stats = [
    { name: 'In Progress', value: enrolledCourses.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Hours Learned', value: '12.5h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Certificates', value: '0', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Points', value: '1,250', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.firstName || 'Student'}! 👋</h1>
        <p className="text-slate-400">Continue your journey and master new skills today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 flex items-center gap-4 border-white/5">
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.name}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Courses List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <BookMarked className="w-5 h-5 text-blue-500" />
              Continue Learning
            </h2>
            <Link href="/student/courses" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Browse all courses
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-white/10">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-20" />
              <p className="text-slate-400 mb-6">You haven't enrolled in any courses yet.</p>
              <Link href="/student/courses" className="premium-button py-3 px-8">
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-blue-500/30 transition-all duration-300">
                  <div className="w-full md:w-40 aspect-video rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-white/5">
                    <Play className="w-8 h-8 text-white/20 group-hover:text-blue-500/50 transition-colors" />
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md w-fit mx-auto md:mx-0">
                        {course.category}
                      </span>
                      <span className="hidden md:block w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span className="text-[10px] text-slate-500 font-medium">{course.lessons_count} Lessons</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    {/* Fake Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500 uppercase">Progress</span>
                        <span className="text-blue-400">{course.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000"
                          style={{ width: `${course.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/student/courses/${course.id}/learn`}
                    className="premium-button py-3 px-8 text-xs flex items-center gap-2 w-full md:w-auto"
                  >
                    Resume
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar / Recommended */}
        <div className="space-y-6">
          <div className="glass-card p-8 space-y-6 bg-gradient-to-br from-blue-600/10 to-transparent">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-2">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Daily Streak: 5 Days</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                You're on fire! Keep learning today to maintain your streak and earn bonus points.
              </p>
            </div>
            <div className="flex gap-2">
              {[1,2,3,4,5,6,7].map((d) => (
                <div key={d} className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  d <= 5 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-600'
                }`}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][d-1]}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">Upcoming Deadlines</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs font-bold text-white">Microservices Quiz</p>
                <p className="text-[10px] text-slate-500">Due in 2 days</p>
                <div className="w-full bg-slate-800 h-1 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
