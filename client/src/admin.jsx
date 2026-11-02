import {useEffect,useState} from 'react';
import {Navigate,Link} from 'react-router-dom';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,Legend,CartesianGrid} from 'recharts';
import {api,money,fmt,useGet} from './api.js';
import {useAuth} from './ctx.jsx';
import {Badge} from './account.jsx';
const C=['#C9A45C','#101D2C','#16A36A','#DC4545','#6f5bd6'];
const ST=['Pending','Under Review','Confirmed','Cancelled','Completed'];
const Err=({e})=>e?<p className="err">{e}</p>:null;
function Overview(){
  const [s,l,e]=useGet('/admin/stats');
  if(l)return <div className="sk"/>;if(e||!s)return <Err e={e}/>;
  return <><div className="kpis"><div className="kpi k1"><b>{s.totalBookings}</b>Total Bookings</div><div className="kpi k2"><b>{s.customers}</b>Customers</div><div className="kpi k3"><b>{money(s.revenue)}</b>Revenue (paid)</div><div className="kpi k4"><b>{s.destinations}</b>Destinations · {s.packages} packages · {s.hotels} hotels</div></div>
  <p>{!!s.newFlights&&<span className="tag s-New">{s.newFlights} new flight requests</span>} {!!s.openTickets&&<span className="tag s-New">{s.openTickets} open tickets</span>} {!!s.pendingReviews&&<span className="tag s-New">{s.pendingReviews} reviews to approve</span>}</p><br/>
  <div className="panel"><h3>Monthly Revenue & Bookings</h3><ResponsiveContainer height={260}><BarChart data={s.monthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/><Bar dataKey="bookings" fill="#101D2C"/><Bar dataKey="revenue" fill="#C9A45C"/></BarChart></ResponsiveContainer></div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}><div className="panel"><h3>By Status</h3><ResponsiveContainer height={240}><PieChart><Pie data={s.byStatus} dataKey="value" nameKey="name" outerRadius={80}>{s.byStatus.map((_,i)=><Cell key={i} fill={C[i%5]}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div>
  <div className="panel"><h3>Popular Destinations</h3><ResponsiveContainer height={240}><BarChart data={s.top} layout="vertical"><XAxis type="number"/><YAxis dataKey="name" type="category" width={90}/><Tooltip/><Bar dataKey="value" fill="#C9A45C"/></BarChart></ResponsiveContainer></div></div></>;
}
function Bookings(){
  const [q,setQ]=useState(''),[st,setSt]=useState(''),[rev,setRev]=useState(0),[l,ld,e]=useGet(`/admin/bookings?q=${encodeURIComponent(q)}&status=${st}`,[rev]),[er,setEr]=useState('');
  const up=(id,b)=>api('/admin/bookings/'+id,{method:'PATCH',body:b}).then(()=>setRev(rev+1)).catch(x=>setEr(x.message));
  const list=Array.isArray(l)?l:[];
  const csv=()=>{const r=[['Ref','Customer','Destination','Date','Total','Status','Payment'],...list.map(b=>[b.ref,b.user?.name,b.destinationName,fmt(b.travelDate),b.total,b.status,b.paymentStatus])];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r.map(x=>x.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n')],{type:'text/csv'}));a.download='bookings.csv';a.click()};
  return <div className="panel"><div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:12}}><input style={{maxWidth:240}} placeholder="Search…" value={q} onChange={x=>setQ(x.target.value)}/><select style={{maxWidth:180}} value={st} onChange={x=>setSt(x.target.value)}><option value="">All statuses</option>{ST.map(x=><option key={x}>{x}</option>)}</select><button className="btn sm" onClick={csv}>Export CSV</button></div><Err e={e||er}/>
  <div className="tbl"><table><thead><tr><th>Ref</th><th>Customer</th><th>Trip</th><th>Date</th><th>Total</th><th>Proof</th><th>Status</th><th>Payment</th></tr></thead><tbody>{list.map(b=><tr key={b._id}><td><Link to={'/invoice/'+b.ref}>{b.ref}</Link>{b.isDemo&&<span className="tag"> demo</span>}</td><td>{b.user?.name}</td><td>{b.kind==='hotel'?'🏨 ':''}{b.destinationName}</td><td>{fmt(b.travelDate)}</td><td>{money(b.total)}</td><td className="muted">{b.paymentProof?.reference?`${b.paymentProof.method}: ${b.paymentProof.reference}`:'-'}</td>
   <td><select value={b.status} onChange={x=>up(b._id,{status:x.target.value})}>{ST.map(x=><option key={x}>{x}</option>)}</select></td><td><select value={b.paymentStatus} onChange={x=>up(b._id,{paymentStatus:x.target.value})}>{['unpaid','paid','refunded'].map(x=><option key={x}>{x}</option>)}</select></td></tr>)}</tbody></table></div>{ld&&<p>Loading…</p>}</div>;
}
function Customers(){
  const {user}=useAuth(),[rev,setRev]=useState(0),[l,ld,e]=useGet('/admin/customers',[rev]);
  return <div className="panel tbl"><Err e={e}/><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Bookings</th><th>Status</th></tr></thead><tbody>{(l||[]).map(c=><tr key={c._id}><td>{c.name}{c.isDemo&&<span className="tag"> demo</span>}</td><td>{c.email}</td><td>{c.phone}</td><td>{fmt(c.createdAt)}</td><td>{c.bookings}</td><td>{user.role==='admin'?<button className="btn sm" onClick={()=>api('/admin/customers/'+c._id,{method:'PATCH',body:{status:c.status==='active'?'suspended':'active'}}).then(()=>setRev(rev+1))}>{c.status}</button>:c.status}</td></tr>)}</tbody></table>{ld&&<p>Loading…</p>}</div>;
}
const F={destinations:[['name','Name','t',1],['country','Country'],['type','Type','local,international'],['category','Category'],['price','Price USD','n',1],['duration','Duration (5 days)'],['image','Image URL'],['attractions','Attractions (one per line)','l'],['description','Description','a']],
 packages:[['title','Title','t',1],['destination','Destination','dest'],['price','Price USD','n',1],['duration','Duration'],['hotel','Hotel'],['transport','Transport'],['image','Image URL'],['itinerary','Itinerary (one day per line)','l'],['included','Included (one per line)','l'],['excluded','Excluded (one per line)','l'],['description','Description','a']],
 hotels:[['name','Name','t',1],['city','City'],['country','Country'],['stars','Stars (1-5)','n'],['pricePerNight','Price / night USD','n',1],['image','Image URL'],['facilities','Facilities (one per line)','l'],['description','Description','a']]};
function Catalog({kind}){
  const {user}=useAuth(),[rev,setRev]=useState(0),[l,ld,e]=useGet('/admin/'+kind,[rev]),[ds]=useGet('/admin/destinations'),[f,setF]=useState({}),[err,setErr]=useState(''),[k,setK]=useState(0);
  const pk=kind==='hotels'?'pricePerNight':'price';
  const add=async x=>{x.preventDefault();setErr('');const b={};for(const [n,,t] of F[kind]){const v=f[n];if(v===undefined||v==='')continue;b[n]=t==='n'?Number(v):t==='l'?String(v).split('\n').map(s=>s.trim()).filter(Boolean):v}try{await api('/admin/'+kind,{method:'POST',body:b});setF({});setK(k+1);setRev(rev+1)}catch(z){setErr(z.message)}};
  const put=(id,b)=>api(`/admin/${kind}/${id}`,{method:'PUT',body:b}).then(()=>setRev(rev+1)).catch(z=>setErr(z.message));
  return <><form key={k} className="panel grid2" onSubmit={add}><h3 className="full">Add new</h3>{F[kind].map(([n,lab,t,req])=><div key={n} className={t==='a'||t==='l'?'full':''}><label>{lab}</label>{t==='a'||t==='l'?<textarea rows="3" onChange={x=>setF({...f,[n]:x.target.value})}/>:t==='dest'?<select onChange={x=>setF({...f,[n]:x.target.value})}><option value="">—</option>{(ds||[]).map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select>:t&&t.includes(',')?<select onChange={x=>setF({...f,[n]:x.target.value})}><option value="">—</option>{t.split(',').map(o=><option key={o}>{o}</option>)}</select>:<input required={!!req} type={t==='n'?'number':'text'} step="any" onChange={x=>setF({...f,[n]:x.target.value})}/>}</div>)}
   <Err e={err}/><button className="btn full">Add</button></form>
  <div className="panel tbl"><Err e={e}/><table><thead><tr><th>Name</th><th>Price</th><th>Published</th><th/></tr></thead><tbody>{(l||[]).map(x=><tr key={x._id}><td>{x.name||x.title}{x.isDemo&&<span className="tag"> demo</span>}</td><td><input type="number" style={{width:100}} defaultValue={x[pk]} onBlur={z=>Number(z.target.value)!==x[pk]&&put(x._id,{[pk]:Number(z.target.value)})}/></td>
   <td><button className="btn sm" onClick={()=>put(x._id,{published:!x.published})}>{x.published?'Published':'Hidden'}</button></td><td>{user.role==='admin'&&<button className="btn sm red" onClick={()=>confirm('Delete?')&&api(`/admin/${kind}/${x._id}`,{method:'DELETE'}).then(()=>setRev(rev+1)).catch(z=>setErr(z.message))}>Delete</button>}</td></tr>)}</tbody></table>{ld&&<p>Loading…</p>}</div></>;
}
function FlightRow({f,reload}){
  const [v,setV]=useState({status:f.status,quote:f.quote||'',airline:f.airline||'',flightNo:f.flightNo||'',pnr:f.pnr||'',departTime:f.departTime||'',arriveTime:f.arriveTime||''}),[m,setM]=useState(''),s=k=>e=>setV({...v,[k]:e.target.value});
  return <div className="panel"><b>{f.ref}</b> {f.isDemo&&<span className="tag">demo</span>} <span className="muted">{f.user?.name} · {f.tripType} · {f.legs.map(l=>`${l.from}→${l.to} ${l.date}`).join(', ')}{f.returnDate?` · return ${f.returnDate}`:''} · {f.pax} pax · {f.cabin}</span>
   <div className="grid2" style={{marginTop:10}}><select value={v.status} onChange={s('status')}>{['New','Quoted','Ticketed','Cancelled'].map(x=><option key={x}>{x}</option>)}</select><input type="number" placeholder="Quote USD" value={v.quote} onChange={s('quote')}/><input placeholder="Airline" value={v.airline} onChange={s('airline')}/><input placeholder="Flight no. (e.g. EK722)" value={v.flightNo} onChange={s('flightNo')}/><input placeholder="PNR" value={v.pnr} onChange={s('pnr')}/><input placeholder="Depart time 08:30" value={v.departTime} onChange={s('departTime')}/><input placeholder="Arrive time" value={v.arriveTime} onChange={s('arriveTime')}/><button className="btn sm" onClick={async()=>{try{await api('/admin/flights/'+f._id,{method:'PATCH',body:v});setM('✓ Saved');reload()}catch(x){setM(x.message)}}}>Save</button></div><p className={m.startsWith('✓')?'ok':'err'}>{m}</p></div>;
}
const Flights=()=>{const [rev,setRev]=useState(0),[l,ld,e]=useGet('/admin/flights',[rev]);return <>{<Err e={e}/>}{ld&&<div className="sk"/>}{(l||[]).map(f=><FlightRow key={f._id+f.updatedAt} f={f} reload={()=>setRev(rev+1)}/>)}</>};
function Reviews(){
  const [rev,setRev]=useState(0),[l,,e]=useGet('/admin/reviews',[rev]),[er,setEr]=useState('');
  return <div className="panel tbl"><Err e={e||er}/><table><thead><tr><th>Author</th><th>Trip</th><th>★</th><th>Comment</th><th/></tr></thead><tbody>{(l||[]).map(r=><tr key={r._id}><td>{r.authorName}</td><td>{r.destinationName}</td><td>{r.rating}</td><td>{r.comment}</td><td><button className="btn sm" onClick={()=>api('/admin/reviews/'+r._id,{method:'PATCH',body:{approved:!r.approved}}).then(()=>setRev(rev+1)).catch(x=>setEr(x.message))}>{r.approved?'Approved':'Approve'}</button> <button className="btn sm red" onClick={()=>confirm('Delete?')&&api('/admin/reviews/'+r._id,{method:'DELETE'}).then(()=>setRev(rev+1)).catch(x=>setEr(x.message))}>✕</button></td></tr>)}</tbody></table></div>;
}
function SupportAdmin(){
  const [rev,setRev]=useState(0),[l,,e]=useGet('/admin/support',[rev]),[t,setT]=useState({});
  const send=(id,close)=>api(`/admin/support/${id}/reply`,{method:'POST',body:{text:t[id],close}}).then(()=>{setT({...t,[id]:''});setRev(rev+1)});
  return <>{<Err e={e}/>}{(l||[]).map(x=><div className="panel" key={x._id}><b>{x.subject}</b> <Badge v={x.status}/> <span className="muted">{x.user?.name} · {fmt(x.createdAt)}</span><p>{x.body}</p>{x.replies.map((r,i)=><p key={i} className="muted"><b>{r.by}:</b> {r.text}</p>)}<div style={{display:'flex',gap:8}}><input placeholder="Reply…" value={t[x._id]||''} onChange={z=>setT({...t,[x._id]:z.target.value})}/><button className="btn sm" onClick={()=>send(x._id,false)}>Reply</button><button className="btn sm out" onClick={()=>send(x._id,true)}>Close</button></div></div>)}</>;
}
function Payments(){
  const [rev,setRev]=useState(0),[l,,e]=useGet('/admin/payments',[rev]);
  return <div className="panel tbl"><Err e={e}/><table><thead><tr><th>Ref</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th><th/></tr></thead><tbody>{(l||[]).map(x=><tr key={x._id}><td>{x.reference}</td><td>{x.booking?.ref}</td><td>{money(x.amount)}</td><td>{x.method}</td><td><Badge v={x.status}/></td><td>{x.status==='pending'&&x.booking&&x.method!=='Pending'&&<button className="btn sm" onClick={()=>confirm('Mark as PAID? Only after you verified the money was received.')&&api('/admin/bookings/'+x.booking._id,{method:'PATCH',body:{paymentStatus:'paid',method:x.method}}).then(()=>setRev(rev+1))}>Verify paid</button>}</td></tr>)}</tbody></table></div>;
}
function Simple({path,cols}){const [l,ld,e]=useGet('/admin/'+path);return <div className="panel tbl"><Err e={e}/><table><thead><tr>{cols.map(c=><th key={c[0]}>{c[0]}</th>)}</tr></thead><tbody>{(l||[]).map(x=><tr key={x._id}>{cols.map(c=><td key={c[0]}>{c[1](x)}</td>)}</tr>)}</tbody></table>{ld&&<p>Loading…</p>}</div>}
function Settings(){
  const {config,user}=useAuth(),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),Y=({v})=><b style={{color:v?'#16A36A':'#DC4545'}}>{v?'✓ connected':'✗ not configured'}</b>;
  const run=async(label,p,m)=>{if(!confirm(`${label}?\nOnly records marked as DEMO are affected. Real customers, bookings and payments are never touched.`))return;setBusy(true);setMsg('');try{await api(p,{method:m});setMsg('✓ '+label+' — done')}catch(x){setMsg('✗ '+x.message)}setBusy(false)};
  return <><div className="panel"><h3>Integrations</h3><p>Card payments (Stripe): <Y v={config.stripe}/><br/>Email (Resend): <Y v={config.email}/></p><p className="muted">Set these in Render → Environment: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, MAIL_FROM, APP_URL.</p></div>
  <div className="panel"><h3>Demo Data Management</h3>{!config.demo?<p>Demo management is disabled (production mode).</p>:user.role!=='admin'?<p>Only the Admin can manage demo data.</p>:<><p className="muted">Only records with isDemo=true are removed. Real data is protected.</p><p className={msg.startsWith('✓')?'ok':'err'}>{busy?'Working…':msg}</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{['customers','bookings','destinations','packages','hotels','payments','flights','reviews'].map(w=><button key={w} disabled={busy} className="btn sm red" onClick={()=>run('Delete demo '+w,'/admin/demo/'+w,'DELETE')}>Delete demo {w}</button>)}
   <button disabled={busy} className="btn sm red" onClick={()=>run('Reset ALL demo data','/admin/demo/all','DELETE')}>Reset all demo</button><button disabled={busy} className="btn sm" onClick={()=>run('Restore default demo data','/admin/demo/restore','POST')}>Restore default demo data</button></div></>}</div></>;
}
export default function Admin(){
  const {user}=useAuth(),[t,setT]=useState('Dashboard');
  if(!user||user.role==='customer')return <Navigate to="/login"/>;
  const tabs=['Dashboard','Bookings','Customers','Destinations','Packages','Hotels','Flights','Payments','Reviews','Support','Messages','Settings'];
  return <div className="layout"><div className="side">{tabs.map(x=><button key={x} className={t===x?'on':''} onClick={()=>setT(x)}>{x}</button>)}</div><div className="main"><h2 style={{marginBottom:16}}>{t}</h2>
   {t==='Dashboard'&&<Overview/>}{t==='Bookings'&&<Bookings/>}{t==='Customers'&&<Customers/>}{['Destinations','Packages','Hotels'].includes(t)&&<Catalog key={t} kind={t.toLowerCase()}/>}{t==='Flights'&&<Flights/>}{t==='Payments'&&<Payments/>}{t==='Reviews'&&<Reviews/>}{t==='Support'&&<SupportAdmin/>}
   {t==='Messages'&&<Simple path="messages" cols={[['From',x=>x.name+' <'+x.email+'>'],['Subject',x=>x.subject],['Message',x=>x.body],['Date',x=>fmt(x.createdAt)]]}/>}{t==='Settings'&&<Settings/>}</div></div>;
}
