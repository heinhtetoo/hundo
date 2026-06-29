import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api.js';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('idle');
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  async function handleVerify() {
    setStatus('loading');
    try {
      const res = await apiFetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  async function handleResend(e) {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResending(true);
    try {
      await apiFetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      toast.success('If that email needs verification, a new link is on its way');
      setResendEmail('');
    } catch {
      toast.error('Failed to resend — please try again');
    } finally {
      setResending(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Invalid link</h1>
        <p className="text-gray-400 mb-6">
          This verification link is missing a token. Please use the link from your email.
        </p>
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
          Back to sign in
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Email verified!</h1>
        <p className="text-gray-400 mb-6">
          Your account is confirmed. You can now sign in.
        </p>
        <Link
          to="/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white
                     font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-3xl font-bold mb-4">Link expired or invalid</h1>
        <p className="text-gray-400 mb-6">
          This verification link has already been used or has expired. Enter your
          email below and we'll send a fresh one.
        </p>
        <form onSubmit={handleResend} className="flex gap-2">
          <input
            type="email"
            value={resendEmail}
            onChange={e => setResendEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-gray-800 text-white placeholder-gray-500
                       rounded-lg px-4 py-2 text-sm outline-none
                       focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={resending || !resendEmail.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white px-4 py-2 rounded-lg text-sm transition-colors
                       whitespace-nowrap"
          >
            {resending ? 'Sending…' : 'Resend link'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Verify your email</h1>
      <p className="text-gray-400 mb-8">
        Click the button below to confirm your email address and activate your account.
      </p>
      <button
        onClick={handleVerify}
        disabled={status === 'loading'}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white
                   font-medium px-6 py-2.5 rounded-lg transition-colors"
      >
        {status === 'loading' ? 'Verifying…' : 'Verify my account'}
      </button>
    </div>
  );
}
