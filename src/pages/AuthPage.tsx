import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, Bot, KeyRound, AlertCircle } from 'lucide-react';
import { signIn, signUp, continueAsGuest, resetPassword } from '../lib/auth';
import GuestWizard from '../components/wizard/GuestWizard';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo || '/';
  const successMessage = (location.state as any)?.message;

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  // Show success message if redirected from password reset
  useEffect(() => {
    if (successMessage) {
      setResetMessage(successMessage);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password);
        await signIn(email, password);
        navigate(returnTo);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetMessage('Check your email for password reset instructions');
        setError('');
      } else {
        await signIn(email, password);
        navigate(returnTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!showGuestInput) {
      setShowGuestInput(true);
      return;
    }

    if (!guestEmail) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Check if user has already completed the wizard
      const wizardCompleted = localStorage.getItem('guest_wizard_completed');
      
      if (!wizardCompleted) {
        // Show wizard first
        setShowWizard(true);
        setLoading(false);
        return;
      }

      await continueAsGuest(guestEmail);
      setGuestMessage('Check your email for the magic link to continue!');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Guest access failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWizardComplete = async () => {
    setShowWizard(false);
    setLoading(true);
    try {
      await continueAsGuest(guestEmail);
      setGuestMessage('Check your email for the magic link to continue!');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Guest access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            {mode === 'reset' ? (
              <KeyRound className="h-6 w-6 text-violet-600" />
            ) : (
              <Lock className="h-6 w-6 text-violet-600" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            {mode === 'signin' ? 'Sign in to your account' : 
             mode === 'signup' ? 'Create your account' :
             'Reset your password'}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {guestMessage && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              {guestMessage}
            </div>
          )}

          {resetMessage && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              {resetMessage}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-slate-300 pl-10 focus:border-violet-500 focus:ring-violet-500"
                  placeholder="Email address"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-slate-300 pl-10 focus:border-violet-500 focus:ring-violet-500"
                    placeholder="Password"
                  />
                </div>
              </div>
            )}
          </div>

          {mode === 'signin' && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-sm font-medium text-violet-600 hover:text-violet-500"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <User className="mr-2 h-5 w-5" />
              )}
              {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Sign up' : 'Reset Password'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-2 text-slate-500">Or</span>
            </div>
          </div>

          {showGuestInput ? (
            <div>
              <div className="mb-4">
                <label htmlFor="guestEmail" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="block w-full rounded-md border-slate-300 pl-10 focus:border-violet-500 focus:ring-violet-500"
                    placeholder="Enter your email to continue as guest"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleGuestAccess}
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                <Bot className="mr-2 h-5 w-5 text-slate-400" />
                Send Magic Link
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGuestAccess}
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              <Bot className="mr-2 h-5 w-5 text-slate-400" />
              Continue as Guest
            </button>
          )}
        </form>

        <div className="text-center text-sm">
          {mode === 'signin' ? (
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setResetMessage('');
                }}
                className="font-medium text-violet-600 hover:text-violet-500"
              >
                Sign up
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setResetMessage('');
                }}
                className="font-medium text-violet-600 hover:text-violet-500"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-slate-600">
              Remember your password?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setResetMessage('');
                }}
                className="font-medium text-violet-600 hover:text-violet-500"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>

      <GuestWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        userEmail={guestEmail}
        onComplete={handleWizardComplete}
      />
    </div>
  );
};

export default AuthPage;