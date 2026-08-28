'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
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

    const supabase = createClient();
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    if (isSignUp && !result.data.session) {
      setMessage('Check your email to confirm your account, then return here to sign in.');
      setIsLoading(false);
      return;
    }

    window.location.assign('/dashboard');
  }

  function switchMode() {
    setIsSignUp((value) => !value);
    setError('');
    setMessage('');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-950">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><Sparkles className="h-5 w-5" /></span>
          Beacon
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md sm:p-9">
          <div className="mb-8"><h1 className="text-2xl font-bold tracking-tight text-slate-950">{isSignUp ? 'Create your account' : 'Welcome back'}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{isSignUp ? 'Start measuring your brand’s visibility across AI search.' : 'Sign in to continue tracking your generative search visibility.'}</p></div>
          {error && <div role="alert" className="mb-5 flex gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
          {message && <div role="status" className="mb-5 rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-sm text-teal-700">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
            <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><input id="password" type="password" required minLength={6} autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
            <button type="submit" disabled={isLoading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}{isLoading ? (isSignUp ? 'Creating account…' : 'Signing in…') : (isSignUp ? 'Create account' : 'Sign In')}</button>
          </form>
          <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500"><span>{isSignUp ? 'Already have an account?' : 'Don’t have an account?'}</span>{' '}<button type="button" onClick={switchMode} className="font-semibold text-blue-600 hover:text-blue-700">{isSignUp ? 'Sign in' : 'Sign up'}</button></div>
        </div>
        <Link href="/" className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
      </div>
    </main>
  );
}
