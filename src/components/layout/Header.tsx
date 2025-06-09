import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Brain, BarChart2, User, LogOut, ExternalLink, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Check Sanity', path: '/create' },
    { name: 'PES Investigator', path: '/pes-investigator' },
    { name: 'Documentation', path: '/documentation' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-slate-900"
            >
              <Brain className="h-8 w-8 text-violet-600" />
              <span>AI Sanity Check</span>
            </Link>

            {/* HG Labs Badge */}
            <a
              href="https://hg-labs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all hover:from-slate-900 hover:to-black hover:shadow-xl md:inline-flex"
            >
              <ExternalLink className="mr-1.5 h-3 w-3" />
              Powered by HG Labs
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-violet-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center space-x-4 md:flex">
            {user ? (
              <>
                <Link to="/dashboard\" className="btn-primary">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Tests
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="text-slate-700 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute inset-x-0 top-16 z-50 bg-white px-4 py-5 shadow-lg md:hidden">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2 py-1 text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-violet-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile HG Labs Badge */}
            <a
              href="https://hg-labs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-slate-900 hover:to-black"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Powered by HG Labs
            </a>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="mt-2 inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Tests
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center px-2 py-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="mt-2 inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;