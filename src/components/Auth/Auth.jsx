import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiGithub, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { MdHealthAndSafety } from 'react-icons/md';
import './Auth.css';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <MdHealthAndSafety className="auth-logo" />
          <h1 className="auth-title">Medical AI Platform</h1>
          <p className="auth-subtitle">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            className="auth-form"
            onSubmit={handleAuth}
            key={isSignUp ? 'signup' : 'signin'}
            initial={{ opacity: 0, x: isSignUp ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isSignUp ? -100 : 100 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FiAlertCircle />
                {error}
              </motion.div>
            )}

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                  <FiUser className="input-icon" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FiLock className="input-icon" />
              </div>
            </div>

            <button 
              className="auth-button" 
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="auth-divider">
          <div className="divider-line" />
          <span>or continue with</span>
          <div className="divider-line" />
        </div>

        <div className="social-auth">
          <button
            className="social-button"
            onClick={() => handleSocialAuth('google')}
            disabled={loading}
          >
            <FcGoogle /> Google
          </button>
          <button
            className="social-button"
            onClick={() => handleSocialAuth('github')}
            disabled={loading}
          >
            <FiGithub /> GitHub
          </button>
        </div>

        <div className="auth-footer">
          <button
            className="auth-link"
            onClick={toggleSignUp}
            disabled={loading}
          >
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <span>{isSignUp ? ' Sign In' : ' Sign Up'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Auth; 