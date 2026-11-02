import {Notification,User} from './models.js';
export const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const tpl=(title,body)=>`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee"><div style="background:#101D2C;color:#C9A45C;padding:16px;font-size:20px;font-weight:bold">SOM TREVEL</div><div style="padding:20px"><h2 style="color:#101D2C">${title}</h2>${body}</div></div>`;
// Email: Resend API. Haddii RESEND_API_KEY la''aan yahay, console ayuu ku qoraa (app-ku ma dhicin).
export async function sendMail(to,subject,html){
  try{
    if(!to)return false;
    if(!process.env.RESEND_API_KEY){console.log(`[MAIL not configured] to=${to} | ${subject}\n${html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,400)}`);return false}
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.MAIL_FROM||'SOM TREVEL <onboarding@resend.dev>',to:[to],subject,html})});
    if(!r.ok)console.error('mail failed',r.status,(await r.text()).slice(0,200));
    return r.ok;
  }catch(e){console.error('mail error',e.message);return false}
}
export const adminAlert=(subject,html)=>sendMail(process.env.ADMIN_NOTIFY_EMAIL||process.env.ADMIN_EMAIL,'[SOM TREVEL] '+subject,tpl(esc(subject),html));
// In-app notification + email to customer (demo users: no email)
export async function tell(userId,title,body){
  try{const u=await User.findById(userId);if(!u)return;await Notification.create({user:u._id,title,body});if(!u.isDemo)await sendMail(u.email,title,tpl(esc(title),`<p>${esc(body)}</p>`))}catch(e){console.error('tell',e.message)}
}
