'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  BookOpen, 
  Search, 
  Filter, 
  Mail, 
  User, 
  Loader2,
  TrendingUp,
  Calendar,
  Layers
} from 'lucide-react'
import { courseApi, authApi } from '@/lib/api'

export default function InstructorStudentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [students, setStudents] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('All')
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      fetchStudentsAndEnrollments(parsedUser.id || parsedUser._id)
    }
  }, [])

  const fetchStudentsAndEnrollments = async (instructorId: string) => {
    try {
      setLoading(true)
      // 1. Fetch all enrollments for this instructor's courses
      const enrolls = await courseApi.getInstructorEnrollments(instructorId)
      setEnrollments(enrolls)

      // 2. Fetch user profile details for all unique student IDs in batch
      const uniqueUserIds = Array.from(new Set(enrolls.map((e: any) => e.user_id).filter(Boolean)))
      
      if (uniqueUserIds.length > 0) {
        const usersList = await authApi.getUsersBatch(uniqueUserIds as string[])
        const usersMap: Record<string, any> = {}
        usersList.forEach((u: any) => {
          usersMap[u._id] = u
        })
        setStudents(usersMap)
      }
    } catch (err) {
      console.error('Failed to fetch students data', err)
    } finally {
      setLoading(false)
    }
  }

  // Dynamic course filters gathered from enrollments
  const coursesList = ['All', ...Array.from(new Set(enrollments.map(e => e.course_title).filter(Boolean)))]

  // Calculate unique student count
  const uniqueStudentCount = Array.from(new Set(enrollments.map(e => e.user_id))).length

  // Group and filter students locally for super fast real-time search & grouping
  const studentIds = Array.from(new Set(enrollments.map(e => e.user_id).filter(Boolean)))

  const filteredStudents = studentIds.map(userId => {
    const student = students[userId] || {}
    const studentEnrollments = enrollments.filter(e => e.user_id === userId)
    
    return {
      userId,
      student,
      enrollments: studentEnrollments
    }
  }).filter(({ student, enrollments: studentEnrolls }) => {
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase()
    
    // Search filter
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEnrolls.some((e: any) => e.course_title?.toLowerCase().includes(searchTerm.toLowerCase()))

    // Course filter
    const matchesCourse = selectedCourse === 'All' || 
      studentEnrolls.some((e: any) => e.course_title === selectedCourse)

    return matchesSearch && matchesCourse
  })

  // Format date elegantly
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">My Enrolled Students</h1>
        <p className="text-slate-400 text-sm">Track progress, course distributions, and student contact details.</p>
      </header>

      {/* Analytics Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between group hover:border-blue-500/20 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Enrolled Students</p>
            <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">{uniqueStudentCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between group hover:border-purple-500/20 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Enrollments</p>
            <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">{enrollments.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-500">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between group hover:border-emerald-500/20 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active Distributions</p>
            <p className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
              {coursesList.length - 1} Courses
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="glass-card">
        {/* Search & Filter Header */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search students by name, email, or course..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
            />
          </div>
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
              showFilterPanel || selectedCourse !== 'All'
                ? 'bg-blue-600/15 border-blue-500/30 text-blue-400' 
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter by Course
            {selectedCourse !== 'All' && (
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilterPanel && (
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col gap-3 animate-in slide-in-from-top-4 duration-300">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Course Title</label>
            <div className="flex flex-wrap gap-2">
              {coursesList.map((course) => (
                <button
                  key={course}
                  onClick={() => setSelectedCourse(course)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCourse === course 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No students have enrolled in your courses yet.</p>
            <p className="text-xs text-slate-500">Publish courses or promote your catalog to get active enrollments.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <p className="text-slate-400">No student enrollments match your criteria.</p>
            <button 
              onClick={() => {
                setSelectedCourse('All')
                setSearchTerm('')
              }}
              className="text-blue-500 hover:underline text-sm font-bold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-5 font-bold">Student Details</th>
                  <th className="px-8 py-5 font-bold">Contact Info</th>
                  <th className="px-8 py-5 font-bold">Enrolled Courses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map(({ userId, student, enrollments: studentEnrolls }) => {
                  const hasFullName = student.firstName || student.lastName
                  const displayName = hasFullName 
                    ? `${student.firstName || ''} ${student.lastName || ''}` 
                    : student.username || 'Unknown Student'
                  const init = student.firstName ? student.firstName[0] : (student.username ? student.username[0] : 'U')

                  return (
                    <tr key={userId} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6 align-top">
                        <div className="flex items-center gap-4">
                          {student.profileImage ? (
                            <img 
                              src={student.profileImage} 
                              alt={displayName} 
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/10 flex items-center justify-center text-blue-400 font-bold shrink-0 text-sm">
                              {init.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                              {displayName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">@{student.username || 'student'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 align-top">
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs">{student.email || 'No email provided'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-3">
                          {studentEnrolls.map((enroll: any) => (
                            <div key={enroll.enrollment_id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3 max-w-xl group/card hover:border-blue-500/20 transition-all">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-white group-hover/card:text-blue-400 transition-colors">{enroll.course_title}</p>
                                <span className="inline-block text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                  {enroll.course_category}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium shrink-0 pt-0.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(enroll.enrolled_at)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
