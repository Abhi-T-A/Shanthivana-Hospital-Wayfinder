import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CampusMap } from './components/CampusMap';
import { SearchBar } from './components/SearchBar';
import { DestinationList } from './components/DestinationList';
import { DestinationDetail } from './components/DestinationDetail';
import { LiveNavigationView } from './components/LiveNavigationView';
import { StatusAlert } from './components/StatusAlert';
import { MobileHomeScreen } from './components/MobileHomeScreen';
import { MobileDestinationList } from './components/MobileDestinationList';
import { MobileDestinationDetails } from './components/MobileDestinationDetails';
import { MobileLiveNavigation } from './components/MobileLiveNavigation';
import { MobileCampusMapView } from './components/MobileCampusMapView';
import { MobileBottomNav } from './components/MobileBottomNav';
import type { MobileTab } from './components/MobileBottomNav';
import { MobileMoreModal } from './components/MobileMoreModal';
import { api } from './services/api';
import type { Destination, CategoryFilter } from './types/destination';
import { Map, Compass } from 'lucide-react';

type MobileScreen = 'home' | 'destinations' | 'details' | 'navigation' | 'map';

export const App: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [totalCampusDestinations, setTotalCampusDestinations] = useState<number>(26);
  const [totalFilteredResults, setTotalFilteredResults] = useState<number>(0);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [navigatingDestination, setNavigatingDestination] = useState<Destination | null>(null);
  
  // Mobile specific navigation states
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>('home');
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [isMoreModalOpen, setIsMoreModalOpen] = useState<boolean>(false);

  // Pagination State for Desktop (default limit 26 so all 26 destinations display immediately)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(26);

  // Desktop Map Modal State
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [serviceStatus, setServiceStatus] = useState<string>('checking');
  const [dbStatus, setDbStatus] = useState<string>('checking');

  // Load API Health
  const checkBackendHealth = useCallback(async () => {
    const health = await api.checkHealth();
    setServiceStatus(health.serviceStatus);
    setDbStatus(health.dbStatus);
  }, []);

  // Fetch destinations from live FastAPI backend
  const loadDestinations = useCallback(async (
    q: string,
    category: CategoryFilter,
    page: number,
    limit: number
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const offset = (page - 1) * limit;
      const data = await api.getDestinations({
        q: q.trim() || undefined,
        category: category !== 'all' ? category : undefined,
        limit: limit,
        offset: offset,
      });

      setDestinations(data.items);
      setTotalFilteredResults(data.total);

      // If unfiltered, update total campus count
      if (!q.trim() && category === 'all') {
        setTotalCampusDestinations(data.total);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while communicating with the backend.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial health check
  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  // Load destinations on query, category, or pagination change
  useEffect(() => {
    loadDestinations(searchQuery, selectedCategory, currentPage, pageSize);
  }, [searchQuery, selectedCategory, currentPage, pageSize, loadDestinations]);

  // Search and filter handlers
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Mobile navigation handlers
  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === 'home') {
      setMobileScreen('home');
    } else if (tab === 'destinations') {
      setMobileScreen('destinations');
    } else if (tab === 'map') {
      setMobileScreen('map');
    } else if (tab === 'more') {
      setIsMoreModalOpen(true);
    }
  };

  const isBackendOnline =
    serviceStatus === 'healthy' &&
    (dbStatus === 'connected' || dbStatus === 'Supabase PostgreSQL');

  return (
    <div className="shanthivana-wayfinder-app">
      {/* ==================================================================
          MOBILE EXPERIENCE (Visible on screens < 1024px)
          Strictly implements the 5 screens from the reference design.
          ================================================================== */}
      <div className="mobile-app-layout mobile-only-view">
        {errorMessage && (
          <div className="mobile-error-toast">
            <StatusAlert
              message={errorMessage}
              onRetry={() => {
                checkBackendHealth();
                loadDestinations(searchQuery, selectedCategory, currentPage, pageSize);
              }}
            />
          </div>
        )}

        {/* Screen 1: Home Screen */}
        {mobileScreen === 'home' && (
          <MobileHomeScreen
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
            onNavigateToDestinations={() => {
              setMobileScreen('destinations');
              setMobileTab('destinations');
            }}
            onNavigateToMap={() => {
              setMobileScreen('map');
              setMobileTab('map');
            }}
            isBackendOnline={isBackendOnline}
            totalDestinations={totalCampusDestinations}
          />
        )}

        {/* Screen 2: Destination List */}
        {mobileScreen === 'destinations' && (
          <MobileDestinationList
            destinations={destinations}
            totalDestinations={totalCampusDestinations}
            totalFilteredResults={totalFilteredResults}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
            onSelectDestination={(dest) => {
              setSelectedDestination(dest);
              setMobileScreen('details');
            }}
            onBackToHome={() => {
              setMobileScreen('home');
              setMobileTab('home');
            }}
            onClearFilters={handleClearAllFilters}
            isLoading={isLoading}
          />
        )}

        {/* Screen 3: Destination Details */}
        {mobileScreen === 'details' && selectedDestination && (
          <MobileDestinationDetails
            destination={selectedDestination}
            onBack={() => {
              setMobileScreen('destinations');
              setMobileTab('destinations');
            }}
            onNavigateHere={(dest) => {
              setNavigatingDestination(dest);
              setMobileScreen('navigation');
            }}
            onViewOnMap={(dest) => {
              setSelectedDestination(dest);
              setMobileScreen('map');
              setMobileTab('map');
            }}
          />
        )}

        {/* Screen 4: Live Navigation */}
        {mobileScreen === 'navigation' && (navigatingDestination || selectedDestination) && (
          <MobileLiveNavigation
            destination={navigatingDestination || selectedDestination!}
            onStopNavigation={() => {
              setNavigatingDestination(null);
              setMobileScreen('details');
            }}
            onViewDetails={() => {
              setMobileScreen('details');
            }}
          />
        )}

        {/* Screen 5: Campus Map */}
        {mobileScreen === 'map' && (
          <MobileCampusMapView
            onBack={() => {
              if (selectedDestination) {
                setMobileScreen('details');
              } else {
                setMobileScreen('home');
                setMobileTab('home');
              }
            }}
            selectedDestination={selectedDestination}
            onClearSelectedDestination={() => setSelectedDestination(null)}
          />
        )}

        {/* Mobile Bottom Navigation (Shown on Home, Destinations, and Map screens) */}
        {mobileScreen !== 'navigation' && mobileScreen !== 'details' && (
          <MobileBottomNav
            activeTab={mobileTab}
            onTabChange={handleMobileTabChange}
          />
        )}

        {/* Mobile More Options Sheet */}
        <MobileMoreModal
          isOpen={isMoreModalOpen}
          onClose={() => setIsMoreModalOpen(false)}
          serviceStatus={serviceStatus}
          dbStatus={dbStatus}
          totalDestinations={totalCampusDestinations}
        />
      </div>

      {/* ==================================================================
          DESKTOP EXPERIENCE (Visible on screens >= 1024px)
          Preserves the desktop layout, hero banner, search bar, and card grid.
          ================================================================== */}
      <div className="desktop-app-layout desktop-only-view">
        <Header
          serviceStatus={serviceStatus}
          dbStatus={dbStatus}
          totalDestinations={totalCampusDestinations}
          onOpenMap={() => setIsMapOpen(true)}
        />

        <main className="main-content">
          <div className="content-container">
            {errorMessage && (
              <StatusAlert
                message={errorMessage}
                onRetry={() => {
                  checkBackendHealth();
                  loadDestinations(searchQuery, selectedCategory, currentPage, pageSize);
                }}
              />
            )}

            {/* Desktop Hero Banner */}
            <div className="hero-banner">
              <div className="hero-text-col">
                <div className="hero-badge">
                  <Compass size={15} />
                  <span>QR-Enabled Campus Wayfinding</span>
                </div>
                <h2 className="hero-title">
                  Explore All {totalCampusDestinations} Campus Destinations
                </h2>
                <p className="hero-subtitle">
                  Welcome to Shanthivana Nature Cure Centre. Locate patient wards, deluxe cottages, yoga halls, treatment sections, and campus amenities.
                </p>
              </div>

              <div className="hero-action-col">
                <button 
                  type="button" 
                  className="hero-map-btn"
                  onClick={() => setIsMapOpen(true)}
                >
                  <Map size={20} />
                  <div className="hero-btn-text">
                    <strong>View Campus Map</strong>
                    <span>Illustrated Layout & Landmarks</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Search & Category Filter Section */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onClearAll={handleClearAllFilters}
              totalResults={totalFilteredResults}
              totalCampusDestinations={totalCampusDestinations}
            />

            {/* Destination Directory Card Grid */}
            <section className="directory-section" aria-label="Campus Destination Directory">
              <DestinationList
                destinations={destinations}
                totalDestinations={totalFilteredResults}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                selectedDestination={selectedDestination}
                onSelectDestination={(dest) => setSelectedDestination(dest)}
                onResetFilters={handleClearAllFilters}
                isLoading={isLoading}
              />
            </section>
          </div>
        </main>

        {/* Desktop Campus Map Modal */}
        <CampusMap
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          selectedDestination={selectedDestination}
          onClearSelection={() => setSelectedDestination(null)}
        />

        {/* Desktop Destination Detail Modal */}
        <DestinationDetail
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onOpenMap={() => setIsMapOpen(true)}
          onNavigate={(dest) => {
            setSelectedDestination(null);
            setNavigatingDestination(dest);
          }}
        />

        {/* Desktop Live Navigation Modal if triggered */}
        {navigatingDestination && (
          <LiveNavigationView
            destination={navigatingDestination}
            onExit={() => setNavigatingDestination(null)}
            onViewDestinationDetails={(dest) => {
              setSelectedDestination(dest);
            }}
          />
        )}

        {/* Desktop Footer */}
        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-left">
              <span className="footer-title">Shanthivana Nature Cure Centre</span>
              <span className="footer-desc">
                S.D.M. Yoga and Nature Cure Hospital, Dharmasthala
              </span>
            </div>
            <div className="footer-right">
              <span className="footer-tag">QR Wayfinder • Complete 26 Location Directory</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
