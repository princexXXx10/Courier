import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { deliveryService, TrackingData } from '../services/deliveryService';
import LiveMap from '../components/LiveMap';

const TrackingPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<TrackingData[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<TrackingData | null>(null);
  const [newTrackingCode, setNewTrackingCode] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  const loadData = async (activeCode?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUserEmail(session.user.email || '');

    const userDeliveries = await deliveryService.getDeliveriesByCustomerId(session.user.id);
    setDeliveries(userDeliveries);

    // Determine which code to select
    const targetCode = activeCode || sessionStorage.getItem('currentTrackingCode') || (userDeliveries.length > 0 ? userDeliveries[0].trackingCode : null);

    if (targetCode) {
      // Find in local list
      const matched = userDeliveries.find(d => d.trackingCode === targetCode);
      if (matched) {
        setSelectedDelivery(matched);
        sessionStorage.setItem('currentTrackingCode', targetCode);
      } else {
        // Fetch individually if not in user's list yet
        const dbData = await deliveryService.getDeliveryByCode(targetCode);
        if (dbData) {
          setSelectedDelivery(dbData);
          sessionStorage.setItem('currentTrackingCode', targetCode);
        }
      }
    } else {
      setSelectedDelivery(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to updates for the currently selected tracking code if any
    const code = sessionStorage.getItem('currentTrackingCode');
    let subscription: any;
    if (code) {
      subscription = deliveryService.subscribeToDelivery(code, () => {
        loadData(code);
      });
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');

    if (!newTrackingCode.trim()) {
      setClaimError('Please enter a tracking code');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const formattedCode = newTrackingCode.trim().toUpperCase();

    // Check if the delivery is already claimed by someone else
    const delivery = await deliveryService.getDeliveryByCode(formattedCode);
    if (!delivery) {
      setClaimError('Tracking code not found in system.');
      return;
    }

    if (delivery.customerId && delivery.customerId !== session.user.id) {
      setClaimError('This shipment is already registered to another account.');
      return;
    }

    const success = await deliveryService.claimDelivery(formattedCode, session.user.id);
    if (success) {
      setClaimSuccess(`Successfully added package ${formattedCode}!`);
      setNewTrackingCode('');
      loadData(formattedCode);
    } else {
      setClaimError('Failed to associate package. Please try again.');
    }
  };

  const handleSelect = (delivery: TrackingData) => {
    setSelectedDelivery(delivery);
    sessionStorage.setItem('currentTrackingCode', delivery.trackingCode);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const iconPaths: Record<string, string> = {
    'in-transit': '<rect x="1" y="3" width="15" height="13"></rect><path d="M16 8V2l6 6-6 6v-4"></path>',
    'out-for-delivery': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    'delivered': '<polyline points="20 6 9 17 4 12"></polyline>',
    'delayed': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
    'failed': '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
  };

  const timelineIcons: Record<string, string> = {
    'Package Picked Up': '<path d="M20 7h-3a2 2 0 0 1-2-2V2"></path><path d="M9 18v-6"></path><path d="M15 18v-6"></path><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>',
    'Departed Facility': '<path d="M16 3h5v5"></path><path d="M21 3l-7 7"></path><path d="M8 3H3v5"></path><path d="M3 3l7 7"></path><path d="M8 21H3v-5"></path><path d="M3 21l7-7"></path><path d="M16 21h5v-5"></path><path d="M21 21l-7-7"></path>',
    'In Transit': '<rect x="1" y="3" width="15" height="13"></rect><path d="M16 8V2l6 6-6 6v-4"></path>',
    'Arrived at Facility': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    'Out for Delivery': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    'Delivered': '<polyline points="20 6 9 17 4 12"></polyline>'
  };

  return (
    <div className="tracking-page" id="trackingPage">
      <div className="mesh-background"></div>

      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Account: {userEmail}
              </span>
              <Link to="/" className="back-button" style={{ textDecoration: 'none' }}>Home</Link>
              <button
                onClick={handleLogout}
                className="back-button"
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="tracking-content-100vh">
        <div className="container-fluid" style={{ height: '100%' }}>
          <div className="tracking-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', height: '100%', minHeight: 0, paddingBottom: '1rem' }}>

            {/* Live GPS Map (Left) */}
            <div className="tracking-map-container modern-card-elevated" style={{ padding: 0, overflow: 'hidden', height: '100%', position: 'relative', zIndex: 1 }}>
              {selectedDelivery ? (
                <LiveMap data={selectedDelivery} zoom={11} />
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)' }}>
                    <circle cx="12" cy="10" r="3"></circle>
                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
                  </svg>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Shipment Selected</h3>
                  <p style={{ maxWidth: '350px', fontSize: '0.9rem' }}>Add a shipment using the form on the right or select an active shipment to view its live GPS location.</p>
                </div>
              )}
            </div>

            {/* Panel (Right) */}
            <div className="tracking-sidebar" style={{ height: '100%', minHeight: 0, overflowY: 'auto', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1rem' }}>

              {/* Claim New Package Card */}
              <div className="modern-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Link New Shipment
                </h3>
                <form onSubmit={handleClaim} style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="tracking-input"
                    placeholder="Enter tracking code (e.g. TRACK001)"
                    value={newTrackingCode}
                    onChange={(e) => setNewTrackingCode(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem 1rem' }}
                  />
                  <button type="submit" className="track-button dynamic-hover" style={{ padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}>
                    Add Package
                  </button>
                </form>
                {claimError && (
                  <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginTop: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {claimError}
                  </div>
                )}
                {claimSuccess && (
                  <div style={{ color: 'var(--brand-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginTop: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {claimSuccess}
                  </div>
                )}
              </div>

              {/* Customer's Shipments Switcher */}
              <div className="modern-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>My Registered Shipments</h3>
                {deliveries.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                    You have no registered shipments.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {deliveries.map(delivery => {
                      const isSelected = selectedDelivery?.trackingCode === delivery.trackingCode;
                      return (
                        <div
                          key={delivery.trackingCode}
                          onClick={() => handleSelect(delivery)}
                          className="dynamic-hover"
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
                            background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{delivery.trackingCode}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                              {delivery.origin.city} → {delivery.destination.city}
                            </div>
                          </div>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: delivery.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            color: delivery.status === 'delivered' ? 'var(--brand-success)' : 'var(--brand-primary)'
                          }}>
                            {delivery.statusText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackingPage;
