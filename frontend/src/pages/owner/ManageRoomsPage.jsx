import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import { propertyService } from '../../services/propertyService';
import Modal from '../../components/Modal';
import {
  Bed, PlusCircle, Edit, Trash2, ArrowLeft, Check, AlertCircle,
  Wind, Bath, CheckCircle2
} from 'lucide-react';
import { formatCurrency, getPriceSuffix } from '../../utils/helpers';

const SHARING_SUGGESTIONS = ['Single sharing', '2 sharing', '3 sharing', '4 sharing', '6 sharing'];

const ManageRoomsPage = () => {
  const { propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    room_number: '',
    sharing_type: '2 sharing',
    total_beds: 2,
    occupied_beds: 0,
    price: '',
    ac: false,
    attached_bathroom: true,
    description: '',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propRes, roomsRes] = await Promise.all([
        propertyService.getById(propertyId),
        roomService.getByPropertyId(propertyId),
      ]);

      if (propRes.success) setProperty(propRes.data);
      if (roomsRes.success) setRooms(roomsRes.data || []);
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      room_number: '',
      sharing_type: '2 sharing',
      total_beds: 2,
      occupied_beds: 0,
      price: property?.starting_price || '',
      ac: false,
      attached_bathroom: true,
      description: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      sharing_type: room.sharing_type,
      total_beds: room.total_beds,
      occupied_beds: room.occupied_beds,
      price: room.price,
      ac: Boolean(room.ac),
      attached_bathroom: Boolean(room.attached_bathroom),
      description: room.description || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleQuickOccupancyUpdate = async (room, delta) => {
    const nextOccupied = Math.max(0, Math.min(room.total_beds, room.occupied_beds + delta));
    if (nextOccupied === room.occupied_beds) return;

    try {
      const res = await roomService.update(room.id, {
        occupied_beds: nextOccupied,
      });
      if (res.success) {
        setRooms(rooms.map((r) => (r.id === room.id ? res.data : r)));
      }
    } catch (err) {
      alert('Failed to update bed occupancy');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomService.delete(roomId);
      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch (err) {
      alert('Failed to delete room');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const total = parseInt(formData.total_beds, 10);
    const occupied = parseInt(formData.occupied_beds, 10) || 0;

    // Validation required by prompt: occupied beds cannot exceed total beds
    if (occupied > total) {
      setFormError('Occupied beds cannot exceed total beds in the room.');
      return;
    }

    if (total <= 0) {
      setFormError('Total beds must be at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRoom) {
        // Update existing room
        const res = await roomService.update(editingRoom.id, {
          ...formData,
          total_beds: total,
          occupied_beds: occupied,
          price: parseFloat(formData.price),
        });
        if (res.success) {
          setRooms(rooms.map((r) => (r.id === editingRoom.id ? res.data : r)));
          setModalOpen(false);
        } else {
          setFormError(res.message || 'Failed to update room.');
        }
      } else {
        // Create new room
        const res = await roomService.create({
          property_id: propertyId,
          ...formData,
          total_beds: total,
          occupied_beds: occupied,
          price: parseFloat(formData.price),
        });
        if (res.success) {
          setRooms([...rooms, res.data]);
          setModalOpen(false);
        } else {
          setFormError(res.message || 'Failed to add room.');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving room details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregated totals
  let totalBeds = 0;
  let occupiedBeds = 0;
  rooms.forEach((r) => {
    totalBeds += r.total_beds;
    occupiedBeds += r.occupied_beds;
  });
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link to="/owner/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        {property && (
          <Link to={`/properties/${property.id}`} className="btn btn-outline btn-sm">
            View Live Listing
          </Link>
        )}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-pg" style={{ marginBottom: '6px' }}>Room & Bed Inventory</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {property ? property.name : 'Manage Rooms'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Configure room sharing types, bed capacities, AC/bathroom tags, and live vacant bed status.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={18} />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Bed Summary Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ROOMS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{rooms.length}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL BEDS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{totalBeds}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>AVAILABLE BEDS (VACANT)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>{availableBeds}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 600 }}>OCCUPIED BEDS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c' }}>{occupiedBeds}</div>
        </div>
      </div>

      {/* Rooms Table / Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading room inventory...
        </div>
      ) : rooms.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Bed size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No rooms added yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Add your available room types (e.g. Single, 2 Sharing, 3 Sharing, 4 Sharing) and set their initial bed occupancies.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Add First Room</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {rooms.map((room) => {
            const avail = room.total_beds - room.occupied_beds;
            return (
              <div key={room.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ROOM NO.</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{room.room_number}</h3>
                    </div>
                    <span className={`badge ${avail > 0 ? 'badge-available' : 'badge-full'}`}>
                      {avail > 0 ? `${avail} Vacant Bed${avail > 1 ? 's' : ''}` : 'Full'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(room.price)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {getPriceSuffix(property?.type)}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {room.sharing_type}
                    </span>
                  </div>

                  {/* Bed Occupancy Tracker & Quick Buttons */}
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Capacity: <strong>{room.total_beds} beds</strong></span>
                      <span>Occupied: <strong>{room.occupied_beds}</strong></span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>Available: {avail}</span>
                    </div>

                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(room.occupied_beds / room.total_beds) * 100}%`,
                          backgroundColor: room.occupied_beds === room.total_beds ? 'var(--danger)' : 'var(--primary)',
                        }}
                      />
                    </div>

                    {/* Quick + / - occupied buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Occupancy:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleQuickOccupancyUpdate(room, -1)}
                          disabled={room.occupied_beds <= 0}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        >
                          - Check Out
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickOccupancyUpdate(room, 1)}
                          disabled={room.occupied_beds >= room.total_beds}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        >
                          + Check In
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {room.ac && (
                      <span className="facility-pill-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                        <Wind size={12} /> AC
                      </span>
                    )}
                    {room.attached_bathroom && (
                      <span className="facility-pill-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        <Bath size={12} /> Attached Bath
                      </span>
                    )}
                  </div>

                  {room.description && (
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{room.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit size={14} /> Edit Room
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoom ? `Edit Room #${editingRoom.room_number}` : 'Add New Room'}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input
                type="text"
                placeholder="e.g. 101, A-1, Dorm-2"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sharing Type *</label>
              <input
                type="text"
                list="sharing-options"
                placeholder="e.g. 2 sharing, Single"
                value={formData.sharing_type}
                onChange={(e) => setFormData({ ...formData, sharing_type: e.target.value })}
                className="form-input"
                required
              />
              <datalist id="sharing-options">
                {SHARING_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Total Beds *</label>
              <input
                type="number"
                min="1"
                value={formData.total_beds}
                onChange={(e) => setFormData({ ...formData, total_beds: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Occupied Beds *</label>
              <input
                type="number"
                min="0"
                max={formData.total_beds}
                value={formData.occupied_beds}
                onChange={(e) => setFormData({ ...formData, occupied_beds: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Price per Bed (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 8500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Calculated Available Preview */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calculated Vacancy:</span>
            <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
              {Math.max(0, (parseInt(formData.total_beds, 10) || 0) - (parseInt(formData.occupied_beds, 10) || 0))} Available Bed(s)
            </span>
          </div>

          {/* Checkboxes: AC & Bathroom */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.ac}
                onChange={(e) => setFormData({ ...formData, ac: e.target.checked })}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Air Conditioned (AC)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.attached_bathroom}
                onChange={(e) => setFormData({ ...formData, attached_bathroom: e.target.checked })}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Attached Bathroom</span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Room Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Sunny corner room, personal wardrobe with lock, study table..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageRoomsPage;
