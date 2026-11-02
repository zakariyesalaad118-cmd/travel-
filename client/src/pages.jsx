import {useEffect,useState} from 'react';
import {Link,useParams,useSearchParams,useNavigate} from 'react-router-dom';
import {api,money,fmt,useGet} from './api.js';
import {useAuth} from './ctx.jsx';
import {MapEmbed,RouteMap,gmaps,gsearch} from './maps.jsx';
export const Card=({to,img,title,sub,price,i=0})=><Link to={to} className="card" style={{animationDelay:i*60+'ms'}}><div className="img">{img&&<img src={img} alt={title} loading="lazy" onError={e=>e.target.remove()}/>}<span>{title}</span></div><div className="b"><div className="muted">{sub}</div>{price&&<div className="price">{price}</div>}</div></Link>;
export const Skeletons=({n=4})=><div className="cards">{Array.from({length:n},(_,i)=><div key={i} className="sk"/>)}</div>;
export const Empty=({text})=><div className="panel" style={{textAlign:'center'}}><div style={{fontSize:40}}>🧳</div><p className="muted">{text}</p></div>;
const Stars=({n})=><span className="stars">{'★'.repeat(n)}{'☆'.repeat(5-n)}</span>;
function SearchWidget(){
  const [tab,setTab]=useState('Flights'),[f,setF]=useState({}),nav=useNavigate(),set=k=>e=>setF({...f,[k]:e.target.value});
  const go=e=>{e.preventDefault();const p=new URLSearchParams();
    if(tab==='Flights'){['from','to','date'].forEach(k=>f[k]&&p.set(k,f[k]));nav('/flights?'+p)}
    else if(tab==='Hotels')nav('/hotels?q='+encodeURIComponent(f.q||''));
    else nav(`/${tab==='Tours'?'destinations':'packages'}?q=`+encodeURIComponent(f.q||''))};
  return <form className="widget" onSubmit={go}><div className="tabs">{['Flights','Hotels','Tours','Packages'].map(t=><button type="button" key={t} className={tab===t?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
   <div className="grid2">{tab==='Flights'?<><div><label>From</label><input list="airports" placeholder="Mogadishu (MGQ)" onChange={set('from')}/></div><div><label>To</label><input list="airports" placeholder="Dubai (DXB)" onChange={set('to')}/></div><div className="full"><label>Departure</label><input type="date" onChange={set('date')}/></div></>
    :<div className="full"><label>{tab==='Hotels'?'Hotel or city':'Destination'}</label><input placeholder="Dubai, Istanbul, Berbera…" onChange={set('q')}/></div>}
   <button className="btn full">{tab==='Flights'?'Search Flights ✈':'Search '+tab}</button></div></form>;
}
export function Home(){
  const [d,dl]=useGet('/destinations'),[p,pl]=useGet('/packages'),[rv]=useGet('/reviews'),[m,setM]=useState(''),[em,setEm]=useState('');
  const sh=t=>(d||[]).filter(x=>x.type===t).slice(0,4);
  return <>
  <header className="hero"><div className="wrap"><div className="fade"><span className="tag" style={{background:'#C9A45C',color:'#101D2C'}}>✦ Premium Travel Agency</span><h1 style={{marginTop:16}}>YOUR JOURNEY,<br/><em>OUR PASSION.</em></h1><p>Discover extraordinary destinations, experience unforgettable journeys, and explore the world with confidence. SOM TREVEL turns every journey into an exceptional experience.</p>
    <p><Link className="btn" to="/destinations">Explore Destinations →</Link> <Link className="btn ghost" to="/packages">Book Your Journey</Link></p>
    <div className="stats"><div><b>50K+</b>Happy Customers</div><div><b>100+</b>Destinations</div><div><b>99%</b>Satisfaction</div></div></div><SearchWidget/></div></header>
  <section className="sec"><div className="wrap"><h2>Discover Somalia</h2><p className="sub">Beaches, history and culture at home.</p>{dl?<Skeletons/>:<div className="cards">{sh('local').map((x,i)=><Card i={i} key={x._id} to={'/destinations/'+x._id} img={x.image} title={x.name} sub={`${x.category} · ${x.duration}`} price={'From '+money(x.price)}/>)}</div>}</div></section>
  <section className="sec" style={{paddingTop:0}}><div className="wrap"><h2>International Destinations</h2><p className="sub">The world, one booking away.</p>{dl?<Skeletons/>:<div className="cards">{sh('international').map((x,i)=><Card i={i} key={x._id} to={'/destinations/'+x._id} img={x.image} title={x.name} sub={`${x.country} · ${x.duration}`} price={'From '+money(x.price)}/>)}</div>}</div></section>
  <section className="sec dark"><div className="wrap"><h2>Fly from Mogadishu to the world</h2><p style={{opacity:.8}}>Popular routes — request a real quote in a minute.</p><RouteMap h={380} legs={[['MGQ','DXB'],['MGQ','IST'],['MGQ','NBO'],['MGQ','JED'],['MGQ','LHR'],['MGQ','KUL']]}/><p><Link className="btn" to="/flights">Request a flight quote</Link></p></div></section>
  <section className="sec"><div className="wrap"><h2>Popular Packages</h2><p className="sub">Hand-picked trips with everything included.</p>{pl?<Skeletons/>:<div className="cards">{(p||[]).slice(0,6).map((x,i)=><Card i={i} key={x._id} to={'/packages/'+x._id} img={x.image} title={x.title} sub={`${x.duration} · ${x.destination?.name||''}`} price={money(x.price)+' / person'}/>)}</div>}</div></section>
  <section className="sec dark"><div className="wrap"><h2>Why Choose SOM TREVEL</h2><br/><div className="feat">{[['Trusted Experts','A local team that knows every route.'],['Transparent Pricing','Clear totals and professional invoices.'],['Digital E-Tickets','Ticket with QR and route map.'],['24/7 Support','WhatsApp, phone and email.']].map(([a,b])=><div key={a}><h3 style={{color:'#C9A45C'}}>{a}</h3><p>{b}</p></div>)}</div></div></section>
  <section className="sec"><div className="wrap"><h2>How it works</h2><br/><div className="steps">{[['1','Choose','Pick a package, hotel or flight route.'],['2','Request','Submit your booking in minutes.'],['3','Confirm','Our team confirms and sends payment options.'],['4','Travel','Get your invoice and e-ticket instantly.']].map(([n,a,b])=><div key={n}><b>{n}</b><h3>{a}</h3><p className="muted">{b}</p></div>)}</div></div></section>
  {!!(rv&&rv.length)&&<section className="sec" style={{paddingTop:0}}><div className="wrap"><h2>What travellers say</h2><br/><div className="cards">{rv.slice(0,6).map(x=><div className="quote" key={x._id}><Stars n={x.rating}/><p>{x.comment}</p><b>{x.authorName}</b><div className="muted">{x.destinationName}</div></div>)}</div></div></section>}
  <section className="sec" style={{paddingTop:0}}><div className="wrap"><div className="offer"><div><h2 style={{color:'#C9A45C'}}>Exclusive offers</h2><p>Get travel deals first. Join our newsletter.</p></div>
    <form onSubmit={async e=>{e.preventDefault();try{await api('/contact',{method:'POST',body:{name:'Newsletter',email:em,subject:'Newsletter signup',body:'Please add me to the newsletter.'}});setM('✓ Subscribed');setEm('')}catch(x){setM(x.message)}}} style={{display:'flex',gap:8,flexWrap:'wrap'}}><input type="email" required placeholder="Your email" value={em} onChange={e=>setEm(e.target.value)} style={{maxWidth:260}}/><button className="btn">Subscribe</button><span>{m}</span></form></div></div></section></>;
}
export function Destinations(){
  const [sp,setSp]=useSearchParams(),type=sp.get('type')||'',q=sp.get('q')||'',[d,l,e]=useGet(`/destinations?type=${type}&q=${encodeURIComponent(q)}`);
  const upd=(k,v)=>{const n=new URLSearchParams(sp);v?n.set(k,v):n.delete(k);setSp(n,{replace:true})};
  return <div className="wrap sec"><h2>{type==='local'?'Somalia Local Travel':type==='international'?'International Travel':'All Destinations'}</h2><p className="sub">Search and filter our destinations.</p>
   <div className="tabs"><button className={!type?'on':''} onClick={()=>upd('type','')}>All</button><button className={type==='local'?'on':''} onClick={()=>upd('type','local')}>Somalia</button><button className={type==='international'?'on':''} onClick={()=>upd('type','international')}>International</button></div>
   <input placeholder="Search destination…" defaultValue={q} onChange={e=>upd('q',e.target.value)} style={{maxWidth:360,marginBottom:20}}/>
   {l?<Skeletons/>:e?<p className="err">{e}</p>:!d?.length?<Empty text="No destinations found."/>:<div className="cards">{d.map((x,i)=><Card i={i} key={x._id} to={'/destinations/'+x._id} img={x.image} title={x.name} sub={`${x.country} · ${x.category} · ${x.duration}`} price={'From '+money(x.price)}/>)}</div>}</div>;
}
export function DestinationDetail(){
  const {id}=useParams(),{user}=useAuth(),[d,l,e]=useGet('/destinations/'+id),[pk]=useGet(d?'/packages?q='+encodeURIComponent(d.name):'/health',[d?.name]),[msg,setMsg]=useState('');
  if(l)return <div className="wrap sec"><div className="sk"/></div>;if(e||!d)return <div className="wrap sec"><p className="err">{e||'Not found'}</p></div>;
  const q=`${d.name}, ${d.country}`,pkgs=Array.isArray(pk)?pk:[];
  return <div className="wrap sec"><div className="card" style={{marginBottom:24}}><div className="img" style={{height:300}}>{d.image&&<img src={d.image} alt={d.name} onError={x=>x.target.remove()}/>}<span style={{fontSize:42}}>{d.name}</span></div></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24}}><div><p>{d.description}</p><p className="muted">{d.country} · {d.category} · {d.duration} · from <b>{money(d.price)}</b></p>
    <ul>{(d.attractions||[]).map(a=><li key={a}>{a}</li>)}</ul>
    <p><a className="btn out" target="_blank" rel="noreferrer" href={gmaps(q)}>Open in Google Maps ↗</a> <a className="btn out" target="_blank" rel="noreferrer" href={gsearch(`${d.name} visa requirements for Somali citizens`)}>Check visa info ↗</a> <button className="btn sm" onClick={async()=>{if(!user)return setMsg('Login first');try{const r=await api('/saved/'+d._id,{method:'POST'});setMsg(r.saved?'♥ Saved':'Removed')}catch(x){setMsg(x.message)}}}>♡ Save</button> {msg}</p>
    <p className="muted">Visa rules change often — always verify with the embassy before booking.</p></div><MapEmbed q={q}/></div>
   <h3 style={{margin:'30px 0 14px'}}>Packages</h3>{pkgs.length?<div className="cards">{pkgs.map(x=><Card key={x._id} to={'/packages/'+x._id} img={x.image} title={x.title} sub={x.duration} price={money(x.price)}/>)}</div>:<Empty text="No packages yet for this destination. Contact us for a custom trip."/>}</div>;
}
export function Packages(){
  const [sp,setSp]=useSearchParams(),q=sp.get('q')||'',[l,ld,e]=useGet('/packages?q='+encodeURIComponent(q));
  return <div className="wrap sec"><h2>Tour Packages</h2><p className="sub">All-inclusive journeys.</p><input placeholder="Search packages…" defaultValue={q} onChange={x=>setSp(x.target.value?{q:x.target.value}:{},{replace:true})} style={{maxWidth:360,marginBottom:20}}/>
   {ld?<Skeletons/>:e?<p className="err">{e}</p>:!l?.length?<Empty text="No packages found."/>:<div className="cards">{l.map((x,i)=><Card i={i} key={x._id} to={'/packages/'+x._id} img={x.image} title={x.title} sub={`${x.duration} · ${x.destination?.name||''}`} price={money(x.price)+' / person'}/>)}</div>}</div>;
}
export function PackageDetail(){
  const {id}=useParams(),{user}=useAuth(),nav=useNavigate(),[p,l,e]=useGet('/packages/'+id),[f,setF]=useState({travelers:1,travelDate:'',notes:''}),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  if(l)return <div className="wrap sec"><div className="sk"/></div>;if(e||!p)return <div className="wrap sec"><p className="err">{e||'Not found'}</p></div>;
  const submit=async x=>{x.preventDefault();if(!user)return nav('/login');setBusy(true);setErr('');try{const b=await api('/bookings',{method:'POST',body:{package:p._id,...f,travelerNames:[user.name]}});nav('/invoice/'+b.ref)}catch(z){setErr(z.message)}setBusy(false)};
  const List=({t,a})=><><h3 style={{fontSize:20,margin:'18px 0 8px'}}>{t}</h3><ul>{(a||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></>;
  const loc=p.destination?`${p.destination.name}, ${p.destination.country}`:p.title;
  return <div className="wrap sec" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:30}}>
   <div>{p.image&&<img src={p.image} alt={p.title} style={{width:'100%',borderRadius:18,maxHeight:360,objectFit:'cover'}} onError={x=>x.target.remove()}/>}<h2 style={{marginTop:16}}>{p.title}</h2><p>{p.description}</p>
    <p className="muted">Hotel: {p.hotel} · Transport: {p.transport} · Departure: {fmt(p.departure)} · Seats: {p.seats}</p><List t="Itinerary" a={p.itinerary}/><List t="Included" a={p.included}/><List t="Excluded" a={p.excluded}/><h3 style={{margin:'18px 0 8px'}}>Where you are going</h3><MapEmbed q={loc}/><p><a target="_blank" rel="noreferrer" href={gmaps(loc)}>Open in Google Maps ↗</a></p></div>
   <form className="panel" onSubmit={submit} style={{alignSelf:'start',position:'sticky',top:90}}><h3>{money(p.price)} <small className="muted">/ person</small></h3><br/>
    <label>Travel date</label><input type="date" required min={new Date().toISOString().slice(0,10)} value={f.travelDate} onChange={x=>setF({...f,travelDate:x.target.value})}/><br/><br/><label>Travelers</label><input type="number" min="1" max="20" value={f.travelers} onChange={x=>setF({...f,travelers:x.target.value})}/><br/><br/>
    <label>Notes</label><textarea rows="3" value={f.notes} onChange={x=>setF({...f,notes:x.target.value})}/><p><b>Total: {money(p.price*(Number(f.travelers)||1))}</b></p>{err&&<p className="err">{err}</p>}
    <button className="btn" disabled={busy} style={{width:'100%'}}>{user?(busy?'Submitting…':'Submit Booking'):'Login to Book'}</button><p className="muted">Booking starts as Pending. Our team confirms it and you can then pay. Verify visa requirements with the embassy.</p></form></div>;
}
export function Contact(){
  const {config}=useAuth(),c=config.company||{},[f,setF]=useState({}),[m,setM]=useState(''),s=k=>e=>setF({...f,[k]:e.target.value});
  return <div className="wrap sec"><h2>Contact Us</h2><p className="sub">We reply fast.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24}}>
   <form className="panel" onSubmit={async e=>{e.preventDefault();try{await api('/contact',{method:'POST',body:f});setM('✓ Message sent. Thank you!');e.target.reset()}catch(x){setM(x.message)}}}>
    <input placeholder="Name" required onChange={s('name')}/><br/><br/><input type="email" placeholder="Email" required onChange={s('email')}/><br/><br/><input placeholder="Subject" onChange={s('subject')}/><br/><br/><textarea rows="5" placeholder="Message" required onChange={s('body')}/><br/><br/>
    <button className="btn">Send</button> <a className="btn out" target="_blank" rel="noreferrer" href={`https://wa.me/${c.whatsapp}`}>WhatsApp</a><p>{m}</p></form>
   <div><div className="panel"><p>📞 {c.phone}<br/>✉️ {c.email}<br/>📍 {c.address}</p></div><MapEmbed q={c.mapQuery||'Mogadishu, Somalia'} h={260}/></div></div></div>;
}
export const About=()=><div className="wrap sec"><h2>About SOM TREVEL</h2><p style={{maxWidth:720,lineHeight:1.8}}>SOM TREVEL is a Somali travel company offering local and international trips, flights, hotels and tailor-made packages. Our mission is to make every journey simple, safe and unforgettable.</p></div>;
export const Services=()=><div className="wrap sec"><h2>Travel Services</h2><br/><div className="cards">{[['✈️','Flight tickets','We find and issue real tickets.'],['🏨','Hotel reservations','Hotels worldwide.'],['🧭','Tour packages','Guided, all-inclusive.'],['🛂','Visa guidance','Document checklists.'],['🚐','Airport transfers','Private pickups.'],['🛡️','Travel support','24/7 help.']].map(([i,a,b])=><div className="quote" key={a}><div style={{fontSize:34}}>{i}</div><h3>{a}</h3><p className="muted">{b}</p></div>)}</div></div>;
export const FAQ=()=><div className="wrap sec"><h2>FAQ</h2><br/>{[['How do I book?','Choose a package or hotel, or request a flight quote. You get a booking reference immediately.'],['When do I get my ticket?','Your e-ticket appears in My Trips once the booking is confirmed.'],['How can I pay?','By card (when enabled) or EVC Plus / bank transfer — submit your transaction reference and we verify it.'],['Do you handle visas?','We give guidance only. Always verify requirements with the embassy.'],['Can I cancel?','Pending bookings can be cancelled from My Trips.']].map(([q,a])=><details className="panel" key={q}><summary><b>{q}</b></summary><p className="muted">{a}</p></details>)}</div>;
