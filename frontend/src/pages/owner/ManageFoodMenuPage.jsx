import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { foodService } from '../../services/foodService';
import { propertyService } from '../../services/propertyService';
import Modal from '../../components/Modal';
import { Utensils, PlusCircle, Edit, Trash2, ArrowLeft, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const ManageFoodMenuPage = () => {
  const { propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    day: 'Monday',
    meal_type: 'Breakfast',
    menu: '',
    start_time: '7:30 AM',
    end_time: '9:30 AM',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propRes, foodRes] = await Promise.all([
        propertyService.getById(propertyId),
        foodService.getByPropertyId(propertyId),
      ]);

      if (propRes.success) setProperty(propRes.data);
      if (foodRes.success) setFoodItems(foodRes.data || []);
    } catch (err) {
      console.error('Error loading food menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      day: selectedDay,
      meal_type: 'Breakfast',
      menu: '',
      start_time: '7:30 AM',
      end_time: '9:30 AM',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      day: item.day,
      meal_type: item.meal_type,
      menu: item.menu,
      start_time: item.start_time || '',
      end_time: item.end_time || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await foodService.delete(itemId);
      setFoodItems(foodItems.filter((i) => i.id !== itemId));
    } catch (err) {
      alert('Failed to delete meal');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.menu.trim()) {
      setFormError('Please enter the meal menu description.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const res = await foodService.update(editingItem.id, formData);
        if (res.success) {
          setFoodItems(foodItems.map((i) => (i.id === editingItem.id ? res.data : i)));
          setModalOpen(false);
        } else {
          setFormError(res.message || 'Failed to update');
        }
      } else {
        const res = await foodService.create({
          property_id: propertyId,
          ...formData,
        });
        if (res.success) {
          setFoodItems([...foodItems, res.data]);
          setModalOpen(false);
        } else {
          setFormError(res.message || 'Failed to create meal item');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving food menu');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDayMeals = foodItems.filter((item) => item.day === selectedDay);

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
          <span className="badge badge-pg" style={{ marginBottom: '6px' }}>Food & Mess Schedule</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Weekly Food Menu</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Publish daily menus for breakfast, lunch, snacks, and dinner with serving hours.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={18} />
          <span>Add Meal for {selectedDay}</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem' }}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const count = foodItems.filter((i) => i.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                backgroundColor: isSelected ? 'var(--primary)' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                transition: 'var(--transition)',
              }}
            >
              {day} {count > 0 && <span style={{ opacity: 0.85 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Meals for Selected Day */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading menu items...
        </div>
      ) : currentDayMeals.length === 0 ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Utensils size={42} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No meals added for {selectedDay}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Add breakfast, lunch, snacks, or dinner to inform tenants about your food schedule.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add Meal</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {currentDayMeals.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-pg" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {item.meal_type}
                  </span>
                  {(item.start_time || item.end_time) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {item.start_time} - {item.end_time}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {item.menu}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Meal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Meal Item' : `Add Meal for ${selectedDay}`}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Day</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="form-select"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Meal Type</label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                className="form-select"
              >
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                placeholder="e.g. 7:30 AM"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                placeholder="e.g. 9:30 AM"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Menu Dishes / Items *</label>
              <textarea
                rows={3}
                placeholder="e.g. Idly + Sambar + Coconut Chutney + Tea / Coffee"
                value={formData.menu}
                onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                className="form-textarea"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingItem ? 'Update Meal' : 'Add Meal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageFoodMenuPage;
