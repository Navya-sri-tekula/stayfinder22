import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { formatCurrency } from '../utils/helpers';
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
const BookingRequestModal = ({ isOpen, onClose, property }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const rooms = (property?.rooms || []).filter((r) => Number(r.available_beds ?? (r.total_beds - r.occupied_beds)) > 0);
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState(tomorrow());
  const [checkOut, setCheckOut] = useState('');
  const [beds, setBeds] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (isOpen) { setRoomId(rooms[0] ? String(rooms[0].id) : ''); setError(''); setSuccess(''); }
  }, [isOpen, property?.id]);
  const selected = rooms.find((r) => String(r.id) === roomId);
  const maxBeds = selected ? Number(selected.available_beds ?? (selected.total_beds - selected.occupied_beds)) : 1;
  const submit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { onClose(); navigate('/login'); return; }
    setSaving(true); setError('');
    try {
      const result = await bookingService.create({ property_id: property.id, room_id: Number(roomId), check_in: checkIn, check_out: checkOut, beds_requested: Number(beds), message });
      setSuccess(result.message || 'Request sent to the property owner.');
    } catch (err) { setError(err.response?.data?.message || 'Could not send your request. Please try again.'); }
    finally { setSaving(false); }
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Request a stay">
    {success ? <div><p style={{color:'var(--success)',fontWeight:700}}>{success}</p><p style={{margin:'0.75rem 0 1rem',color:'var(--text-muted)'}}>Your request is pending until the owner responds. No payment is collected.</p><button className="btn btn-primary" onClick={()=>{onClose();navigate('/bookings');}}>View my requests</button></div> :
    <form onSubmit={submit}>
      {!isAuthenticated && <p>Please log in to send a booking request.</p>}
      {rooms.length === 0 ? <p>No rooms currently show available beds. Please contact the owner.</p> : <>
        <div className="form-group"><label className="form-label">Room</label><select className="form-input" value={roomId} onChange={e=>{setRoomId(e.target.value);setBeds(1);}} required>{rooms.map(r=><option key={r.id} value={r.id}>Room {r.room_number} · {r.sharing_type} · {formatCurrency(r.price)} · {r.available_beds ?? (r.total_beds-r.occupied_beds)} beds</option>)}</select></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}><div className="form-group"><label className="form-label">Check-in</label><input className="form-input" type="date" min={tomorrow()} value={checkIn} onChange={e=>setCheckIn(e.target.value)} required /></div><div className="form-group"><label className="form-label">Check-out</label><input className="form-input" type="date" min={checkIn||tomorrow()} value={checkOut} onChange={e=>setCheckOut(e.target.value)} required /></div></div>
        <div className="form-group"><label className="form-label">Beds requested</label><input className="form-input" type="number" min="1" max={maxBeds} value={beds} onChange={e=>setBeds(e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Message to owner (optional)</label><textarea className="form-textarea" rows="3" maxLength="1000" value={message} onChange={e=>setMessage(e.target.value)} /></div>
      </>}
      {error && <p style={{color:'var(--danger)',marginBottom:'1rem'}}>{error}</p>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:'0.75rem',marginTop:'1rem'}}><button type="button" className="btn btn-outline" onClick={onClose}>Close</button>{rooms.length>0 && <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Sending...':'Send request'}</button>}</div>
    </form>}
  </Modal>;
};
export default BookingRequestModal;
