'use client';

import { ArrowLeft, Code2, BarChart3, Users, Brain, Clock, Target, Trophy, CheckCircle, Zap, Shield, Cpu } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      title: "AI-Powered Code Analysis",
      description: "Advanced machine learning algorithms analyze your code in real-time, providing instant feedback on syntax, logic, and performance optimization opportunities.",
      benefits: [
        "Real-time syntax and logic error detection",
        "Complexity analysis with Big O notation",
        "Performance bottleneck identification",
        "Code quality scoring and recommendations"
      ],
      colSpan: "md:col-span-2",
      gradient: "from-purple-500/20 to-blue-500/20"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-400" />,
      title: "Analytics Dashboard",
      description: "Track your progress with detailed analytics that show improvement over time, identify strengths and weaknesses, and provide actionable insights.",
      benefits: [
        "Performance tracking across sessions",
        "Skill gap analysis and recommendations",
        "Interview readiness scoring",
        "Progress visualization and trends"
      ],
      colSpan: "md:col-span-1",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Users className="w-8 h-8 text-green-400" />,
      title: "Interactive AI Coaching",
      description: "Get personalized guidance from our AI coach that adapts to your learning style and provides progressive hints when you're stuck.",
      benefits: [
        "Contextual hints and guidance",
        "Adaptive difficulty adjustment",
        "Communication skills coaching",
        "Interview best practices training"
      ],
      colSpan: "md:col-span-3",
      gradient: "from-green-500/20 to-emerald-500/20"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Clock className="w-6 h-6 text-orange-400" />,
      title: "Real-Time Metrics",
      description: "Monitor execution time, memory usage, and algorithmic complexity as you code."
    },
    {
      icon: <Target className="w-6 h-6 text-red-400" />,
      title: "Company-Specific Practice",
      description: "Practice with problems commonly asked at top tech companies like Google, Amazon, and Microsoft."
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-400" />,
      title: "Achievement System",
      description: "Unlock achievements as you solve problems and improve your coding interview skills."
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      title: "Plagiarism Detection",
      description: "Ensure candidate integrity with advanced code similarity analysis."
    },
    {
      icon: <Cpu className="w-6 h-6 text-pink-400" />,
      title: "System Design",
      description: "Practice high-level system design questions with interactive whiteboard tools."
    },
    {
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      title: "Speed Drills",
      description: "Timed challenges to improve your coding speed and efficiency under pressure."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="h-6 w-px bg-white/10"></div>
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/practice"
              className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            >
              Start Practice
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Powerful Features for<br />
            Modern Hiring
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Our platform combines cutting-edge AI with proven interview methodologies to create
            the most effective technical screening solution available.
          </p>
        </div>
      </section>

      {/* Core Features - Bento Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className={`${feature.colSpan} bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

                <div className="relative z-10">
                  <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Advanced Capabilities</h2>
            <p className="text-gray-400">Professional-grade tools for serious technical assessment</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="bg-black border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-all duration-300 group">
                <div className="mb-4 bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Streamlined process for candidates and recruiters</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 -z-10" />

            {[
              { title: "Select Problem", desc: "Choose from our curated library or upload custom challenges" },
              { title: "AI Interview", desc: "Candidate completes the coding challenge with AI guidance" },
              { title: "Auto-Scoring", desc: "System evaluates code quality, complexity, and behavior" },
              { title: "Detailed Report", desc: "Recruiters receive comprehensive insights and ranking" }
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-24 h-24 bg-black border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl z-10 relative">
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-blue-400">
                    {i + 1}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to upgrade your hiring?</h2>
          <p className="text-xl text-gray-400 mb-12">
            Join forward-thinking companies using IntervAi to find the best talent.
          </p>
          <Link
            href="/practice"
            className="inline-flex items-center bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200"
          >
            <Code2 className="w-5 h-5 mr-2" />
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <Logo className="mb-4" />
              <p className="text-gray-500 max-w-sm">
                The intelligent HR replacement platform.
                Automating technical interviews with human-like AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/practice" className="hover:text-white transition-colors">Practice Interviews</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/#testimonials" className="hover:text-white transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Team</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Hackathon</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>© 2025 IntervAi. Built for Hackathon. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}