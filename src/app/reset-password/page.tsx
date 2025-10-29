'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/ui/Header';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors([]);

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
        if (data.details) {
          setValidationErrors(data.details);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { label: '', color: '', width: '0%' };
    if (pwd.length < 8) return { label: 'Too short', color: 'bg-red-500', width: '25%' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[@$!%*?&]/.test(pwd)) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (strength <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          {!success && token ? (
            <>
              <div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                  Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Enter your new password below.
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                    <p className="font-semibold mb-2">Password requirements:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {validationErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="New password"
                    />
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Password strength:</span>
                          <span className={`font-medium ${
                            strength.label === 'Strong' ? 'text-green-600' :
                            strength.label === 'Medium' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {strength.label}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${strength.color}`}
                            style={{ width: strength.width }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Confirm password"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded text-sm text-blue-800">
                  <p className="font-semibold mb-1">Password must contain:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character (@$!%*?&)</li>
                  </ul>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || !token || password !== confirmPassword}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          ) : success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Password Reset Successful
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Invalid Reset Link
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {error || 'The password reset link is invalid or has expired.'}
              </p>
              <div className="mt-6 space-y-2">
                <Link
                  href="/forgot-password"
                  className="block font-medium text-blue-600 hover:text-blue-500"
                >
                  Request a new reset link
                </Link>
                <Link
                  href="/login"
                  className="block font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
