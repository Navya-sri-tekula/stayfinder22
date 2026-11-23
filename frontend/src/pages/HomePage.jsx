import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Building, ShieldCheck, Bed, Utensils, Star, ArrowRight, Sparkles } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';

const POPULAR_LOCATIONS = [
  { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80', tag: 'Tech Hub' },
  { name: 'Hyderabad', image: 'https://images.unsplash.com/photo-1605469237567-a39930679526?auto=format&fit=crop&w=600&q=80', tag: 'HITEC City' },
  { name: 'Pune', image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=600&q=80', tag: 'Student City' },
  { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80', tag: 'Financial Capital' },
];

const CATEGORIES = [
  { type: 'hostel', title: 'Student & Working Hostels', desc: 'Affordable, secure shared rooms with wifi & study areas', icon: '🎓', color: '#ede9fe' },
  { type: 'pg', title: 'Luxury & Executive PGs', desc: 'Premium coliving with home-cooked meals & housekeeping', icon: '🏢', color: '#e0f2fe' },
  { type: 'hotel', title: 'Comfort & Transit Hotels', desc: 'Flexible daily stays with full amenities & room service', icon: '🛎️', color: '#fef3c7' },
  { type: 'room', title: 'Private Independent Rooms', desc: 'Quiet 1RK / studio rooms with maximum privacy', icon: '🔑', color: '#dcfce7' },
];

const HomePage = () => {
  const navigate = useNavigate();

  // Search Form State
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [sharingType, setSharingType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Featured Properties State
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await propertyService.getAll({ limit: 6, sortBy: 'rating' });
        if (res.success && res.data) {
          setFeaturedProperties(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (propertyType) params.append('type', propertyType);
    if (sharingType) params.append('sharing', sharingType);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0 6rem 0',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '960px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={16} />
            <span>Discover verified hostels, PGs, hotels & rooms</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-1px',
              color: '#ffffff',
              marginBottom: '1.25rem',
            }}
          >
            Find a place that feels like home.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '700px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6,
            }}
          >
            Search nearby hostels & PGs with real-time bed availability, weekly food menus, curfew rules, and interactive map discovery.
          </p>

          {/* Search Box Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'left',
              color: 'var(--text-main)',
            }}
          >
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                {/* Location / Keyword Search */}
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>Location or Stay</span>
                  </label>
                  <input
                    type="text"
                    placeholder="City, area, or property name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="form-label">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="form-select"
                  >
                    <option value="">All Property Types</option>
                    <option value="hostel">Hostel</option>
                    <option value="pg">PG / Coliving</option>
                    <option value="hotel">Hotel</option>
                    <option value="room">Private Room</option>
                  </select>
                </div>

                {/* Sharing Type */}
                <div>
                  <label className="form-label">Sharing Type</label>
                  <select
                    value={sharingType}
                    onChange={(e) => setSharingType(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Any Sharing</option>
                    <option value="Single">Single Sharing</option>
                    <option value="2 sharing">2 Sharing</option>
                    <option value="3 sharing">3 Sharing</option>
                    <option value="4 sharing">4 Sharing</option>
                  </select>
                </div>

                {/* Budget Max */}
                <div>
                  <label className="form-label">Max Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', maxWidth: '240px' }}
                >
                  <Search size={18} />
                  <span>Search Properties</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Explore by Stay Category</h2>
            <p style={{ color: 'var(--text-muted)' }}>Choose the living experience tailored to your lifestyle and budget</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.type}
                to={`/search?type=${cat.type}`}
                className="card"
                style={{ padding: '1.75rem', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
              >
                <div
                  style={{
                    fontSize: '2rem',
                    backgroundColor: cat.color,
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  {cat.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{cat.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>{cat.desc}</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Browse {cat.title.split(' ')[0]} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section style={{ padding: '3rem 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Popular Cities</h2>
              <p style={{ color: 'var(--text-muted)' }}>Top student and IT destinations across India</p>
            </div>
            <Link to="/search" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
              View All Locations <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {POPULAR_LOCATIONS.map((loc) => (
              <Link
                key={loc.name}
                to={`/search?city=${loc.name}`}
                style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 60%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1rem',
                    color: 'white',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase' }}>{loc.tag}</span>
                  <h4 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>{loc.name}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Featured Verified Stays</h2>
              <p style={{ color: 'var(--text-muted)' }}>Highly-rated stays with active bed vacancies and certified amenities</p>
            </div>
            <Link to="/search" className="btn btn-outline btn-sm">
              Explore All Stays
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading properties...
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid-cards">
              {featuredProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No properties found.
            </div>
          )}
        </div>
      </section>

      {/* Why Choose StayFinder Highlights */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f1f5f9' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Why Choose StayFinder?</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need to find, compare, and book the perfect stay without agent commissions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <MapPin size={26} />
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Interactive Leaflet Map</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Search within 1km, 3km, 5km, or 10km radius from your office, college, or current GPS position.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Bed size={26} />
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Live Bed Availability</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Never waste time calling full hostels. View exact vacant beds across single, 2, 3, and 4 sharing rooms.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Utensils size={26} />
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Weekly Food Menus</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Check day-by-day breakfast, lunch, and dinner menus with serving hours before deciding your stay.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <ShieldCheck size={26} />
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Transparent Rules & Curfews</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Read entry/exit hours, guest policies, outing permissions, and notice period rules upfront.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Banner CTA */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem',
              color: 'white',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <span className="badge badge-pg" style={{ marginBottom: '1rem' }}>For Property Owners</span>
              <h3 style={{ fontSize: '1.85rem', color: 'white', marginBottom: '0.75rem' }}>
                Are you a hostel or PG owner?
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6 }}>
                List your rooms, set bed occupancies, publish daily food menus, configure gate hours, and connect directly with tenants looking for stays right now.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/register?role=owner" className="btn btn-primary btn-lg">
                Register as Property Owner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
