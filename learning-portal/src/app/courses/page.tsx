'use client'

import { useEffect, useState } from 'react'
import { courseApi } from '@/lib/api'
import { Search, Filter, Clock, BookOpen, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getCourses()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleEnroll = async (courseId: number, isEnrolled: boolean) => {
    if (isEnrolled) {
      router.push(`/courses/${courseId}/learn`)
      return
    }

    try {
      await courseApi.enroll(courseId)
      // Refresh list to show 'Continue Learning'
      fetchCourses()
      router.push(`/courses/${courseId}/learn`)
    } catch (error) {
      console.error('Enrollment failed')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Explore Courses</h1>
          <p className="text-slate-400 text-sm">Expand your knowledge with our expert-led curriculum.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white w-64"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="glass-card group overflow-hidden flex flex-col h-full border-white/5 hover:border-blue-500/30 transition-all duration-500">
              {/* Course Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                <BookOpen className="w-16 h-16 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-background/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-tighter border border-white/10">
                  {course.category || 'Technology'}
                </div>
                {course.is_enrolled && (
                   <div className="absolute top-4 left-4 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-tighter border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Enrolled
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {course.description || 'Master the fundamentals and advanced concepts in this comprehensive course.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-y border-white/5 py-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>{course.lessons_count || 0} Lessons</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Price</span>
                    <span className="text-xl font-bold text-white">{course.is_enrolled ? 'Free' : `$${course.price}`}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleEnroll(course.id, course.is_enrolled)}
                    className={`py-3 px-6 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      course.is_enrolled 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'premium-button shadow-lg shadow-blue-500/20'
                    }`}
                  >
                    {course.is_enrolled ? 'Continue Learning' : 'Enroll Now'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
