'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { courseApi } from '@/lib/api'
import { 
  ArrowLeft, 
  Plus, 
  Video, 
  FileText, 
  GripVertical,
  Play,
  Save,
  Clock,
  Loader2,
  Trash2,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'

export default function CourseLessonsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    video_url: '',
    duration: 0
  })

  useEffect(() => {
    fetchLessons()
  }, [id])

  const fetchLessons = async () => {
    try {
      const data = await courseApi.getLessons(Number(id))
      setLessons(data)
    } catch (err) {
      console.error('Failed to fetch lessons')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    try {
      await courseApi.addLesson(Number(id), {
        ...newLesson,
        order: lessons.length + 1
      })
      setNewLesson({ title: '', content: '', video_url: '', duration: 0 })
      fetchLessons()
    } catch (err) {
      console.error('Failed to add lesson')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href="/instructor/dashboard" 
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Course Curriculum</h1>
          <p className="text-slate-400 text-sm mt-1">Structure your course by adding lessons and content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Lessons List
            </h2>
            <span className="text-xs text-slate-500">{lessons.length} Lessons</span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : lessons.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4 border-dashed">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">No lessons added yet. Start building your curriculum!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="glass-card p-4 group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab active:cursor-grabbing text-slate-600">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{lesson.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration} min
                        </span>
                        {lesson.video_url && (
                          <span className="text-[10px] text-blue-400 flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Video attached
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Lesson Form */}
        <div className="space-y-6">
          <div className="glass-card p-8 space-y-6 sticky top-28">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              Add New Lesson
            </h2>
            
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Lesson Title</label>
                <input 
                  type="text" 
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  required
                  placeholder="Introduction to..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Content (Markdown/Text)</label>
                <textarea 
                  rows={4}
                  value={newLesson.content}
                  onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                  placeholder="Lesson details..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Duration (min)</label>
                  <input 
                    type="number" 
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({...newLesson, duration: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Order</label>
                  <input 
                    type="number" 
                    value={lessons.length + 1}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Video URL (optional)</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={newLesson.video_url}
                    onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={adding}
                className="premium-button w-full flex justify-center items-center gap-2 py-3.5 mt-4"
              >
                {adding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Lesson
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
