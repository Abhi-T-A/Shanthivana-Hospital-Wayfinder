import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import type { CategoryFilter } from '../types/destination';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  onClearAll: () => void;
  totalResults: number;
  totalCampusDestinations: number;
}

const CATEGORIES: { id: CategoryFilter; label: string; shortLabel: string }[] = [
  { id: 'all', label: 'All Destinations', shortLabel: 'ALL' },
  { id: 'hospital', label: 'Hospital & Clinical', shortLabel: 'HOSPITAL' },
  { id: 'accommodation', label: 'Rooms & Cottages', shortLabel: 'ROOMS & COTTAGES' },
  { id: 'yoga', label: 'Yoga Halls', shortLabel: 'YOGA' },
  { id: 'wellness', label: 'Therapy & Wellness', shortLabel: 'WELLNESS' },
  { id: 'administrative', label: 'Administration', shortLabel: 'ADMIN' },
  { id: 'amenity', label: 'Amenities', shortLabel: 'AMENITIES' },
  { id: 'entrance', label: 'Entrance', shortLabel: 'ENTRANCE' },
  { id: 'utility', label: 'Utilities', shortLabel: 'UTILITY' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onClearAll,
  totalResults,
  totalCampusDestinations,
}) => {
  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all';

  return (
    <div className="search-section">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={19} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search destinations (e.g. Reception, A Block, Yoga)..."
          className="search-input"
          aria-label="Search destinations"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Horizontally scrollable on mobile */}
      <div className="categories-scroll-wrapper">
        <div className="categories-scroll-container">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <span className="chip-short">{cat.shortLabel}</span>
              <span className="chip-full">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="search-meta-bar">
        <div className="section-count-heading">
          <span className="count-label">CAMPUS DESTINATIONS</span>
          <span className="count-badge">({totalResults}{totalResults !== totalCampusDestinations ? ` of ${totalCampusDestinations}` : ''})</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="reset-filters-btn"
            onClick={onClearAll}
            title="Reset filters"
          >
            <RotateCcw size={13} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
