import {useEffect,useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {airport,AIRPORTS,airportLabel} from './airports.js';
// ---- Google links (no API key needed) ----
export const gmaps=q=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
export const gflights=(f,t,d)=>`https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${f} to ${t}${d?' on '+d:''}`)}`;
export const ghotels=c=>`https://www.google.com/travel/hotels/${encodeURIComponent(c)}`;
export const gsearch=q=>`https://www.google.com/search?q=${encodeURIComponent(q)}`;
export const trackFA=fn=>`https://www.flightaware.com/live/flight/${encodeURIComponent(fn)}`;
export const trackFR=fn=>`https://www.flightradar24.com/data/flights/${encodeURIComponent(String(fn).toLowerCase())}`;
export const MapEmbed=({q,h=320})=><iframe title={'Map '+q} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{width:'100%',height:h,border:0,borderRadius:14}} src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`}/>;
export const AirportList=()=><datalist id="airports">{AIRPORTS.map(a=><option key={a.code} value={airportLabel(a)}/>)}</datalist>;
function arc(a,b,n=64){
  const r=Math.PI/180,la1=a[0]*r,lo1=a[1]*r,la2=b[0]*r,lo2=b[1]*r;
  const d=2*Math.asin(Math.min(1,Math.sqrt(Math.sin((la2-la1)/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin((lo2-lo1)/2)**2)));
  if(!d||Math.sin(d)<1e-6)return [a,b];
  const pts=[];let prev=a[1];
  for(let i=0;i<=n;i++){const f=i/n,A=Math.sin((1-f)*d)/Math.sin(d),B=Math.sin(f*d)/Math.sin(d);
    const x=A*Math.cos(la1)*Math.cos(lo1)+B*Math.cos(la2)*Math.cos(lo2),y=A*Math.cos(la1)*Math.sin(lo1)+B*Math.cos(la2)*Math.sin(lo2),z=A*Math.sin(la1)+B*Math.sin(la2);
    const lat=Math.atan2(z,Math.hypot(x,y))/r;let lon=Math.atan2(y,x)/r;while(lon-prev>180)lon-=360;while(lon-prev<-180)lon+=360;prev=lon;pts.push([lat,lon])}
  return pts;
}
// Real interactive world map with great-circle flight routes. legs = [['MGQ','DXB'],...]
export function RouteMap({legs,h=360}){
  const el=useRef(null),key=JSON.stringify(legs||[]);
  useEffect(()=>{
    const pairs=(legs||[]).map(([f,t])=>[airport(f),airport(t)]).filter(([a,b])=>a&&b);
    if(!pairs.length||!el.current)return;
    let map;
    try{
      map=L.map(el.current,{scrollWheelZoom:false,worldCopyJump:true,zoomControl:true});
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:8,attribution:'© OpenStreetMap contributors'}).addTo(map);
      const all=[];
      pairs.forEach(([a,b])=>{
        const pts=arc([a.lat,a.lng],[b.lat,b.lng]);all.push(...pts);
        L.polyline(pts,{color:'#C9A45C',weight:3,dashArray:'8 8'}).addTo(map);
        [a,b].forEach(p=>L.circleMarker([p.lat,p.lng],{radius:7,color:'#101D2C',fillColor:'#C9A45C',fillOpacity:1,weight:2}).bindTooltip(`${p.code} · ${p.city}`,{permanent:true,direction:'top'}).addTo(map));
        const i=Math.floor(pts.length/2),m=pts[i],m2=pts[i+1]||m,hd=Math.atan2((m2[1]-m[1])*Math.cos(m[0]*Math.PI/180),m2[0]-m[0])*180/Math.PI;
        L.marker(m,{interactive:false,icon:L.divIcon({className:'',html:`<div style="font-size:26px;transform:rotate(${hd-45}deg);filter:drop-shadow(0 2px 3px #0008)">✈</div>`,iconSize:[26,26],iconAnchor:[13,13]})}).addTo(map);
      });
      map.fitBounds(L.latLngBounds(all),{padding:[50,50]});
    }catch(e){console.error('map',e)}
    return()=>{try{map&&map.remove()}catch{}};
  },[key]);
  const ok=(legs||[]).some(([f,t])=>airport(f)&&airport(t));
  return ok?<div ref={el} style={{height:h,borderRadius:14,overflow:'hidden',isolation:'isolate'}}/>:<div className="muted" style={{padding:20,textAlign:'center'}}>Dooro airports si aad u aragto khariidadda</div>;
}
