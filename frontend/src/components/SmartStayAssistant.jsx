import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Wallet, Star, Utensils, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

// Transparent, rule-based matching: it uses the filters and listing facts already selected by the tenant.
const SmartStayAssistant = ({ properties = [], filters = {}, coords }) => {
  const recommendations = useMemo(() => {
    if (!properties.length) return [];
    const prices = properties.map((p) => Number(p.starting_price) || 0);
    const maxPrice = Math.max(...prices, 1);
    const maxDistance = Math.max(...properties.map((p) => Number(p.distance) || 0), 1);
    return properties.map((property) => {
      const reasons = [];
      let score = 0;
      const price = Number(property.starting_price) || 0;
      const budget = Number(filters.maxPrice);
      const minBudget = Number(filters.minPrice);
      if (budget && price <= budget && (!minBudget || price >= minBudget)) { score += 35; reasons.push('within your monthly budget'); }
      else if (!budget && !minBudget) { score += 15; reasons.push('price compared with other matches'); }
      else if (minBudget && price >= minBudget && (!budget || price <= budget)) { score += 20; reasons.push('within your price range'); }
      if (filters.sharing && (property.sharing_options || []).some((s) => filters.sharing.toLowerCase().split(',').some((v) => s.toLowerCase().includes(v.trim())))) { score += 25; reasons.push('your preferred sharing type'); }
      if (coords && Number.isFinite(Number(property.distance))) { score += 20 * (1 - Math.min(Number(property.distance) / maxDistance, 1)); reasons.push('near your selected location'); }
      if (property.average_rating) { score += Math.min(Number(property.average_rating) / 5, 1) * 10; reasons.push('guest ratings'); }
      if (filters.food === 'true' && property.has_food) { score += 10; reasons.push('food or mess availability'); }
      const wantedFacilities = (filters.facilities || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
      const actualFacilities = (property.facilities || []).map((facility) => String(facility.facility_name || '').toLowerCase());
      if (wantedFacilities.length && wantedFacilities.every((wanted) => actualFacilities.includes(wanted))) { score += 10; reasons.push('your selected facilities'); }
      if (!reasons.length) reasons.push('available beds and overall value');
      return { ...property, matchScore: Math.round(score), matchReasons: reasons };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  }, [properties, filters, coords]);

  if (!recommendations.length) return null;
  const best = recommendations[0];
  return (
    <section className="card" style={{ padding: '1.1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid var(--primary-border)', background: 'linear-gradient(135deg, var(--primary-light), #ffffff)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.35rem' }}>
        <Sparkles size={19} color="var(--primary)" />
        <strong>StayFinder Smart Match</strong>
        <span className="badge badge-pg">Preference-based</span>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginBottom: '0.8rem' }}>
        Your shortlist is ranked using the filters you selected, live bed availability, price, distance and ratings. This is a transparent recommendation engine, not an automated booking decision.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
        {recommendations.map((item, index) => (
          <Link key={item.id} to={`/properties/${item.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.9rem' }}>{index === 0 ? 'Best match' : `Match #${index + 1}`}</strong>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.matchScore} pts</span>
            </div>
            <div style={{ fontWeight: 700, marginTop: '0.35rem' }}>{item.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.3rem 0' }}>{formatCurrency(item.starting_price)} / month · {item.available_beds} beds available</div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              {item.matchReasons.slice(0, 3).map((reason) => <span key={reason}>• {reason}</span>)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem' }}>View stay <ArrowRight size={13} /></div>
          </Link>
        ))}
      </div>
    </section>
  );
};
export default SmartStayAssistant;
