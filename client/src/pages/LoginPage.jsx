import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';
import AuthBrandPanel from '../components/auth/AuthBrandPanel.jsx';
import AuthBrandMark from '../components/auth/AuthBrandMark.jsx';
import Field from '../components/ui/Field.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

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
    <div className="flex-1 flex">
      <AuthBrandPanel />
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <AuthBrandMark />
        <div className="relative z-10 flex-1 flex flex-col lg:items-center lg:justify-center px-6 pb-8 lg:py-12">
          <div className="w-full max-w-md">
            <h1 className="text-[32px] md:text-[38px] font-bold tracking-[-0.028em] mb-1.5 md:mb-2">
              Welcome back.
            </h1>
            <p className="text-[14px] md:text-[15px] text-content-muted mb-7 md:mb-10">
              Sign in to continue your journey.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Field
                label="Email"
                error={errors.email?.message}
                className="mb-4 md:mb-[22px]"
              >
                <Input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </Field>

              <div className="mb-7 md:mb-[34px]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-medium text-content-muted">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-accent hover:text-accent-hover"
                  >
                    <span className="lg:hidden">Forgot?</span>
                    <span className="hidden lg:inline">Forgot password?</span>
                  </Link>
                </div>
                <Input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {errors.root && (
                <p className="text-red-400 text-sm mb-4">{errors.root.message}</p>
              )}

              {unverifiedEmail && (
                <div className="mb-4 rounded-lg border border-[oklch(76%_0.19_55_/_0.35)] bg-[oklch(76%_0.19_55_/_0.1)] p-3 text-sm">
                  <p className="text-brand mb-2">
                    Please verify your email before signing in.
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-accent hover:text-accent-hover disabled:opacity-50"
                  >
                    {resending ? 'Resending…' : 'Resend verification email'}
                  </button>
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
            <p className="text-content-subtle text-sm mt-[22px] md:mt-[26px] text-center">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-accent hover:text-accent-hover font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
