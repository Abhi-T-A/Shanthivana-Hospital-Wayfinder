import React, { useEffect } from 'react';
import type { Destination } from '../types/destination';
import {
  X,
  Building,
  Info,
  Navigation,
  Clock,
  Compass,
  Map,
  ArrowLeft,
} from 'lucide-react';

interface DestinationDetailProps {
  destination: Destination | null;
  onClose: () => void;
  onOpenMap?: () => void;
  onNavigate?: (destination: Destination) => void;
}

export const DestinationDetail: React.FC<DestinationDetailProps> = ({
  destination,
  onClose,
  onOpenMap,
  onNavigate,
}) => {
  // Support ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (destination) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [destination, onClose]);

  if (!destination) return null;

  // Campus context helper based on ground truth verified rules
  const getCampusContext = (dest: Destination) => {
    switch (dest.slug) {
      case 'reception':
        return 'Campus Fact: Reception is located directly at the entrance of Main Hospital A Block for patient admissions and visitor registrations.';
      case 'administrative-block':
        return 'Campus Fact: Executive and superintendent offices are located inside the Main Hospital A Block complex.';
      case 'treatment-section':
        return 'Campus Fact: Naturopathy and hydrotherapy therapy section is situated in close proximity to the Main Hospital Block.';
      case 'utility-shop':
        return 'Campus Fact: Store for daily essentials, organic supplies, and herbal items is situated near the Main Hospital Block.';
      case 'special-rooms':
        return 'Distinct Inpatient Accommodation: Special Rooms offer inpatient facilities by A Block. (Distinct from Special Ward).';
      case 'special-ward':
        return 'Specialized Clinical Care: Special Ward provides intensive inpatient medical care inside the hospital complex. (Distinct from Special Rooms).';
      default:
        return null;
    }
  };

  const campusFact = getCampusContext(destination);

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div 
        className="detail-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <div className="detail-top-nav">
          <button 
            type="button" 
            className="detail-back-btn" 
            onClick={onClose}
          >
            <ArrowLeft size={16} />
            <span>Return to Directory</span>
          </button>

          <button 
            type="button" 
            className="detail-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="detail-badge-group">
          <span className={`category-tag tag-${destination.category.toLowerCase()}`}>
            {destination.category}
          </span>
          <span className="dest-index-badge">Location #{destination.id}</span>
          <span className="slug-tag">/{destination.slug}</span>
        </div>

        <h2 id="detail-title" className="detail-title">{destination.name}</h2>

        {destination.building_name ? (
          <div className="detail-meta-item">
            <Building size={18} className="detail-meta-icon" />
            <span>Building / Sector: <strong>{destination.building_name}</strong></span>
          </div>
        ) : (
          <div className="detail-meta-item">
            <Building size={18} className="detail-meta-icon" />
            <span>Independent Campus Sector / Facility</span>
          </div>
        )}

        {destination.description && (
          <div className="detail-description-box">
            <p>{destination.description}</p>
          </div>
        )}

        {/* Campus Specific Guidance Callout */}
        {campusFact && (
          <div className="detail-fact-callout">
            <Info size={18} className="fact-icon" />
            <p>{campusFact}</p>
          </div>
        )}

        {/* Coordinate Verification Notice */}
        <div className="detail-status-section">
          <div className="status-box pending-box">
            <div className="status-box-header">
              <Compass size={17} />
              <span>Ground-Truth Coordinates Status</span>
            </div>
            <p className="status-box-desc">
              Normalized Map Coordinates: <code>(null, null)</code>. Ground coordinates are awaiting surveyor verification. Exact placement markers will activate after onsite GPS registration.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="detail-action-group">
          {/* Prominent Primary Navigate Here Button */}
          {onNavigate && (
            <button 
              type="button" 
              className="btn-navigate-here"
              onClick={() => {
                onClose();
                onNavigate(destination);
              }}
            >
              <Navigation size={18} />
              <span>Navigate Here</span>
            </button>
          )}

          {onOpenMap && (
            <button 
              type="button" 
              className="btn-open-map"
              onClick={() => {
                onClose();
                onOpenMap();
              }}
            >
              <Map size={17} />
              <span>View On Campus Map Illustration</span>
            </button>
          )}

          {!onNavigate && (
            <button 
              type="button" 
              className="btn-nav-disabled" 
              disabled 
              title="Turn-by-turn navigation will activate once surveyor route edges are verified"
            >
              <Navigation size={17} />
              <span>Start Turn-by-Turn Directions (Coming Soon)</span>
            </button>
          )}
          
          <div className="nav-disabled-hint">
            <Clock size={13} />
            <span>Live GPS positioning and campus navigation view</span>
          </div>
        </div>
      </div>
    </div>
  );
};
