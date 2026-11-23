import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Heart, Shield, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', paddingTop: '4rem', paddingBottom: '2rem', marginTop: '4rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 800, fontSize: '1.4rem', marginBottom: '1rem' }}>
              <div style={{ background: '#2563eb', padding: '6px', borderRadius: '8px', color: 'white', display: 'flex' }}>
                <Building2 size={22} />
              </div>
              <span>StayFinder</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', color: '#cbd5e1' }}>
              Discover verified hostels, PGs, hotel rooms, and coliving spaces near you with interactive maps, bed availability tracking, food menus, and honest reviews.
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={16} color="#10b981" /> 100% Verified
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>Stay Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link to="/search?type=hostel" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Student & Working Hostels</Link></li>
              <li><Link to="/search?type=pg" style={{ color: '#94a3b8' }}>Luxury & Executive PGs</Link></li>
              <li><Link to="/search?type=hotel" style={{ color: '#94a3b8' }}>Boutique & Budget Hotels</Link></li>
              <li><Link to="/search?type=room" style={{ color: '#94a3b8' }}>Private Studio Rooms</Link></li>
              <li><Link to="/search?food=true" style={{ color: '#94a3b8' }}>Stays with Home-Cooked Food</Link></li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>Popular Hubs</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link to="/search?city=Bangalore" style={{ color: '#94a3b8' }}>Hostels & PGs in Bangalore</Link></li>
              <li><Link to="/search?city=Hyderabad" style={{ color: '#94a3b8' }}>Hostels & PGs in Hyderabad</Link></li>
              <li><Link to="/search?city=Pune" style={{ color: '#94a3b8' }}>Hostels & PGs in Pune</Link></li>
              <li><Link to="/search?city=Mumbai" style={{ color: '#94a3b8' }}>Hostels & PGs in Mumbai</Link></li>
            </ul>
          </div>

          {/* Contact & For Owners */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>For Property Owners</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              List your hostel or PG and manage rooms, available beds, food menus, and timings effortlessly.
            </p>
            <Link to="/register?role=owner" className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: '1.5rem' }}>
              List Your Property
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} /> support@stayfinder.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} /> +91 98765 43210
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            &copy; {new Date().getFullYear()} StayFinder Technologies Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
