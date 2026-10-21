import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Destination } from '../types/destination';
import type { UserCoordinates, GeolocationStatus, RouteFindResponse } from '../types/route';
import { api } from '../services/api';
import {
  ArrowLeft,
  Navigation,
  Compass,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Locate,
  LocateOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Building,
  Info,
  Clock,
  ExternalLink,
  Map as MapIcon,
} from 'lucide-react';

interface LiveNavigationViewProps {
  destination: Destination;
  onExit: () => void;
  onViewDestinationDetails?: (destination: Destination) => void;
}

export const LiveNavigationView: React.FC<LiveNavigationViewProps> = ({
  destination,
  onExit,
  onViewDestinationDetails,
}) => {
  // Geolocation states
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>('prompt');
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Backend Route verification states
  const [isCheckingBackend, setIsCheckingBackend] = useState<boolean>(true);
  const [verifiedNodesCount, setVerifiedNodesCount] = useState<number>(0);
  const [verifiedEdgesCount, setVerifiedEdgesCount] = useState<number>(0);
  const [routeData, setRouteData] = useState<RouteFindResponse | null>(null);
  const [routeNotice, setRouteNotice] = useState<string>('');

  // Map interactive zoom
  const [zoom, setZoom] = useState<number>(1);

  // Stop location tracking and exit
  const handleExit = useCallback(() => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    onExit();
  }, [onExit]);

  // Clean up watchPosition on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Request browser location with watchPosition
  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      setLocationError('Your browser or device does not support the Geolocation API.');
      return;
    }

    setGeoStatus('requesting');
    setLocationError(null);

    // Initial position fetch
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: UserCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        setUserCoords(coords);
        setGeoStatus('granted');
        setLocationError(null);

        // Start live continuous watching
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
          (watchErr) => {
            console.warn('Geolocation watch error:', watchErr.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 4000,
          }
        );
      },
      (error) => {
        let errorMsg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          setGeoStatus('denied');
          errorMsg = 'Location permission was denied. Please allow location access in your browser settings to display your live position on campus.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoStatus('unavailable');
          errorMsg = 'GPS location is currently unavailable. Ensure device location is turned on and try stepping outdoors.';
        } else if (error.code === error.TIMEOUT) {
          setGeoStatus('timeout');
          errorMsg = 'Location request timed out while acquiring GPS fix. You can retry anytime.';
        }
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  }, []);

  // Inspect existing backend routing service & database readiness
  useEffect(() => {
    let isMounted = true;
    const inspectBackendRouting = async () => {
      setIsCheckingBackend(true);
      try {
        // Query verified route nodes & edges
        const [nodesRes, edgesRes] = await Promise.all([
          api.getRouteNodes(true),
          api.getRouteEdges(true),
        ]);

        if (!isMounted) return;

        setVerifiedNodesCount(nodesRes.total);
        setVerifiedEdgesCount(edgesRes.total);

        // Check if verified data exists for route calculation
        if (nodesRes.total === 0 || edgesRes.total === 0) {
          setRouteData(null);
          setRouteNotice(
            'Route engine is active, but 0 verified route nodes and edges currently exist in the database. Walking routes require ground-truth surveyor mapping.'
          );
        } else {
          // If nodes exist in future, route calculation would be triggered here
          setRouteNotice(`Found ${nodesRes.total} verified route nodes and ${edgesRes.total} verified pathway edges.`);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error checking route data:', err);
        setRouteNotice('Unable to verify route data with backend routing service.');
      } finally {
        if (isMounted) {
          setIsCheckingBackend(false);
        }
      }
    };

    inspectBackendRouting();

    return () => {
      isMounted = false;
    };
  }, [destination]);

  // Map zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  // Approximate check for Shanthivana / Dharmasthala vicinity (~12.95°N, 75.38°E)
  const isNearCampus = userCoords
    ? Math.abs(userCoords.latitude - 12.95) < 0.2 && Math.abs(userCoords.longitude - 75.38) < 0.2
    : null;

  return (
    <div className="live-nav-screen" role="region" aria-label="Campus Live Navigation">
      {/* Top Header Bar */}
      <header className="live-nav-header">
        <div className="live-nav-header-inner">
          <button
            type="button"
            className="live-nav-back-btn"
            onClick={handleExit}
            aria-label="Exit campus navigation"
          >
            <ArrowLeft size={18} />
            <span>Return to Directory</span>
          </button>

          <div className="live-nav-status-pill">
            {geoStatus === 'granted' ? (
              <span className="gps-pill active">
                <span className="radar-pulse"></span>
                <span>GPS Live Active</span>
              </span>
            ) : geoStatus === 'requesting' ? (
              <span className="gps-pill acquiring">
                <Locate size={14} className="spin-icon" />
                <span>Acquiring GPS...</span>
              </span>
            ) : geoStatus === 'denied' ? (
              <span className="gps-pill denied">
                <LocateOff size={14} />
                <span>GPS Denied</span>
              </span>
            ) : (
              <span className="gps-pill standby">
                <Compass size={14} />
                <span>GPS Standby</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Navigation Content Scroll Container */}
      <div className="live-nav-content">
        {/* Selected Destination Card */}
        <section className="live-nav-dest-card" aria-label="Selected Destination Info">
          <div className="live-dest-header">
            <div>
              <span className={`category-tag tag-${destination.category.toLowerCase()}`}>
                {destination.category}
              </span>
              <h1 className="live-dest-title">{destination.name}</h1>
              {destination.building_name && (
                <div className="live-dest-building">
                  <Building size={15} />
                  <span>{destination.building_name}</span>
                </div>
              )}
            </div>

            <div className="live-dest-id-badge">
              <span>#{destination.id}</span>
            </div>
          </div>

          {destination.description && (
            <p className="live-dest-desc">{destination.description}</p>
          )}

          {onViewDestinationDetails && (
            <button
              type="button"
              className="live-dest-details-link"
              onClick={() => onViewDestinationDetails(destination)}
            >
              <Info size={14} />
              <span>View Full Campus Landmark Info</span>
              <ExternalLink size={12} />
            </button>
          )}
        </section>

        {/* Pre-Permission Disclosure Card (Shown when status is prompt) */}
        {geoStatus === 'prompt' && (
          <section className="location-permission-card" aria-label="Location Permission Request">
            <div className="permission-icon-wrapper">
              <Compass size={28} className="permission-icon" />
            </div>

            <h2 className="permission-title">Enable Campus GPS Navigation</h2>

            <p className="permission-desc">
              To guide you to <strong>{destination.name}</strong> from where you are standing on campus,
              Wayfinder needs access to your device’s current location.
            </p>

            <div className="permission-guarantees">
              <div className="guarantee-item">
                <ShieldCheck size={18} className="guarantee-icon" />
                <div>
                  <strong>No Entrance Assumption:</strong> We never assume you are starting from the main entrance. Real-time GPS locates your actual position on the campus grounds.
                </div>
              </div>
              <div className="guarantee-item">
                <CheckCircle2 size={18} className="guarantee-icon" />
                <div>
                  <strong>Privacy Protected:</strong> Your coordinates are processed entirely in your browser and are never stored or shared with external tracking services.
                </div>
              </div>
            </div>

            <div className="permission-actions">
              <button
                type="button"
                className="btn-enable-gps"
                onClick={requestLocation}
              >
                <Navigation size={18} />
                <span>Allow Location Access</span>
              </button>

              <button
                type="button"
                className="btn-skip-gps"
                onClick={() => setGeoStatus('skipped')}
              >
                <span>Continue Without GPS</span>
              </button>
            </div>
          </section>
        )}

        {/* Live GPS Positioning Status Card */}
        {geoStatus === 'granted' && userCoords && (
          <section className="live-coords-card" aria-label="Live GPS Reading">
            <div className="coords-header">
              <div className="coords-title-row">
                <span className="radar-dot"></span>
                <span className="coords-headline">Current Visitor Position</span>
              </div>
              <span className="coords-accuracy-badge">
                Accuracy: ±{userCoords.accuracy}m
              </span>
            </div>

            <div className="coords-grid">
              <div className="coord-box">
                <span className="coord-label">Latitude</span>
                <span className="coord-val">{userCoords.latitude.toFixed(6)}° N</span>
              </div>
              <div className="coord-box">
                <span className="coord-label">Longitude</span>
                <span className="coord-val">{userCoords.longitude.toFixed(6)}° E</span>
              </div>
            </div>

            {isNearCampus === false && (
              <div className="campus-proximity-note">
                <Info size={15} />
                <span>
                  Current GPS coordinates are outside the physical Shanthivana Dharmasthala campus perimeter. Live routing calibration will activate automatically when you arrive onsite.
                </span>
              </div>
            )}
          </section>
        )}

        {/* Geolocation Denied / Error Guidance Banner */}
        {(geoStatus === 'denied' || geoStatus === 'unavailable' || geoStatus === 'timeout' || geoStatus === 'unsupported') && (
          <div className="geo-error-card">
            <div className="geo-error-icon-box">
              <LocateOff size={20} />
            </div>
            <div className="geo-error-content">
              <strong>GPS Positioning Inactive</strong>
              <p>{locationError || 'Location access is required to display your live position on campus.'}</p>
              {geoStatus !== 'unsupported' && (
                <button
                  type="button"
                  className="btn-retry-gps"
                  onClick={requestLocation}
                >
                  <Locate size={15} />
                  <span>Retry Location Access</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Verified Route Status & Safety Integrity Section */}
        <section className="route-readiness-card" aria-label="Verified Route Integrity">
          <div className="route-readiness-header">
            <div className="route-header-icon-box">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="route-readiness-title">Verified Walking Route Status</h3>
              <p className="route-readiness-sub">
                Backend Dijkstra Engine: <code>/api/v1/routes/find</code>
              </p>
            </div>
          </div>

          <div className="route-status-body">
            {isCheckingBackend ? (
              <div className="route-loading-state">
                <div className="inline-spinner"></div>
                <span>Checking verified pathway nodes and edges in database...</span>
              </div>
            ) : verifiedNodesCount === 0 || verifiedEdgesCount === 0 ? (
              <div className="route-unverified-notice">
                <div className="unverified-badge-row">
                  <span className="badge-unverified">
                    Survey Status: Pending Onsite GPS Survey
                  </span>
                  <span className="badge-db-nodes">
                    {verifiedNodesCount} Verified Nodes • {verifiedEdgesCount} Verified Edges
                  </span>
                </div>

                <p className="unverified-text">
                  Direct navigation for <strong>{destination.name}</strong> is held safely because
                  pathway nodes and walking edges have not yet undergone physical onsite GPS survey verification.
                </p>

                <div className="safety-policy-box">
                  <div className="safety-bullet">
                    <ShieldCheck size={16} className="safety-bullet-icon" />
                    <span>
                      <strong>Strict Safety Policy:</strong> In accordance with medical campus safety standards, Wayfinder never fabricates routes from guessed coordinates or draws unverified paths.
                    </span>
                  </div>
                  <div className="safety-bullet">
                    <Info size={16} className="safety-bullet-icon" />
                    <span>
                      <strong>Illustrative Arrows Policy:</strong> Decorative or directional arrows printed on the architectural campus map are visual sketches and are never treated as verified walking directions.
                    </span>
                  </div>
                </div>
              </div>
            ) : routeData ? (
              <div className="route-calculated-box">
                <div className="route-calc-header">
                  <Clock size={16} />
                  <span>Verified Walking Route Found</span>
                </div>
                <div className="route-calc-stats">
                  <div>Distance: <strong>{routeData.total_distance_meters}m</strong></div>
                  <div>Est. Walking Time: <strong>{Math.ceil(routeData.total_distance_meters / 80)} min</strong></div>
                </div>
              </div>
            ) : (
              <div className="route-unverified-notice">
                <p>{routeNotice}</p>
              </div>
            )}
          </div>
        </section>

        {/* Full-Width Mobile Campus Map Viewport */}
        <section className="live-nav-map-section" aria-label="Campus Map View">
          <div className="nav-map-header">
            <div className="nav-map-title">
              <MapIcon size={18} />
              <span>Full Campus Map View</span>
            </div>

            <div className="nav-map-zoom-controls">
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleZoomIn}
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleZoomOut}
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <div className="nav-map-viewport">
            <div
              className="nav-map-canvas-container"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              <img
                src="/shanthivana-campus-map.jpg"
                alt="Shanthivana Hospital Campus Illustrated Overview Map"
                className="nav-campus-map-img"
              />
            </div>
          </div>

          <div className="nav-map-footer-notice">
            <span>Official layout sketch • S.D.M. Yoga and Nature Cure Hospital, Dharmasthala</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </section>

        {/* Exit Navigation Bottom Floating Button */}
        <div className="live-nav-footer-action">
          <button
            type="button"
            className="btn-exit-navigation-full"
            onClick={handleExit}
          >
            <ArrowLeft size={18} />
            <span>Exit Navigation & Return to Directory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
