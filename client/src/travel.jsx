import {useState} from 'react';
import {Link,Navigate,useNavigate,useParams,useSearchParams} from 'react-router-dom';
import {QRCodeSVG} from 'qrcode.react';
import {api,money,fmt,useGet} from './api.js';
import {useAuth,Logo} from './ctx.jsx';
import {Card,Skeletons,Empty} from './pages.jsx';
import {Badge} from './account.jsx';
import {MapEmbed,RouteMap,gmaps,gflights,ghotels,gsearch,trackFA,trackFR} from './maps.jsx';
import {airport,iata} from './airports.js';
const today=()=>new Date().toISOString().slice(0,10);
export function Hotels(){
  const [sp,setSp]=useSearchParams(),q=sp.get('q')||'',[h,l,e]=useGet('/hotels?q='+encodeURIComponent(q));
  return <div className="wrap sec"><h2>Hotels</h2><p className="sub">Stay in comfort anywhere you travel.</p><input placeholder="City, country or hotel…" defaultValue={q} onChange={x=>setSp(x.target.value?{q:x.target.value}:{},{replace:true})} style={{maxWidth:360,marginBottom:20}}/>
  {l?<Skeletons/>:e?<p className="err">{e}</p>:!h?.length?<Empty text="No hotels found."/>:<div className="cards">{h.map((x,i)=><Card i={i} key={x._id} to={'/hotels/'+x._id} img={x.image} title={x.name} sub={`${'★'.repeat(x.stars||0)} ${x.city}, ${x.country}`} price={`From ${money(x.pricePerNight)} / night`}/>)}</div>}</div>;
}
export function HotelDetail(){
  const {id}=useParams(),{user}=useAuth(),nav=useNavigate(),[h,l,e]=useGet('/hotels/'+id),[f,setF]=useState({checkIn:'',checkOut:'',rooms:1,guests:2,room:'',notes:''}),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  if(l)return <div className="wrap sec"><div className="sk"/></div>;if(e||!h)return <div className="wrap sec"><p className="err">{e||'Not found'}</p></div>;
  const room=(h.rooms||[]).find(r=>r.name===f.room)||(h.rooms||[])[0]||{name:'Standard Room',price:h.pricePerNight};
  const nights=Math.max(0,Math.round((new Date(f.checkOut)-new Date(f.checkIn))/864e5))||0,total=room.price*nights*(Number(f.rooms)||1);
  const submit=async x=>{x.preventDefault();if(!user)return nav('/login');setBusy(true);setErr('');try{const b=await api(`/hotels/${h._id}/book`,{method:'POST',body:{...f,room:room.name}});nav('/invoice/'+b.ref)}catch(z){setErr(z.message)}setBusy(false)};
  const q=`${h.name}, ${h.city}, ${h.country}`;
  return <div className="wrap sec" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:30}}><div>
   {h.image&&<img src={h.image} alt={h.name} style={{width:'100%',borderRadius:18,maxHeight:360,objectFit:'cover'}} onError={x=>x.target.remove()}/>}<h2 style={{marginTop:16}}>{h.name} <span className="stars">{'★'.repeat(h.stars||0)}</span></h2><p className="muted">{h.city}, {h.country}</p><p>{h.description}</p>
   <h3 style={{margin:'16px 0 8px'}}>Facilities</h3><p>{(h.facilities||[]).map(x=><span key={x} className="tag" style={{margin:3}}>{x}</span>)}</p>
   <h3 style={{margin:'16px 0 8px'}}>Rooms</h3>{(h.rooms||[]).map(r=><p key={r.name}>{r.name} — <b>{money(r.price)}</b> / night</p>)}
   <h3 style={{margin:'16px 0 8px'}}>Location</h3><MapEmbed q={q}/><p><a target="_blank" rel="noreferrer" href={gmaps(q)}>Google Maps ↗</a> · <a target="_blank" rel="noreferrer" href={ghotels(h.city)}>Compare hotels in {h.city} on Google ↗</a></p></div>
   <form className="panel" onSubmit={submit} style={{alignSelf:'start',position:'sticky',top:90}}><h3>Reserve</h3><br/>
    <label>Room</label><select value={f.room||room.name} onChange={x=>setF({...f,room:x.target.value})}>{(h.rooms||[]).map(r=><option key={r.name}>{r.name}</option>)}</select><br/><br/>
    <div className="grid2"><div><label>Check-in</label><input type="date" required min={today()} value={f.checkIn} onChange={x=>setF({...f,checkIn:x.target.value})}/></div><div><label>Check-out</label><input type="date" required min={f.checkIn||today()} value={f.checkOut} onChange={x=>setF({...f,checkOut:x.target.value})}/></div>
    <div><label>Rooms</label><input type="number" min="1" max="9" value={f.rooms} onChange={x=>setF({...f,rooms:x.target.value})}/></div><div><label>Guests</label><input type="number" min="1" max="20" value={f.guests} onChange={x=>setF({...f,guests:x.target.value})}/></div></div>
    <p><b>{nights} night(s) · Total {money(total)}</b></p>{err&&<p className="err">{err}</p>}<button className="btn" disabled={busy||!nights} style={{width:'100%'}}>{user?(busy?'Submitting…':'Request Reservation'):'Login to Reserve'}</button><p className="muted">The reservation is confirmed by our team after review.</p></form></div>;
}
export function Flights(){
  const [sp]=useSearchParams(),{user}=useAuth(),nav=useNavigate(),[my]=useGet(user?'/flights/mine':'/health',[user?.id]);
  const [tt,setTt]=useState('One-way'),[legs,setLegs]=useState([{from:sp.get('from')||'',to:sp.get('to')||'',date:sp.get('date')||''}]),[ret,setRet]=useState(''),[pax,setPax]=useState(1),[cabin,setCabin]=useState('Economy'),[phone,setPhone]=useState(''),[notes,setNotes]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const shown=tt==='Multi-city'?legs:legs.slice(0,1),setLeg=(i,k,v)=>setLegs(legs.map((l,j)=>j===i?{...l,[k]:v}:l));
  const pairs=shown.map(l=>[iata(l.from),iata(l.to)]).filter(([a,b])=>airport(a)&&airport(b)&&a!==b);
  const first=shown[0]||{},fa=iata(first.from),ta=iata(first.to);
  const submit=async e=>{e.preventDefault();if(!user)return nav('/login');setBusy(true);setErr('');try{const r=await api('/flights',{method:'POST',body:{tripType:tt,legs:shown,returnDate:ret,pax,cabin,phone,notes}});nav('/flight/'+r.ref)}catch(x){setErr(x.message)}setBusy(false)};
  return <div className="wrap sec"><h2>Flights</h2><p className="sub">Request a real quote from our team — we never show made-up fares. Compare live prices on Google Flights anytime.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:24}}>
   <form className="panel" onSubmit={submit}><div className="tabs">{['One-way','Round-trip','Multi-city'].map(t=><button type="button" key={t} className={tt===t?'on':''} onClick={()=>setTt(t)}>{t}</button>)}</div>
    {shown.map((l,i)=><div className="grid2" key={i} style={{marginBottom:10}}><div><label>From</label><input list="airports" required placeholder="MGQ" value={l.from} onChange={e=>setLeg(i,'from',e.target.value)}/></div><div><label>To</label><input list="airports" required placeholder="DXB" value={l.to} onChange={e=>setLeg(i,'to',e.target.value)}/></div><div className="full"><label>Date {tt==='Multi-city'&&`(leg ${i+1})`}</label><input type="date" required min={today()} value={l.date} onChange={e=>setLeg(i,'date',e.target.value)}/></div></div>)}
    {tt==='Multi-city'&&<p><button type="button" className="btn sm out" disabled={legs.length>=4} onClick={()=>setLegs([...legs,{from:legs[legs.length-1]?.to||'',to:'',date:''}])}>+ Add leg</button> {legs.length>1&&<button type="button" className="btn sm red" onClick={()=>setLegs(legs.slice(0,-1))}>Remove last</button>}</p>}
    {tt==='Round-trip'&&<div style={{marginBottom:10}}><label>Return date</label><input type="date" required min={first.date||today()} value={ret} onChange={e=>setRet(e.target.value)}/></div>}
    <div className="grid2"><div><label>Passengers</label><input type="number" min="1" max="9" value={pax} onChange={e=>setPax(e.target.value)}/></div><div><label>Cabin</label><select value={cabin} onChange={e=>setCabin(e.target.value)}>{['Economy','Premium Economy','Business','First'].map(c=><option key={c}>{c}</option>)}</select></div><div className="full"><label>Phone / WhatsApp</label><input value={phone} onChange={e=>setPhone(e.target.value)}/></div><div className="full"><label>Notes</label><textarea rows="2" value={notes} onChange={e=>setNotes(e.target.value)}/></div></div>
    {err&&<p className="err">{err}</p>}<br/><button className="btn" disabled={busy} style={{width:'100%'}}>{user?(busy?'Sending…':'Request Flight Quote'):'Login to Request'}</button>
    {fa&&ta&&<p><a target="_blank" rel="noreferrer" className="btn out" href={gflights(fa,ta,first.date)}>Compare live fares on Google Flights ↗</a></p>}</form>
   <div><RouteMap legs={pairs} h={380}/></div></div>
  {user&&Array.isArray(my)&&<><h3 style={{margin:'30px 0 12px'}}>My flight requests</h3>{my.length?<div className="panel tbl"><table><thead><tr><th>Ref</th><th>Route</th><th>Date</th><th>Status</th><th>Quote</th><th/></tr></thead><tbody>{my.map(f=><tr key={f._id}><td>{f.ref}</td><td>{f.legs.map(l=>`${l.from}→${l.to}`).join(', ')}</td><td>{f.legs[0]?.date}</td><td><Badge v={f.status}/></td><td>{f.quote?money(f.quote):'-'}</td><td><Link className="btn sm" to={'/flight/'+f.ref}>Open</Link></td></tr>)}</tbody></table></div>:<Empty text="No flight requests yet."/>}</>}</div>;
}
export function FlightTicket(){
  const {ref}=useParams(),{user}=useAuth(),[f,l,e]=useGet(user?'/flights/'+ref:'/health',[user?.id]);
  if(!user)return <Navigate to="/login"/>;
  if(l)return <div className="wrap sec"><div className="sk"/></div>;if(e||!f?.legs)return <div className="wrap sec"><p className="err">{e||'Not found'}</p></div>;
  const legs=f.legs.map(x=>[x.from,x.to]),all=f.tripType==='Round-trip'?[...legs,[legs[0][1],legs[0][0]]]:legs,tk=f.status==='Ticketed',step=['New','Quoted','Ticketed'].indexOf(f.status);
  return <div className="wrap"><div className="noprint" style={{padding:'20px 0'}}>{tk&&<button className="btn" onClick={()=>window.print()}>🖨 Print / Save as PDF</button>} <Link className="btn out" to="/flights">← Flights</Link></div>
   <div className="inv"><h2>Flight request {f.ref}</h2><p className="muted">{f.tripType} · {f.pax} passenger(s) · {f.cabin} {f.isDemo&&'· DEMO DATA'}</p>
    {f.status==='Cancelled'?<p><Badge v="Cancelled"/></p>:<div className="timeline">{['Requested','Quoted','Ticketed'].map((x,i)=><div key={x} className={i<=step?'on':''}>{x}</div>)}</div>}
    {f.quote&&!tk&&<p><b>Our quote: {money(f.quote)}</b> — contact us to confirm and pay.</p>}<RouteMap legs={all} h={320}/></div>
   {tk&&<div className="ticket"><div className="l"><Logo/><h3 style={{marginTop:10}}>BOARDING PASS · E-TICKET</h3><div className="route"><b>{f.legs[0].from}</b><i/><b>{f.legs[0].to}</b></div>
     <p>{airport(f.legs[0].from)?.city} → {airport(f.legs[0].to)?.city}<br/>Date: {f.legs[0].date} · {f.departTime||''}{f.arriveTime?` → ${f.arriveTime}`:''}<br/>Airline: <b>{f.airline}</b> · Flight: <b>{f.flightNo}</b><br/>Passenger: {f.user?.name} · {f.cabin}</p>
     {!f.isDemo&&f.flightNo?<p className="noprint"><a style={{color:'#C9A45C'}} target="_blank" rel="noreferrer" href={trackFA(f.flightNo)}>Live status (FlightAware) ↗</a><br/><a style={{color:'#C9A45C'}} target="_blank" rel="noreferrer" href={trackFR(f.flightNo)}>Track on Flightradar24 ↗</a><br/><a style={{color:'#C9A45C'}} target="_blank" rel="noreferrer" href={gsearch(`${f.flightNo} flight status`)}>Google flight status ↗</a></p>:<p>DEMO ticket — not valid for travel.</p>}</div>
    <div className="r"><QRCodeSVG value={`SOMTREVEL:${f.ref}:${f.pnr||''}`} size={110}/><b>PNR {f.pnr||'-'}</b><span className="muted">{f.ref}</span></div></div>}</div>;
}
