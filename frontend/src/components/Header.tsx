import React from 'react';
import { Compass, CheckCircle2, Map } from 'lucide-react';

interface HeaderProps {
  serviceStatus: string;
  dbStatus: string;
  totalDestinations: number;
  onOpenMap: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  serviceStatus,
  dbStatus,
  totalDestinations,
  onOpenMap,
}) => {
  const isHealthy = serviceStatus === 'healthy' && (dbStatus === 'connected' || dbStatus === 'Supabase PostgreSQL');

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-icon">
            <Compass size={22} className="icon-pulse" />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h1 className="brand-title">Shanthivana Wayfinder</h1>
              <span className="badge-beta">Hospital QR</span>
            </div>
            <p className="brand-subtitle">
              S.D.M. Yoga and Nature Cure Hospital, Dharmasthala
            </p>
          </div>
        </div>

        <div className="header-meta">
          <div className={`status-pill ${isHealthy ? 'status-online' : 'status-offline'}`}>
            <span className="pulse-dot"></span>
            <span className="status-text">{isHealthy ? 'Supabase Live' : 'Connecting API...'}</span>
          </div>

          <div className="status-pill status-info desktop-only">
            <CheckCircle2 size={13} />
            <span>{totalDestinations} Destinations</span>
          </div>

          <button 
            type="button" 
            className="btn-header-map"
            onClick={onOpenMap}
            title="Open Campus Map Illustration"
            aria-label="View Campus Map"
          >
            <Map size={16} />
            <span className="btn-map-label">Campus Map</span>
          </button>
        </div>
      </div>
    </header>
  );
};
