import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BarChart2, FileText, Lock, Scale, Shield, Bot, Cpu, Zap, Eye, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-violet-900 py-16 text-white md:py-24">
        <div className="container-custom">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="fade-in">
              <div className="mb-4 inline-flex items-center rounded-full bg-violet-800/30 px-4 py-2 text-sm backdrop-blur-sm">
                <Scale className="mr-2 h-4 w-4" />
                Flip the script
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
                Psychologically Evaluate AI Systems
              </h1>
              <p className="mb-8 text-lg text-slate-200 md:text-xl">
                After decades of algorithmic profiling of humans, it's time for AI to undergo the same rigorous psychological assessment. Ensure your AI systems meet the same standards we're held to.
              </p>
              
              {/* Demo Mode Notice */}
              {!isSupabaseConfigured && (
                <div className="mb-6 rounded-lg bg-amber-900/30 border border-amber-700/50 p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-200">Demo Mode</h4>
                      <p className="text-sm text-amber-300 mt-1">
                        Running with local LLM only. Full privacy, no backend required. Perfect for testing!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/empathy-investigator"
                  className="inline-flex items-center justify-center rounded-md bg-violet-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-violet-700"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Empathy Investigator
                </Link>
                <Link
                  to="/view-tests"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Test Results
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative h-64 w-64 md:h-80 md:w-80">
                <div className="absolute inset-0 animate-pulse-slow rounded-full bg-violet-500/30 blur-3xl"></div>
                <div className="relative flex h-full items-center justify-center rounded-full bg-slate-800/50 p-8 backdrop-blur-sm">
                  <Brain className="h-32 w-32 text-violet-400 md:h-40 md:w-40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Local LLM Empathy Assessment
            </h2>
            <p className="text-lg text-slate-600">
              Using validated psychological frameworks with complete privacy and offline capability.
              All processing happens in your browser with local language models.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Perth Empathy Scale */}
            <div className="card group hover:shadow-md">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Perth Empathy Scale</h3>
              <p className="mb-4 text-slate-600">
                Evaluate AI systems across four empathy dimensions using the validated PES framework, measuring both cognitive and affective empathy.
              </p>
              <Link
                to="/empathy-investigator"
                className="inline-flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700"
              >
                Start Assessment
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>

            {/* Local LLM */}
            <div className="card group hover:shadow-md">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Cpu className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Local LLM Processing</h3>
              <p className="mb-4 text-slate-600">
                Run empathy assessments entirely in your browser using WebLLM. No data leaves your device, ensuring complete privacy.
              </p>
              <Link
                to="/empathy-investigator"
                className="inline-flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700"
              >
                Try Local Assessment
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>

            {/* Public Results */}
            <div className="card group hover:shadow-md">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Public Test Results</h3>
              <p className="mb-4 text-slate-600">
                Explore community test results and empathy assessments. All results are publicly viewable for transparency and research.
              </p>
              <Link
                to="/view-tests"
                className="inline-flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700"
              >
                View Results
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="container-custom">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Why AI Psychological Assessment Matters
            </h2>
            <p className="text-lg text-slate-600">
              In an era where AI systems increasingly influence human lives, psychological transparency
              and accountability are non-negotiable.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-slate-900">Protect Users</h3>
              <p className="text-slate-600">
                Identify potentially harmful behavioral patterns and psychological risks before they impact your users.
              </p>
            </div>

            <div className="card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-slate-900">Complete Privacy</h3>
              <p className="text-slate-600">
                Run assessments entirely in your browser with local LLMs. No data leaves your device, ensuring complete privacy.
              </p>
            </div>

            <div className="card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-slate-900">Build Trust</h3>
              <p className="text-slate-600">
                Create transparency and accountability in AI systems through rigorous psychological evaluation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-violet-900 py-16 text-white md:py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Ready to evaluate your AI system?
            </h2>
            <p className="mb-8 text-lg text-violet-100">
              Join the movement for psychological transparency in artificial intelligence with complete privacy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/empathy-investigator"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-violet-900 shadow-lg transition-all hover:bg-slate-100"
              >
                <Brain className="mr-2 h-4 w-4" />
                Start Assessment
              </Link>
              <Link
                to="/view-tests"
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Public Results
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-slate-100 p-3">
              <Lock className="h-6 w-6 text-slate-700" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              Secure and Private
            </h3>
            <p className="mb-4 text-slate-600">
              Your AI evaluation data never leaves your browser. All processing happens locally
              using WebLLM technology for complete privacy and offline capability.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="inline-flex items-center rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                <Cpu className="mr-2 h-4 w-4" />
                Local Processing
              </div>
              <div className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                <Lock className="mr-2 h-4 w-4" />
                Zero Data Collection
              </div>
              <div className="inline-flex items-center rounded-md bg-violet-100 px-3 py-1 text-sm font-medium text-violet-800">
                <Zap className="mr-2 h-4 w-4" />
                Offline Capable
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;