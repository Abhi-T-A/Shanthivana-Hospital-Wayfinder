import React, { useState } from 'react';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Info,
  RotateCcw,
} from 'lucide-react';
import type { Destination } from '../types/destination';

interface MobileCampusMapViewProps {
  onBack: () => void;
  selectedDestination?: Destination | null;
  onClearSelectedDestination?: () => void;
}

export const MobileCampusMapView: React.FC<MobileCampusMapViewProps> = ({
  onBack,
  selectedDestination,
  onClearSelectedDestination,
}) => {
  const [zoom, setZoom] = useState<number>(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setZoom(1);

  return (
    <div className="mobile-screen mobile-map-screen">
      {/* Top Header */}
      <header className="mobile-map-header">
        <button
          type="button"
          className="m-header-back-btn"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="m-map-header-text">
          <h1 className="m-map-title">Campus Map</h1>
          <p className="m-map-sub">Shanthivana Nature Cure Centre</p>
        </div>
      </header>

      {/* Map Interactive Viewport */}
      <div className="m-campus-map-area">
        {/* Floating Zoom Controls */}
        <div className="m-nav-floating-controls">
          <button
            type="button"
            className="m-map-ctrl-btn"
            onClick={handleReset}
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw size={17} />
          </button>
          <button
            type="button"
            className="m-map-ctrl-btn"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            className="m-map-ctrl-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
        </div>

        {/* Selected location pill if coming from destination details */}
        {selectedDestination && (
          <div className="m-map-selected-pill">
            <Crosshair size={14} className="m-pill-icon" />
            <span className="m-pill-name">{selectedDestination.name}</span>
            {onClearSelectedDestination && (
              <button
                type="button"
                className="m-pill-close"
                onClick={onClearSelectedDestination}
                aria-label="Clear highlight"
              >
                &times;
              </button>
            )}
          </div>
        )}

        {/* Canvas wrapper */}
        <div className="m-campus-map-viewport">
          <div
            className="m-campus-canvas-transform"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <img
              src="/shanthivana-campus-map.jpg"
              alt="Shanthivana Hospital Campus Official Layout"
              className="m-campus-map-img"
            />
          </div>
        </div>
      </div>

      {/* Bottom Sheet Information & Legend matching Screen 5 */}
      <div className="m-map-bottom-sheet">
        <div className="m-map-info-header">
          <div className="m-info-icon-circle">
            <Info size={18} />
          </div>
          <div>
            <h3 className="m-map-info-title">Map Information</h3>
            <p className="m-map-info-desc">
              This is an illustrative campus layout. Exact locations and walking routes are under
              verification.
            </p>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="m-map-legend-grid">
          <div className="m-legend-item">
            <span className="m-legend-swatch legend-path">→</span>
            <span className="m-legend-label">Main Paths (Illustrative)</span>
          </div>

          <div className="m-legend-item">
            <span className="m-legend-swatch legend-hospital"></span>
            <span className="m-legend-label">Hospital Buildings</span>
          </div>

          <div className="m-legend-item">
            <span className="m-legend-swatch legend-cottages"></span>
            <span className="m-legend-label">Cottages</span>
          </div>

          <div className="m-legend-item">
            <span className="m-legend-swatch legend-yoga"></span>
            <span className="m-legend-label">Yoga Halls</span>
          </div>

          <div className="m-legend-item">
            <span className="m-legend-swatch legend-greenery"></span>
            <span className="m-legend-label">Green Areas</span>
          </div>

          <div className="m-legend-item">
            <span className="m-legend-swatch legend-water"></span>
            <span className="m-legend-label">Water / Pool</span>
          </div>
        </div>
      </div>
    </div>
  );
};
