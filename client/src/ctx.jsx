import {createContext,useContext} from 'react';
export const Auth=createContext({user:null,setUser:()=>{},config:{company:{}}});
export const useAuth=()=>useContext(Auth);
export const Logo=()=><span className="logo"><svg width="40" height="32" viewBox="0 0 40 32" fill="none"><circle cx="18" cy="16" r="12" stroke="#C9A45C" strokeWidth="1.5" opacity=".6"/><ellipse cx="18" cy="16" rx="5" ry="12" stroke="#C9A45C" strokeWidth="1" opacity=".4"/><path d="M2 21 38 4 25 28l-5-9-9 2 6-7z" fill="#C9A45C"/></svg><span>SOM TREVEL<small>Your Journey, Our Passion</small></span></span>;
