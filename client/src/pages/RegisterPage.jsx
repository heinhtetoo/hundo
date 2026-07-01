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
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    try {
      await registerUser(data.email, data.password);
      setPendingEmail(data.email);
    } catch (err) {
      setError('root', { message: err.message });
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await resendVerification(pendingEmail);
      toast.success('Verification email resent — check your inbox');
    } catch {
      toast.error('Failed to resend — please try again');
    } finally {
      setResending(false);
    }
  }

  if (pendingEmail) {
    return (
      <AuthScreen>
        <IconBadge>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </IconBadge>
        <div>
          <h1 className="text-3xl font-bold mb-3">Check your inbox</h1>
          <p className="text-content-muted">
            We sent a verification link to{' '}
            <span className="text-content font-medium">{pendingEmail}</span>.
          </p>
          <p className="text-content-muted mt-2">
            Click the link in the email to verify your account, then{' '}
            <Link
              to="/login"
              className="text-accent hover:text-accent-hover font-medium"
            >
              sign in
            </Link>
            .
          </p>
        </div>
        <p className="text-content-subtle text-sm">
          Didn&apos;t receive it?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-accent hover:text-accent-hover disabled:opacity-50"
          >
            {resending ? 'Resending…' : 'Resend verification email'}
          </button>
        </p>
      </AuthScreen>
    );
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
