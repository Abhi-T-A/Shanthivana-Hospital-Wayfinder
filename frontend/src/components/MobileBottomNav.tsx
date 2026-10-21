import React from 'react';
import { Home, Compass, Map as MapIcon, MoreHorizontal } from 'lucide-react';

export type MobileTab = 'home' | 'destinations' | 'map' | 'more';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
        aria-label="Home Screen"
      >
        <Home size={20} className="nav-icon" />
        <span className="nav-label">Home</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'destinations' ? 'active' : ''}`}
        onClick={() => onTabChange('destinations')}
        aria-label="Campus Destinations"
      >
        <Compass size={20} className="nav-icon" />
        <span className="nav-label">Destinations</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'map' ? 'active' : ''}`}
        onClick={() => onTabChange('map')}
        aria-label="Campus Map"
      >
        <MapIcon size={20} className="nav-icon" />
        <span className="nav-label">Map</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'more' ? 'active' : ''}`}
        onClick={() => onTabChange('more')}
        aria-label="More Options"
      >
        <MoreHorizontal size={20} className="nav-icon" />
        <span className="nav-label">More</span>
      </button>
    </nav>
  );
};
