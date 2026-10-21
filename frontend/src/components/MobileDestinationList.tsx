import React from 'react';
import {
  ArrowLeft,
  Search,
  X,
  ChevronRight,
  HeartPulse,
  Bed,
  Sparkles,
  Stethoscope,
  Building2,
  Store,
  DoorOpen,
  Wrench,
  FlaskConical,
  Waves,
  Trees,
  Car,
  MapPinOff,
} from 'lucide-react';
import type { Destination, CategoryFilter } from '../types/destination';

interface MobileDestinationListProps {
  destinations: Destination[];
  totalDestinations: number;
  totalFilteredResults: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  onSelectDestination: (dest: Destination) => void;
  onBackToHome: () => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

const CATEGORY_CHIPS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hospital', label: 'Hospital' },
  { id: 'accommodation', label: 'Rooms' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'administrative', label: 'Admin' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'amenity', label: 'Amenities' },
  { id: 'entrance', label: 'Entrance' },
  { id: 'utility', label: 'Utilities' },
];

export const MobileDestinationList: React.FC<MobileDestinationListProps> = ({
  destinations,
  totalDestinations,
  totalFilteredResults,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onSelectDestination,
  onBackToHome,
  onClearFilters,
  isLoading,
}) => {
  // Map specific icons for each destination slug/category matching reference image
  const getDestinationIcon = (dest: Destination) => {
    const slug = dest.slug.toLowerCase();
    const cat = dest.category.toLowerCase();

    if (slug.includes('entrance') || slug.includes('gate')) {
      return <DoorOpen size={20} className="m-row-icon icon-entrance" />;
    }
    if (slug === 'reception') {
      return <Building2 size={20} className="m-row-icon icon-reception" />;
    }
    if (slug === 'administrative-block') {
      return <Building2 size={20} className="m-row-icon icon-admin" />;
    }
    if (slug.includes('laboratory')) {
      return <FlaskConical size={20} className="m-row-icon icon-lab" />;
    }
    if (slug.includes('treatment')) {
      return <Stethoscope size={20} className="m-row-icon icon-treatment" />;
    }
    if (slug.includes('swimming') || slug.includes('pool')) {
      return <Waves size={20} className="m-row-icon icon-pool" />;
    }
    if (slug.includes('parking')) {
      return <Car size={20} className="m-row-icon icon-parking" />;
    }
    if (slug.includes('cottages') || slug.includes('huts') || slug.includes('villa')) {
      return <Trees size={20} className="m-row-icon icon-cottage" />;
    }
    if (cat === 'hospital' || slug.includes('hospital') || slug.includes('ward')) {
      if (slug.includes('ward') || slug.includes('block-deluxe')) {
        return <Bed size={20} className="m-row-icon icon-ward" />;
      }
      return <HeartPulse size={20} className="m-row-icon icon-hospital" />;
    }
    if (cat === 'accommodation') {
      return <Bed size={20} className="m-row-icon icon-bed" />;
    }
    if (cat === 'yoga') {
      return <Sparkles size={20} className="m-row-icon icon-yoga" />;
    }
    if (cat === 'amenity' || slug.includes('shop') || slug.includes('dining')) {
      return <Store size={20} className="m-row-icon icon-amenity" />;
    }
    if (cat === 'utility' || slug.includes('stp')) {
      return <Wrench size={20} className="m-row-icon icon-utility" />;
    }

    return <Building2 size={20} className="m-row-icon icon-default" />;
  };

  const getSubtitle = (dest: Destination) => {
    if (dest.building_name) return dest.building_name;
    switch (dest.category.toLowerCase()) {
      case 'entrance':
        return 'Entrance';
      case 'accommodation':
        return 'Accommodation';
      case 'hospital':
        return 'Hospital';
      case 'yoga':
        return 'Yoga & Meditation';
      case 'wellness':
        return 'Therapy';
      case 'administrative':
        return 'Administration';
      case 'amenity':
        return 'Amenity';
      case 'utility':
        return 'Utility';
      default:
        return 'Campus Facility';
    }
  };

  return (
    <div className="mobile-screen mobile-list-screen">
      {/* Top Header */}
      <header className="mobile-list-header">
        <button
          type="button"
          className="m-header-back-btn"
          onClick={onBackToHome}
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="m-list-header-text">
          <h1 className="m-list-title">Campus Destinations ({totalFilteredResults})</h1>
          <p className="m-list-subtitle">Explore all locations at Shanthivana</p>
        </div>
      </header>

      {/* Search Input Box */}
      <div className="m-list-search-wrap">
        <div className="m-list-search-box">
          <Search size={18} className="m-search-icon" />
          <input
            type="text"
            className="m-list-search-input"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search destinations"
          />
          {searchQuery && (
            <button
              type="button"
              className="m-search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Horizontally Scrollable Category Pills */}
      <div className="m-chips-scroll-wrap list-mode">
        <div className="m-chips-container">
          {CATEGORY_CHIPS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`m-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations List */}
      <div className="m-list-scroll-body">
        {isLoading ? (
          <div className="m-list-skeleton-wrap">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="m-skeleton-row">
                <div className="m-skeleton-icon"></div>
                <div className="m-skeleton-lines">
                  <div className="m-skeleton-line title"></div>
                  <div className="m-skeleton-line sub"></div>
                </div>
                <div className="m-skeleton-arrow"></div>
              </div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="m-list-empty-wrap">
            <div className="m-empty-icon-circle">
              <MapPinOff size={28} />
            </div>
            <h3 className="m-empty-heading">No destinations found</h3>
            <p className="m-empty-sub">
              No campus locations matched your query "{searchQuery}".
            </p>
            <button
              type="button"
              className="m-empty-reset-btn"
              onClick={onClearFilters}
            >
              View All {totalDestinations} Destinations
            </button>
          </div>
        ) : (
          <div className="m-dest-rows-container">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="m-dest-row-item"
                onClick={() => onSelectDestination(dest)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDestination(dest);
                  }
                }}
              >
                <div className="m-row-icon-box">{getDestinationIcon(dest)}</div>

                <div className="m-row-info">
                  <h2 className="m-row-name">{dest.name}</h2>
                  <p className="m-row-sub">{getSubtitle(dest)}</p>
                </div>

                <ChevronRight size={18} className="m-row-chevron" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
