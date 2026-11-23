import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Loader2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

const parsePreferences = (message) => {
  const text = message.toLowerCase();
  const amountMatch = text.match(/(?:under|below|less than|upto|up to|max(?:imum)?|budget(?: of)?)\\s*(?:₹|rs\\.?\\s*)?([\\d,]+(?:\\.\\d+)?)\\s*(k|thousand)?|(?:₹|rs\\.?\\s*)([\\d,]+(?:\\.\\d+)?)\\s*(k|thousand)?|\\b([\\d,]+)\\s*(k|thousand)\\b/i);
  const rawAmount = amountMatch && (amountMatch[1] || amountMatch[3] || amountMatch[5]);
  const suffix = amountMatch && (amountMatch[2] || amountMatch[4] || amountMatch[6] || '');
  const maxPrice = rawAmount ? String(Number(rawAmount.replace(/,/g, '')) * (/k|thousand/i.test(suffix) ? 1000 : 1)) : '';
  const sharingMatch = text.match(/\\b(single|1\\s*sharing|2\\s*sharing|double sharing|2-share|3\\s*sharing|triple sharing|3-share|4\\s*sharing|4-share)\\b/i);
  const sharing = sharingMatch ? (sharingMatch[1].includes('single') || sharingMatch[1].includes('1') ? 'Single' : sharingMatch[1].includes('2') || sharingMatch[1].includes('double') ? '2 sharing' : sharingMatch[1].includes('3') || sharingMatch[1].includes('triple') ? '3 sharing' : '4 sharing') : '';
  const food = /\\b(food|mess|meals|breakfast|lunch|dinner)\\b/.test(text);
  const facilities = ['wifi', 'ac', 'laundry', 'parking'].filter((value) => new RegExp('\\\\b' + value + '\\\\b', 'i').test(text));
  const type = /\\bhostel\\b/.test(text) ? 'hostel' : /\\b(pg|paying guest)\\b/.test(text) ? 'pg' : /\\bhotel\\b/.test(text) ? 'hotel' : /\\b(private room|room)\\b/.test(text) ? 'room' : '';
  const locationMatch = message.match(/\\b(?:near|around|in|at)\\s+([a-zA-Z][a-zA-Z\\s,-]{1,55}?)(?=\\s+(?:under|below|less than|with|without|for|and|maximum|max|budget|food|mess|wifi|ac|laundry|parking|single|[234]\\s*sharing)\\b|[,;.]|$)/i);
  const location = locationMatch ? locationMatch[1].trim() : '';
  return { maxPrice, sharing, food, facilities, type, location };
};

export default function StayFinderAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hi! I can search StayFinder listings using your area, monthly budget, room sharing, property type, food and facilities. Try: “PG near Kukatpally under ₹8,000 with food and WiFi”.' }]);

  const send = async (event) => {
    event?.preventDefault();
    const prompt = input.trim();
    if (!prompt || busy) return;
    setMessages((old) => [...old, { role: 'user', text: prompt }]);
    setInput('');
    setBusy(true);
    try {
      const prefs = parsePreferences(prompt);
      const params = { limit: 30, page: 1 };
      if (prefs.maxPrice) params.maxPrice = prefs.maxPrice;
      if (prefs.sharing) params.sharing = prefs.sharing;
      if (prefs.food) params.food = 'true';
      if (prefs.facilities.length) params.facilities = prefs.facilities.join(',');
      if (prefs.type) params.type = prefs.type;
      let searchedLocation = '';
      if (prefs.location) {
        try {
          const geo = await api.get('/location/search', { params: { q: prefs.location } });
          const point = geo.data?.data;
          if (geo.data?.success && Number.isFinite(Number(point?.latitude)) && Number.isFinite(Number(point?.longitude))) {
            params.latitude = Number(point.latitude);
            params.longitude = Number(point.longitude);
            params.sortBy = 'distance';
            params.radius = '10';
            searchedLocation = point.display_name || prefs.location;
          }
        } catch (locationError) {
          setMessages((old) => [...old, { role: 'assistant', text: 'I could not confidently locate “' + prefs.location + '”. I will still search using your other filters. You can use the map’s location search to choose a more precise landmark.' }]);
        }
      }
      const response = await propertyService.getAll(params);
      const stays = Array.isArray(response?.data) ? response.data.slice(0, 5) : [];
      const criteria = [prefs.location && 'area: ' + (searchedLocation || prefs.location), prefs.maxPrice && 'budget up to ' + formatCurrency(prefs.maxPrice), prefs.sharing && prefs.sharing, prefs.type, prefs.food && 'food', ...prefs.facilities].filter(Boolean);
      const answer = stays.length
        ? 'I found ' + stays.length + ' matching available listing(s)' + (criteria.length ? ' for ' + criteria.join(', ') : '') + '. These are database matches, not guaranteed bookings. Open a stay to confirm room availability and contact the owner.'
        : 'No available listing matched those filters. Try increasing the budget, widening the area, or removing one requirement. Only listings currently returned by the StayFinder database can appear here.';
      setMessages((old) => [...old, { role: 'assistant', text: answer, stays }]);
    } catch (error) {
      setMessages((old) => [...old, { role: 'assistant', text: error.response?.data?.message || 'I could not reach the StayFinder search service. Please try again.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', right: 22, bottom: 22, zIndex: 3000, fontFamily: 'inherit' }}>
      {open && <section aria-label="StayFinder assistant" style={{ width: 'min(390px, calc(100vw - 28px))', height: 'min(560px, calc(100vh - 110px))', marginBottom: 12, background: '#fff', border: '1px solid #dbe3ef', borderRadius: 18, boxShadow: '0 18px 55px rgba(15,23,42,.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '14px 16px', color: '#fff', background: 'linear-gradient(120deg,#1d4ed8,#4338ca)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 12, background: 'rgba(255,255,255,.18)' }}><Sparkles size={20}/></span>
          <div style={{ flex: 1 }}><strong>StayFinder Assistant</strong><div style={{ fontSize: 11, opacity: .85 }}>Live listing search · preference based</div></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" style={{ color: '#fff' }}><X size={20}/></button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f8fafc' }}>
          {messages.map((message, index) => <div key={index} style={{ marginBottom: 12, display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '94%', padding: 11, borderRadius: 13, background: message.role === 'user' ? '#dbeafe' : '#fff', border: '1px solid #e2e8f0', fontSize: 13, lineHeight: 1.5 }}>
              {message.text}
              {message.stays?.map((stay) => <Link key={stay.id} to={`/properties/${stay.id}`} onClick={() => setOpen(false)} style={{ display: 'block', padding: 9, marginTop: 8, borderRadius: 9, border: '1px solid #dbeafe', color: '#1e40af', textDecoration: 'none', background: '#eff6ff' }}>
                <strong>{stay.name}</strong><div style={{ color: '#334155' }}>{formatCurrency(stay.starting_price)} / month · {stay.available_beds ?? 'Check'} beds available</div><small><MapPin size={11} style={{ display: 'inline' }}/> {stay.address}, {stay.city}</small>
              </Link>)}
            </div>
          </div>)}
          {busy && <div role="status" style={{ color: '#64748b', fontSize: 12, display: 'flex', gap: 7, alignItems: 'center' }}><Loader2 size={14}/> Finding suitable stays…</div>}
        </div>
        <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. PG near Kukatpally under ₹8000 with food" aria-label="Describe your stay preferences" style={{ flex: 1, minWidth: 0, border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 11px', fontSize: 12 }} />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" style={{ background: '#2563eb', color: '#fff', borderRadius: 10, padding: '0 13px', opacity: busy || !input.trim() ? .5 : 1 }}><Send size={17}/></button>
        </form>
      </section>}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close StayFinder assistant' : 'Open StayFinder assistant'} title="Ask StayFinder Assistant" style={{ marginLeft: 'auto', width: 58, height: 58, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#2563eb,#4338ca)', color: '#fff', boxShadow: '0 8px 25px rgba(37,99,235,.4)', border: '3px solid #fff', cursor: 'pointer' }}>
        {open ? <X size={25}/> : <Bot size={27}/>}
      </button>
    </div>
  );
}
