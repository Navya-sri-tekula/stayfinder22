import React, { useState } from 'react';
import { Bot, X, Send, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

const parsePreferences = (message) => {
  const text = message.toLowerCase();
  const amountMatch = message.match(/(?:₹|rs\.?\s*)([\d,]+)\s*(k|thousand)?|(?:under|below|maximum|max|budget(?:\s+of)?)\s*(?:₹|rs\.?\s*)?([\d,]+)\s*(k|thousand)?|([\d,]+)\s*(k|thousand)\b/i);
  let maxPrice = '';
  if (amountMatch) {
    const raw = (amountMatch[1] || amountMatch[3] || amountMatch[5] || '').replace(/,/g, '');
    const suffix = amountMatch[2] || amountMatch[4] || amountMatch[6] || '';
    maxPrice = String(Number(raw) * (/k|thousand/i.test(suffix) ? 1000 : 1));
  }
  const sharing = ['single', '2 sharing', '2-share', 'double sharing', '3 sharing', '3-share', '4 sharing', '4-share'].find((v) => text.includes(v));
  const food = /food|mess|meals|breakfast|lunch|dinner/.test(text);
  const facilities = ['wifi', 'ac', 'laundry', 'parking'].filter((v) => text.includes(v));
  const type = /hostel/.test(text) ? 'hostel' : /pg|paying guest/.test(text) ? 'pg' : '';
  return { maxPrice, sharing, food, facilities, type };
};

export default function StayFinderAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hi! I’m StayFinder Match Assistant. Tell me your preferred area, monthly budget, sharing type and must-have facilities. I’ll search available stays and explain the closest matches.' }]);

  const send = async (event) => {
    event?.preventDefault();
    const prompt = input.trim();
    if (!prompt || busy) return;
    setMessages((old) => [...old, { role: 'user', text: prompt }]);
    setInput('');
    setBusy(true);
    try {
      const prefs = parsePreferences(prompt);
      const params = { limit: 30, sortBy: 'distance' };
      if (prefs.maxPrice) params.maxPrice = prefs.maxPrice;
      if (prefs.sharing) params.sharing = prefs.sharing;
      if (prefs.food) params.food = 'true';
      if (prefs.facilities.length) params.facilities = prefs.facilities.join(',');
      if (prefs.type) params.type = prefs.type;
      const locationQuery = prompt.match(/(?:near|around|in|at)\s+([a-zA-Z][a-zA-Z\s,-]{2,50})/i)?.[1]?.split(/\s+(?:under|below|with|without|for|and|max|budget)\b/i)[0]?.trim();
      if (locationQuery) {
        try {
          const geo = await api.get('/location/search', { params: { q: locationQuery } });
          if (geo.data?.success) {
            params.latitude = geo.data.data.latitude;
            params.longitude = geo.data.data.longitude;
            params.sortBy = 'distance';
            params.radius = '10';
          }
        } catch { /* Search still works using budget and other preferences. */ }
      }
      const response = await propertyService.getAll(params);
      const stays = (response.data || []).slice(0, 5);
      const answer = stays.length
        ? 'Here are the closest matching listings currently returned by StayFinder. Compare the room price, available beds and details before sending a booking request.'
        : 'I could not find a listing matching those details yet. Try a wider budget, another nearby area, or remove one filter. Owners can add listings as the platform grows.';
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
          <div style={{ flex: 1 }}><strong>StayFinder Assistant</strong><div style={{ fontSize: 11, opacity: .85 }}>Preference-based stay finder</div></div>
          <button onClick={() => setOpen(false)} aria-label="Close assistant" style={{ color: '#fff' }}><X size={20}/></button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f8fafc' }}>
          {messages.map((message, index) => <div key={index} style={{ marginBottom: 12, display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '92%', padding: 11, borderRadius: 13, background: message.role === 'user' ? '#dbeafe' : '#fff', border: '1px solid #e2e8f0', fontSize: 13, lineHeight: 1.5 }}>
              {message.text}
              {message.stays?.map((stay) => <Link key={stay.id} to={`/properties/${stay.id}`} onClick={() => setOpen(false)} style={{ display: 'block', padding: 9, marginTop: 8, borderRadius: 9, border: '1px solid #dbeafe', color: '#1e40af', textDecoration: 'none', background: '#eff6ff' }}>
                <strong>{stay.name}</strong><div style={{ color: '#334155' }}>{formatCurrency(stay.starting_price)} / month · {stay.available_beds ?? 'Check'} beds available</div><small>{stay.address}, {stay.city}</small>
              </Link>)}
            </div>
          </div>)}
          {busy && <div style={{ color: '#64748b', fontSize: 12, display: 'flex', gap: 7, alignItems: 'center' }}><Loader2 size={14}/> Finding suitable stays…</div>}
        </div>
        <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. PG near Kukatpally under ₹8000 with food" style={{ flex: 1, minWidth: 0, border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 11px', fontSize: 12 }} />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" style={{ background: '#2563eb', color: '#fff', borderRadius: 10, padding: '0 13px', opacity: busy || !input.trim() ? .5 : 1 }}><Send size={17}/></button>
        </form>
      </section>}
      <button onClick={() => setOpen((value) => !value)} aria-label="Open StayFinder assistant" title="Ask StayFinder Assistant" style={{ marginLeft: 'auto', width: 58, height: 58, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#2563eb,#4338ca)', color: '#fff', boxShadow: '0 8px 25px rgba(37,99,235,.4)', border: '3px solid #fff', cursor: 'pointer' }}>
        {open ? <X size={25}/> : <Bot size={27}/>}
      </button>
    </div>
  );
}
