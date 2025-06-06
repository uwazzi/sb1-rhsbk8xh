import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BarChart2, FileText, Lock, Scale, Shield, Bot } from 'lucide-react';

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
                
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
                Flip the script: Psychologically Evaluate AI Systems
              </h1>
              <p className="mb-8 text-lg text-slate-200 md:text-xl">
                After decades of algorithmic profiling of humans, it's time for AI to undergo the same rigorous psychological assessment. Ensure your AI systems meet the same standards we're held to.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/create"
                  className="inline-flex items-center justify-center rounded-md bg-violet-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-violet-700"
                >
                  Check Sanity
                </Link>
                <Link
                  to="/documentation"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Learn More
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
              Comprehensive Psychological Evaluation
            </h2>
            <p className="text-lg text-slate-600">
              Using the same validated psychological frameworks that have been used to assess humans,
              we provide unprecedented transparency into AI behavior and cognition.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* NEO-PI-R */}
            <div className="card group hover:shadow-md">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Brain className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">NEO Personality Inventory</h3>
              <p className="mb-4 text-slate-600">
                Evaluate AI systems across the Big Five personality dimensions, revealing potential biases and behavioral patterns that traditional testing misses.
              </p>
              <Link
                to="/documentation"
                className="inline-flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700"
              >
                Learn more
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

            {/* PES */}
            <div className="card group hover:shadow-md">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Perth Empathy Scale</h3>
              <p className="mb-4 text-slate-600">
                Measure your AI's true empathetic capabilities and emotional intelligence, ensuring it can genuinely understand and respond to human emotions.
              </p>
              <Link
                to="/documentation"
                className="inline-flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700"
              >
                Learn more
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

            {/* PCL-R */}
            <div className="card group hover:shadow-md">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <BarChart2 className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Psychopathy Checklist</h3>
              <p className="mb-4 text-slate-600">
                Detect concerning behavioral patterns and manipulative tendencies before deployment, ensuring your AI systems are psychologically safe.
              </p>
              <Link
                to="/documentation"
                className="inline-flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700"
              >
                Learn more
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
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-slate-900">Balance Power</h3>
              <p className="text-slate-600">
                Restore equilibrium to the human-AI relationship by subjecting AI to the same psychological scrutiny we face.
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
              Join the movement for psychological transparency in artificial intelligence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/create"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-violet-900 shadow-lg transition-all hover:bg-slate-100"
              >
                Check Sanity
              </Link>
              <Link
                to="/documentation"
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                View Documentation
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
              Secure and Transparent
            </h3>
            <p className="mb-4 text-slate-600">
              Your AI evaluation data is encrypted and protected. We never store AI responses
              or use them for training our own systems.
            </p>
            <a
              href="https://github.com/yourusername/ai-sanity-check"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              View Our Transparency Report
              <svg
                className="ml-1 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;