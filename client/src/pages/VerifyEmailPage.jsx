import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api.js';
import AuthScreen from '../components/auth/AuthScreen.jsx';
import IconBadge from '../components/auth/IconBadge.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

function EnvelopeIcon() {
  return (
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
  );
}

function AlertIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <line x1="12" y1="16.5" x2="12" y2="16.5" />
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
      <AuthScreen>
        <IconBadge>
          <AlertIcon />
        </IconBadge>
        <div>
          <h1 className="text-3xl font-bold mb-3">Invalid link</h1>
          <p className="text-content-muted">
            This verification link is missing a token. Please use the link from
            your email.
          </p>
        </div>
        <Link
          to="/login"
          className="text-accent hover:text-accent-hover font-medium"
        >
          Back to sign in
        </Link>
      </AuthScreen>
    );
  }

  if (status === 'success') {
    return (
      <AuthScreen>
        <IconBadge>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </IconBadge>
        <div>
          <h1 className="text-3xl font-bold mb-3">Email verified!</h1>
          <p className="text-content-muted">
            Your account is confirmed. You can now sign in.
          </p>
        </div>
        <Button as={Link} to="/login">
          Sign in
        </Button>
      </AuthScreen>
    );
  }

  if (status === 'error') {
    return (
      <AuthScreen>
        <IconBadge>
          <AlertIcon />
        </IconBadge>
        <div>
          <h1 className="text-3xl font-bold mb-3">Link expired or invalid</h1>
          <p className="text-content-muted">
            This verification link has already been used or has expired. Enter
            your email below and we&apos;ll send a fresh one.
          </p>
        </div>
        <form onSubmit={handleResend} className="w-full flex flex-col gap-3">
          <Input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Button
            type="submit"
            disabled={resending || !resendEmail.trim()}
            className="w-full"
          >
            {resending ? 'Sending…' : 'Resend link'}
          </Button>
        </form>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <IconBadge>
        <EnvelopeIcon />
      </IconBadge>
      <div>
        <h1 className="text-3xl font-bold mb-3">Verify your email</h1>
        <p className="text-content-muted">
          Click the button below to confirm your email address and activate your
          account.
        </p>
      </div>
      <Button onClick={handleVerify} disabled={status === 'loading'}>
        {status === 'loading' ? 'Verifying…' : 'Verify my account'}
      </Button>
    </AuthScreen>
  );
}
