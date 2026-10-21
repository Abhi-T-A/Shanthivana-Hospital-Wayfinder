import React from 'react';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Building2,
  Navigation,
  Map as MapIcon,
  AlertTriangle,
  Building,
  CircleDot,
  Clock,
  Compass,
} from 'lucide-react';
import type { Destination } from '../types/destination';

interface MobileDestinationDetailsProps {
  destination: Destination;
  onBack: () => void;
  onNavigateHere: (destination: Destination) => void;
  onViewOnMap: (destination: Destination) => void;
}

export const MobileDestinationDetails: React.FC<MobileDestinationDetailsProps> = ({
  destination,
  onBack,
  onNavigateHere,
  onViewOnMap,
}) => {
  const [isFavorited, setIsFavorited] = React.useState(false);

  return (
    <div className="mobile-screen mobile-details-screen">
      {/* Top Header */}
      <header className="mobile-details-header">
        <button
          type="button"
          className="m-header-back-btn"
          onClick={onBack}
          aria-label="Back to destinations"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="m-details-title">Destination Details</h1>

        <button
          type="button"
          className={`m-favorite-btn ${isFavorited ? 'active' : ''}`}
          onClick={() => setIsFavorited(!isFavorited)}
          aria-label="Favorite destination"
        >
          <Heart size={20} className={isFavorited ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </header>

      {/* Main Scrollable Content */}
      <div className="mobile-details-body">
        {/* Building Banner / Photo Graphic */}
        <div className="m-details-banner">
          <div className="m-banner-overlay">
            <div className="m-banner-badge">
              <Compass size={14} />
              <span>Location #{destination.id}</span>
            </div>
            <div className="m-banner-icon-circle">
              <Building2 size={36} />
            </div>
            <span className="m-banner-caption">
              {destination.building_name || 'Shanthivana Campus Landmark'}
            </span>
          </div>
        </div>

        {/* Destination Information */}
        <div className="m-details-content-card">
          <h2 className="m-dest-main-title">{destination.name}</h2>

          <div className="m-dest-tags-row">
            <span className={`m-category-badge tag-${destination.category.toLowerCase()}`}>
              {destination.category.toUpperCase()}
            </span>
          </div>

          <div className="m-dest-location-row">
            <MapPin size={16} className="m-pin-green" />
            <span className="m-location-text">
              {destination.building_name || 'Independent Campus Sector'}
            </span>
          </div>

          {destination.description && (
            <p className="m-dest-description-text">{destination.description}</p>
          )}

          {/* Verification Status Warning Box */}
          <div className="m-survey-warning-box">
            <div className="m-warning-header">
              <AlertTriangle size={17} className="m-warning-icon" />
              <strong>Location coordinates pending onsite verification</strong>
            </div>
            <p className="m-warning-sub">
              Exact location is being verified during the campus survey.
            </p>
          </div>

          {/* Metadata Key-Value Details */}
          <div className="m-metadata-table">
            <div className="m-meta-row">
              <div className="m-meta-key">
                <Building2 size={16} className="m-meta-icon" />
                <span>Category</span>
              </div>
              <div className="m-meta-val">{destination.category}</div>
            </div>

            <div className="m-meta-row">
              <div className="m-meta-key">
                <Building size={16} className="m-meta-icon" />
                <span>Building / Area</span>
              </div>
              <div className="m-meta-val">
                {destination.building_name || 'Campus Grounds'}
              </div>
            </div>

            <div className="m-meta-row">
              <div className="m-meta-key">
                <CircleDot size={16} className="m-meta-icon text-emerald-600" />
                <span>Status</span>
              </div>
              <div className="m-meta-val active-status">Active</div>
            </div>

            <div className="m-meta-row">
              <div className="m-meta-key">
                <Clock size={16} className="m-meta-icon text-amber-600" />
                <span>Verified</span>
              </div>
              <div className="m-meta-val unverified-status">Not yet verified</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="m-details-actions">
            <button
              type="button"
              className="btn-navigate-primary"
              onClick={() => onNavigateHere(destination)}
            >
              <Navigation size={18} />
              <span>Navigate Here</span>
            </button>

            <button
              type="button"
              className="btn-view-map-secondary"
              onClick={() => onViewOnMap(destination)}
            >
              <MapIcon size={18} />
              <span>View on Campus Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
