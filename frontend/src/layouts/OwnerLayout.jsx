import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LayoutDashboard, PlusCircle, Building, ShieldCheck, CalendarCheck } from 'lucide-react';

const OwnerLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard Overview', path: '/owner/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Booking Requests', path: '/owner/bookings', icon: <CalendarCheck size={18} /> },
    { label: 'Add New Property', path: '/owner/properties/add', icon: <PlusCircle size={18} /> },
  ];

  return (
    <div className="app-container">
      <Navbar />
      {/* Owner Header Bar */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '8px', borderRadius: 'var(--radius-md)', color: 'var(--primary)', display: 'flex' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Property Owner Hub</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage listings, rooms, occupancy, food menus & rules</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="main-content" style={{ padding: '2rem 0' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default OwnerLayout;
