'use client'

import { useEffect, useState } from 'react'
import { authApi, courseApi } from '@/lib/api'
import { 
  User, 
  Mail, 
  Shield, 
  Camera,
  MapPin,
  Link as LinkIcon,
  Save,
  X,
  Loader2,
  CheckCircle2,
  BookOpen,
  Users
} from 'lucide-react'

export default function InstructorProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  
  // Real-time teaching stats
  const [coursesCount, setCoursesCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: ''
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        username: parsedUser.username || ''
      })
      fetchInstructorStats(parsedUser.id || parsedUser._id)
    }
  }, [])

  const fetchInstructorStats = async (instructorId: string) => {
    try {
      setStatsLoading(true)
      // Get courses published count
      const courses = await courseApi.getCourses(instructorId)
      setCoursesCount(courses.length)

      // Get unique enrolled students count
      const enrollments = await courseApi.getInstructorEnrollments(instructorId)
      const uniqueUserIds = Array.from(new Set(enrollments.map((e: any) => e.user_id).filter(Boolean)))
      setStudentsCount(uniqueUserIds.length)
    } catch (error) {
      console.error('Failed to fetch instructor stats', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updatedUser = await authApi.updateProfile(formData)
      setUser(updatedUser)
      
      // Dispatch custom event to notify Header and Sidebar
      window.dispatchEvent(new Event('userUpdated'))
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setIsEditing(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="relative h-48 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
        <div className="absolute -bottom-12 left-10 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-card border-4 border-background flex items-center justify-center overflow-hidden shadow-2xl shadow-black/50">
              <User className="w-16 h-16 text-slate-500" />
            </div>
            <button className="absolute bottom-2 right-2 p-2 rounded-xl bg-blue-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all border border-white/20">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="pb-14">
            <h1 className="text-3xl font-bold text-white">{user?.username || 'Nexus Instructor'}</h1>
            <p className="text-slate-300 flex items-center gap-2 font-medium">
              <Shield className="w-4 h-4 text-blue-400" />
              {user?.role?.toUpperCase() || 'INSTRUCTOR'}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-bold px-4 py-2 rounded-xl bg-blue-500/10"
                >
                  <Edit3Icon className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={loading}
                    className="premium-button flex items-center gap-2 text-sm py-2 px-6"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Username</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm"
                  />
                ) : (
                  <p className="text-white font-medium text-lg">{user?.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email Address</p>
                <p className="text-white font-medium text-lg flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {user?.email}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">First Name</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm"
                  />
                ) : (
                  <p className="text-white font-medium text-lg">{user?.firstName || 'Not set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Last Name</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white text-sm"
                  />
                ) : (
                  <p className="text-white font-medium text-lg">{user?.lastName || 'Not set'}</p>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8">
            <h2 className="text-lg font-bold text-white mb-6">Instructor Statistics</h2>
            {statsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Courses Published
                  </span>
                  <span className="text-lg font-bold text-white">{coursesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    Active Students
                  </span>
                  <span className="text-lg font-bold text-purple-400">{studentsCount}</span>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-8">
            <h2 className="text-lg font-bold text-white mb-6">Connected Links</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-400 cursor-pointer transition-colors">
                <LinkIcon className="w-4 h-4" />
                <span>linkedin.com/in/{user?.username}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline fallback Edit icon in case of icon naming collisions
function Edit3Icon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}
