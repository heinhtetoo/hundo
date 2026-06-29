import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [matchError, setMatchError] = useState('');

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Invalid link</h1>
        <p className="text-gray-400 mb-6">
          This reset link is missing a token. Please use the link from your
          email or{' '}
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
            request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMatchError('');
    if (password !== confirm) {
      setMatchError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Password reset!</h1>
        <p className="text-gray-400 mb-6">
          Your password has been updated. You can now sign in with your new
          password.
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
      <div className="max-w-md mx-auto mt-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Link expired or invalid</h1>
        <p className="text-gray-400 mb-6">
          This reset link has already been used or has expired. Request a new
          one below.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white
                     font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
      <p className="text-gray-400 mb-8">Enter a new password for your account.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          required
          minLength={8}
          className="bg-gray-800 text-white placeholder-gray-500 rounded-lg
                     px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          required
          className="bg-gray-800 text-white placeholder-gray-500 rounded-lg
                     px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {matchError && (
          <p className="text-red-400 text-sm">{matchError}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                     text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
