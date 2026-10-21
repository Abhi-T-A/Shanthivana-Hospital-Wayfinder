import React, { useState } from 'react';
import type { Destination } from '../types/destination';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Maximize2, X, Compass } from 'lucide-react';

interface CampusMapProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDestination: Destination | null;
  onClearSelection: () => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  isOpen,
  onClose,
  selectedDestination,
  onClearSelection,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="map-modal-backdrop" onClick={onClose}>
      <div 
        className={`map-modal-container ${isFullScreen ? 'map-fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Campus Overview Map"
      >
        <div className="map-toolbar">
          <div className="map-title-row">
            <div className="map-icon-box">
              <Compass size={20} />
            </div>
            <div>
              <h2 className="map-heading">Shanthivana Campus Overview Map</h2>
              <p className="map-subheading">Official Illustrated Layout — Dharmasthala, Karnataka</p>
            </div>
          </div>

          <div className="map-controls">
            <button 
              type="button"
              className="control-btn" 
              onClick={handleZoomIn} 
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button 
              type="button"
              className="control-btn" 
              onClick={handleZoomOut} 
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <button 
              type="button"
              className="control-btn" 
              onClick={handleResetZoom} 
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              type="button"
              className="control-btn" 
              onClick={() => setIsFullScreen(!isFullScreen)} 
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label="Toggle fullscreen"
            >
              <Maximize2 size={16} />
            </button>
            <button 
              type="button"
              className="control-btn close-btn" 
              onClick={onClose} 
              title="Close Map View"
              aria-label="Close map"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Survey Calibration Notice */}
        <div className="survey-banner">
          <AlertTriangle size={18} className="survey-icon" />
          <div className="survey-text">
            <strong>Orientation Reference Only:</strong> Illustrated pathways and landmark sketches are for general campus orientation. Exact location coordinates and pedestrian path edges are pending onsite surveyor verification. Illustrated lines must <em>not</em> be interpreted as certified turn-by-turn routes.
          </div>
        </div>

        {/* Selected location orientation pill if any */}
        {selectedDestination && (
          <div className="selected-location-toast">
            <div className="toast-content">
              <span className="toast-label">Highlighting:</span>
              <span className="toast-name">{selectedDestination.name}</span>
              {selectedDestination.building_name && (
                <span className="toast-building">({selectedDestination.building_name})</span>
              )}
            </div>
            <button 
              type="button" 
              className="toast-close" 
              onClick={onClearSelection}
              title="Clear Highlight"
            >
              &times;
            </button>
          </div>
        )}

        {/* Map Viewport */}
        <div className="map-viewport">
          <div 
            className="map-image-wrapper"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <img
              src="/shanthivana-campus-map.jpg"
              alt="Shanthivana Nature Cure Centre Campus Map Illustration"
              className="campus-map-img"
              loading="lazy"
            />
          </div>
        </div>
        
        <div className="map-caption">
          <span>Illustration courtesy of S.D.M. Yoga and Nature Cure Hospital, Dharmasthala.</span>
          <span className="zoom-indicator">Zoom Scale: {Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
