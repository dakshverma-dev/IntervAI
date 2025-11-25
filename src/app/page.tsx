'use client';

import { ArrowRight, Code2, CheckCircle, Play, BrainCircuit, Mic, FileText, Award, FileBarChart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">IntervAi</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#workflow" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Recruiter Dashboard</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Log in
            </Link>
            <Link
              href="/practice"
              className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            >
              Start Interview
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-gray-300">AI-Powered HR Replacement</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 pb-2">
            The Future of<br />
            Technical Hiring
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Replace your first-round technical interviews with an autonomous AI agent.
            Real-time voice interaction, code analysis, and automated scoring—24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/practice"
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 flex items-center justify-center"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Try Demo Interview
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 backdrop-blur-sm"
            >
              Recruiter Dashboard
            </Link>
          </div>

          {/* Workflow Visualization */}
          <div id="workflow" className="mt-32 relative mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">End-to-End Autonomous Hiring</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 -translate-y-1/2 -z-10" />

              {[
                { icon: Mic, title: "Voice Input", desc: "Natural conversation" },
                { icon: FileText, title: "Resume Parsing", desc: "Skill extraction" },
                { icon: Code2, title: "AI Interview", desc: "Real-time coding" },
                { icon: BrainCircuit, title: "AI Scoring", desc: "Tech + Behavioral" },
                { icon: FileBarChart, title: "Final Report", desc: "Actionable insights" }
              ].map((step, i) => (
                <div key={i} className="bg-black/80 border border-white/10 backdrop-blur-sm p-6 rounded-2xl flex flex-col items-center text-center group hover:border-purple-500/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-purple-400">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Complete Hiring Platform</h2>
            <p className="text-gray-400 text-lg max-w-xl">
              Everything you need to automate your technical screening process with precision and fairness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Card - Real-time Feedback */}
            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10 group-hover:bg-purple-600/20 transition-colors" />
              <div className="h-full flex flex-col justify-between relative z-10">
                <div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-400">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Real-time Code & Complexity Analysis</h3>
                  <p className="text-gray-400 max-w-md">
                    Our AI evaluates code efficiency (Big O), style, and correctness in real-time. It provides instant feedback to candidates and detailed technical reports to recruiters.
                  </p>
                </div>
                <div className="mt-8 flex items-center space-x-4 text-sm font-mono text-gray-500">
                  <div className="bg-black/50 rounded-lg px-3 py-2 border border-white/5">O(n log n)</div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                  <div className="bg-green-900/20 text-green-400 rounded-lg px-3 py-2 border border-green-500/20">O(n) Optimized</div>
                </div>
              </div>
            </div>

            {/* Tall Card - Interactive Interview */}
            <div className="md:row-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent z-10" />
              <div className="h-full flex flex-col relative z-20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Voice-First Interview</h3>
                <p className="text-gray-400 mb-8">
                  A natural, conversational AI that conducts interviews just like a human. It asks follow-up questions, probes for understanding, and evaluates communication skills.
                </p>
                <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs">AI</div>
                    <div className="bg-blue-900/20 rounded-lg rounded-tl-none p-3 text-sm text-blue-100">
                      Can you explain why you chose a HashMap here?
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-white/10 rounded-lg rounded-tr-none p-3 text-sm text-gray-200">
                      To optimize lookup time to O(1).
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">You</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs">AI</div>
                    <div className="bg-blue-900/20 rounded-lg rounded-tl-none p-3 text-sm text-blue-100">
                      Excellent. How would that scale with memory?
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Card - Resume Parsing */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 group hover:border-green-500/30 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 text-green-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Automated Resume Parsing</h3>
              <p className="text-gray-400 text-sm">
                Instantly extracts skills and experience to tailor the interview questions specifically to the candidate&apos;s background.
              </p>
            </div>

            {/* Standard Card - AI Scoring */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 group hover:border-yellow-500/30 transition-colors">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6 text-yellow-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dual-Axis Scoring</h3>
              <p className="text-gray-400 text-sm">
                Comprehensive evaluation covering both Technical Proficiency (code quality, correctness) and Behavioral traits (communication, problem-solving).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Dashboard Preview */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Recruiter Dashboard</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Get a bird&apos;s-eye view of your hiring pipeline. Compare candidates, view detailed reports, and make data-driven hiring decisions.
              </p>
              <ul className="space-y-4">
                {[
                  "Detailed Candidate Reports",
                  "Skill Gap Analysis",
                  "Plagiarism Detection",
                  "Automated Shortlisting"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 font-medium flex items-center">
                  Explore Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-black border border-white/10 rounded-xl p-6 shadow-2xl">
                {/* Mock Dashboard UI */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div className="font-bold">Candidate Ranking</div>
                    <div className="text-xs text-gray-500">Last 7 Days</div>
                  </div>
                  {[
                    { name: "Alex Chen", score: 98, role: "Senior Backend" },
                    { name: "Sarah Jones", score: 95, role: "Full Stack" },
                    { name: "Mike Ross", score: 92, role: "Frontend" }
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold">
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.role}</div>
                        </div>
                      </div>
                      <div className="text-green-400 font-bold">{c.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to modernize your hiring?</h2>
          <p className="text-xl text-gray-400 mb-12">
            Start screening candidates with AI today. Save time, reduce bias, and hire the best talent.
          </p>
          <Link
            href="/practice"
            className="inline-flex items-center bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>© 2025 IntervAi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
