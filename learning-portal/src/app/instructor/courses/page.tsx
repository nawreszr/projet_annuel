'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  FileText,
  Loader2,
  Video
} from 'lucide-react'
import Link from 'next/link'
import { courseApi } from '@/lib/api'

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      fetchCourses(parsedUser.id || parsedUser._id)
    }
  }, [])

  const fetchCourses = async (instructorId: string) => {
    try {
      const data = await courseApi.getCourses(instructorId)
      setCourses(data)
    } catch (err) {
      console.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage My Courses</h1>
          <p className="text-slate-400 text-sm">Create, edit and organize your curriculum content.</p>
        </div>
        <Link href="/instructor/courses/new" className="premium-button flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Course
        </Link>
      </header>

      <div className="glass-card">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search your courses..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">You haven't created any courses yet.</p>
            <Link href="/instructor/courses/new" className="text-blue-500 hover:underline text-sm font-bold">
              Start by creating your first course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-5 font-bold">Course Details</th>
                  <th className="px-8 py-5 font-bold">Price</th>
                  <th className="px-8 py-5 font-bold">Level</th>
                  <th className="px-8 py-5 font-bold">Status</th>
                  <th className="px-8 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((course) => (
                  <tr key={course.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
                          <Video className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{course.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-500">{course.category}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span className="text-[10px] text-blue-400 font-bold">{course.lessons_count || 0} Lessons</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-white font-medium">${course.price}</td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                        {course.level}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-xs text-emerald-500 font-medium">Published</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/instructor/courses/${course.id}/lessons`}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 text-[10px] font-bold hover:bg-blue-600/20 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          CURRICULUM
                        </Link>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
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
