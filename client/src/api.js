import {useEffect,useState} from 'react';
export const api=async(p,o={})=>{
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),25000);
  try{
    const r=await fetch('/api'+p,{credentials:'include',headers:{'Content-Type':'application/json'},...o,body:o.body?JSON.stringify(o.body):undefined,signal:ctl.signal});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||'Qalad ayaa dhacay, fadlan dib isku day');
    return d;
  }catch(e){throw new Error(e.name==='AbortError'?'Server-ku wuu daahay, dib isku day':e.message==='Failed to fetch'?'Internet ama server ma shaqeeyo':e.message)}
  finally{clearTimeout(tm)}
};
export const money=n=>'$'+Number(n||0).toLocaleString();
export const fmt=d=>{const x=new Date(d);return d&&!isNaN(x)?x.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'-'};
export function useGet(path,deps=[]){
  const [s,set]=useState({d:null,l:true,e:''});
  useEffect(()=>{let on=true;set(x=>({...x,l:true,e:''}));api(path).then(d=>on&&set({d,l:false,e:''})).catch(e=>on&&set({d:null,l:false,e:e.message}));return()=>{on=false}},[path,...deps]);
  return [s.d,s.l,s.e,v=>set(x=>({...x,d:v}))];
}
