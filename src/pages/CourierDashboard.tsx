import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deliveryService, TrackingData } from '../services/deliveryService';
import { supabase } from '../lib/supabaseClient';
import LiveMap from '../components/LiveMap';

const CourierDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<TrackingData[]>([]);
  const [currentCourierName, setCurrentCourierName] = useState('Loading...');
  const [activeTrackingCode, setActiveTrackingCode] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string>('');
  const [showFailureSelect, setShowFailureSelect] = useState<string | null>(null);
  const [focusedDeliveryCode, setFocusedDeliveryCode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let watchId: number;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();
      
      const courierName = profile?.full_name || 'Courier';
      setCurrentCourierName(courierName);

      const all = await deliveryService.getAllDeliveries();
      const assigned = all.filter(d => d.assignedCourier === courierName);
      setDeliveries(assigned);

      // Auto-start tracking if there's an active delivery
      const activeDelivery = assigned.find(d => d.status === 'out-for-delivery');
      if (activeDelivery) {
        setActiveTrackingCode(activeDelivery.trackingCode);
        setFocusedDeliveryCode(activeDelivery.trackingCode);
      }
    };

    init();

    // Start watching position if an active delivery is selected
    if (activeTrackingCode) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await deliveryService.updateLocation(activeTrackingCode, latitude, longitude);
          },
          (error) => {
            console.error('Error watching position:', error);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeTrackingCode, navigate]);

  const handleUpdateStatus = async (code: string, newStatus: string, newStatusText: string, location: string) => {
    await deliveryService.updateStatus(code, newStatus, newStatusText, location);
    // Reload deliveries
    const all = await deliveryService.getAllDeliveries();
    setDeliveries(all.filter(d => d.assignedCourier === currentCourierName));
    setShowFailureSelect(null);
    setFailureReason('');
    
    if (newStatus === 'delivered' || newStatus === 'failed') {
      if (activeTrackingCode === code) {
        setActiveTrackingCode(null);
      }
      if (focusedDeliveryCode === code) {
        setFocusedDeliveryCode(null);
      }
    }
  };

  const handleStartRoute = async (delivery: TrackingData) => {
    await handleUpdateStatus(delivery.trackingCode, 'out-for-delivery', 'Out for Delivery', delivery.origin.city);
    setActiveTrackingCode(delivery.trackingCode);
    setFocusedDeliveryCode(delivery.trackingCode);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: '2rem' }}>
      <nav className="navbar" style={{ background: 'var(--bg-primary)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="container-fluid">
          <div className="nav-content">
            <div className="logo">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M3 23L16 30L29 23" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Courier App</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Welcome, {currentCourierName}</span>
              <button onClick={handleLogout} className="back-button" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid" style={{ marginTop: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Your Assigned Deliveries</h1>
        
        <div className="courier-dashboard-grid" style={{ gridTemplateColumns: '1fr 400px' }}>
          
          {/* Left Column: Live Map */}
          <div className="courier-map-container modern-card-elevated" style={{ height: '100%' }}>
            {deliveries.length > 0 ? (
              <LiveMap 
                data={focusedDeliveryCode ? deliveries.filter(d => d.trackingCode === focusedDeliveryCode) : deliveries} 
                zoom={focusedDeliveryCode ? 13 : 11} 
              />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No active routes
              </div>
            )}
          </div>

          {/* Right Column: Deliveries List */}
          <div className="courier-list-container">
            {deliveries.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No deliveries assigned to you right now.</p>
            ) : (
              deliveries.map(delivery => {
                const isCompleted = delivery.status === 'delivered' || delivery.status === 'failed';
                const isActive = activeTrackingCode === delivery.trackingCode;
                const isFocused = focusedDeliveryCode === delivery.trackingCode;
                const isPending = delivery.status === 'in-transit' || delivery.status === 'delayed';
                
                return (
                  <div 
                    key={delivery.trackingCode} 
                    className="modern-card dynamic-hover" 
                    onClick={() => setFocusedDeliveryCode(isFocused ? null : delivery.trackingCode)}
                    style={{ padding: '1.5rem', border: isFocused ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)', position: 'relative', cursor: 'pointer', background: isFocused ? 'var(--bg-tertiary)' : 'var(--bg-primary)' }}
                  >
                    {isActive && (
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--brand-success)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <span className="pulse-dot"></span> GPS LIVE
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{delivery.trackingCode}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>To: {delivery.customerName} - {delivery.destination.city}</p>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: delivery.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : delivery.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: delivery.status === 'delivered' ? 'var(--brand-success)' : delivery.status === 'failed' ? '#ef4444' : 'var(--brand-primary)'
                      }}>
                        {delivery.statusText}
                      </span>
                    </div>
                    
                    {!isCompleted && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                        
                        {isPending && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <button 
                              onClick={() => handleStartRoute(delivery)}
                              className="track-button dynamic-hover" 
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              Start Delivery Route
                            </button>
                          </div>
                        )}

                        {isActive && (
                           <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                             <button 
                               onClick={() => handleUpdateStatus(delivery.trackingCode, 'delivered', 'Delivered', delivery.destination.city)}
                               className="example-code dynamic-hover" 
                               style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand-success)', borderColor: 'transparent', padding: '0.5rem 1rem', flex: 1 }}
                             >
                               Mark "Delivered"
                             </button>
                             <button 
                               onClick={() => setShowFailureSelect(showFailureSelect === delivery.trackingCode ? null : delivery.trackingCode)}
                               className="example-code dynamic-hover" 
                               style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'transparent', padding: '0.5rem 1rem', flex: 1 }}
                             >
                               Failed to Deliver
                             </button>
                           </div>
                        )}

                        {showFailureSelect === delivery.trackingCode && (
                          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', animation: 'fadeIn 0.3s ease' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Select Reason:</label>
                            <select 
                              className="tracking-input" 
                              style={{ width: '100%', marginBottom: '1rem' }}
                              value={failureReason}
                              onChange={(e) => setFailureReason(e.target.value)}
                            >
                              <option value="">-- Select a reason --</option>
                              <option value="Customer not available">Customer not available</option>
                              <option value="Address not found">Address not found</option>
                              <option value="Weather conditions">Weather conditions</option>
                              <option value="Vehicle breakdown">Vehicle breakdown</option>
                            </select>
                            <button 
                              className="track-button dynamic-hover"
                              style={{ background: '#ef4444', width: '100%', justifyContent: 'center' }}
                              disabled={!failureReason}
                              onClick={() => handleUpdateStatus(delivery.trackingCode, 'failed', `Failed: ${failureReason}`, delivery.currentLocation.city)}
                            >
                              Confirm Failure
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourierDashboard;
