import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllDeliveries, updateDeliveryStatus, updateCoordinates, TrackingData } from '../data/mockData';

const CourierDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<TrackingData[]>([]);
  
  // Mock logged-in courier
  const currentCourierName = 'John Smith';

  const loadDeliveries = () => {
    // Filter deliveries assigned to this courier
    const all = getAllDeliveries();
    setDeliveries(all.filter(d => d.assignedCourier === currentCourierName));
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleUpdateStatus = (code: string, newStatus: TrackingData['status'], newStatusText: string, location: string) => {
    updateDeliveryStatus(code, newStatus, newStatusText, location);
    loadDeliveries(); // Refresh the list
  };

  const [simulatingCode, setSimulatingCode] = useState<string | null>(null);

  const startSimulation = (delivery: TrackingData) => {
    if (simulatingCode) return;
    setSimulatingCode(delivery.trackingCode);

    // Simple simulation: move from origin to destination in 10 steps
    const steps = 10;
    let currentStep = 0;
    
    const latStep = (delivery.destination.coordinates[0] - delivery.origin.coordinates[0]) / steps;
    const lngStep = (delivery.destination.coordinates[1] - delivery.origin.coordinates[1]) / steps;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        const newLat = delivery.origin.coordinates[0] + (latStep * currentStep);
        const newLng = delivery.origin.coordinates[1] + (lngStep * currentStep);
        updateCoordinates(delivery.trackingCode, newLat, newLng);
      } else {
        clearInterval(interval);
        setSimulatingCode(null);
      }
    }, 1000); // update every 1 second
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: '2rem' }}>
      {/* Basic Navbar */}
      <nav className="navbar" style={{ background: 'var(--bg-primary)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M3 23L16 30L29 23" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Courier App</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Welcome, {currentCourierName}</span>
              <Link to="/" className="back-button">Log Out</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '2rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Your Assigned Deliveries</h1>
        
        {/* Deliveries List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deliveries.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No deliveries assigned to you.</p>
          ) : (
            deliveries.map(delivery => (
              <div key={delivery.trackingCode} className="modern-card" style={{ padding: '1.5rem' }}>
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
                    backgroundColor: delivery.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    color: delivery.status === 'delivered' ? 'var(--brand-success)' : 'var(--brand-primary)'
                  }}>
                    {delivery.statusText}
                  </span>
                </div>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Update Status:</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleUpdateStatus(delivery.trackingCode, 'out-for-delivery', 'Out for Delivery', delivery.destination.city)}
                      className="example-code" 
                      style={{ background: 'var(--bg-primary)', padding: '0.5rem 1rem' }}
                      disabled={delivery.status === 'out-for-delivery' || delivery.status === 'delivered'}
                    >
                      Mark "Out for Delivery"
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(delivery.trackingCode, 'delivered', 'Delivered', delivery.destination.city)}
                      className="track-button" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      disabled={delivery.status === 'delivered'}
                    >
                      Mark "Delivered"
                    </button>
                    <button 
                      onClick={() => startSimulation(delivery)}
                      className="example-code" 
                      style={{ background: simulatingCode === delivery.trackingCode ? 'var(--brand-success)' : 'var(--bg-secondary)', padding: '0.5rem 1rem', borderColor: simulatingCode === delivery.trackingCode ? 'var(--brand-success)' : 'var(--border-color)', color: simulatingCode === delivery.trackingCode ? 'white' : 'var(--text-secondary)' }}
                      disabled={simulatingCode !== null || delivery.status === 'delivered'}
                    >
                      {simulatingCode === delivery.trackingCode ? 'Simulating...' : 'Simulate GPS Movement'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierDashboard;
