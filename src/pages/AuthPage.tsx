import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { deliveryService } from '../services/deliveryService';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect them accordingly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => {
          if (data?.role === 'admin') navigate('/admin');
          else if (data?.role === 'courier') navigate('/courier');
          else navigate('/tracking');
        });
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;

        // Auto claim pending tracking code if it exists
        const pendingCode = sessionStorage.getItem('pendingTrackingCode');
        if (pendingCode && data.user) {
          await deliveryService.claimDelivery(pendingCode, data.user.id);
          sessionStorage.removeItem('pendingTrackingCode');
          sessionStorage.setItem('currentTrackingCode', pendingCode);
        }

        navigate('/tracking');
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Fetch role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Auto claim pending tracking code if it exists
        const pendingCode = sessionStorage.getItem('pendingTrackingCode');
        if (pendingCode && data.user) {
          await deliveryService.claimDelivery(pendingCode, data.user.id);
          sessionStorage.removeItem('pendingTrackingCode');
          sessionStorage.setItem('currentTrackingCode', pendingCode);
          navigate('/tracking');
          return;
        }

        if (profile?.role === 'admin') navigate('/admin');
        else if (profile?.role === 'courier') navigate('/courier');
        else navigate('/tracking');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="mesh-background"></div>

      <nav className="navbar" style={{ position: 'relative', zIndex: 20 }}>
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L3 9L16 16L29 9L16 2Z" fill="url(#logo-gradient)" stroke="#6366F1" strokeWidth="2" />
                <path d="M3 23L16 30L29 23" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 16L16 23L29 16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="logo-gradient" x1="3" y1="2" x2="29" y2="16">
                    <stop stopColor="#6366F1" />
                    <stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--text-primary)', marginLeft: '0.75rem' }}>CourierTrack</span>
            </div>
            <Link to="/" className="back-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M13 3L7 10L13 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      
      <div className="modern-card-elevated" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 1rem' }}>
            <path d="M16 2L3 9L16 16L29 9L16 2Z" fill="url(#logo-gradient)" stroke="#6366F1" strokeWidth="2" />
            <path d="M3 23L16 30L29 23" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 16L16 23L29 16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="logo-gradient" x1="3" y1="2" x2="29" y2="16">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
            {isSignUp ? 'Create Account' : 'Portal Login'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {isSignUp ? 'Sign up to track and manage your deliveries' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {error && (
          <div style={{ 
            display: 'block', 
            marginBottom: '1.5rem', 
            animation: 'fadeIn 0.3s ease', 
            color: '#ef4444', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            textAlign: 'center',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'text-bottom', marginRight: '0.5rem' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isSignUp && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input 
                type="text" 
                className="tracking-input" 
                style={{ width: '100%', padding: '0.75rem 1rem' }}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              type="email" 
              className="tracking-input" 
              style={{ width: '100%', padding: '0.75rem 1rem' }}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              className="tracking-input" 
              style={{ width: '100%', padding: '0.75rem 1rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="track-button" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--brand-primary)', 
                cursor: 'pointer', 
                fontSize: '0.9rem', 
                fontWeight: '500',
                textDecoration: 'underline' 
              }}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default AuthPage;
