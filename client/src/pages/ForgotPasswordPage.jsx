import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import AuthScreen from '../components/auth/AuthScreen.jsx';
import IconBadge from '../components/auth/IconBadge.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

function LockIcon() {
  return (
    <svg width="34" height="40" viewBox="0 0 34 40" fill="none" stroke="currentColor">
      <rect x="3" y="18" width="28" height="20" rx="5" strokeWidth="2.2" />
      <path d="M9 18V12a8 8 0 0 1 16 0v6" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="17" cy="28" r="2.5" fill="currentColor" stroke="none" />
      <line x1="17" y1="30.5" x2="17" y2="34" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckBadge() {
  return (
    <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-brand border-[2.5px] border-surface flex items-center justify-center shadow-[0_4px_14px_oklch(76%_0.19_55_/_0.5)]">
      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
        <path
          d="M1.5 5L5 8.5L11.5 1.5"
          stroke="oklch(12% 0.03 55)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await requestPasswordReset(email.trim());
      toast.success('Reset link resent — check your inbox');
    } catch {
      toast.error('Failed to resend — please try again');
    } finally {
      setResending(false);
    }
  }

  if (submitted) {
    return (
      <AuthScreen
        maxWidthClass="max-w-[480px]"
        gapClass="gap-9"
        glowColor="oklch(76% 0.19 55 / 0.09)"
        glowSize={700}
      >
        <IconBadge size={108} corner={<CheckBadge />}>
          <svg width="52" height="40" viewBox="0 0 52 40" fill="none" stroke="currentColor">
            <rect x="1" y="1" width="50" height="38" rx="6" strokeWidth="2" />
            <path d="M1 10L26 27L51 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconBadge>
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[34px] md:text-[46px] font-bold leading-[1.08] tracking-[-0.03em]">
            Check your inbox
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.65] text-content-muted">
            If that email address has an account, we&apos;ve sent a reset link to{' '}
            <span className="text-content font-semibold">{email}</span>.
          </p>
        </div>
        <div className="w-full rounded-[14px] border border-[oklch(16%_0.022_265)] bg-[oklch(9.5%_0.022_265)] px-7 py-[22px] flex flex-col gap-4 shadow-[0_20px_56px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2.5">
            <span className="w-[7px] h-[7px] rounded-full bg-brand shrink-0 shadow-[0_0_6px_oklch(76%_0.19_55_/_0.7)]" />
            <span className="text-sm text-content-muted">
              Link expires in <span className="text-brand font-semibold">1 hour</span>
            </span>
          </div>
          <div className="h-px bg-edge-subtle" />
          <p className="text-sm text-content-subtle">
            Didn&apos;t receive it? Check your spam folder, or{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-accent hover:text-accent-hover font-medium disabled:opacity-50"
            >
              resend the link
            </button>
            .
          </p>
        </div>
        <Link to="/login" className="text-sm text-accent hover:text-accent-hover font-medium">
          ← Back to sign in
        </Link>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen maxWidthClass="max-w-[448px]" gapClass="gap-9" glowSize={680}>
      <IconBadge>
        <LockIcon />
      </IconBadge>
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[34px] md:text-[44px] font-bold leading-[1.08] tracking-[-0.03em]">
          Forgot your password?
        </h1>
        <p className="text-[15px] md:text-[17px] leading-[1.6] text-content-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-[oklch(16%_0.022_265)] bg-[oklch(9.5%_0.022_265)] p-6 md:p-8 flex flex-col gap-4 md:gap-5 shadow-[0_20px_56px_rgba(0,0,0,0.45)]"
      >
        <div>
          <label className="block mb-2 text-[11px] font-medium uppercase tracking-[0.03em] text-content-muted">
            Email address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        <Button type="submit" size="lg" disabled={loading || !email.trim()} className="w-full">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <p className="text-sm text-content-subtle">
        Remember your password?{' '}
        <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
          Sign in
        </Link>
      </p>
    </AuthScreen>
  );
}
