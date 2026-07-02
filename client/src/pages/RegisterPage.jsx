import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import AuthBrandPanel from '../components/auth/AuthBrandPanel.jsx';
import AuthBrandMark from '../components/auth/AuthBrandMark.jsx';
import AuthScreen from '../components/auth/AuthScreen.jsx';
import IconBadge from '../components/auth/IconBadge.jsx';
import StepIndicator from '../components/auth/StepIndicator.jsx';
import Field from '../components/ui/Field.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function RegisterPage() {
  const { register: registerUser, resendVerification } = useAuth();
  const [pendingEmail, setPendingEmail] = useState(null);
  const [verifyToken, setVerifyToken] = useState(null);
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    try {
      const token = await registerUser(data.email, data.password);
      setVerifyToken(token);
      setPendingEmail(data.email);
    } catch (err) {
      setError('root', { message: err.message });
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const token = await resendVerification(pendingEmail);
      if (token) setVerifyToken(token);
      toast.success('Verification email resent — check your inbox');
    } catch {
      toast.error('Failed to resend — please try again');
    } finally {
      setResending(false);
    }
  }

  if (pendingEmail) {
    return (
      <AuthScreen maxWidthClass="max-w-[480px]" gapClass="gap-8">
        <StepIndicator states={['done', 'active', 'pending']} />
        <IconBadge size={108}>
          <svg width="48" height="38" viewBox="0 0 48 38" fill="none" stroke="currentColor">
            <rect x="1" y="1" width="46" height="36" rx="6" strokeWidth="2" />
            <path
              d="M1 9L24 25L47 9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconBadge>
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[34px] md:text-[46px] font-bold tracking-[-0.03em]">
            Check your inbox
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.65] text-content-muted">
            We sent a verification link to{' '}
            <span className="text-content font-semibold">{pendingEmail}</span>.
            <br />
            Click the link to verify your account, then{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover">
              sign in
            </Link>
            .
          </p>
        </div>
        <div className="rounded-[10px] border border-edge bg-surface-card px-7 py-[15px]">
          <p className="text-sm text-content-subtle">
            Didn&apos;t receive it?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-accent hover:text-accent-hover font-medium disabled:opacity-50"
            >
              {resending ? 'Resending…' : 'Resend verification email'}
            </button>
          </p>
        </div>
        {verifyToken && (
          <div className="rounded-[10px] border border-[oklch(76%_0.19_55_/_0.28)] bg-brand/5 px-7 py-[15px]">
            <p className="text-sm text-content-subtle">
              <span className="font-semibold text-brand">Demo mode:</span> email
              delivery is limited, so verify directly here —{' '}
              <Link
                to={`/verify-email?token=${verifyToken}`}
                className="text-accent hover:text-accent-hover font-medium"
              >
                Verify now
              </Link>
              .
            </p>
          </div>
        )}
      </AuthScreen>
    );
  }

  return (
    <div className="relative flex-1 flex">
      <div
        className="hidden lg:block pointer-events-none absolute inset-x-0 top-0 h-[260px] z-[1]"
        style={{
          background:
            'linear-gradient(180deg, oklch(76% 0.19 55 / 0.10) 0%, oklch(76% 0.19 55 / 0.04) 60%, transparent 100%)',
        }}
      />
      <AuthBrandPanel />
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <AuthBrandMark />
        <div className="relative z-10 flex-1 flex flex-col lg:items-center lg:justify-center px-6 pb-8 lg:py-12">
          <div className="w-full max-w-md">
            <h1 className="text-[32px] md:text-[38px] font-bold tracking-[-0.028em] mb-1.5 md:mb-2">
              Create account
            </h1>
            <p className="text-[14px] md:text-[15px] text-content-muted mb-7 md:mb-10">
              Join and start building your library.
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
              <Field
                label="Password"
                error={errors.password?.message}
                className="mb-7 md:mb-[34px]"
              >
                <Input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Choose a strong password"
                />
              </Field>
              {errors.root && (
                <p className="text-red-400 text-sm mb-4">{errors.root.message}</p>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
            <p className="text-content-subtle text-sm mt-[22px] md:mt-[26px] text-center">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-accent hover:text-accent-hover font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
