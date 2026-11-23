import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { Shield, Plus, Trash2, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

const COMMON_FACILITIES_SUGGESTIONS = [
  'WiFi', 'AC', 'Parking', 'Laundry', 'CCTV', 'Power Backup',
  'Hot Water', 'Housekeeping', 'Gym', 'Study Room', 'Common Room', 'Kitchen',
  'Refrigerator', 'Microwave', 'Biometric Entry', 'Lift', 'RO Water Purifier', 'Bicycle Parking'
];

const COMMON_RULES_SUGGESTIONS = [
  { name: 'Entry Time', value: '10:30 PM' },
  { name: 'Exit / Outing Time', value: '6:00 AM' },
  { name: 'Visitor Timings', value: '10:00 AM - 7:00 PM' },
  { name: 'Curfew', value: 'Gate closed at 11:00 PM sharp' },
  { name: 'Weekend Rules', value: 'Night outing permitted with digital pass' },
  { name: 'Smoking Policy', value: 'Strictly prohibited on property premises' },
  { name: 'Alcohol Policy', value: 'Not permitted' },
  { name: 'Quiet Hours', value: '10:30 PM to 6:30 AM' },
];

const ManageFacilitiesRulesPage = () => {
  const { propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Facility Input
  const [newFacilityName, setNewFacilityName] = useState('');

  // New Rule Input
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleValue, setNewRuleValue] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getById(propertyId);
      if (res.success && res.data) {
        setProperty(res.data);
        setFacilities(res.data.facilities || []);
        setRules(res.data.rules || []);
      }
    } catch (err) {
      console.error('Error loading facilities & rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const handleAddFacility = async (nameToAdd) => {
    const name = (nameToAdd || newFacilityName).trim();
    if (!name) return;

    // Check if duplicate
    if (facilities.some((f) => f.facility_name.toLowerCase() === name.toLowerCase())) {
      alert('This facility is already added.');
      return;
    }

    try {
      const res = await propertyService.addFacility(propertyId, name);
      if (res.success && res.data) {
        setFacilities([...facilities, res.data]);
        setNewFacilityName('');
      }
    } catch (err) {
      alert('Failed to add facility');
    }
  };

  const handleDeleteFacility = async (facilityId) => {
    try {
      await propertyService.deleteFacility(propertyId, facilityId);
      setFacilities(facilities.filter((f) => f.id !== facilityId));
    } catch (err) {
      alert('Failed to remove facility');
    }
  };

  const handleAddRule = async (nameVal, ruleVal) => {
    const rName = (nameVal || newRuleName).trim();
    const rVal = (ruleVal || newRuleValue).trim();
    if (!rName || !rVal) return;

    try {
      const res = await propertyService.addRule(propertyId, {
        rule_name: rName,
        rule_value: rVal,
      });
      if (res.success && res.data) {
        setRules([...rules, res.data]);
        setNewRuleName('');
        setNewRuleValue('');
      }
    } catch (err) {
      alert('Failed to add rule');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await propertyService.deleteRule(propertyId, ruleId);
      setRules(rules.filter((r) => r.id !== ruleId));
    } catch (err) {
      alert('Failed to delete rule');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
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

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Manage Facilities & House Rules
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {property?.name}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Section 1: Facilities Management */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="var(--primary)" />
            <span>Active Facilities ({facilities.length})</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Tenants search and filter stays based on these facilities.
          </p>

          {/* Current Facilities List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {facilities.map((fac) => (
              <div
                key={fac.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-main)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <span>{fac.facility_name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteFacility(fac.id)}
                  style={{ color: 'var(--danger)', display: 'flex' }}
                  title="Remove facility"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom facility */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Add custom facility (e.g. Swimming Pool, Gaming Zone)..."
              value={newFacilityName}
              onChange={(e) => setNewFacilityName(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => handleAddFacility()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={16} /> Add Facility
            </button>
          </div>

          {/* Quick Suggestions */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              POPULAR SUGGESTIONS (CLICK TO ADD):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {COMMON_FACILITIES_SUGGESTIONS.map((item) => {
                const isAlreadyAdded = facilities.some((f) => f.facility_name.toLowerCase() === item.toLowerCase());
                if (isAlreadyAdded) return null;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddFacility(item)}
                    className="facility-pill-sm"
                    style={{ cursor: 'pointer', backgroundColor: '#ffffff', transition: 'all 0.15s ease' }}
                  >
                    + {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Property Rules & Outing Timings */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--primary)" />
            <span>Outing Timings & Rules ({rules.length})</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Clearly communicate entry/exit curfews, visitor permissions, and hostel regulations.
          </p>

          {/* Rules List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {rules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{rule.rule_name}: </span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>{rule.rule_value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  style={{ color: 'var(--danger)', display: 'flex' }}
                  title="Remove rule"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom rule */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(220px, 2fr) auto', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Rule Name (e.g. Visitor Timings)"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Rule Details (e.g. 10:00 AM - 7:00 PM in Lobby)"
              value={newRuleValue}
              onChange={(e) => setNewRuleValue(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              onClick={() => handleAddRule()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={16} /> Add Rule
            </button>
          </div>

          {/* Quick Suggestions for Rules */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              COMMON RULES TEMPLATES (CLICK TO ADD):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {COMMON_RULES_SUGGESTIONS.map((r) => {
                const isAdded = rules.some((x) => x.rule_name.toLowerCase() === r.name.toLowerCase());
                if (isAdded) return null;
                return (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => handleAddRule(r.name, r.value)}
                    className="facility-pill-sm"
                    style={{ cursor: 'pointer', backgroundColor: '#ffffff' }}
                  >
                    + {r.name}: {r.value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFacilitiesRulesPage;
