import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { updatePassword } from '../lib/auth';
import { supabase } from '../lib/supabase';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        // Try to get session from URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) throw error;
            if (data.session) {
              setIsValidSession(true);
            }
          } catch (err) {
            console.error('Error setting session:', err);
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      }
    };

    checkSession();
  }, []);

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValidation.isValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password updated successfully. Please sign in with your new password.' 
          } 
        });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Verifying reset link...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Password Updated!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            <Lock className="h-6 w-6 text-violet-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  {error.includes('Invalid or expired') && (
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Go to login page
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-slate-300 pr-10 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border-slate-300 pr-10 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          {password && (
            <div className="rounded-md bg-slate-50 p-4">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Password Requirements:</h4>
              <ul className="space-y-1 text-sm">
                <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-slate-500'}`}>
                  <CheckCircle className={`h-4 w-4 mr-2 ${passwordValidation.minLength ? 'text-green-500' : 'text-slate-400'}`} />
                  At least 8 characters
                </li>
                <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-slate-500'}`}>
                  <CheckCircle className={`h-4 w-4 mr-2 ${passwordValidation.hasUpperCase ? 'text-green-500' : 'text-slate-400'}`} />
                  One uppercase letter
                </li>
                <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-slate-500'}`}>
                  <CheckCircle className={`h-4 w-4 mr-2 ${passwordValidation.hasLowerCase ? 'text-green-500' : 'text-slate-400'}`} />
                  One lowercase letter
                </li>
                <li className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-slate-500'}`}>
                  <CheckCircle className={`h-4 w-4 mr-2 ${passwordValidation.hasNumbers ? 'text-green-500' : 'text-slate-400'}`} />
                  One number
                </li>
                <li className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-slate-500'}`}>
                  <CheckCircle className={`h-4 w-4 mr-2 ${passwordValidation.hasSpecialChar ? 'text-green-500' : 'text-slate-400'}`} />
                  One special character
                </li>
              </ul>
            </div>
          )}

          {/* Password Match Indicator */}
          {confirmPassword && (
            <div className={`text-sm ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
              {password === confirmPassword ? (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Passwords match
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Passwords do not match
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-violet-600 hover:text-violet-500"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;