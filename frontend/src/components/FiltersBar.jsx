import React from 'react';
import { Filter, X, RotateCcw, MapPin, Navigation } from 'lucide-react';

const PROPERTY_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'PG / Co-living', value: 'pg' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Private Room', value: 'room' },
];

const SHARING_OPTIONS = [
  { label: 'Single', value: 'Single' },
  { label: '2 Sharing', value: '2 sharing' },
  { label: '3 Sharing', value: '3 sharing' },
  { label: '4 Sharing', value: '4 sharing' },
];

const FACILITIES_LIST = ['WiFi', 'AC', 'Parking', 'Laundry'];

const RADIUS_OPTIONS = [
  { label: 'Any Distance', value: '' },
  { label: 'Within 1 km', value: '1' },
  { label: 'Within 3 km', value: '3' },
  { label: 'Within 5 km', value: '5' },
  { label: 'Within 10 km', value: '10' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Distance: Nearest', value: 'distance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating: High to Low', value: 'rating' },
];

const FiltersBar = ({
  filters,
  onFilterChange,
  onResetFilters,
  userCoords,
  onGetLocation,
  onClearLocation,
}) => {
  const handleTypeSelect = (typeVal) => {
    onFilterChange('type', typeVal);
  };

  const handleSharingToggle = (sharingVal) => {
    const current = filters.sharing ? filters.sharing.split(',').filter(Boolean) : [];
    let updated;
    if (current.includes(sharingVal)) {
      updated = current.filter((s) => s !== sharingVal);
    } else {
      updated = [...current, sharingVal];
    }
    onFilterChange('sharing', updated.join(','));
  };

  const handleFacilityToggle = (fac) => {
    const current = filters.facilities ? filters.facilities.split(',').filter(Boolean) : [];
    let updated;
    if (current.includes(fac)) {
      updated = current.filter((f) => f !== fac);
    } else {
      updated = [...current, fac];
    }
    onFilterChange('facilities', updated.join(','));
  };

  const selectedSharing = filters.sharing ? filters.sharing.split(',') : [];
  const selectedFacilities = filters.facilities ? filters.facilities.split(',') : [];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.05rem' }}>
          <Filter size={18} color="var(--primary)" />
          <span>Filters & Sorting</span>
        </div>
        <button
          onClick={onResetFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Property Type Pills */}
      <div>
        <label className="form-label" style={{ fontSize: '0.85rem' }}>Property Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
          {PROPERTY_TYPES.map((pt) => {
            const isSelected = filters.type === pt.value || (!filters.type && pt.value === '');
            return (
              <button
                key={pt.value}
                type="button"
                onClick={() => handleTypeSelect(pt.value)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {pt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="form-label" style={{ fontSize: '0.85rem' }}>Price Range (₹)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="form-input"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="form-input"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Sharing Type */}
      <div>
        <label className="form-label" style={{ fontSize: '0.85rem' }}>Room Sharing</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.35rem' }}>
          {SHARING_OPTIONS.map((opt) => {
            const isChecked = selectedSharing.includes(opt.value);
            return (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  backgroundColor: isChecked ? 'var(--primary-light)' : 'var(--bg-main)',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: isChecked ? '1px solid var(--primary-border)' : '1px solid transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleSharingToggle(opt.value)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Important Facilities & Food */}
      <div>
        <label className="form-label" style={{ fontSize: '0.85rem' }}>Amenities & Facilities</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.35rem' }}>
          {/* Food Available check */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              backgroundColor: filters.food === 'true' ? 'var(--primary-light)' : 'var(--bg-main)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: filters.food === 'true' ? '1px solid var(--primary-border)' : '1px solid transparent',
              gridColumn: 'span 2',
            }}
          >
            <input
              type="checkbox"
              checked={filters.food === 'true'}
              onChange={(e) => onFilterChange('food', e.target.checked ? 'true' : '')}
              style={{ accentColor: 'var(--primary)' }}
            />
            <span style={{ fontWeight: 600 }}>Food Available (Mess/Kitchen)</span>
          </label>

          {FACILITIES_LIST.map((fac) => {
            const isChecked = selectedFacilities.includes(fac);
            return (
              <label
                key={fac}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  backgroundColor: isChecked ? 'var(--primary-light)' : 'var(--bg-main)',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: isChecked ? '1px solid var(--primary-border)' : '1px solid transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFacilityToggle(fac)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>{fac}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Location Radius */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', margin: 0 }}>Search Radius</label>
          {userCoords ? (
            <button
              onClick={onClearLocation}
              style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}
            >
              Clear GPS
            </button>
          ) : (
            <button
              onClick={onGetLocation}
              style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Navigation size={12} /> Use GPS
            </button>
          )}
        </div>

        <select
          value={filters.radius || ''}
          onChange={(e) => onFilterChange('radius', e.target.value)}
          className="form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        {filters.radius && !userCoords && (
          <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
            * Click "Use GPS" above to enable radius distance filtering from your position.
          </p>
        )}
      </div>

      {/* Sorting */}
      <div>
        <label className="form-label" style={{ fontSize: '0.85rem' }}>Sort Properties By</label>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem', marginTop: '0.35rem' }}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltersBar;
