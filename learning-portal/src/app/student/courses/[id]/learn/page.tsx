'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { courseApi, aiApi } from '@/lib/api'
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  Clock,
  Layout,
  ArrowLeft,
  Loader2,
  Trophy,
  PartyPopper,
  Bot,
  Send,
  X,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function CoursePlayerPage() {
  const { id } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCertificate, setShowCertificate] = useState(false)
  
  // AI Helper State
  const [showAiHelper, setShowAiHelper] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<any[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  const fetchData = async () => {
    try {
      const courses = await courseApi.getCourses()
      const foundCourse = courses.find((c: any) => c.id.toString() === id)
      setCourse(foundCourse)

      const lessonsData = await courseApi.getLessons(Number(id))
      setLessons(lessonsData)
      
      if (!currentLesson && lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0])
      } else if (currentLesson) {
        const updatedCurrent = lessonsData.find((l: any) => l.id === currentLesson.id)
        if (updatedCurrent) setCurrentLesson(updatedCurrent)
      }
    } catch (error) {
      console.error('Failed to fetch course content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleNextLesson = async () => {
    const currentIndex = lessons.indexOf(currentLesson)
    try {
      await courseApi.updateProgress(Number(id), currentLesson.id)
      await fetchData()
    } catch (error) {
      console.error('Failed to save progress')
    }

    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1])
    }
  }

  const handleAiAsk = async () => {
    if (!aiInput.trim() || aiLoading) return
    
    const userMsg = { role: 'user', content: aiInput }
    setAiMessages(prev => [...prev, userMsg])
    setAiInput('')
    setAiLoading(true)

    try {
      // On ajoute du contexte pour l'IA
      const contextPrompt = `[Contexte : Je regarde la leçon "${currentLesson?.title}" du cours "${course?.title}"] \n\n ${aiInput}`
      const response = await aiApi.ask(contextPrompt)
      setAiMessages(prev => [...prev, { role: 'assistant', content: response.answer }])
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: "Désolé, je rencontre une petite difficulté technique." }])
    } finally {
      setAiLoading(false)
    }
  }

  const currentIndex = lessons.indexOf(currentLesson)
  const completedLessonsCount = lessons.filter(l => l.is_completed).length
  const progress = lessons.length > 0 ? Math.round((completedLessonsCount / lessons.length) * 100) : 0
  
  const isLastLesson = currentIndex === lessons.length - 1
  const isFirstLesson = currentIndex === 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading your classroom...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] -m-6 lg:-m-10 relative">
      
      {/* AI Floating Helper */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4">
        {showAiHelper && (
          <div className="w-80 h-96 glass-card border-blue-500/30 flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
            <header className="p-4 border-b border-white/5 bg-blue-600/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Assistant</span>
              </div>
              <button onClick={() => setShowAiHelper(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {aiMessages.length === 0 && (
                <div className="text-center space-y-2 pt-8">
                  <Sparkles className="w-8 h-8 text-blue-500/30 mx-auto" />
                  <p className="text-[10px] text-slate-500 font-medium">Posez une question sur cette leçon !</p>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-xl text-[11px] leading-relaxed ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-slate-300'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-2 rounded-xl flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                    <span className="text-[10px] text-slate-500 italic">L'IA réfléchit...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-white/5 bg-white/[0.02]">
              <div className="relative">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiAsk()}
                  placeholder="Posez votre question..."
                  className="w-full bg-background border border-white/10 rounded-xl py-2 pl-3 pr-10 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white"
                />
                <button 
                  onClick={handleAiAsk}
                  disabled={!aiInput.trim() || aiLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
        <button 
          onClick={() => setShowAiHelper(!showAiHelper)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${
            showAiHelper ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white shadow-blue-600/40'
          }`}
        >
          {showAiHelper ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          {!showAiHelper && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse"></span>}
        </button>
      </div>

      {/* Certificate Success Modal */}
      {showCertificate && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card p-12 text-center max-w-md space-y-6 border-blue-500/30">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(37,99,235,0.5)]">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                Congratulations! <PartyPopper className="w-6 h-6 text-yellow-400" />
              </h2>
              <p className="text-slate-400">You have successfully completed <b>{course?.title}</b>. Your expertise is now officially recognized!</p>
            </div>
            <button 
              onClick={() => setShowCertificate(false)}
              className="premium-button w-full py-4"
            >
              Back to Course
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-white/5 bg-card/30 backdrop-blur-md flex items-center justify-between px-8 z-10">
        <div className="flex items-center gap-4">
          <Link href="/courses" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="h-6 w-px bg-white/10"></div>
          <div>
            <h1 className="text-sm font-bold text-white line-clamp-1">{course?.title}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Lesson {currentIndex + 1} of {lessons.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Your Progress</p>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-white">{progress}%</span>
            </div>
          </div>
          <button 
            onClick={() => setShowCertificate(true)}
            disabled={progress < 100}
            className={`py-2 px-6 text-xs rounded-xl font-bold transition-all ${
              progress === 100 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
            }`}
          >
            Claim Certificate
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 bg-background">
          <div className="relative aspect-video rounded-3xl bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
            {currentLesson?.video_url ? (
               <iframe 
                src={currentLesson.video_url.includes('youtube.com') 
                  ? currentLesson.video_url.replace('watch?v=', 'embed/') 
                  : currentLesson.video_url} 
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            ) : course?.video_url ? (
               <iframe 
                src={course.video_url.includes('youtube.com') 
                  ? course.video_url.replace('watch?v=', 'embed/') 
                  : course.video_url} 
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                <Video className="w-20 h-20 mb-4 opacity-20" />
                <p className="text-sm font-medium">No video available for this lesson</p>
              </div>
            )}

            {/* Course Preview Badge Overlay */}
            {!currentLesson?.video_url && course?.video_url && (
              <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-10 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Course Preview
              </div>
            )}
          </div>

          <div className="max-w-4xl space-y-6 pb-20">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{currentLesson?.title}</h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                currentLesson?.is_completed 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}>
                {currentLesson?.is_completed ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs font-bold">{currentLesson?.is_completed ? 'Completed' : 'Current Lesson'}</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-slate-400 leading-relaxed text-lg">
                {currentLesson?.content || "No content description provided for this lesson."}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-8 border-t border-white/5">
              <button 
                disabled={isFirstLesson}
                onClick={() => setCurrentLesson(lessons[currentIndex - 1])}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Lesson
              </button>
              <button 
                onClick={handleNextLesson}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl transition-all text-sm font-bold text-white shadow-xl ${
                  isLastLesson 
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                }`}
              >
                {isLastLesson ? 'Finish Course' : 'Next Lesson'}
                {!isLastLesson && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Curriculum */}
        <div className="w-96 border-l border-white/5 bg-card/20 backdrop-blur-sm overflow-y-auto hidden xl:block">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-blue-500" />
              Course Curriculum
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {lessons.map((lesson, index) => {
              const isActive = currentLesson?.id === lesson.id;
              const isCompleted = lesson.is_completed;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLesson(lesson)}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl transition-all group ${
                    isActive ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}m
                      </div>
                    </div>
                  </div>
                  {isActive && <Play className="w-4 h-4 text-blue-500 animate-pulse" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
