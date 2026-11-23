import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import FiltersBar from '../components/FiltersBar';
import { useGeolocation } from '../hooks/useGeolocation';
import { Search, Map, List, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { coords, getLocation, clearLocation, loading: geoLoading } = useGeolocation();

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    sharing: searchParams.get('sharing') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    facilities: searchParams.get('facilities') || '',
    food: searchParams.get('food') || '',
    radius: searchParams.get('radius') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'list' | 'map' | 'split'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with search params changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      type: searchParams.get('type') || '',
      sharing: searchParams.get('sharing') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      facilities: searchParams.get('facilities') || '',
      food: searchParams.get('food') || '',
      radius: searchParams.get('radius') || '',
      sortBy: searchParams.get('sortBy') || 'newest',
      page: parseInt(searchParams.get('page') || '1', 10),
    }));
  }, [searchParams]);

  // Fetch properties from backend
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const query = {
        ...filters,
        limit: 9,
      };

      if (coords) {
        query.latitude = coords.latitude;
        query.longitude = coords.longitude;
      }

      // Cleanup empty params
      Object.keys(query).forEach((key) => {
        if (!query[key]) delete query[key];
      });

      const res = await propertyService.getAll(query);
      if (res.success) {
        setProperties(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, limit: 9, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters, coords]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);

    // Update URL query parameters
    const nextParams = new URLSearchParams();
    Object.entries(updated).forEach(([k, v]) => {
      if (v) nextParams.set(k, v);
    });
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      search: '',
      city: '',
      type: '',
      sharing: '',
      minPrice: '',
      maxPrice: '',
      facilities: '',
      food: '',
      radius: '',
      sortBy: 'newest',
      page: 1,
    };
    setFilters(emptyFilters);
    setSearchParams({});
    clearLocation();
  };

  const handlePageChange = (newPage) => {
    handleFilterChange('page', newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Top Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Explore Stays</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Found {pagination.total} {pagination.total === 1 ? 'property' : 'properties'} matching your search
          </p>
        </div>

        {/* View Mode Toggle & Mobile Filter Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            className="btn btn-outline btn-sm mobile-filter-btn"
            onClick={() => setMobileFilterOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>

          {/* View Mode Switcher */}
          <div
            style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '3px',
              display: 'flex',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('split')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'split' ? '#ffffff' : 'transparent',
                color: viewMode === 'split' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'split' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <List size={14} style={{ display: 'inline', marginRight: '4px' }} /> List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'map' ? '#ffffff' : 'transparent',
                color: viewMode === 'map' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Map size={14} style={{ display: 'inline', marginRight: '4px' }} /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Column + Content Column */}
      <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }} className="search-page-layout">
        {/* Left Filters Sidebar (Desktop) */}
        <div style={{ width: '280px', flexShrink: 0 }} className="desktop-filters-sidebar">
          <FiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            userCoords={coords}
            onGetLocation={getLocation}
            onClearLocation={clearLocation}
            onSearchLocation={(latitude, longitude, displayName) => {
              setCoords({ latitude, longitude });
              const area = displayName.split(',').slice(0, 2).join(',').trim();
              handleFilterChange('city', area);
              handleFilterChange('sortBy', 'distance');
              handleFilterChange('radius', filters.radius || '5');
            }}
          />
        </div>

        {/* Content Column */}
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          {/* Active Search & GPS Info */}
          {(filters.search || filters.city || coords || filters.radius) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '1rem',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Active filters:</span>
              {filters.search && (
                <span className="badge badge-pg">
                  Keyword: "{filters.search}"
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange('search', '')} />
                </span>
              )}
              {filters.city && (
                <span className="badge badge-hostel">
                  City: {filters.city}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange('city', '')} />
                </span>
              )}
              {coords && (
                <span className="badge badge-room">
                  GPS Active ({coords.latitude.toFixed(2)}, {coords.longitude.toFixed(2)})
                  <X size={12} style={{ cursor: 'pointer' }} onClick={clearLocation} />
                </span>
              )}
              {filters.radius && (
                <span className="badge badge-hotel">
                  Radius: {filters.radius} km
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange('radius', '')} />
                </span>
              )}
            </div>
          )}

          {/* View Modes */}
          {viewMode === 'map' ? (
            <div style={{ height: '700px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <MapView
                properties={properties}
                userCoords={coords}
                radiusKm={filters.radius ? parseFloat(filters.radius) : null}
              />
            </div>
          ) : viewMode === 'split' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) 1fr', gap: '1.5rem', alignItems: 'flex-start' }} className="split-view-container">
              {/* Properties List Column */}
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading matching stays...
                  </div>
                ) : properties.length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <h3>No properties found</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Try relaxing your filters or clearing location radius.
                    </p>
                    <button onClick={handleResetFilters} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {properties.map((p) => (
                      <PropertyCard key={p.id} property={p} />
                    ))}
                  </div>
                )}
              </div>

              {/* Map Column (Sticky on Desktop) */}
              <div style={{ position: 'sticky', top: '90px', height: 'calc(100vh - 120px)', minHeight: '500px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }} className="split-map-wrap">
                <MapView
                  properties={properties}
                  userCoords={coords}
                  radiusKm={filters.radius ? parseFloat(filters.radius) : null}
                />
              </div>
            </div>
          ) : (
            /* Pure Grid / List View */
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading matching stays...
                </div>
              ) : properties.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <h3>No properties found</h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Try relaxing your filters or clearing location radius.
                  </p>
                  <button onClick={handleResetFilters} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid-cards">
                  {properties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && viewMode !== 'map' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '2.5rem',
              }}
            >
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="btn btn-outline btn-sm"
                style={{ opacity: pagination.page <= 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`btn btn-sm ${pageNum === pagination.page ? 'btn-primary' : 'btn-outline'}`}
                  style={{ minWidth: '36px' }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="btn btn-outline btn-sm"
                style={{ opacity: pagination.page >= pagination.totalPages ? 0.5 : 1 }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="modal-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '420px', maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FiltersBar
              filters={filters}
              onFilterChange={(k, v) => {
                handleFilterChange(k, v);
              }}
              onResetFilters={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
              userCoords={coords}
              onGetLocation={getLocation}
              onClearLocation={clearLocation}
            />
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Apply Filters ({pagination.total} Results)
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-filters-sidebar {
            display: none !important;
          }
          .split-view-container {
            grid-template-columns: 1fr !important;
          }
          .split-map-wrap {
            display: none !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-filter-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchPage;
