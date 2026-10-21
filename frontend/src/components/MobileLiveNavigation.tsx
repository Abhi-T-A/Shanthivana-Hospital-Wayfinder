import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Crosshair,
  AlertTriangle,
  Square,
  Building2,
  ChevronRight,
  Locate,
} from 'lucide-react';
import type { Destination } from '../types/destination';
import type { UserCoordinates, GeolocationStatus } from '../types/route';

interface MobileLiveNavigationProps {
  destination: Destination;
  onStopNavigation: () => void;
  onViewDetails: () => void;
}

export const MobileLiveNavigation: React.FC<MobileLiveNavigationProps> = ({
  destination,
  onStopNavigation,
  onViewDetails,
}) => {
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>('idle');
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [zoom, setZoom] = useState<number>(1.1);

  // Stop location tracking safely
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Request browser location and continuous watch
  const startLocationTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }

    setGeoStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        });
        setGeoStatus('granted');

        // Continuous watch
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            setUserCoords({
              latitude: watchPos.coords.latitude,
              longitude: watchPos.coords.longitude,
              accuracy: Math.round(watchPos.coords.accuracy),
              heading: watchPos.coords.heading,
              speed: watchPos.coords.speed,
              timestamp: watchPos.timestamp,
            });
          },
          (err) => {
            console.warn('Geolocation watch error:', err.message);
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 4000 }
        );
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus('denied');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoStatus('unavailable');
        } else {
          setGeoStatus('timeout');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, []);

  // Attempt initial GPS tracking on mount
  useEffect(() => {
    startLocationTracking();

    return () => {
      stopLocationTracking();
    };
  }, [startLocationTracking, stopLocationTracking]);

  // Handle Stop Navigation
  const handleStop = () => {
    stopLocationTracking();
    onStopNavigation();
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.8));
  const handleRecenter = () => setZoom(1.1);

  return (
    <div className="mobile-screen mobile-nav-screen">
      {/* Top Header */}
      <header className="mobile-nav-header">
        <button
          type="button"
          className="m-header-back-btn"
          onClick={handleStop}
          aria-label="Exit navigation"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="m-nav-header-title">Navigate to {destination.name}</h1>
      </header>

      {/* Full-Width Map Canvas Area */}
      <div className="m-nav-map-area">
        {/* Floating Zoom Controls */}
        <div className="m-nav-floating-controls">
          <button
            type="button"
            className="m-map-ctrl-btn"
            onClick={handleRecenter}
            title="Recenter Map"
            aria-label="Recenter Map"
          >
            <Crosshair size={18} />
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

        {/* Map Image Viewport */}
        <div className="m-nav-map-viewport">
          <div
            className="m-nav-canvas-transform"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <img
              src="/shanthivana-campus-map.jpg"
              alt="Shanthivana Live Campus Navigation Map"
              className="m-nav-map-img"
            />
          </div>
        </div>

        {/* User Location Badge Overlay */}
        {geoStatus === 'granted' && userCoords && (
          <div className="m-user-loc-indicator">
            <span className="m-loc-pulse"></span>
            <span>Your Location (±{userCoords.accuracy}m)</span>
          </div>
        )}
      </div>

      {/* Floating Bottom Card matching Screen 4 */}
      <div className="m-nav-bottom-sheet">
        {/* Destination Summary Row */}
        <div
          className="m-nav-sheet-dest-row"
          onClick={onViewDetails}
          role="button"
          tabIndex={0}
        >
          <div className="m-sheet-thumb">
            <Building2 size={20} />
          </div>

          <div className="m-sheet-dest-info">
            <h3 className="m-sheet-dest-name">{destination.name}</h3>
            <span className="m-sheet-dest-cat">{destination.category}</span>
          </div>

          <ChevronRight size={18} className="m-sheet-chevron" />
        </div>

        {/* Warning Banner: Navigation in Preview Mode */}
        <div className="m-sheet-preview-alert">
          <div className="m-preview-alert-header">
            <AlertTriangle size={16} className="m-alert-icon-amber" />
            <strong>Navigation is in preview mode</strong>
          </div>
          <p className="m-preview-alert-desc">
            Routes are available only for verified locations. Some locations may not have
            navigation yet.
          </p>
        </div>

        {/* Current Location GPS Status */}
        <div className="m-sheet-gps-status">
          <div className="m-gps-bullet-row">
            <span className={`m-gps-circle-dot ${geoStatus === 'granted' ? 'active' : ''}`}></span>
            <div className="m-gps-text-wrap">
              <strong>Current Location</strong>
              <p>
                {geoStatus === 'granted'
                  ? 'Using your device location (GPS)'
                  : geoStatus === 'requesting'
                  ? 'Acquiring GPS location fix...'
                  : geoStatus === 'denied'
                  ? 'Location permission denied (Tap to enable)'
                  : 'GPS standby mode'}
              </p>
            </div>
          </div>

          {geoStatus === 'denied' && (
            <button
              type="button"
              className="m-btn-enable-gps-mini"
              onClick={startLocationTracking}
            >
              <Locate size={13} />
              <span>Allow GPS</span>
            </button>
          )}
        </div>

        {/* Prominent Red Stop Navigation Button */}
        <button
          type="button"
          className="btn-stop-navigation"
          onClick={handleStop}
        >
          <Square size={16} className="fill-current" />
          <span>Stop Navigation</span>
        </button>
      </div>
    </div>
  );
};
