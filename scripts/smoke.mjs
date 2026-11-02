// Usage: node scripts/smoke.mjs http://localhost:5000   (server must be running)
const base=process.argv[2]||'http://localhost:5000';let fail=0,cookie='';
const t=async(name,fn)=>{try{const r=await fn();console.log('PASS',name,r?`(${r})`:'')}catch(e){fail++;console.log('FAIL',name,'-',e.message)}};
const get=async(p,o={})=>{const r=await fetch(base+'/api'+p,{...o,headers:{'Content-Type':'application/json',cookie,...(o.headers||{})}});const sc=r.headers.get('set-cookie');if(sc)cookie=sc.split(';')[0];const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`${r.status} ${d.error||''}`);return d};
await t('health',async()=>{const d=await get('/health');if(!d.db)throw new Error('db not connected')});
await t('config',async()=>{await get('/config')});
await t('destinations',async()=>`${(await get('/destinations')).length} items`);
await t('packages',async()=>`${(await get('/packages')).length} items`);
await t('hotels',async()=>`${(await get('/hotels')).length} items`);
await t('reviews',async()=>`${(await get('/reviews')).length} items`);
await t('unknown api -> 404 json',async()=>{try{await get('/nope')}catch(e){if(!e.message.startsWith('404'))throw e;return}throw new Error('expected 404')});
await t('bad id -> 400',async()=>{try{await get('/packages/xyz')}catch(e){if(!e.message.startsWith('400'))throw e;return}throw new Error('expected 400')});
await t('admin route blocked when logged out',async()=>{try{await get('/admin/stats')}catch(e){if(!e.message.startsWith('401'))throw e;return}throw new Error('expected 401')});
const email=process.env.ADMIN_EMAIL||'admin@somtrevel.com',password=process.env.ADMIN_PASSWORD||'ChangeMe123!';
await t('admin login',async()=>{await get('/auth/login',{method:'POST',body:JSON.stringify({email,password})})});
await t('admin stats',async()=>{const s=await get('/admin/stats');return `${s.totalBookings} bookings, ${s.customers} customers`});
await t('admin bookings',async()=>`${(await get('/admin/bookings')).length} rows`);
await t('admin flights',async()=>`${(await get('/admin/flights')).length} rows`);
console.log(fail?`\n${fail} CHECK(S) FAILED`:'\nALL CHECKS PASSED');process.exit(fail?1:0);
