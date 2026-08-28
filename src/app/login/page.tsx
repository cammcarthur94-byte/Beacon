'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const result = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/dashboard` },
          })
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

      if (result.error) {
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      if (isSignUp && !result.data.session) {
        setMessage('Account created! Please check your email to confirm your account, then sign in.');
        setIsLoading(false);
        return;
      }

      // Successful authentication -> redirect to dashboard
      window.location.assign('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  function switchMode() {
    setIsSignUp((value) => !value);
    setError('');
    setMessage('');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-950">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <Link
          href="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 transition hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          Beacon
        </Link>

        {/* Central Auth Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md sm:p-9">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isSignUp
                ? 'Start measuring your brand visibility across generative AI search engines.'
                : 'Sign in to access your GEO dashboard, prompt audits, and visibility metrics.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Status Message */}
          {message && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-sm text-teal-700"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading
                ? isSignUp
                  ? 'Creating account...'
                  : 'Signing in...'
                : isSignUp
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>

          {/* Mode Switch Toggle */}
          <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
            <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/"
          className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </main>
  );
}
