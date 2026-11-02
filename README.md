# SOM TREVEL — Travel Platform (React + Express + MongoDB)

## 1. Orod local (tijaabo)
```
cp .env.example .env        # geli MONGODB_URI iyo JWT_SECRET (16+ xaraf)
npm install
npm run build               # dhisa frontend-ka
npm start                   # http://localhost:5000
npm run smoke               # (server-ka oo socda) hubi dhammaan API-yada
```
Marka ugu horreysa demo data si toos ah ayaa loo abuuraa. Admin = ADMIN_EMAIL/ADMIN_PASSWORD. Demo customer: `demo.ahmed.hassan@example.com` / `Demo12345`.
Commands: `npm run db:seed`, `npm run db:reset-demo`.

## 2. Deploy
1. **GitHub**: `git init && git add . && git commit -m "SOM TREVEL"` → push repo cusub (`.env` GitHub ha gelin).
2. **MongoDB Atlas**: free cluster → Database user → Network Access `0.0.0.0/0` → copy URI → `MONGODB_URI`.
3. **Render**: New → Blueprint (render.yaml). Geli env vars. `APP_URL` = URL-ka dhabta ah (https://...).
4. **Cloudflare**: Add site → DNS CNAME (`@` iyo `www`) → `your-app.onrender.com` (Proxied) → SSL "Full". Render → Custom Domains ku dar domain-ka.
5. **Production dhab**: `DEMO_ENABLED=false`; marka hore Admin → Settings → Reset all demo.

## 3. Features la xiray
- **Email (Resend)**: `RESEND_API_KEY` + `MAIL_FROM` (domain-ka resend.com ku xaqiiji). La'aantiisa emails waxay ku qoranyihiin server log; forgot-password link-gu wuxuu ku jiraa log-ka.
- **Card payment (Stripe)**: `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Stripe Dashboard → Webhooks → endpoint `https://DOMAIN/api/payments/stripe-webhook`, event `checkout.session.completed`. "Paid" waxaa la dhigaa KALIYA marka webhook-ga saxiixan yimaado.
- **EVC Plus / Bank / Cash**: customer wuxuu geliyaa transaction reference; Admin → Payments → "Verify paid" kadib hubinta lacagta.
- **Flights**: customer wuxuu codsadaa quote; Admin → Flights wuxuu geliyaa quote, airline, flight no, PNR → status "Ticketed" → customer wuxuu helaa boarding-pass ticket leh khariidad, QR iyo links FlightAware/Flightradar24/Google. Fares been abuur ah lama tusayo; "Google Flights" link ayaa lagu barbardhigaa qiimaha live.
- **Maps**: Google Maps embed (key looma baahna), khariidad interactive oo flight route ah (OpenStreetMap + Leaflet).
- **Hotels, Reviews, Support tickets, Notifications (bell), Saved destinations, Forgot/Reset password, Profile**.

## 4. Xusuus
- Sawirada Soomaaliya: gradient ayaa muuqda ilaa admin URL geliyo (Admin → Destinations).
- Visa info: link Google ah oo lagu hubiyo; ma aha xog rasmi ah.
