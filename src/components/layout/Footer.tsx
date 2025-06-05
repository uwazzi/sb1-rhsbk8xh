import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 py-12 text-slate-300">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-violet-400" />
              <span className="text-xl font-bold text-white">AI Sanity Check</span>
            </Link>
            <p className="mt-4 text-sm">
              Advanced psychological evaluation for AI agents and large language models.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Check Sanity
                </Link>
              </li>
              <li>
                <Link
                  to="/documentation"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/documentation"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  NEO-PI-R
                </Link>
              </li>
              <li>
                <Link
                  to="/documentation"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Perth Empathy Scale
                </Link>
              </li>
              <li>
                <Link
                  to="/documentation"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  PCL-R
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} AI Sanity Check. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;