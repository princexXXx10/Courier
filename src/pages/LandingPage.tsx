import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrackingData } from '../data/mockData';

const LandingPage: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingCode.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate network delay for UX
    setTimeout(() => {
      const codeToTrack = trackingCode.toUpperCase();
      const exists = getTrackingData(codeToTrack);
      
      if (!exists) {
        setError('Tracking code not found in system.');
        setIsLoading(false);
        return;
      }
      
      sessionStorage.setItem('currentTrackingCode', codeToTrack);
      navigate('/tracking');
    }, 1500);
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
              <div className="nav-links">
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#contact">Contact</a>
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
                  <button type="submit" className="track-button">
                    <span>Track Package</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 10L17 10M17 10L13 6M17 10L13 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
                {error && <div className="error-message" style={{ display: 'block', animation: 'fadeIn 0.3s ease' }}>{error}</div>}
              </div>

              {/* Example Codes */}
              <div className="example-codes">
                <span className="example-label">Try example:</span>
                <button className="example-code" onClick={() => handleExampleClick('TRACK001')}>TRACK001</button>
                <button className="example-code" onClick={() => handleExampleClick('TRACK002')}>TRACK002</button>
                <button className="example-code" onClick={() => handleExampleClick('TRACK003')}>TRACK003</button>
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
