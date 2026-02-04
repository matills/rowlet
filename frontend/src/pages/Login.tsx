import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithProvider, signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleProviderLogin = async (provider: 'google' | 'github' | 'discord') => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithProvider(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmail(email);
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="owlist-logo">
            <h1>OWLIST</h1>
            <p className="tagline">© 1930</p>
          </div>

          <div className="email-sent">
            <h2>Check your email!</h2>
            <p>We've sent you a magic link to <strong>{email}</strong></p>
            <p className="hint">Click the link in the email to sign in.</p>
            <Button onClick={() => setEmailSent(false)} variant="secondary">
              Try another email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="owlist-logo">
          <h1>OWLIST</h1>
          <p className="tagline">Trackea tu diversión</p>
          <p className="vintage-text">© 1930</p>
        </div>

        <div className="login-methods">
          <h2>Sign in to Owlist</h2>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* OAuth providers */}
          <div className="provider-buttons">
            <Button
              onClick={() => handleProviderLogin('google')}
              disabled={isLoading}
              variant="secondary"
              fullWidth
            >
              Continue with Google
            </Button>
            <Button
              onClick={() => handleProviderLogin('github')}
              disabled={isLoading}
              variant="secondary"
              fullWidth
            >
              Continue with GitHub
            </Button>
            <Button
              onClick={() => handleProviderLogin('discord')}
              disabled={isLoading}
              variant="secondary"
              fullWidth
            >
              Continue with Discord
            </Button>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          {/* Email magic link */}
          <form onSubmit={handleEmailLogin} className="email-form">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !email}
              fullWidth
            >
              {isLoading ? 'Sending...' : 'Send magic link'}
            </Button>
          </form>

          <p className="login-info">
            We'll send you a magic link to sign in without a password.
          </p>
        </div>

        <div className="back-home">
          <button onClick={() => navigate('/')} className="link-button">
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
