import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import LocationPickerMap from '../../components/LocationPickerMap';
import { ArrowLeft, Save, Trash2, Plus, Upload, X } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

const EditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'pg',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 12.9716,
    longitude: 77.5946,
    starting_price: '',
    status: 'available',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await propertyService.getById(id);
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            name: p.name || '',
            type: p.type || 'pg',
            description: p.description || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            pincode: p.pincode || '',
            latitude: parseFloat(p.latitude) || 12.9716,
            longitude: parseFloat(p.longitude) || 77.5946,
            starting_price: p.starting_price || '',
            status: p.status || 'available',
          });
          setExistingImages(p.images || []);
        }
      } catch (err) {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await propertyService.deleteImage(id, imageId);
      setExistingImages(existingImages.filter((img) => img.id !== imageId));
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    try {
      const fd = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        fd.append('images', selectedFiles[i]);
      }
      const res = await propertyService.uploadImages(id, fd);
      if (res.success && res.data) {
        setExistingImages([...existingImages, ...res.data]);
        setSelectedFiles([]);
      }
    } catch (err) {
      alert('Failed to upload image files.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await propertyService.update(id, formData);
      if (res.success) {
        setSuccess('Property updated successfully!');
        if (selectedFiles.length > 0) {
          await handleUploadFiles();
        }
      } else {
        setError(res.message || 'Failed to update property.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        Loading property...
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '850px', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link to="/owner/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <Link to={`/properties/${id}`} className="btn btn-outline btn-sm">
          View Public Listing
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Edit Property Details</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Update address, map marker, pricing, status, and photos</p>

        {success && (
          <div style={{ backgroundColor: 'var(--success-light)', color: '#047857', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Basic Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Property Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="pg">PG / Coliving</option>
                <option value="hostel">Hostel</option>
                <option value="hotel">Hotel</option>
                <option value="room">Private Room</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Starting Price (₹)</label>
              <input
                type="number"
                name="starting_price"
                value={formData.starting_price}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="available">Available (Accepting Residents)</option>
                <option value="full">Full / No Vacancy</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
              />
            </div>
          </div>

          {/* Address & Map */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Address & Map Location
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Map Coordinates</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Lat: {formData.latitude}, Lng: {formData.longitude}
                </span>
              </div>
              <LocationPickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
                height="300px"
              />
            </div>
          </div>

          {/* Manage Photos */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Photos
            </h3>

            {/* Existing photos */}
            {existingImages.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {existingImages.map((img) => (
                  <div key={img.id} style={{ position: 'relative', width: '110px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={getImageUrl(img.image_url)} alt="property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(239, 68, 68, 0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Delete Image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload more photos */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Upload Additional Photos:</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                className="form-input"
              />
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Link to="/owner/dashboard" className="btn btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyPage;
