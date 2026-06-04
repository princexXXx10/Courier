import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { deliveryService } from '../services/deliveryService';

const LandingPage: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) setUserRole(profile.role);
      }
    };
    checkUser();
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingCode.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setIsLoading(true);
    setError('');

    (async () => {
      const codeToTrack = trackingCode.toUpperCase();
      const delivery = await deliveryService.getDeliveryByCode(codeToTrack);

      if (!delivery) {
        setError('Tracking code not found in system.');
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to login/signup and queue the tracking code
        sessionStorage.setItem('pendingTrackingCode', codeToTrack);
        navigate('/auth');
      } else {
        // Claim the delivery first, then view it
        await deliveryService.claimDelivery(codeToTrack, session.user.id);
        sessionStorage.setItem('currentTrackingCode', codeToTrack);
        navigate('/tracking');
      }
    })();
  };

  const handleExampleClick = (code: string) => {
    setTrackingCode(code);
  };

  return (
    <>
      <div className="landing-page" id="landingPage">
        {/* Mesh Background */}
        <div className="mesh-background"></div>

        {/* Navigation */}
        <nav className="navbar">
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
                <span>CourierTrack</span>
              </div>
              <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {isLoggedIn ? (
                  <>
                    {userRole === 'admin' && (
                      <Link to="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>Admin Dashboard</Link>
                    )}
                    {userRole === 'courier' && (
                      <Link to="/courier" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>Courier Dashboard</Link>
                    )}
                    {userRole === 'customer' && (
                      <Link to="/tracking" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>My Shipments</Link>
                    )}
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setIsLoggedIn(false);
                        setUserRole(null);
                        navigate('/');
                      }}
                      className="back-button"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>Sign In / Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                <span>Real-time Package Tracking</span>
              </div>

              <h1 className="hero-title">
                Track Your Packages
                <span className="hero-title-gradient">Anywhere, Anytime</span>
              </h1>
              <p className="hero-subtitle">
                Enter your tracking code and watch your package journey unfold with live updates, interactive maps, and detailed timeline tracking
              </p>

              {/* Tracking Input */}
              <div className="tracking-input-container">
                <form className="input-wrapper" onSubmit={handleTrack}>
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16z" strokeWidth="2" />
                    <path d="M19 19l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    id="trackingCode"
                    className="tracking-input"
                    placeholder="Enter tracking code (e.g., TRACK001)"
                    autoComplete="off"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                  <button type="submit" className="track-button dynamic-hover">
                    <span>Track Package</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 10L17 10M17 10L13 6M17 10L13 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
                {error && (
                  <div style={{
                    display: 'block',
                    animation: 'fadeIn 0.3s ease',
                    color: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    marginTop: '1rem',
                    textAlign: 'left',
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
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen active">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Locating your package...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;
