'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  MoreHorizontal,
  Video,
  FileText,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { courseApi } from '@/lib/api'

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      fetchInstructorCourses(parsedUser.id || parsedUser._id)
    }
  }, [])

  const fetchInstructorCourses = async (instructorId: string) => {
    try {
      const data = await courseApi.getCourses(instructorId)
      setCourses(data)
    } catch (err) {
      console.error('Failed to fetch instructor courses')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Total Revenue', value: `$${courses.reduce((acc, c) => acc + (c.price || 0), 0).toLocaleString()}`, change: '+12%', icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Total Students', value: '0', change: '0%', icon: Users, color: 'text-blue-500' },
    { label: 'Active Courses', value: courses.length.toString(), change: '+1', icon: BookOpen, color: 'text-purple-500' },
    { label: 'Rating', value: '4.8', change: '0', icon: TrendingUp, color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Instructor Studio</h1>
          <p className="text-slate-400">Manage your own courses and track their performance.</p>
        </div>
        <Link href="/instructor/courses/new" className="premium-button flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Course
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <h2 className="text-xl font-bold text-white">My Courses</h2>
          <button className="text-sm text-blue-400 hover:text-blue-300">View History</button>
        </div>
        
        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">You haven't created any courses yet.</p>
            <Link href="/instructor/courses/new" className="text-blue-500 hover:underline text-sm font-bold">
              Create your first course now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                  <th className="px-8 py-4 font-medium">Course</th>
                  <th className="px-8 py-4 font-medium">Price</th>
                  <th className="px-8 py-4 font-medium">Lessons</th>
                  <th className="px-8 py-4 font-medium">Status</th>
                  <th className="px-8 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((course) => (
                  <tr key={course.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-semibold text-white">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-white font-medium">${course.price}</td>
                    <td className="px-8 py-6 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500/50" />
                        {course.lessons_count || 0} Lessons
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                        Published
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/instructor/courses/${course.id}/lessons`}
                          className="p-2 rounded-lg hover:bg-blue-600/10 text-blue-400 transition-colors flex items-center gap-2 text-xs font-bold"
                        >
                          <FileText className="w-4 h-4" />
                          CURRICULUM
                        </Link>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
