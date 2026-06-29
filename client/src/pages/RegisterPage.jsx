import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

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
      <div className="max-w-md mx-auto mt-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Check your inbox</h1>
        <p className="text-gray-400 mb-2">
          We sent a verification link to{' '}
          <span className="text-white font-medium">{pendingEmail}</span>.
        </p>
        <p className="text-gray-400 mb-8">
          Click the link in the email to verify your account, then{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            sign in
          </Link>
          .
        </p>
        <p className="text-gray-500 text-sm">
          Didn&apos;t receive it?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
          >
            {resending ? 'Resending…' : 'Resend verification email'}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-8">Create account</h1>
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
          <label className="block text-sm text-gray-400 mb-1.5">Password</label>
          <input
            {...register('password')}
            type="password"
            autoComplete="new-password"
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                     text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-gray-400 text-sm mt-6 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
