import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Trash2 } from 'lucide-react';
import { wishlistService } from '../services/wishlistService';
import PropertyCard from '../components/PropertyCard';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWishlist: refreshGlobalWishlist } = useWishlist();

  const loadSavedProperties = async () => {
    try {
      setLoading(true);
      const res = await wishlistService.getAll();
      if (res.success && Array.isArray(res.data)) {
        setWishlistItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedProperties();
  }, []);

  const handleRemove = async (propertyId) => {
    try {
      await wishlistService.remove(propertyId);
      setWishlistItems((prev) => prev.filter((p) => p.id !== propertyId));
      refreshGlobalWishlist();
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '0.5rem' }}>
          <Heart size={24} fill="currentColor" />
          <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Saved Collection</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Saved Stays</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'property' : 'properties'} saved for future reference
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your saved stays...
        </div>
      ) : wishlistItems.length > 0 ? (
        <div className="grid-cards">
          {wishlistItems.map((prop) => (
            <div key={prop.id} style={{ position: 'relative' }}>
              <PropertyCard property={prop} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Heart size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your wishlist is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Explore hostels, PGs, and rooms across top cities, and tap the heart icon to save your favorites here.
          </p>
          <Link to="/search" className="btn btn-primary">
            <Search size={18} />
            <span>Discover Properties</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
