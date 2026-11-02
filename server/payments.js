import crypto from 'crypto';
import {Booking,Payment} from './models.js';
import {tell,adminAlert,esc} from './mail.js';
export const stripeOn=()=>!!process.env.STRIPE_SECRET_KEY&&!!process.env.STRIPE_WEBHOOK_SECRET;
export async function createCheckout(b,base){
  const p=new URLSearchParams({mode:'payment',success_url:`${base}/invoice/${b.ref}?paid=1`,cancel_url:`${base}/invoice/${b.ref}`,client_reference_id:b.ref,'line_items[0][quantity]':'1','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(Math.round(b.total*100)),'line_items[0][price_data][product_data][name]':`${b.packageTitle} (${b.ref})`.slice(0,200)});
  const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded'},body:p});
  const d=await r.json();if(!r.ok)throw new Error(d.error?.message||'Stripe error');return d;
}
// Lacagta waxaa "paid" laga dhigayaa KALIYA marka Stripe webhook saxiix ah yimaado.
export async function stripeWebhook(req,res){
  try{
    const secret=process.env.STRIPE_WEBHOOK_SECRET;if(!secret)return res.status(503).end();
    const parts=Object.fromEntries(String(req.headers['stripe-signature']||'').split(',').map(x=>x.split('=')));
    const raw=req.body.toString('utf8');
    const exp=Buffer.from(crypto.createHmac('sha256',secret).update(`${parts.t}.${raw}`).digest('hex')),got=Buffer.from(String(parts.v1||''));
    if(exp.length!==got.length||!crypto.timingSafeEqual(exp,got)||Math.abs(Date.now()/1000-Number(parts.t))>600)return res.status(400).end();
    const ev=JSON.parse(raw),s=ev.data?.object;
    if(ev.type==='checkout.session.completed'&&s?.payment_status==='paid'){
      const b=await Booking.findOne({ref:s.client_reference_id});
      if(b&&s.amount_total===Math.round(b.total*100)){
        b.paymentStatus='paid';await b.save();
        await Payment.updateMany({booking:b._id},{status:'paid',method:'Card (Stripe)',reference:String(s.payment_intent||s.id)});
        await tell(b.user,'Payment received',`We received your payment for booking ${b.ref}. Thank you!`);
        await adminAlert('Card payment received',`<p>Booking ${esc(b.ref)} paid: $${b.total}</p>`);
      }
    }
    res.json({received:true});
  }catch(e){console.error('webhook',e.message);res.status(400).end()}
}
