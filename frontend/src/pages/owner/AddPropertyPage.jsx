import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import LocationPickerMap from '../../components/LocationPickerMap';
import { Building2, MapPin, Upload, Plus, X, ArrowLeft, CheckCircle2 } from 'lucide-react';

const STANDARD_FACILITIES = [
  'WiFi', 'AC', 'Parking', 'Laundry', 'CCTV', 'Power Backup',
  'Hot Water', 'Housekeeping', 'Gym', 'Study Room', 'Common Room', 'Kitchen'
];

const DEFAULT_RULES = [
  { rule_name: 'Entry Time', rule_value: '10:30 PM' },
  { rule_name: 'Exit / Outing Time', rule_value: '6:00 AM' },
  { rule_name: 'Visitor Timings', rule_value: '10:00 AM - 7:00 PM' },
  { rule_name: 'Curfew', rule_value: 'Strict gate closure at 11:00 PM' },
  { rule_name: 'Weekend Rules', rule_value: 'Night outing allowed with gate pass' },
];

const AddPropertyPage = () => {
  const navigate = useNavigate();

  // Basic Information
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

  // Facilities checklist
  const [selectedFacilities, setSelectedFacilities] = useState(['WiFi', 'CCTV', 'Hot Water', 'Housekeeping']);

  // Property Rules
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleValue, setNewRuleValue] = useState('');

  // Photos
  const [imageUrls, setImageUrls] = useState([
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleFacilityToggle = (fac) => {
    if (selectedFacilities.includes(fac)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== fac));
    } else {
      setSelectedFacilities([...selectedFacilities, fac]);
    }
  };

  const handleAddRule = () => {
    if (newRuleName.trim() && newRuleValue.trim()) {
      setRules([...rules, { rule_name: newRuleName.trim(), rule_value: newRuleValue.trim() }]);
      setNewRuleName('');
      setNewRuleValue('');
    }
  };

  const handleRemoveRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImageUrl = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.address || !formData.city || !formData.starting_price) {
      setError('Please fill in all required property information.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create property
      const payload = {
        ...formData,
        facilities: selectedFacilities,
        rules: rules,
        images: imageUrls,
      };

      const res = await propertyService.create(payload);
      if (res.success && res.data) {
        const createdId = res.data.id;

        // 2. Upload file images if selected
        if (selectedFiles.length > 0) {
          const fileData = new FormData();
          for (let i = 0; i < selectedFiles.length; i++) {
            fileData.append('images', selectedFiles[i]);
          }
          await propertyService.uploadImages(createdId, fileData);
        }

        // Navigate to add rooms for this property
        navigate(`/owner/properties/${createdId}/rooms`);
      } else {
        setError(res.message || 'Failed to create property.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save property listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
        <Link to="/owner/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>List a New Property</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Provide complete property details, set coordinates on the map, and add initial rules and facilities.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Basic Information */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              1. Basic Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Property Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Royal Orchid Luxury PG for Men & Women"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="pg">PG / Coliving</option>
                  <option value="hostel">Hostel (Student / Working)</option>
                  <option value="hotel">Hotel</option>
                  <option value="room">Independent Room</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Starting Price (₹) *</label>
                <input
                  type="number"
                  name="starting_price"
                  placeholder="e.g. 7500"
                  value={formData.starting_price}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe your property highlights, nearby tech parks/colleges, food quality, security..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Interactive Map Picker (REQUIRED) */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              2. Location & Interactive Map Placement
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. 14th Main, Sector 2, near BDA Complex"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bangalore"
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
                  placeholder="e.g. Karnataka"
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
                  placeholder="e.g. 560102"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Map Picker */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Pin Exact Location on OpenStreetMap:
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Selected Lat: <strong>{formData.latitude}</strong>, Lng: <strong>{formData.longitude}</strong>
                </span>
              </div>
              <LocationPickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
                height="340px"
              />
            </div>
          </div>

          {/* Section 3: Facilities */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              3. Facilities & Amenities
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {STANDARD_FACILITIES.map((fac) => {
                const isSelected = selectedFacilities.includes(fac);
                return (
                  <label
                    key={fac}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: isSelected ? '1px solid var(--primary-border)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFacilityToggle(fac)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{fac}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Outing Timings & Rules */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              4. Outing Timings & Property Rules
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{rule.rule_name}: </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{rule.rule_value}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveRule(idx)} style={{ color: 'var(--danger)' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Rule Row */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Rule Title (e.g. Visitor Timings)"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="form-input"
                style={{ flex: 1, minWidth: '160px' }}
              />
              <input
                type="text"
                placeholder="Rule Value (e.g. Till 8:00 PM)"
                value={newRuleValue}
                onChange={(e) => setNewRuleValue(e.target.value)}
                className="form-input"
                style={{ flex: 2, minWidth: '200px' }}
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={16} /> Add Rule
              </button>
            </div>
          </div>

          {/* Section 5: Photos */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              5. Property Photos
            </h3>

            {/* Image URL preview */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="url"
                placeholder="Paste image URL (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={handleAddImageUrl} className="btn btn-outline">
                <Plus size={16} /> Add URL
              </button>
            </div>

            {/* Local file upload */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Or Upload Photos from Computer:</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                className="form-input"
              />
            </div>

            {/* Thumbnails preview */}
            {imageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: '90px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(i)}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Link to="/owner/dashboard" className="btn btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? 'Creating Listing...' : 'Proceed to Add Rooms →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyPage;
