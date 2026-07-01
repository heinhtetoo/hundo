import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthScreen from '../components/auth/AuthScreen.jsx';
import IconBadge from '../components/auth/IconBadge.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

function AlertIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <line x1="12" y1="16.5" x2="12" y2="16.5" />
    </svg>
  );
}

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

function CheckIcon() {
  return (
    <svg width="44" height="34" viewBox="0 0 46 36" fill="none">
      <path d="M2 19L17 32L44 2" stroke="oklch(76% 0.19 55)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
      <AuthScreen maxWidthClass="max-w-[480px]" gapClass="gap-8" glowColor="oklch(52% 0.22 25 / 0.06)">
        <IconBadge>
          <AlertIcon />
        </IconBadge>
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[34px] md:text-[44px] font-bold tracking-[-0.03em]">
            Invalid link
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.65] text-content-muted">
            This reset link is missing a token. Please use the link from your
            email or{' '}
            <Link to="/forgot-password" className="text-accent hover:text-accent-hover font-medium">
              request a new one
            </Link>
            .
          </p>
        </div>
      </AuthScreen>
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
      <AuthScreen maxWidthClass="max-w-[480px]" gapClass="gap-8" glowColor="oklch(76% 0.19 55 / 0.10)" glowSize={700}>
        <div className="relative w-[168px] h-[168px]">
          <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(oklch(76% 0.19 55) 360deg, transparent 0)' }} />
          <div className="absolute inset-[13px] rounded-full bg-surface flex items-center justify-center">
            <CheckIcon />
          </div>
          <div className="absolute -inset-[10px] rounded-full border border-[oklch(76%_0.19_55_/_0.15)] pointer-events-none" />
          <div className="absolute -inset-[20px] rounded-full border border-[oklch(76%_0.19_55_/_0.07)] pointer-events-none" />
        </div>
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[38px] md:text-[48px] font-bold tracking-[-0.033em]">
            Password reset!
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.65] text-content-muted">
            Your password has been updated. You can now sign in with your new
            password.
          </p>
        </div>
        <Button as={Link} to="/login" size="lg" className="shadow-[0_8px_28px_oklch(76%_0.19_55_/_0.38)]">
          Sign in to Hundo →
        </Button>
      </AuthScreen>
    );
  }

  if (status === 'error') {
    return (
      <AuthScreen maxWidthClass="max-w-[480px]" gapClass="gap-8" glowColor="oklch(52% 0.22 25 / 0.06)">
        <div className="relative w-[128px] h-[128px]">
          <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(oklch(52% 0.22 25) 45%, oklch(16% 0.022 265) 0)' }} />
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
            This reset link has already been used or has expired. Request a new
            one below.
          </p>
        </div>
        <Button as={Link} to="/forgot-password" size="lg">
          Request new link
        </Button>
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
          Reset your password
        </h1>
        <p className="text-[15px] md:text-[17px] leading-[1.6] text-content-muted">
          Enter a new password for your account.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full text-left rounded-2xl border border-[oklch(16%_0.022_265)] bg-[oklch(9.5%_0.022_265)] p-6 md:p-8 flex flex-col gap-4 md:gap-5 shadow-[0_20px_56px_rgba(0,0,0,0.45)]"
      >
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          required
          minLength={8}
        />
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          required
        />
        {matchError && <p className="text-red-400 text-sm">{matchError}</p>}
        <Button type="submit" size="lg" disabled={loading || !password || !confirm} className="w-full">
          {loading ? 'Resetting…' : 'Reset password'}
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
