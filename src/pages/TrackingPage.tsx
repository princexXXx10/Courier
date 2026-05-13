import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deliveryService, TrackingData } from '../services/deliveryService';
import LiveMap from '../components/LiveMap';

const TrackingPage: React.FC = () => {
  const [data, setData] = useState<TrackingData | null>(null);

  useEffect(() => {
    const code = sessionStorage.getItem('currentTrackingCode') || 'TRACK001';
    
    const fetchInitialData = async () => {
      const dbData = await deliveryService.getDeliveryByCode(code);
      if (dbData) {
        setData(dbData);
      }
    };
    
    fetchInitialData();

    // Subscribe to real-time updates
    const subscription = deliveryService.subscribeToDelivery(code, (payload) => {
      // Refresh data when an update occurs
      fetchInitialData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!data) return <div>Loading...</div>;

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
            <Link to="/" className="back-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M13 3L7 10L13 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="tracking-content-100vh">
        <div className="container-fluid" style={{ height: '100%' }}>
          <div className="tracking-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', height: '100%', paddingBottom: '1rem' }}>
            
            {/* Live GPS Map (Left) */}
            <div className="tracking-map-container modern-card-elevated" style={{ padding: 0, overflow: 'hidden', height: '100%', position: 'relative', zIndex: 1 }}>
              <LiveMap data={data} zoom={11} />
            </div>

            {/* Status Panel (Right) */}
            <div className="tracking-sidebar" style={{ height: '100%', overflowY: 'auto', paddingLeft: '0.5rem' }}>
              <div className={`combined-status-card modern-card status-${data.status}`} style={{ margin: 0, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                
                {/* Status Header */}
                <div className="status-section-compact">
                  <div className="status-header-combined">
                    <svg className="status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" dangerouslySetInnerHTML={{ __html: iconPaths[data.status] }} />
                    <div className="status-info-combined">
                      <h2 className="status-title-combined">{data.statusText}</h2>
                      <span className="tracking-code-badge">{data.trackingCode}</span>
                    </div>
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${data.progress}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="eta-section">
                    <div className="eta-label">Estimated Delivery</div>
                    <div className="eta-time">{data.eta}</div>
                  </div>
                </div>

                {/* Package Details */}
                <div className="package-details-compact">
                  <div className="package-detail-row">
                    <svg className="package-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="10" r="3"></circle>
                      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
                    </svg>
                    <div className="package-detail-content">
                      <div className="package-detail-label">Origin</div>
                      <div className="package-detail-value">{data.origin.city}</div>
                    </div>
                  </div>
                  <div className="package-detail-row">
                    <svg className="package-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div className="package-detail-content">
                      <div className="package-detail-label">Destination</div>
                      <div className="package-detail-value">{data.destination.city}</div>
                    </div>
                  </div>
                  <div className="package-detail-row">
                    <svg className="package-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 7h-9"></path>
                      <path d="M14 17H5"></path>
                      <circle cx="17" cy="17" r="3"></circle>
                      <circle cx="7" cy="7" r="3"></circle>
                    </svg>
                    <div className="package-detail-content">
                      <div className="package-detail-label">Weight</div>
                      <div className="package-detail-value">{data.packageDetails.weight}</div>
                    </div>
                  </div>
                  <div className="package-detail-row">
                    <svg className="package-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <path d="M16 8V2l6 6-6 6v-4"></path>
                    </svg>
                    <div className="package-detail-content">
                      <div className="package-detail-label">Courier</div>
                      <div className="package-detail-value">{data.packageDetails.courier}</div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="timeline-in-overlay" style={{ flex: 1, paddingBottom: '1rem' }}>
                  <h3 className="card-title">Tracking Timeline</h3>
                  <div className="timeline-minimalist" style={{ maxHeight: '100%' }}>
                    {data.timeline.map((item, index) => (
                      <div key={index} className={`timeline-item-minimal ${item.status}`} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="timeline-icon-wrapper">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: timelineIcons[item.title] || timelineIcons['In Transit'] }} />
                        </div>
                        <div className="timeline-content-minimal">
                          <div className="timeline-time-minimal">{item.time}</div>
                          <div className="timeline-title-minimal">{item.title}</div>
                          <div className="timeline-location-minimal">{item.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackingPage;
