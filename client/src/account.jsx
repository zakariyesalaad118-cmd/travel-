import {useState} from 'react';
import {Link,useParams,useNavigate,Navigate,useSearchParams} from 'react-router-dom';
import {QRCodeSVG} from 'qrcode.react';
import {api,money,fmt,useGet} from './api.js';
import {useAuth,Logo} from './ctx.jsx';
import {MapEmbed,gmaps} from './maps.jsx';
export const Badge=({v})=><span className={`tag s-${String(v).split(' ')[0]}`} style={{fontWeight:700}}>{v}</span>;
function AuthForm({reg}){
  const {setUser}=useAuth(),nav=useNavigate(),[f,setF]=useState({}),[err,setErr]=useState(''),[busy,setBusy]=useState(false),s=k=>e=>setF({...f,[k]:e.target.value});
  return <div className="box panel"><h2>{reg?'Create account':'Welcome back'}</h2><br/><form onSubmit={async e=>{e.preventDefault();setBusy(true);setErr('');try{const u=await api(reg?'/auth/register':'/auth/login',{method:'POST',body:f});setUser(u);nav(u.role==='customer'?'/dashboard':'/admin')}catch(x){setErr(x.message)}setBusy(false)}}>
   {reg&&<><input placeholder="Full name" required onChange={s('name')}/><input placeholder="Phone" onChange={s('phone')}/></>}<input type="email" placeholder="Email" required onChange={s('email')}/><input type="password" placeholder="Password (8+)" required minLength={reg?8:1} onChange={s('password')}/>
   {err&&<p className="err">{err}</p>}<button className="btn" disabled={busy} style={{width:'100%'}}>{busy?'Please wait…':reg?'Register':'Login'}</button></form>
   <p className="muted">{reg?<>Have an account? <Link to="/login">Login</Link></>:<><Link to="/forgot">Forgot password?</Link> · <Link to="/register">Register</Link></>}</p></div>;
}
export const Login=()=><AuthForm/>;
export const Register=()=><AuthForm reg/>;
export function Forgot(){
  const [e,setE]=useState(''),[m,setM]=useState('');
  return <div className="box panel"><h2>Forgot password</h2><br/><form onSubmit={async x=>{x.preventDefault();try{await api('/auth/forgot',{method:'POST',body:{email:e}});setM('✓ If the email exists, a reset link has been sent.')}catch(z){setM(z.message)}}}><input type="email" required placeholder="Your email" value={e} onChange={x=>setE(x.target.value)}/><button className="btn" style={{width:'100%'}}>Send reset link</button></form><p className="muted">{m}</p></div>;
}
export function Reset(){
  const [sp]=useSearchParams(),nav=useNavigate(),[p,setP]=useState(''),[m,setM]=useState('');
  return <div className="box panel"><h2>New password</h2><br/><form onSubmit={async x=>{x.preventDefault();try{await api('/auth/reset',{method:'POST',body:{email:sp.get('email'),token:sp.get('token'),password:p}});nav('/login')}catch(z){setM(z.message)}}}><input type="password" minLength={8} required placeholder="New password (8+)" value={p} onChange={x=>setP(x.target.value)}/><button className="btn" style={{width:'100%'}}>Save password</button></form><p className="err">{m}</p></div>;
}
function ReviewBtn({b,done}){
  const [o,setO]=useState(false),[r,setR]=useState(5),[c,setC]=useState(''),[m,setM]=useState('');
  if(!o)return <button className="btn sm out" onClick={()=>setO(true)}>★ Review</button>;
  return <span><select style={{width:60}} value={r} onChange={e=>setR(e.target.value)}>{[5,4,3,2,1].map(n=><option key={n}>{n}</option>)}</select> <input style={{width:160}} placeholder="Comment" value={c} onChange={e=>setC(e.target.value)}/> <button className="btn sm" onClick={async()=>{try{await api('/reviews',{method:'POST',body:{ref:b.ref,rating:r,comment:c}});setM('✓ Thanks (pending approval)');setO(false);done&&done()}catch(x){setM(x.message)}}}>Send</button> {m}</span>;
}
function Support(){
  const [rev,setRev]=useState(0),[t,,,]=useGet('/support/mine',[rev]),[f,setF]=useState({subject:'',body:''}),[m,setM]=useState(''),[rep,setRep]=useState({});
  return <div><form className="panel" onSubmit={async e=>{e.preventDefault();try{await api('/support',{method:'POST',body:f});setF({subject:'',body:''});setM('✓ Ticket created');setRev(rev+1)}catch(x){setM(x.message)}}}><h3>New support request</h3><br/><input required placeholder="Subject" value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}/><br/><br/><textarea required rows="3" placeholder="How can we help?" value={f.body} onChange={e=>setF({...f,body:e.target.value})}/><br/><br/><button className="btn">Submit</button> {m}</form>
   {(t||[]).map(x=><div className="panel" key={x._id}><b>{x.subject}</b> <Badge v={x.status}/><p>{x.body}</p>{x.replies.map((r,i)=><p key={i} className="muted"><b>{r.by==='staff'?'SOM TREVEL':'You'}:</b> {r.text}</p>)}
    {x.status==='open'&&<div style={{display:'flex',gap:8}}><input placeholder="Reply…" value={rep[x._id]||''} onChange={e=>setRep({...rep,[x._id]:e.target.value})}/><button className="btn sm" onClick={async()=>{try{await api(`/support/${x._id}/reply`,{method:'POST',body:{text:rep[x._id]}});setRep({...rep,[x._id]:''});setRev(rev+1)}catch(z){setM(z.message)}}}>Send</button></div>}</div>)}</div>;
}
function Profile(){
  const {user,setUser}=useAuth(),[f,setF]=useState({name:user.name,phone:user.phone||''}),[p,setP]=useState({current:'',next:''}),[m,setM]=useState(''),[m2,setM2]=useState('');
  return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
   <form className="panel" onSubmit={async e=>{e.preventDefault();try{setUser(await api('/auth/me',{method:'PATCH',body:f}));setM('✓ Saved')}catch(x){setM(x.message)}}}><h3>My profile</h3><br/><label>Name</label><input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><br/><br/><label>Email</label><input value={user.email} disabled/><br/><br/><label>Phone</label><input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/><br/><br/><button className="btn">Save</button> {m}</form>
   <form className="panel" onSubmit={async e=>{e.preventDefault();try{await api('/auth/password',{method:'POST',body:p});setP({current:'',next:''});setM2('✓ Password changed')}catch(x){setM2(x.message)}}}><h3>Change password</h3><br/><input type="password" placeholder="Current password" required value={p.current} onChange={e=>setP({...p,current:e.target.value})}/><br/><br/><input type="password" minLength={8} placeholder="New password (8+)" required value={p.next} onChange={e=>setP({...p,next:e.target.value})}/><br/><br/><button className="btn">Change</button> {m2}</form></div>;
}
export function Dashboard(){
  const {user}=useAuth(),[tab,setTab]=useState('Overview'),[rev,setRev]=useState(0),on=!!user;
  const [b,bl,,]=useGet(on?'/bookings/mine':'/health',[user?.id,rev]),[fl]=useGet(on?'/flights/mine':'/health',[user?.id]),[sv,,,setSv]=useGet(on?'/saved':'/health',[user?.id,tab]),[nt]=useGet(on?'/notifications':'/health',[user?.id,tab]);
  if(!user)return <Navigate to="/login"/>;
  const bk=Array.isArray(b)?b:[],flights=Array.isArray(fl)?fl:[],saved=Array.isArray(sv)?sv:[],notes=Array.isArray(nt)?nt:[];
  const up=(Array.isArray(bk)?bk:[]).filter(x=>['Confirmed','Pending','Under Review'].includes(x.status)&&new Date(x.travelDate)>new Date()).length;
  const tabs=['Overview','My Bookings','Flights','Saved','Notifications','Profile','Support'];
  return <div className="wrap sec"><h2>Welcome back, {user.name.split(' ')[0]}</h2><br/><div className="tabbar">{tabs.map(t=><button key={t} className={tab===t?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
   {tab==='Overview'&&<><div className="kpis"><div className="kpi k1"><b>{up}</b>Upcoming Trips</div><div className="kpi k2"><b>{bk.length}</b>Total Bookings</div><div className="kpi k3"><b>{(Array.isArray(bk)?bk:[]).filter(x=>x.status==='Pending').length}</b>Pending</div><div className="kpi k4"><b>{money(bk.filter(x=>x.paymentStatus==='paid').reduce((a,x)=>a+x.total,0))}</b>Total Spent</div></div>
     <div className="panel"><h3>Recent activity</h3>{notes.slice(0,5).map(n=><p key={n._id}><b>{n.title}</b> <span className="muted">{n.body}</span></p>)}{!notes.length&&<p className="muted">Nothing yet.</p>}</div></>}
   {tab==='My Bookings'&&<div className="panel tbl"><table><thead><tr><th>Ref</th><th>Trip</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th><th/></tr></thead><tbody>{bk.map(x=><tr key={x._id}><td>{x.ref}</td><td>{x.packageTitle}</td><td>{fmt(x.travelDate)}</td><td>{money(x.total)}</td><td><Badge v={x.status}/></td><td><Badge v={x.paymentStatus}/></td>
    <td><Link className="btn sm" to={'/invoice/'+x.ref}>Invoice / Ticket</Link> {['Pending','Under Review'].includes(x.status)&&<button className="btn sm red" onClick={async()=>{if(confirm('Cancel this booking?')){try{await api(`/bookings/${x.ref}/cancel`,{method:'POST'});setRev(rev+1)}catch(e){alert(e.message)}}}}>Cancel</button>} {x.status==='Completed'&&<ReviewBtn b={x}/>}</td></tr>)}</tbody></table>{bl&&<p>Loading…</p>}{!bl&&!bk.length&&<p className="muted">No bookings yet. <Link to="/packages">Browse packages</Link></p>}</div>}
   {tab==='Flights'&&<div className="panel tbl"><p><Link className="btn sm" to="/flights">+ New flight request</Link></p><table><thead><tr><th>Ref</th><th>Route</th><th>Status</th><th>Quote</th><th/></tr></thead><tbody>{flights.map(f=><tr key={f._id}><td>{f.ref}</td><td>{f.legs.map(l=>`${l.from}→${l.to}`).join(', ')}</td><td><Badge v={f.status}/></td><td>{f.quote?money(f.quote):'-'}</td><td><Link className="btn sm" to={'/flight/'+f.ref}>Open</Link></td></tr>)}</tbody></table>{!flights.length&&<p className="muted">No flight requests.</p>}</div>}
   {tab==='Saved'&&<div className="cards">{saved.map(d=><div className="panel" key={d._id}><Link to={'/destinations/'+d._id}><b>{d.name}</b></Link><p className="muted">{d.country} · {money(d.price)}</p><button className="btn sm red" onClick={async()=>{try{await api('/saved/'+d._id,{method:'POST'});setSv((Array.isArray(saved)?saved:[]).filter(x=>x._id!==d._id))}catch{}}}>Remove</button></div>)}{!saved.length&&<p className="muted">No saved destinations. Tap “♡ Save” on a destination page.</p>}</div>}
   {tab==='Notifications'&&<div className="panel">{notes.map(n=><p key={n._id}><b>{n.title}</b><br/><span className="muted">{n.body} · {fmt(n.createdAt)}</span></p>)}{!notes.length&&<p className="muted">No notifications.</p>}</div>}
   {tab==='Profile'&&<Profile/>}{tab==='Support'&&<Support/>}</div>;
}
export function Invoice(){
  const {ref}=useParams(),{user,config}=useAuth(),[sp]=useSearchParams(),[rev,setRev]=useState(0),[b,l,e]=useGet(user?'/bookings/'+ref:'/health',[user?.id,rev]),[pf,setPf]=useState({method:'EVC Plus',reference:''}),[m,setM]=useState(''),[busy,setBusy]=useState(false);
  if(!user)return <Navigate to="/login"/>;
  if(l)return <div className="wrap sec"><div className="sk"/></div>;if(e||!b?.ref)return <div className="wrap sec"><p className="err">{e||'Not found'}</p></div>;
  const ok=['Confirmed','Completed'].includes(b.status),hotel=b.kind==='hotel',canPay=b.paymentStatus==='unpaid'&&b.status!=='Cancelled',loc=`${b.destinationName||''}`;
  const card=async()=>{setBusy(true);setM('');try{const r=await api(`/bookings/${b.ref}/checkout`,{method:'POST'});window.location.href=r.url}catch(x){setM(x.message);setBusy(false)}};
  const proof=async x=>{x.preventDefault();try{await api(`/bookings/${b.ref}/payment-proof`,{method:'POST',body:pf});setM('✓ Sent. We will verify your payment and confirm.');setRev(rev+1)}catch(z){setM(z.message)}};
  return <div className="wrap"><div className="noprint" style={{padding:'20px 0'}}><button className="btn" onClick={()=>window.print()}>🖨 Print / Save as PDF</button> <Link className="btn out" to="/dashboard">← Back</Link></div>
   {sp.get('paid')&&<p className="ok noprint">Thank you! Your payment will show as “paid” as soon as the card provider confirms it. <button className="btn sm" onClick={()=>setRev(rev+1)}>Refresh</button></p>}
   <div className="inv"><div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:10}}><div style={{background:'#101D2C',padding:10,borderRadius:8}}><Logo/></div><div style={{textAlign:'right'}}><h2>INVOICE</h2><div className="muted">No. {b.ref}<br/>Issued {fmt(b.createdAt)}</div></div></div><hr/>
    <p><b>Billed to:</b> {b.user?.name}<br/>{b.user?.email} {b.user?.phone}</p>
    <div className="tbl"><table><thead><tr><th>Description</th><th>{hotel?'Guests':'Travelers'}</th><th>{hotel?'Check-in':'Travel date'}</th><th>Amount</th></tr></thead><tbody><tr><td>{b.packageTitle}{hotel&&b.meta?` · ${b.meta.nights} night(s) × ${b.meta.rooms} room(s) · out ${fmt(b.meta.checkOut)}`:` — ${b.destinationName||''}`}</td><td>{b.travelers}</td><td>{fmt(b.travelDate)}</td><td>{money(b.total)}</td></tr></tbody></table></div>
    <h3 style={{textAlign:'right',marginTop:20}}>Total: {money(b.total)} USD</h3><p style={{textAlign:'right'}}>Booking: <Badge v={b.status}/> Payment: <Badge v={b.paymentStatus}/></p>
    {b.isDemo&&<p className="err">DEMO DATA — not a real transaction.</p>}</div>
   {canPay&&<div className="panel noprint" style={{maxWidth:820,margin:'0 auto 20px'}}><h3>Pay for this booking</h3><br/>
     {config.stripe?<p><button className="btn" disabled={busy} onClick={card}>💳 Pay {money(b.total)} by card</button></p>:<p className="muted">Card payment is not enabled yet.</p>}
     {b.paymentProof?.reference?<p className="ok">Payment reference submitted: {b.paymentProof.method} · {b.paymentProof.reference}. Waiting for verification.</p>:
     <form onSubmit={proof} className="grid2"><div className="full muted">Paid by EVC Plus, bank transfer or cash? Enter your transaction reference. Our team verifies it before marking as paid.</div><select value={pf.method} onChange={x=>setPf({...pf,method:x.target.value})}>{['EVC Plus','Bank Transfer','Cash','Other'].map(x=><option key={x}>{x}</option>)}</select><input required placeholder="Transaction reference" value={pf.reference} onChange={x=>setPf({...pf,reference:x.target.value})}/><button className="btn full">I have paid</button></form>}<p className={m.startsWith('✓')?'ok':'err'}>{m}</p></div>}
   {ok?<><div className="ticket"><div className="l"><Logo/><h2 style={{marginTop:12}}>{hotel?'HOTEL VOUCHER':'E-TICKET'}</h2><p><b>{b.destinationName}</b><br/>{b.packageTitle}</p><p>Guest: {(b.travelerNames&&b.travelerNames[0])||b.user?.name} {b.travelers>1?`(+${b.travelers-1})`:''}<br/>{hotel?'Check-in':'Date'}: {fmt(b.travelDate)}{hotel&&b.meta?` · Check-out: ${fmt(b.meta.checkOut)}`:''}<br/>{!hotel&&<>Hotel: {b.package?.hotel||'-'}</>}</p></div><div className="r"><QRCodeSVG value={`SOMTREVEL:${b.ref}`} size={110}/><b>{b.ref}</b><span className="muted">{b.status}</span></div></div>
    <div className="inv noprint"><h3>Where you are going</h3><br/><MapEmbed q={loc} h={300}/><p><a target="_blank" rel="noreferrer" href={gmaps(loc)}>Open in Google Maps ↗</a></p></div></>
    :<p className="muted noprint" style={{textAlign:'center'}}>Your e-ticket will appear here once the booking is confirmed.</p>}</div>;
}
