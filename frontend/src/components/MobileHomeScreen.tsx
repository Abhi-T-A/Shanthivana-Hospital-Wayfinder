import React from 'react';
import {
  Compass,
  Search,
  Map as MapIcon,
  ListChecks,
  HeartPulse,
  Bed,
  Sparkles,
  Stethoscope,
  Building2,
  Store,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import type { CategoryFilter } from '../types/destination';

interface MobileHomeScreenProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  onNavigateToDestinations: () => void;
  onNavigateToMap: () => void;
  isBackendOnline: boolean;
  totalDestinations: number;
}

const CATEGORY_CHIPS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hospital', label: 'Hospital' },
  { id: 'accommodation', label: 'Rooms' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'administrative', label: 'Admin' },
  { id: 'amenity', label: 'Amenities' },
  { id: 'entrance', label: 'Entrance' },
  { id: 'utility', label: 'Utilities' },
];

const QUICK_CATEGORIES: {
  id: CategoryFilter;
  label: string;
  icon: React.ReactNode;
  bgClass: string;
}[] = [
  {
    id: 'hospital',
    label: 'Hospital & Clinical',
    icon: <HeartPulse size={22} className="qc-icon qc-hospital" />,
    bgClass: 'qc-bg-hospital',
  },
  {
    id: 'accommodation',
    label: 'Rooms & Cottages',
    icon: <Bed size={22} className="qc-icon qc-rooms" />,
    bgClass: 'qc-bg-rooms',
  },
  {
    id: 'yoga',
    label: 'Yoga Halls',
    icon: <Sparkles size={22} className="qc-icon qc-yoga" />,
    bgClass: 'qc-bg-yoga',
  },
  {
    id: 'wellness',
    label: 'Therapy & Wellness',
    icon: <Stethoscope size={22} className="qc-icon qc-wellness" />,
    bgClass: 'qc-bg-wellness',
  },
  {
    id: 'administrative',
    label: 'Administration',
    icon: <Building2 size={22} className="qc-icon qc-admin" />,
    bgClass: 'qc-bg-admin',
  },
  {
    id: 'amenity',
    label: 'Amenities',
    icon: <Store size={22} className="qc-icon qc-amenities" />,
    bgClass: 'qc-bg-amenities',
  },
];

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onNavigateToDestinations,
  onNavigateToMap,
  isBackendOnline,
  totalDestinations,
}) => {
  const handleCategoryChipClick = (cat: CategoryFilter) => {
    onSelectCategory(cat);
    onNavigateToDestinations();
  };

  const handleQuickCategoryClick = (cat: CategoryFilter) => {
    onSelectCategory(cat);
    onNavigateToDestinations();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToDestinations();
  };

  return (
    <div className="mobile-screen mobile-home-screen">
      {/* Mobile Top Header */}
      <header className="mobile-home-header">
        <div className="m-header-left">
          <div className="m-header-logo-circle">
            <Compass size={22} />
          </div>
          <div className="m-header-text">
            <h1 className="m-header-title">Shanthivana Smart Wayfinder</h1>
            <p className="m-header-subtitle">
              S.D.M. Yoga and Nature Cure Hospital, Dharmasthala
            </p>
          </div>
        </div>

        <div className="m-header-right">
          <span className={`m-online-pill ${isBackendOnline ? 'online' : 'offline'}`}>
            <span className="m-online-dot"></span>
            <span>{isBackendOnline ? 'Online' : 'Offline'}</span>
          </span>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="mobile-home-body">
        {/* Welcome Text */}
        <div className="m-home-welcome">
          <h2 className="m-welcome-heading">Find Your Destination</h2>
          <p className="m-welcome-sub">Where would you like to go?</p>
        </div>

        {/* Search Bar */}
        <form className="m-home-search-form" onSubmit={handleSearchSubmit}>
          <div className="m-home-search-box">
            <Search size={18} className="m-search-icon" />
            <input
              type="text"
              className="m-search-input"
              placeholder="Search wards, rooms, yoga halls..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) {
                  onNavigateToDestinations();
                }
              }}
              aria-label="Search destinations"
            />
          </div>
        </form>

        {/* Category Horizontal Filter Pills */}
        <div className="m-chips-scroll-wrap">
          <div className="m-chips-container">
            {CATEGORY_CHIPS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`m-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryChipClick(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two Prominent Action Cards */}
        <div className="m-action-cards-grid">
          <button
            type="button"
            className="m-action-card explore-card"
            onClick={onNavigateToDestinations}
          >
            <div className="m-action-icon-wrap explore-icon">
              <ListChecks size={24} />
            </div>
            <span className="m-action-title">Explore All Destinations</span>
          </button>

          <button
            type="button"
            className="m-action-card map-card"
            onClick={onNavigateToMap}
          >
            <div className="m-action-icon-wrap map-icon">
              <MapIcon size={24} />
            </div>
            <span className="m-action-title">View Campus Map</span>
          </button>
        </div>

        {/* Quick Categories Section */}
        <section className="m-quick-categories-section">
          <h3 className="m-section-title">Quick Categories</h3>
          <div className="m-quick-grid">
            {QUICK_CATEGORIES.map((qc) => (
              <button
                key={qc.id}
                type="button"
                className={`m-quick-card ${qc.bgClass}`}
                onClick={() => handleQuickCategoryClick(qc.id)}
              >
                <div className="m-quick-icon-wrap">{qc.icon}</div>
                <span className="m-quick-label">{qc.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Summary Banner */}
        <div
          className="m-dest-banner-card"
          onClick={onNavigateToDestinations}
          role="button"
          tabIndex={0}
        >
          <div className="m-banner-pin-circle">
            <MapPin size={20} />
          </div>
          <div className="m-banner-text">
            <strong className="m-banner-title">{totalDestinations} Campus Destinations</strong>
            <p className="m-banner-sub">
              Find patient wards, cottages, yoga halls, treatment sections and more.
            </p>
          </div>
          <ChevronRight size={18} className="m-banner-arrow" />
        </div>
      </div>
    </div>
  );
};
