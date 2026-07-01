import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api.js';
import AuthScreen from '../components/auth/AuthScreen.jsx';
import IconBadge from '../components/auth/IconBadge.jsx';
import StepIndicator from '../components/auth/StepIndicator.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const CONFETTI = [
  { left: '28%', top: '22%', size: 7, color: 'oklch(76% 0.19 55 / 0.65)' },
  { left: '70%', top: '20%', size: 5, color: 'oklch(62% 0.24 280 / 0.7)' },
  { left: '22%', top: '58%', size: 6, color: 'oklch(76% 0.19 55 / 0.55)' },
  { left: '75%', top: '62%', size: 8, color: 'oklch(76% 0.19 55 / 0.45)' },
  { left: '82%', top: '32%', size: 5, color: 'oklch(62% 0.24 280 / 0.55)' },
  { left: '16%', top: '38%', size: 6, color: 'oklch(76% 0.19 55 / 0.45)' },
  { left: '58%', top: '78%', size: 5, color: 'oklch(76% 0.19 55 / 0.5)' },
  { left: '36%', top: '80%', size: 7, color: 'oklch(62% 0.24 280 / 0.45)' },
  { left: '44%', top: '15%', size: 4, color: 'oklch(76% 0.19 55 / 0.6)' },
  { left: '88%', top: '55%', size: 5, color: 'oklch(76% 0.19 55 / 0.4)' },
];

function Confetti() {
  return (
    <>
      {CONFETTI.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size, background: d.color }}
        />
      ))}
    </>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="48" height="38" viewBox="0 0 48 38" fill="none" stroke="currentColor">
      <rect x="1" y="1" width="46" height="36" rx="6" strokeWidth="2" />
      <path d="M1 9L24 25L47 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
      setStatus(res.ok ? 'success' : 'error');
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
      <AuthScreen maxWidthClass="max-w-[480px]" gapClass="gap-8">
        <IconBadge size={108}>
          <EnvelopeIcon />
        </IconBadge>
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[34px] md:text-[44px] font-bold tracking-[-0.03em]">
            Invalid link
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.65] text-content-muted">
            This verification link is missing a token. Please use the link from
            your email.
          </p>
        </div>
        <Link to="/login" className="text-sm text-accent hover:text-accent-hover font-medium">
          ← Back to sign in
        </Link>
      </AuthScreen>
    );
  }

  if (status === 'success') {
    return (
      <AuthScreen
        maxWidthClass="max-w-[480px]"
        gapClass="gap-8"
        glowColor="oklch(76% 0.19 55 / 0.10)"
        glowSize={700}
        decor={<Confetti />}
      >
        <StepIndicator states={['done', 'done', 'active']} />
        <div className="relative w-[168px] h-[168px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(oklch(76% 0.19 55) 360deg, transparent 0)' }}
          />
          <div className="absolute inset-[13px] rounded-full bg-surface flex items-center justify-center">
            <svg width="46" height="36" viewBox="0 0 46 36" fill="none">
              <path
                d="M2 19L17 32L44 2"
                stroke="oklch(76% 0.19 55)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="absolute -inset-[10px] rounded-full border border-[oklch(76%_0.19_55_/_0.15)] pointer-events-none" />
          <div className="absolute -inset-[20px] rounded-full border border-[oklch(76%_0.19_55_/_0.07)] pointer-events-none" />
        </div>
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[38px] md:text-[48px] font-bold tracking-[-0.033em]">
            Email verified!
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.65] text-content-muted">
            Your account is confirmed. Start building your backlog and tracking
            every completion.
          </p>
        </div>
        <Button
          as={Link}
          to="/login"
          size="lg"
          className="shadow-[0_8px_28px_oklch(76%_0.19_55_/_0.38)]"
        >
          Sign in to Hundo →
        </Button>
      </AuthScreen>
    );
  }

  if (status === 'error') {
    return (
      <AuthScreen
        maxWidthClass="max-w-[520px]"
        gapClass="gap-8"
        glowColor="oklch(52% 0.22 25 / 0.06)"
        glowSize={600}
      >
        <div className="relative w-[128px] h-[128px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(oklch(52% 0.22 25) 45%, oklch(16% 0.022 265) 0)' }}
          />
          <div className="absolute inset-[11px] rounded-full bg-surface flex items-center justify-center">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 8v8" stroke="oklch(52% 0.22 25)" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="15" cy="21" r="1.8" fill="oklch(52% 0.22 25)" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[34px] md:text-[44px] font-bold tracking-[-0.03em]">
            Link expired
            <br />
            or invalid
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.65] text-content-muted">
            This verification link has already been used or has expired. Enter
            your email and we&apos;ll send you a fresh one.
          </p>
        </div>
        <form onSubmit={handleResend} className="w-full flex flex-col sm:flex-row gap-2.5">
          <Input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="sm:flex-1"
          />
          <Button
            type="submit"
            disabled={resending || !resendEmail.trim()}
            className="shrink-0"
          >
            {resending ? 'Sending…' : 'Resend link'}
          </Button>
        </form>
        <Link to="/login" className="text-sm text-content-subtle hover:text-content-muted">
          ← Back to sign in
        </Link>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen maxWidthClass="max-w-[480px]" gapClass="gap-8">
      <StepIndicator states={['done', 'active', 'pending']} />
      <IconBadge size={108}>
        <EnvelopeIcon />
      </IconBadge>
      <div className="flex flex-col gap-3.5">
        <h1 className="text-[34px] md:text-[46px] font-bold tracking-[-0.03em]">
          Verify your email
        </h1>
        <p className="text-[15px] md:text-[17px] leading-[1.65] text-content-muted">
          Click the button below to confirm your email address and activate your
          Hundo account.
        </p>
      </div>
      <Button
        onClick={handleVerify}
        disabled={status === 'loading'}
        size="lg"
        className="shadow-[0_8px_28px_oklch(76%_0.19_55_/_0.3)]"
      >
        {status === 'loading' ? 'Verifying…' : 'Verify my account'}
      </Button>
      <p className="text-[11px] text-content-subtle">Link expires in 24 hours</p>
    </AuthScreen>
  );
}
