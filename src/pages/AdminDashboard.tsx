import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { deliveryService, TrackingData } from '../services/deliveryService';
import LiveMap from '../components/LiveMap';

const AdminDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<TrackingData[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const data = await deliveryService.getAllDeliveries();
      setDeliveries(data);
    };
    
    loadData();
    
    // Subscribe to all delivery changes
    const subscription = deliveryService.subscribeToAllDeliveries(() => {
      loadData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const totalDeliveries = deliveries.length;
  const inTransit = deliveries.filter(d => d.status === 'in-transit').length;
  const delivered = deliveries.filter(d => d.status === 'delivered').length;

  const mapData = selectedCode 
    ? deliveries.filter(d => d.trackingCode === selectedCode)
    : deliveries;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: '2rem' }}>
      {/* Basic Navbar */}
      <nav className="navbar" style={{ background: 'var(--bg-primary)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L3 9L16 16L29 9L16 2Z" fill="var(--brand-primary)" />
              </svg>
              <span>Admin Portal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/" className="back-button">Back to Tracking</Link>
              <button onClick={handleLogout} className="back-button" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Dashboard Overview</h1>
        
        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="modern-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Shipments</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-primary)' }}>{totalDeliveries}</p>
          </div>
          <div className="modern-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>In Transit</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-warning)' }}>{inTransit}</p>
          </div>
          <div className="modern-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Delivered</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-success)' }}>{delivered}</p>
          </div>
        </div>

        {/* Global Live Map */}
        <div className="modern-card" style={{ padding: 0, overflow: 'hidden', height: '400px', marginBottom: '2rem', position: 'relative' }}>
          {selectedCode && (
            <button 
              onClick={() => setSelectedCode(null)}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Show All Trucks
            </button>
          )}
          {mapData.length > 0 && <LiveMap data={mapData} zoom={selectedCode ? 12 : 4} />}
        </div>

        {/* Deliveries List */}
        <div className="modern-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Active Deliveries</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Tracking Code</th>
                <th style={{ padding: '1rem 0.5rem' }}>Customer</th>
                <th style={{ padding: '1rem 0.5rem' }}>Assigned Courier</th>
                <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                <th style={{ padding: '1rem 0.5rem' }}>Destination</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(delivery => (
                <tr 
                  key={delivery.trackingCode} 
                  onClick={() => setSelectedCode(delivery.trackingCode)}
                  className="dynamic-hover"
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: selectedCode === delivery.trackingCode ? 'var(--bg-tertiary)' : 'transparent' }}
                >
                  <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>{delivery.trackingCode}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{delivery.customerName}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{delivery.assignedCourier}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
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
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>{delivery.destination.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
