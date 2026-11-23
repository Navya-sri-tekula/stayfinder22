import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Bed, DoorOpen, Star, PlusCircle, Settings,
  Edit, Trash2, Utensils, Shield, CheckCircle, AlertTriangle
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { formatCurrency, getPriceSuffix, getImageUrl } from '../../utils/helpers';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    totalReviews: 0,
  });

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, propsRes] = await Promise.all([
        propertyService.getOwnerStats(),
        propertyService.getMyProperties(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (propsRes.success) setProperties(propsRes.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteProperty = async (id) => {
    try {
      await propertyService.delete(id);
      setDeleteConfirmId(null);
      await loadDashboardData();
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  return (
    <div className="container">
      {/* Top Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Owner Management Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of your properties, live occupancy, bed inventory & reviews</p>
        </div>

        <Link to="/owner/properties/add" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Aggregate Stats Cards (REQUIRED BY PROMPT) */}
      <div className="dashboard-grid">
        {/* Total Properties */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Building2 size={26} />
          </div>
          <div>
            <div className="stat-val">{stats.totalProperties}</div>
            <div className="stat-label">Total Properties</div>
          </div>
        </div>

        {/* Total Rooms */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
            <DoorOpen size={26} />
          </div>
          <div>
            <div className="stat-val">{stats.totalRooms}</div>
            <div className="stat-label">Total Rooms</div>
          </div>
        </div>

        {/* Available Beds */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: '#059669' }}>
            <Bed size={26} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#059669' }}>{stats.availableBeds}</div>
            <div className="stat-label">Available Beds (Vacant)</div>
          </div>
        </div>

        {/* Occupied Beds */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fed7aa', color: '#c2410c' }}>
            <Bed size={26} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#c2410c' }}>{stats.occupiedBeds}</div>
            <div className="stat-label">Occupied Beds ({stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0}%)</div>
          </div>
        </div>

        {/* Number of Reviews */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef08a', color: '#854d0e' }}>
            <Star size={26} fill="currentColor" />
          </div>
          <div>
            <div className="stat-val">{stats.totalReviews}</div>
            <div className="stat-label">Resident Reviews</div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Your Listings ({properties.length})</h2>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading your property listings...
          </div>
        ) : properties.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <Building2 size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No properties listed yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Create your first hostel, PG, hotel or room listing to start managing rooms, beds and tenants.
            </p>
            <Link to="/owner/properties/add" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Add Your First Property</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {properties.map((prop) => {
              const thumbnail = prop.images && prop.images.length > 0
                ? getImageUrl(prop.images[0].image_url)
                : getImageUrl(null);

              return (
                <div
                  key={prop.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                  }}
                >
                  {/* Left: Thumbnail & Main Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '280px', flex: 2 }}>
                    <img
                      src={thumbnail}
                      alt={prop.name}
                      style={{
                        width: '110px',
                        height: '85px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`badge badge-${prop.type}`}>{prop.type}</span>
                        <span className="badge badge-available">{prop.status}</span>
                      </div>
                      <Link to={`/properties/${prop.id}`} style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                        {prop.name}
                      </Link>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {prop.address}, {prop.city}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
                        From {formatCurrency(prop.starting_price)} {getPriceSuffix(prop.type)}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Live Room & Bed Occupancy Counter */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-main)',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      flex: 1,
                      minWidth: '220px',
                      justifyContent: 'space-around',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{prop.total_rooms}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ROOMS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{prop.available_beds}</div>
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>VACANT BEDS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ea580c' }}>{prop.occupied_beds}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OCCUPIED</div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <Link
                      to={`/owner/properties/${prop.id}/rooms`}
                      className="btn btn-outline btn-sm"
                      title="Manage Rooms & Beds"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Bed size={15} />
                      <span>Rooms ({prop.total_rooms})</span>
                    </Link>

                    <Link
                      to={`/owner/properties/${prop.id}/food`}
                      className="btn btn-outline btn-sm"
                      title="Manage Weekly Food Menu"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Utensils size={15} />
                      <span>Food</span>
                    </Link>

                    <Link
                      to={`/owner/properties/${prop.id}/facilities-rules`}
                      className="btn btn-outline btn-sm"
                      title="Manage Facilities & Rules"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Shield size={15} />
                      <span>Rules</span>
                    </Link>

                    <Link
                      to={`/owner/properties/${prop.id}/edit`}
                      className="btn btn-outline btn-sm"
                      title="Edit Property Info & Images"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit size={15} />
                      <span>Edit</span>
                    </Link>

                    {deleteConfirmId === prop.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="btn btn-outline btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(prop.id)}
                        className="btn btn-outline btn-sm"
                        title="Delete Property"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
