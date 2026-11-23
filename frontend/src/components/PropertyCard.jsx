import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Bed, Wifi, Wind, Utensils, Car, Shirt } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getPriceSuffix, getImageUrl, formatDistance } from '../utils/helpers';

const PropertyCard = ({ property }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(property.id);
  const mainImage = property.images && property.images.length > 0
    ? getImageUrl(property.images[0].image_url)
    : getImageUrl(null);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleWishlist(property.id);
  };

  const getFacilityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi size={13} />;
    if (lower.includes('ac')) return <Wind size={13} />;
    if (lower.includes('food') || lower.includes('kitchen') || lower.includes('mess')) return <Utensils size={13} />;
    if (lower.includes('park')) return <Car size={13} />;
    if (lower.includes('laundry')) return <Shirt size={13} />;
    return null;
  };

  return (
    <div className="card property-card">
      {/* Image Thumbnail with Overlays */}
      <div className="property-card-img-wrap">
        <img src={mainImage} alt={property.name} className="property-card-img" loading="lazy" />

        {/* Type Badge */}
        <div className="type-badge-overlay">
          <span className={`badge badge-${property.type}`}>
            {property.type}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`wishlist-btn-overlay ${isWishlisted ? 'active' : ''}`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Distance Badge if calculated */}
        {property.distance !== null && property.distance !== undefined && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {formatDistance(property.distance)}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="property-card-body">
        {/* Rating and Bed Availability Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div className="rating-pill">
            <Star size={13} fill="currentColor" />
            <span>{property.average_rating > 0 ? property.average_rating.toFixed(1) : 'New'}</span>
            {property.review_count > 0 && (
              <span style={{ color: '#a16207', fontWeight: 500, fontSize: '0.75rem' }}>
                ({property.review_count})
              </span>
            )}
          </div>

          {/* Beds status */}
          <div>
            {property.available_beds !== undefined && (
              <span
                className={`badge ${property.available_beds > 0 ? 'badge-available' : 'badge-full'}`}
              >
                <Bed size={12} />
                {property.available_beds > 0
                  ? `${property.available_beds} beds available`
                  : 'Fully Occupied'}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/properties/${property.id}`}>
          <h3 className="property-title" title={property.name}>
            {property.name}
          </h3>
        </Link>

        {/* Location */}
        <div className="property-location">
          <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {property.address}, {property.city}
          </span>
        </div>

        {/* Sharing Options */}
        {property.sharing_options && property.sharing_options.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Sharing:</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {property.sharing_options.join(' • ')}
            </span>
          </div>
        )}

        {/* Facilities Preview */}
        {property.facilities && property.facilities.length > 0 && (
          <div className="facility-pills">
            {property.facilities.slice(0, 4).map((f, i) => (
              <span key={i} className="facility-pill-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                {getFacilityIcon(f.facility_name)}
                {f.facility_name}
              </span>
            ))}
            {property.facilities.length > 4 && (
              <span className="facility-pill-sm" style={{ backgroundColor: 'var(--border-color)', fontWeight: 600 }}>
                +{property.facilities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Price & Action Button */}
        <div className="property-card-footer">
          <div className="price-tag">
            <span className="price-val">{formatCurrency(property.starting_price)}</span>
            <span className="price-period">Starts {getPriceSuffix(property.type)}</span>
          </div>

          <Link to={`/properties/${property.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
