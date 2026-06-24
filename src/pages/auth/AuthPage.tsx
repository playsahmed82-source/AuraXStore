import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Gamepad2 } from 'lucide-react';
import { useStore } from '../../lib/store';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp } = useStore();

  const isLogin = location.pathname === '/auth/login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        setSuccess('Account created successfully! Please check your email to verify your account.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-500 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      <Link to="/" className="flex items-center gap-2 mb-8 relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-white">
          Aura<span className="text-primary-400">x</span>Store
        </span>
      </Link>

      <div className="w-full max-w-md glass-card p-8 relative">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500">
            {isLogin ? 'Sign in to continue to AuraxStore' : 'Join 500K+ gamers today'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error-500/10 border border-error-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-success-500/10 border border-success-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-success-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-success-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="input-field pl-12"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field pl-12"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field pl-12 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-600 bg-dark-300 text-primary-500" />
                Remember me
              </label>
              <Link to="/auth/forgot-password" className="text-primary-400 hover:text-primary-300">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              to={isLogin ? '/auth/register' : '/auth/login'}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-400">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
