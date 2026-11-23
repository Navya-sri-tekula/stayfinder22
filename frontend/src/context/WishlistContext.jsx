import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistService.getAll();
      if (res.success && Array.isArray(res.data)) {
        const idSet = new Set(res.data.map((item) => item.id));
        setWishlistIds(idSet);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (propertyId) => {
    if (!isAuthenticated) return false;

    const id = parseInt(propertyId, 10);
    const isCurrentlyWishlisted = wishlistIds.has(id);

    try {
      if (isCurrentlyWishlisted) {
        await wishlistService.remove(id);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await wishlistService.add(id);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
      return true;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (propertyId) => {
    return wishlistIds.has(parseInt(propertyId, 10));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        loading,
        toggleWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
