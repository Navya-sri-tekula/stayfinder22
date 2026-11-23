import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
const BookingsPage = () => {
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const load=async()=>{try{const r=await bookingService.getMine();setRows(r.data||[]);setError('');}catch(e){setError(e.response?.data?.message||'Unable to load booking requests.');}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const cancel=async(id)=>{try{await bookingService.cancel(id);await load();}catch(e){setError(e.response?.data?.message||'Could not cancel this request.');}};
  return <div className="container" style={{padding:'2.5rem 1.5rem 4rem'}}><h1 style={{fontSize:'1.8rem',fontWeight:800}}>My booking requests</h1><p style={{color:'var(--text-muted)',margin:'0.5rem 0 1.5rem'}}>Track owner responses. Payments are not collected in this version.</p>{error&&<p style={{color:'var(--danger)'}}>{error}</p>}{loading?<p>Loading requests…</p>:rows.length===0?<div className="card" style={{padding:'2rem'}}>No booking requests yet. <Link to="/search">Find a stay</Link></div>:<div style={{display:'grid',gap:'1rem'}}>{rows.map(b=><article className="card" key={b.id} style={{padding:'1.25rem'}}><div style={{display:'flex',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}><div><h2 style={{fontWeight:700}}>{b.property?.name}</h2><p>{b.property?.address}, {b.property?.city}</p><p>Room {b.room?.room_number} · {b.beds_requested} bed(s)</p><p>{b.check_in} to {b.check_out}</p>{b.owner_response&&<p>Owner response: {b.owner_response}</p>}</div><div><span className="badge badge-room">{b.status}</span>{['pending','approved'].includes(b.status)&&<div><button className="btn btn-outline btn-sm" style={{marginTop:'0.75rem'}} onClick={()=>cancel(b.id)}>Cancel request</button></div>}</div></div></article>)}</div>}</div>;
};
export default BookingsPage;
