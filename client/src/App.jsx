import {Component,createContext,useContext,useEffect,useState} from 'react';
import {Routes,Route,NavLink,Link,useNavigate,useLocation} from 'react-router-dom';
import {api,fmt} from './api.js';
import {Auth,useAuth} from './ctx.jsx';
import {Logo} from './ctx.jsx';
import {Home,Destinations,DestinationDetail,Packages,PackageDetail,Contact,About,FAQ,Services} from './pages.jsx';
import {Hotels,HotelDetail,Flights,FlightTicket} from './travel.jsx';
import {Login,Register,Forgot,Reset,Dashboard,Invoice} from './account.jsx';
import Admin from './admin.jsx';
import {AirportList} from './maps.jsx';
class Boundary extends Component{
  state={e:null};
  static getDerivedStateFromError(e){return {e}}
  componentDidCatch(e){console.error(e)}
  componentDidUpdate(p){if(p.k!==this.props.k&&this.state.e)this.setState({e:null})}
  render(){return this.state.e?<div className="wrap sec"><h2>Wax qalad ah ayaa dhacay</h2><p className="sub">Fadlan dib u cusboonaysii bogga. Haddii uu sii socdo, nala soo xiriir.</p><a className="btn" href="/">Back home</a></div>:this.props.children}
}
function Bell(){
  const {user}=useAuth(),[l,setL]=useState([]),[open,setOpen]=useState(false);
  useEffect(()=>{if(!user)return;const f=()=>api('/notifications').then(setL).catch(()=>{});f();const t=setInterval(f,60000);return()=>clearInterval(t)},[user]);
  const n=l.filter(x=>!x.read).length;
  return <span style={{position:'relative'}}><button className="bell" aria-label="Notifications" onClick={()=>{setOpen(!open);if(!open&&n)api('/notifications/read',{method:'POST'}).then(()=>setTimeout(()=>setL(x=>x.map(y=>({...y,read:true}))),1500)).catch(()=>{})}}>🔔{n>0&&<i>{n}</i>}</button>
   {open&&<div className="pop">{l.length?l.map(x=><div key={x._id} style={{padding:'8px 0',borderBottom:'1px solid #eee'}}><b style={{fontSize:13}}>{x.title}</b><div className="muted">{x.body}</div><div className="muted" style={{fontSize:11}}>{fmt(x.createdAt)}</div></div>):<p className="muted">No notifications</p>}</div>}</span>;
}
export default function App(){
  const [user,setUser]=useState(null),[config,setConfig]=useState({company:{}}),[ready,setReady]=useState(false),[open,setOpen]=useState(false),nav=useNavigate(),loc=useLocation();
  useEffect(()=>{Promise.allSettled([api('/auth/me').then(setUser),api('/config').then(setConfig)]).finally(()=>setReady(true))},[]);
  useEffect(()=>{window.scrollTo(0,0);setOpen(false)},[loc.pathname]);
  const logout=async()=>{try{await api('/auth/logout',{method:'POST'})}catch{}setUser(null);nav('/')};
  if(!ready)return <div className="wrap sec"><div className="sk"/></div>;
  const staff=user&&user.role!=='customer',c=config.company||{};
  return <Auth.Provider value={{user,setUser,config}}>
    <nav className="top"><div className="wrap"><Link to="/"><Logo/></Link><div className="sp"/>
      <div className={'links'+(open?' open':'')}>
        <NavLink to="/" end>Home</NavLink><NavLink to="/destinations?type=local">Somalia</NavLink><NavLink to="/destinations?type=international">International</NavLink><NavLink to="/flights">Flights</NavLink><NavLink to="/hotels">Hotels</NavLink><NavLink to="/packages">Packages</NavLink><NavLink to="/contact">Contact</NavLink>
        {user?<>{staff&&<NavLink to="/admin">Admin</NavLink>}<NavLink to="/dashboard">My Trips</NavLink><a href="#out" onClick={e=>{e.preventDefault();logout()}}>Logout</a></>:<NavLink to="/login">Login</NavLink>}
        <Link className="btn sm" to="/packages">Book Now</Link></div>
      {user&&<Bell/>}<button className="burger" aria-label="Menu" onClick={()=>setOpen(o=>!o)}>☰</button></div></nav>
    <Boundary k={loc.pathname}><Routes>
      <Route path="/" element={<Home/>}/><Route path="/destinations" element={<Destinations/>}/><Route path="/destinations/:id" element={<DestinationDetail/>}/>
      <Route path="/packages" element={<Packages/>}/><Route path="/packages/:id" element={<PackageDetail/>}/>
      <Route path="/hotels" element={<Hotels/>}/><Route path="/hotels/:id" element={<HotelDetail/>}/><Route path="/flights" element={<Flights/>}/><Route path="/flight/:ref" element={<FlightTicket/>}/>
      <Route path="/about" element={<About/>}/><Route path="/services" element={<Services/>}/><Route path="/faq" element={<FAQ/>}/><Route path="/contact" element={<Contact/>}/>
      <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/forgot" element={<Forgot/>}/><Route path="/reset" element={<Reset/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/><Route path="/invoice/:ref" element={<Invoice/>}/><Route path="/admin" element={<Admin/>}/>
      <Route path="*" element={<div className="wrap sec"><h2>Page not found</h2><p><Link className="btn" to="/">Home</Link></p></div>}/>
    </Routes></Boundary>
    <AirportList/>
    {c.whatsapp&&<a className="wa" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">💬</a>}
    <footer><div className="wrap"><div><Logo/><p>Local & international travel from Somalia.</p></div><div><b>Explore</b><Link to="/flights">Flights</Link><Link to="/hotels">Hotels</Link><Link to="/packages">Packages</Link><Link to="/destinations">Destinations</Link></div><div><b>Company</b><Link to="/about">About</Link><Link to="/services">Services</Link><Link to="/faq">FAQ</Link><Link to="/contact">Contact</Link></div><div><b>Contact</b><p>{c.phone}<br/>{c.email}<br/>{c.address}</p></div></div>
      <div className="wrap" style={{display:'block',marginTop:20}}>© {new Date().getFullYear()} SOM TREVEL. All rights reserved.</div></footer>
  </Auth.Provider>;
}
