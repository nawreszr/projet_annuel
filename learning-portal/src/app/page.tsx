'use client'

import Link from 'next/link'
import { 
  BookOpen, 
  Bot, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Globe,
  Sparkles,
  LayoutDashboard
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Nexus</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#courses" className="hover:text-white transition-colors">Courses</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register" className="premium-button py-2 px-6 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles className="w-3 h-3" />
            Reinventing Education with AI
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Master Any Skill <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Personalized for You
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Nexus combines the world's best curriculum with advanced AI tutoring to give you a learning experience that's 10x faster and more effective.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link href="/register" className="premium-button text-lg px-10 py-4 flex items-center gap-3 w-full sm:w-auto justify-center">
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="px-10 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-3 w-full sm:w-auto justify-center">
              <LayoutDashboard className="w-5 h-5" />
              Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-10 group hover:bg-white/5 transition-all">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 group-hover:scale-110 transition-transform">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">24/7 AI Tutor</h3>
              <p className="text-slate-400 leading-relaxed">
                Get instant answers and personalized explanations whenever you're stuck. Our AI understands your context.
              </p>
            </div>

            <div className="glass-card p-10 group hover:bg-white/5 transition-all">
              <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-400 mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Adaptive Learning</h3>
              <p className="text-slate-400 leading-relaxed">
                Our platform adjusts to your pace, identifying knowledge gaps and reinforcing concepts in real-time.
              </p>
            </div>

            <div className="glass-card p-10 group hover:bg-white/5 transition-all">
              <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Expert Courses</h3>
              <p className="text-slate-400 leading-relaxed">
                Learn from industry leaders in technology, design, and business with high-quality, up-to-date content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-4xl font-extrabold text-white mb-2">50k+</p>
              <p className="text-sm text-slate-500 uppercase tracking-widest">Active Students</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-white mb-2">200+</p>
              <p className="text-sm text-slate-500 uppercase tracking-widest">Expert Courses</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-white mb-2">98%</p>
              <p className="text-sm text-slate-500 uppercase tracking-widest">Success Rate</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-white mb-2">24/7</p>
              <p className="text-sm text-slate-500 uppercase tracking-widest">AI Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass-card p-12 md:p-20 text-center relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform your future?</h2>
            <p className="text-slate-300 mb-10 max-w-xl mx-auto">
              Join thousands of students who are already learning smarter with Nexus.
            </p>
            <Link href="/register" className="premium-button text-lg px-12 py-4">
              Join Nexus Today
            </Link>
          </div>
          {/* Decorative blur */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/30 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/30 rounded-full blur-[100px]"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <BookOpen className="text-blue-500 w-6 h-6" />
          <span className="text-xl font-bold text-white">Nexus</span>
        </div>
        <p className="text-slate-500 text-sm">© 2026 Nexus Learning. All rights reserved.</p>
      </footer>
    </div>
  )
}
