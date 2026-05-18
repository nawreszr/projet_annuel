'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { courseApi } from '@/lib/api'
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Layout, 
  CheckCircle2,
  AlertCircle,
  Video
} from 'lucide-react'
import Link from 'next/link'

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: 'Technology',
    level: 'Beginner',
    video_url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const savedUser = localStorage.getItem('nexus_user')
    const user = savedUser ? JSON.parse(savedUser) : null

    try {
      await courseApi.createCourse({
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        instructor: user?.username || 'Unknown',
        instructor_id: user?.id || user?._id || 'unknown'
      })
      setSuccess(true)
      setTimeout(() => {
        router.push('/instructor/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create course. Please verify the course service is running.')
    } finally {
      setLoading(false)
    }
  }

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-white">Course Created!</h1>
        <p className="text-slate-400">Your course has been successfully added to the catalog.</p>
        <p className="text-sm text-blue-400">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href="/instructor/dashboard" 
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Course</h1>
          <p className="text-slate-400 text-sm mt-1">Design a high-quality learning experience for your students.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-500" />
              General Information
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Course Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="e.g. Mastering Next.js with Tailwind CSS"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="What will students learn in this course?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white resize-none"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-500" />
              Course Content & Media
            </h2>
            
            <input 
              type="file" 
              id="course-thumbnail" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
            
            <label 
              htmlFor="course-thumbnail"
              className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 text-center space-y-4 hover:border-blue-500/30 transition-colors cursor-pointer group block overflow-hidden"
            >
              {imagePreview ? (
                <div className="absolute inset-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : null}
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-blue-600/10 transition-colors">
                  {imagePreview ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <Plus className="w-8 h-8 text-slate-500 group-hover:text-blue-500" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-white font-medium">
                    {imagePreview ? 'Change Thumbnail' : 'Upload Course Thumbnail'}
                  </p>
                  <p className="text-xs text-slate-500">Drag and drop or click to browse (Max 5MB)</p>
                </div>
              </div>
            </label>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-sm font-medium text-slate-300">Course Preview Video URL (optional)</label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Pricing & Duration
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Price ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    placeholder="49.99"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Duration (Minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                    placeholder="120"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Level</label>
                <select 
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="premium-button w-full flex justify-center items-center gap-2 py-4 shadow-2xl shadow-blue-500/20"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Publish Course
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500 px-4">
              By publishing, you agree to Nexus's instructor terms and quality guidelines.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
