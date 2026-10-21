import React from 'react';
import type { Destination } from '../types/destination';
import {
  HeartPulse,
  Bed,
  Sparkles,
  Stethoscope,
  Building2,
  Store,
  DoorOpen,
  Wrench,
  ChevronRight,
  MapPinOff,
  MapPin,
  ChevronLeft,
} from 'lucide-react';

interface DestinationListProps {
  destinations: Destination[];
  totalDestinations: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedDestination: Destination | null;
  onSelectDestination: (dest: Destination) => void;
  onResetFilters?: () => void;
  isLoading: boolean;
}

export const DestinationList: React.FC<DestinationListProps> = ({
  destinations,
  totalDestinations,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedDestination,
  onSelectDestination,
  onResetFilters,
  isLoading,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hospital':
        return <HeartPulse size={20} className="cat-icon cat-hospital" />;
      case 'accommodation':
        return <Bed size={20} className="cat-icon cat-accommodation" />;
      case 'yoga':
        return <Sparkles size={20} className="cat-icon cat-yoga" />;
      case 'wellness':
        return <Stethoscope size={20} className="cat-icon cat-wellness" />;
      case 'administrative':
        return <Building2 size={20} className="cat-icon cat-admin" />;
      case 'amenity':
        return <Store size={20} className="cat-icon cat-amenity" />;
      case 'entrance':
        return <DoorOpen size={20} className="cat-icon cat-entrance" />;
      case 'utility':
        return <Wrench size={20} className="cat-icon cat-utility" />;
      default:
        return <Building2 size={20} className="cat-icon" />;
    }
  };

  const totalPages = Math.ceil(totalDestinations / pageSize) || 1;

  if (isLoading) {
    return (
      <div className="destinations-loading-container">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="menu-item-skeleton">
            <div className="skeleton-icon"></div>
            <div className="skeleton-content">
              <div className="skeleton-line title"></div>
              <div className="skeleton-line subtitle"></div>
            </div>
            <div className="skeleton-arrow"></div>
          </div>
        ))}
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="destinations-empty">
        <div className="empty-icon-wrap">
          <MapPinOff size={36} />
        </div>
        <h3 className="empty-title">No matching campus destinations found</h3>
        <p className="empty-desc">
          We couldn't find any location matching your search query or category filter.
        </p>
        {onResetFilters && (
          <button type="button" className="empty-reset-btn" onClick={onResetFilters}>
            View All 26 Campus Destinations
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="destination-directory-wrapper">
      {/* Container adapts: on mobile it is a sleek menu list; on desktop it is a card grid */}
      <div className="destinations-container-adaptive">
        {destinations.map((dest) => {
          const isSelected = selectedDestination?.id === dest.id;

          return (
            <div
              key={dest.id}
              className={`destination-entry ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDestination(dest)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDestination(dest);
                }
              }}
              aria-label={`View details for ${dest.name}`}
            >
              {/* Left: Icon container */}
              <div className="entry-icon-box">
                {getCategoryIcon(dest.category)}
              </div>

              {/* Middle: Name, Building, Category */}
              <div className="entry-main-content">
                <div className="entry-title-row">
                  <h3 className="entry-name">{dest.name}</h3>
                  <span className="entry-cat-badge desktop-only tag-${dest.category.toLowerCase()}">
                    {dest.category}
                  </span>
                </div>

                <div className="entry-sub-row">
                  {dest.building_name ? (
                    <span className="entry-building">
                      <MapPin size={12} className="building-icon-inline" />
                      {dest.building_name}
                    </span>
                  ) : (
                    <span className="entry-building independent">
                      {dest.category.toUpperCase()} • Campus Area
                    </span>
                  )}
                  <span className="mobile-only entry-bullet">•</span>
                  <span className="mobile-only entry-cat-text">
                    {dest.category}
                  </span>
                </div>

                {dest.description && (
                  <p className="entry-desc-desktop desktop-only">
                    {dest.description}
                  </p>
                )}
              </div>

              {/* Right: Chevron & Action info */}
              <div className="entry-trailing">
                <span className="desktop-only entry-survey-chip">
                  Survey Pending
                </span>
                <span className="desktop-only entry-view-label">
                  Details
                </span>
                <ChevronRight size={18} className="entry-chevron" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalDestinations > 0 && (
        <div className="pagination-bar">
          <div className="pagination-info">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <span className="pagination-total-note">
              ({totalDestinations} total locations)
            </span>
          </div>

          <div className="pagination-actions">
            <div className="page-size-picker">
              <label htmlFor="pageSizeSelect">Show:</label>
              <select
                id="pageSizeSelect"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="page-size-select"
              >
                <option value={26}>All 26 Locations</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="page-nav-btns">
                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
