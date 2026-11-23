import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Building2, Heart, User, LogOut, LayoutDashboard, PlusCircle, Menu, X, Search } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Building2 size={24} />
          </div>
          <span>StayFinder</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links" style={{ display: 'none', mdDisplay: 'flex' }} id="desktop-nav">
          <Link to="/search" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={18} />
            <span>Find Stays</span>
          </Link>

          {isAuthenticated && (
            <Link to="/wishlist" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
              <Heart size={18} />
              <span>Saved</span>
              {wishlistIds.size > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    padding: '1px 6px',
                    marginLeft: '2px',
                  }}
                >
                  {wishlistIds.size}
                </span>
              )}
            </Link>
          )}

          {isOwner && (
            <Link
              to="/owner/dashboard"
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <LayoutDashboard size={16} />
              <span>Owner Dashboard</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-main)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={16} />
                </div>
                <span>{user.name.split(' ')[0]}</span>
                <span className={`badge ${user.role === 'owner' ? 'badge-pg' : 'badge-room'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {user.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                title="Logout"
                style={{ padding: '0.45rem 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'flex', padding: '0.5rem', color: 'var(--text-main)' }}
          className="mobile-toggle-btn"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link
            to="/search"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Search size={18} />
            <span>Discover Stays</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/wishlist"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Heart size={18} />
              <span>Wishlist ({wishlistIds.size})</span>
            </Link>
          )}

          {isOwner && (
            <Link
              to="/owner/dashboard"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}
            >
              <LayoutDashboard size={18} />
              <span>Owner Dashboard</span>
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <User size={18} />
                <span>My Profile ({user.name})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link
                to="/login"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          #desktop-nav {
            display: flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
