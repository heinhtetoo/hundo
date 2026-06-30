import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthScreen from '../components/auth/AuthScreen.jsx';
import IconBadge from '../components/auth/IconBadge.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

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

function LockIcon() {
  return (
    <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
      <rect
        x="3"
        y="18"
        width="28"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M9 18V12a8 8 0 0 1 16 0v6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
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
      <AuthScreen>
        <IconBadge>
          <AlertIcon />
        </IconBadge>
        <div>
          <h1 className="text-3xl font-bold mb-3">Invalid link</h1>
          <p className="text-content-muted">
            This reset link is missing a token. Please use the link from your
            email or{' '}
            <Link
              to="/forgot-password"
              className="text-accent hover:text-accent-hover font-medium"
            >
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
          <h1 className="text-3xl font-bold mb-3">Password reset!</h1>
          <p className="text-content-muted">
            Your password has been updated. You can now sign in with your new
            password.
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
            This reset link has already been used or has expired. Request a new
            one below.
          </p>
        </div>
        <Button as={Link} to="/forgot-password">
          Request new link
        </Button>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <IconBadge>
        <LockIcon />
      </IconBadge>
      <div>
        <h1 className="text-3xl font-bold mb-3">Reset your password</h1>
        <p className="text-content-muted">
          Enter a new password for your account.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
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
        <Button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full"
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </AuthScreen>
  );
}
