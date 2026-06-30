import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthScreen from '../components/auth/AuthScreen.jsx';
import IconBadge from '../components/auth/IconBadge.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  if (submitted) {
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
            If that email address has an account, we have sent a reset link. It
            expires in 1 hour.
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

  return (
    <AuthScreen>
      <IconBadge>
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
      </IconBadge>
      <div>
        <h1 className="text-3xl font-bold mb-3">Forgot your password?</h1>
        <p className="text-content-muted">
          Enter your email and we will send you a reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full"
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <p className="text-content-subtle text-sm">
        Remember your password?{' '}
        <Link
          to="/login"
          className="text-accent hover:text-accent-hover font-medium"
        >
          Sign in
        </Link>
      </p>
    </AuthScreen>
  );
}
