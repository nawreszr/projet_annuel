'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  FileText,
  Loader2,
  Video,
  X,
  DollarSign,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { courseApi } from '@/lib/api'

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Edit Course state
  const [courseToEdit, setCourseToEdit] = useState<any | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: 'Technology',
    level: 'Beginner'
  })
  const [editLoading, setEditLoading] = useState(false)

  // Delete Course state
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

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
      showToast('Failed to load courses. Please verify the courses API is reachable.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle opening the Edit modal
  const handleEditClick = (course: any) => {
    setCourseToEdit(course)
    setEditFormData({
      title: course.title || '',
      description: course.description || '',
      price: course.price?.toString() || '',
      duration: course.duration?.toString() || '',
      category: course.category || 'Technology',
      level: course.level || 'Beginner'
    })
  }

  // Handle Edit submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      await courseApi.updateCourse(courseToEdit.id, {
        ...editFormData,
        price: parseFloat(editFormData.price),
        duration: parseInt(editFormData.duration)
      })
      showToast('Course updated successfully!')
      setCourseToEdit(null)
      if (user) {
        fetchCourses(user.id || user._id)
      }
    } catch (err: any) {
      console.error(err)
      showToast(err.response?.data?.error || 'Failed to update course. Please check connection.', 'error')
    } finally {
      setEditLoading(false)
    }
  }

  // Handle Delete confirm
  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return
    setDeleteLoading(true)
    try {
      await courseApi.deleteCourse(courseToDelete.id)
      showToast(`Course "${courseToDelete.title}" deleted successfully!`)
      setCourseToDelete(null)
      if (user) {
        fetchCourses(user.id || user._id)
      }
    } catch (err: any) {
      console.error(err)
      showToast(err.response?.data?.error || 'Failed to delete course. Please check connection.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Unique categories gathered dynamically from current list (fallback to standard set)
  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))]
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

  // Filter courses locally for maximum reactivity and fast responsive feel
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory

    return matchesSearch && matchesLevel && matchesCategory
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage My Courses</h1>
          <p className="text-slate-400 text-sm">Create, edit, filter, and organize your curriculum content.</p>
        </div>
        <Link href="/instructor/courses/new" className="premium-button flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Course
        </Link>
      </header>

      <div className="glass-card">
        {/* Search & Filter Header */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search your courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
            />
          </div>
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
              showFilterPanel || selectedLevel !== 'All' || selectedCategory !== 'All'
                ? 'bg-blue-600/15 border-blue-500/30 text-blue-400' 
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {(selectedLevel !== 'All' || selectedCategory !== 'All') && (
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilterPanel && (
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Level</label>
              <div className="flex flex-wrap gap-2">
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedLevel === lvl 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end sm:ml-auto">
              <button 
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedLevel('All')
                  setSearchTerm('')
                }}
                className="text-xs font-bold text-slate-500 hover:text-white transition-colors py-2"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

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
        ) : filteredCourses.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <p className="text-slate-400">No courses match your search or filter criteria.</p>
            <button 
              onClick={() => {
                setSelectedCategory('All')
                setSelectedLevel('All')
                setSearchTerm('')
              }}
              className="text-blue-500 hover:underline text-sm font-bold"
            >
              Reset all filters
            </button>
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
                {filteredCourses.map((course) => (
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
                        <span className="text-xs text-emerald-500 font-medium">
                          {course.is_published === false ? 'Draft' : 'Published'}
                        </span>
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
                        <button 
                          onClick={() => handleEditClick(course)}
                          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                          title="Edit Course"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCourseToDelete(course)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                          title="Delete Course"
                        >
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

      {/* Edit Course Modal */}
      {courseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card max-w-2xl w-full p-8 border border-white/10 space-y-6 mx-4 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setCourseToEdit(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-blue-500" />
                Edit Course
              </h3>
              <p className="text-slate-400 text-sm mt-1">Modify your course configuration and pricing.</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Course Title</label>
                  <input 
                    type="text" 
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <textarea 
                    rows={4}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Price ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="number" 
                        step="0.01"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                        required
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
                        value={editFormData.duration}
                        onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Category</label>
                    <select 
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Level</label>
                    <select 
                      value={editFormData.level}
                      onChange={(e) => setEditFormData({...editFormData, level: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setCourseToEdit(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="flex-1 premium-button flex justify-center items-center gap-2 py-3 shadow-lg shadow-blue-500/20"
                >
                  {editLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-350">
          <div className="glass-card max-w-md w-full p-8 border border-white/10 space-y-6 mx-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Delete Course</h3>
              <p className="text-sm text-slate-400">
                Are you sure you want to delete <span className="text-white font-semibold">"{courseToDelete.title}"</span>? This will permanently delete the course and all associated lessons and progression data.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setCourseToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all text-sm font-bold shadow-lg shadow-red-500/20 flex justify-center items-center gap-2"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
