import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setUnverifiedEmail(null);
    try {
      await login(data.email, data.password);
      navigate('/backlog');
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email);
      } else {
        setError('root', { message: err.message });
      }
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await apiFetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      toast.success('Verification email resent — check your inbox');
    } catch {
      toast.error('Failed to resend — please try again');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-8">Sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white
                       outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm text-gray-400">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white
                       outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        {errors.root && (
          <p className="text-red-400 text-sm">{errors.root.message}</p>
        )}
        {unverifiedEmail && (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-3 text-sm">
            <p className="text-yellow-300 mb-2">
              Please verify your email before signing in.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
            >
              {resending ? 'Resending…' : 'Resend verification email'}
            </button>
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                     text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-gray-400 text-sm mt-6 text-center">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
          Register
        </Link>
      </p>
    </div>
  );
}
