import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Heart, Star, Bed, Shield, Wifi, Wind, Utensils, Clock,
  AlertCircle, Phone, Mail, User, ChevronLeft, Share2, CheckCircle2,
  Calendar, Coffee, Moon, Sun, Bath, Info
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { reviewService } from '../services/reviewService';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import Modal from '../components/Modal';
import BookingRequestModal from '../components/BookingRequestModal';
import { formatCurrency, getPriceSuffix, getImageUrl } from '../utils/helpers';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Review Form Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getById(id);
      if (res.success && res.data) {
        setProperty(res.data);
      }
    } catch (err) {
      console.error('Error fetching property details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h2>Loading property details...</h2>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Property not found</h2>
        <Link to="/search" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Stays
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(property.id);
  const images = property.images && property.images.length > 0
    ? property.images.map((img) => getImageUrl(img.image_url))
    : [getImageUrl(null)];

  // Group food menus by day
  const foodByDay = {};
  DAYS_OF_WEEK.forEach((d) => {
    foodByDay[d] = [];
  });
  if (property.food_menus) {
    property.food_menus.forEach((item) => {
      if (foodByDay[item.day]) {
        foodByDay[item.day].push(item);
      }
    });
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await reviewService.create({
        property_id: property.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.success) {
        setReviewModalOpen(false);
        setReviewComment('');
        await fetchPropertyDetails();
      } else {
        setReviewError(res.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Back button and quick actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}
        >
          <ChevronLeft size={18} /> Back to Search
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => toggleWishlist(property.id)}
            className={`btn btn-outline btn-sm ${isSaved ? 'btn-danger' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} color={isSaved ? 'var(--danger)' : 'currentColor'} />
            <span>{isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span className={`badge badge-${property.type}`} style={{ fontSize: '0.85rem', padding: '3px 10px' }}>
              {property.type}
            </span>
            <div className="rating-pill">
              <Star size={14} fill="currentColor" />
              <span>{property.average_rating > 0 ? property.average_rating.toFixed(1) : 'New'}</span>
              <span style={{ color: '#a16207', fontWeight: 500 }}>({property.review_count} reviews)</span>
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.3rem)', fontWeight: 800, marginBottom: '0.4rem' }}>
            {property.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <MapPin size={18} color="var(--primary)" />
            <span>{property.address}, {property.city} {property.pincode ? `- ${property.pincode}` : ''}</span>
          </div>
        </div>

        {/* Starting Price & Book / Contact */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Starting Price</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>
            {formatCurrency(property.starting_price)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            per bed {getPriceSuffix(property.type)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
            {property.owner?.phone && <a className="btn btn-outline btn-sm" href={`tel:${property.owner.phone}`}><Phone size={14} style={{ marginRight: 5 }} /> Call owner</a>}
            {property.owner?.phone && <a className="btn btn-outline btn-sm" href={`https://wa.me/${String(property.owner.phone).replace(/\\D/g, '')}?text=${encodeURIComponent(`Hello, I found ${property.name} on StayFinder and would like to know about room availability.`)}`} target="_blank" rel="noreferrer">WhatsApp</a>}
            {property.owner?.email && <a className="btn btn-outline btn-sm" href={`mailto:${property.owner.email}?subject=${encodeURIComponent(`Stay enquiry - ${property.name}`)}`}><Mail size={14} style={{ marginRight: 5 }} /> Email</a>}
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1rem', height: '420px' }}>
          {/* Main Large Image */}
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '100%', position: 'relative' }}>
            <img
              src={images[activeImageIndex]}
              alt={property.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Side Thumbnail Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: 'repeat(3, 1fr)', gap: '0.75rem', height: '100%' }}>
            {images.slice(0, 3).map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeImageIndex === idx ? '3px solid var(--primary)' : '2px solid transparent',
                  opacity: activeImageIndex === idx ? 1 : 0.85,
                  transition: 'var(--transition)',
                }}
              >
                <img src={imgUrl} alt="stay thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2.5rem' }} className="details-columns-layout">
        {/* Left Primary Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* About Section */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={20} color="var(--primary)" />
              <span>About this Stay</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.975rem', whiteSpace: 'pre-line' }}>
              {property.description || 'Welcome to this comfortable and verified stay equipped with all modern amenities for students and professionals.'}
            </p>

            {/* Quick Stats Pill Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bed size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {property.available_beds} Beds Available (Out of {property.total_beds})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#10b981" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>StayFinder Verified Listing</span>
              </div>
            </div>
          </div>

          {/* Rooms & Bed-Sharing Details (REQUIRED HIGHLIGHT) */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Room & Sharing Options</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transparent bed occupancy for each sharing type</p>
              </div>
              <span className="badge badge-pg">
                {property.rooms ? property.rooms.length : 0} Room Types
              </span>
            </div>

            {property.rooms && property.rooms.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {property.rooms.map((room) => {
                  const avail = room.available_beds;
                  const isAvailable = avail > 0;
                  return (
                    <div
                      key={room.id}
                      style={{
                        border: isAvailable ? '1.5px solid var(--border-color)' : '1px dashed #cbd5e1',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        backgroundColor: isAvailable ? '#ffffff' : '#f8fafc',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                              ROOM #{room.room_number}
                            </span>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{room.sharing_type}</h4>
                          </div>

                          <span className={`badge ${isAvailable ? 'badge-available' : 'badge-full'}`}>
                            {isAvailable ? `${avail} Vacant Bed${avail > 1 ? 's' : ''}` : 'Fully Booked'}
                          </span>
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {formatCurrency(room.price)}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {getPriceSuffix(property.type)}
                          </span>
                        </div>

                        {/* Beds Breakup Bar */}
                        <div style={{ backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-sm)', padding: '8px 10px', marginBottom: '0.75rem', fontSize: '0.825rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Total Beds: <strong>{room.total_beds}</strong></span>
                            <span>Occupied: <strong style={{ color: 'var(--text-muted)' }}>{room.occupied_beds}</strong></span>
                            <span>Available: <strong style={{ color: '#059669' }}>{avail}</strong></span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div style={{ height: '6px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${(room.occupied_beds / room.total_beds) * 100}%`,
                                backgroundColor: room.occupied_beds === room.total_beds ? 'var(--danger)' : 'var(--primary)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Features: AC, Bath */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          {room.ac && (
                            <span className="facility-pill-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                              <Wind size={12} /> AC Equipped
                            </span>
                          )}
                          {room.attached_bathroom && (
                            <span className="facility-pill-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                              <Bath size={12} /> Attached Bathroom
                            </span>
                          )}
                        </div>

                        {room.description && (
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{room.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No room categories listed yet.</p>
            )}
          </div>

          {/* Facilities & Amenities */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 700 }}>
              Facilities & Amenities
            </h3>
            {property.facilities && property.facilities.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.85rem' }}>
                {property.facilities.map((fac) => (
                  <div
                    key={fac.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--primary)" />
                    <span>{fac.facility_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No amenities specified.</p>
            )}
          </div>

          {/* Weekly Food Menu */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Utensils size={20} color="var(--primary)" />
                  <span>Weekly Food Menu</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hygienic meals prepared fresh on premises</p>
              </div>
            </div>

            {/* Day Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDay === day;
                const hasItems = foodByDay[day] && foodByDay[day].length > 0;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                      color: isSelected ? '#ffffff' : hasItems ? 'var(--text-main)' : 'var(--text-muted)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      transition: 'var(--transition)',
                    }}
                  >
                    {day} {hasItems ? `(${foodByDay[day].length})` : ''}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Meals Grid */}
            {foodByDay[selectedDay] && foodByDay[selectedDay].length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {foodByDay[selectedDay].map((meal) => (
                  <div
                    key={meal.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-pg" style={{ fontWeight: 700 }}>
                        {meal.meal_type}
                      </span>
                      {(meal.start_time || meal.end_time) && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} /> {meal.start_time} - {meal.end_time}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                      {meal.menu}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                No food menu items added for {selectedDay}.
              </div>
            )}
          </div>

          {/* Outing & Property Rules */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--primary)" />
              <span>Outing Timings & Property Rules</span>
            </h3>

            {property.rules && property.rules.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {property.rules.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      {rule.rule_name}
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                      {rule.rule_value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Standard house rules apply.</p>
            )}
          </div>

          {/* Map Location */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>
              Location & Neighborhood
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {property.address}, {property.city} (Coordinates: {parseFloat(property.latitude).toFixed(4)}, {parseFloat(property.longitude).toFixed(4)})
            </p>
            <div style={{ height: '360px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <MapView
                properties={[property]}
                center={[parseFloat(property.latitude), parseFloat(property.longitude)]}
                zoom={14}
              />
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Resident Reviews</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Star size={18} fill="#eab308" color="#eab308" />
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {property.average_rating > 0 ? property.average_rating.toFixed(1) : 'New'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    ({property.review_count} {property.review_count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else setReviewModalOpen(true);
                }}
                className="btn btn-outline btn-sm"
              >
                Write a Review
              </button>
            </div>

            {/* Reviews List */}
            {property.reviews && property.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {property.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {rev.user ? rev.user.name.charAt(0) : 'U'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{rev.user ? rev.user.name : 'Resident'}</span>
                      </div>

                      {/* Stars */}
                      <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            color="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, paddingLeft: '40px' }}>
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                No reviews yet. Be the first to review this stay!
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar - Owner / Contact Card (Sticky) */}
        <div>
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Contact & Summary Box */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Interested in this stay?</h4>

              <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>RENT STARTS AT</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatCurrency(property.starting_price)}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    {getPriceSuffix(property.type)}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  * Security deposit typically 1-2 months rent (refundable).
                </div>
              </div>

              {/* Owner Profile */}
              {property.owner && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                    Property Owner / Manager
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {property.owner.name ? property.owner.name.charAt(0) : 'O'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{property.owner.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Property Host</div>
                    </div>
                  </div>

                  {property.owner.phone && (
                    <a
                      href={`tel:${property.owner.phone}`}
                      className="btn btn-outline"
                      style={{ width: '100%', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                    >
                      <Phone size={16} />
                      <span>{property.owner.phone}</span>
                    </a>
                  )}

                  {property.owner.email && (
                    <a
                      href={`mailto:${property.owner.email}`}
                      className="btn btn-outline"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                    >
                      <Mail size={16} />
                      <span>{property.owner.email}</span>
                    </a>
                  )}
                </div>
              )}

              <button onClick={() => setBookingModalOpen(true)} className="btn btn-primary" style={{ width: '100%', marginBottom: '0.6rem' }}>
                <Calendar size={18} /><span>Request to Book</span>
              </button>
              <button
                onClick={() => toggleWishlist(property.id)}
                className={`btn ${isSaved ? 'btn-danger' : 'btn-primary'}`}
                style={{ width: '100%' }}
              >
                <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Remove from Saved' : 'Save Property'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingRequestModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} property={property} />

      {/* Review Modal Dialog */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Write a Review"
      >
        <form onSubmit={handleReviewSubmit}>
          {reviewError && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {reviewError}
            </div>
          )}

          {/* Star selector */}
          <div className="form-group">
            <label className="form-label">Your Rating (1 to 5 Stars)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: star <= reviewRating ? '#fef08a' : '#f1f5f9',
                    color: star <= reviewRating ? '#854d0e' : '#94a3b8',
                  }}
                >
                  <Star size={24} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Experience / Feedback</label>
            <textarea
              rows={4}
              placeholder="Tell others about cleanliness, food quality, wifi speed, owner behavior..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="btn btn-primary"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 860px) {
          .details-columns-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyDetailsPage;
