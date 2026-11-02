import bcrypt from 'bcryptjs';
import {User,Destination,Pkg,Hotel,Booking,Payment,FlightRequest,Review,Ticket,Notification} from './models.js';
const U=id=>`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=70`;
const D=[
['Mogadishu','Somalia','local','City Tours',450,'4 days'],['Hargeisa','Somalia','local','Culture',520,'5 days'],['Berbera','Somalia','local','Beaches',480,'4 days'],['Laas Geel','Somalia','local','Historical Sites',390,'3 days'],['Bosaso','Somalia','local','Beaches',430,'4 days'],['Kismayo','Somalia','local','Beaches',410,'4 days'],['Garowe','Somalia','local','Culture',380,'3 days'],['Zeila','Somalia','local','Historical Sites',420,'3 days'],
['Dubai','UAE','international','City Tours',1200,'5 days','1512453979798-5ea266f8880c'],['Istanbul','Turkey','international','Culture',1100,'6 days','1524231757912-21f4fe3a7200'],['Nairobi','Kenya','international','Nature',900,'5 days','1611348524140-53c9a25263d6'],['Cairo','Egypt','international','Historical Sites',950,'6 days','1572252009286-268acec5ca0a'],['London','UK','international','City Tours',1800,'6 days','1513635269975-59663e0ac1ad'],['Paris','France','international','Culture',1900,'6 days','1502602898657-3e91760cbb34'],['Kuala Lumpur','Malaysia','international','City Tours',1300,'6 days','1596422846543-75c6fc197f07'],['Maldives','Maldives','international','Beaches',2600,'7 days','1514282401047-d79a71a590e8'],['Jeddah','Saudi Arabia','international','Culture',1000,'5 days'],['Zanzibar','Tanzania','international','Beaches',1400,'6 days'],['Bali','Indonesia','international','Beaches',1700,'7 days'],['Addis Ababa','Ethiopia','international','Culture',800,'4 days']];
const H=[['Gulf Pearl Hotel','Dubai','UAE',5,320,'1566073771259-6a8506099945'],['Bosphorus Grand','Istanbul','Turkey',5,210,'1542314831-068cd1dbfeeb'],['Savanna Lodge','Nairobi','Kenya',4,140,'1551882547-ff40c63fe5fa'],['Nile View Palace','Cairo','Egypt',4,110,'1520250497591-112f2f40a3f4'],['Thames Court','London','UK',4,260],['Seine Lumiere','Paris','France',5,290],['Petronas Sky Suites','Kuala Lumpur','Malaysia',4,120],['Lagoon Water Villas','Male','Maldives',5,650],['Banadir Seaside Hotel','Mogadishu','Somalia',4,95],['Hargeisa Heights','Hargeisa','Somalia',3,85]];
const NAMES=['Ahmed Hassan','Mohamed Ali','Sahra Abdullahi','Fatima Omar','Abdirahman Yusuf','Amina Mohamed','Hassan Ibrahim','Hodan Ahmed','Khadija Nur','Ismail Farah','Ayaan Warsame','Abdullahi Jama','Hawa Salad','Yusuf Mohamud','Maryan Aden','Omar Dahir','Istarlin Osman','Liban Abdi','Nasra Hirsi','Bilal Guled','Fadumo Elmi','Mustafa Duale','Zeinab Sharif','Ridwan Ali','Sagal Hussein'];
const STATUS=['Confirmed','Pending','Completed','Under Review','Cancelled'];
const METHOD=['EVC Plus','Cash','Bank Transfer','Card'];
const COMMENTS=['Smooth booking and a very professional team.','Beautiful trip, everything was well organised.','Great value and friendly support.','Our hotel was excellent. Will book again.','Fast confirmation and clear invoice.'];
const iso=t=>new Date(t).toISOString().slice(0,10);
export async function wipeDemo(what='all'){
  const f={isDemo:true},all=what==='all';
  if(all||what==='bookings'){const ids=(await Booking.find(f).select('_id')).map(b=>b._id);if(ids.length)await Payment.deleteMany({booking:{$in:ids}});await Booking.deleteMany(f)}
  if(all||what==='payments')await Payment.deleteMany(f);
  if(all||what==='flights')await FlightRequest.deleteMany(f);
  if(all||what==='reviews')await Review.deleteMany(f);
  if(all||what==='hotels')await Hotel.deleteMany(f);
  if(all||what==='packages')await Pkg.deleteMany(f);
  if(all||what==='destinations')await Destination.deleteMany(f);
  if(all||what==='customers'){const ids=(await User.find({...f,role:'customer'}).select('_id')).map(u=>u._id);await Notification.deleteMany({user:{$in:ids}});await Ticket.deleteMany(f);await User.deleteMany({...f,role:'customer'})}
}
export async function seedDemo(){
  const hash=await bcrypt.hash('Demo12345',10),now=Date.now(),day=864e5;
  const users=await User.insertMany(NAMES.map((n,i)=>({name:n,email:`demo.${n.toLowerCase().replace(/ /g,'.')}@example.com`,phone:`+2526100${1000+i*37}`,passwordHash:hash,isDemo:true,createdAt:new Date(now-(300-i*10)*day)})));
  const dests=await Destination.insertMany(D.map(([name,country,type,category,price,duration,img])=>({name,country,type,category,price,duration,image:img?U(img):'',description:`[DEMO] Discover ${name}, ${country} — a ${category.toLowerCase()} experience curated by SOM TREVEL.`,attractions:['Guided highlights','Local cuisine','Photo stops'],isDemo:true})));
  const pk=await Pkg.insertMany(dests.slice(0,15).map((d,i)=>{const days=parseInt(d.duration);return{title:`${d.name} ${d.category} Escape`,destination:d._id,description:`[DEMO] ${d.duration} curated trip to ${d.name}.`,image:d.image,price:d.price,duration:d.duration,itinerary:Array.from({length:days},(_,k)=>`Day ${k+1}: ${k===0?'Arrival & welcome':k===days-1?'Free time & departure':'Guided excursion'}`),included:['Accommodation','Airport transfers','Guided tours','Breakfast'],excluded:['Flights (unless stated)','Visa fees','Personal expenses'],hotel:'4-star partner hotel (demo)',transport:'Private transfers',seats:12+i,departure:new Date(now+(20+i*9)*day),isDemo:true}}));
  await Hotel.insertMany(H.map(([name,city,country,stars,p,img])=>({name,city,country,stars,pricePerNight:p,image:img?U(img):'',description:`[DEMO] ${stars}-star hotel in ${city}, ${country}.`,facilities:['Free WiFi','Breakfast','Pool','Airport shuttle','24h reception'],rooms:[{name:'Standard Room',price:p},{name:'Deluxe Room',price:Math.round(p*1.4)},{name:'Suite',price:Math.round(p*2.2)}],isDemo:true})));
  for(let i=0;i<40;i++){
    const u=users[i%25],p=pk[(i*7)%15],st=STATUS[i%5],n=1+(i%4),created=new Date(now-(i*6+1)*day);
    const pay=st==='Confirmed'||st==='Completed'?'paid':st==='Cancelled'&&i%2?'refunded':'unpaid';
    const b=await Booking.create({ref:`TRV-D${1001+i}`,user:u._id,package:p._id,destinationName:dests.find(d=>d._id.equals(p.destination)).name,packageTitle:p.title,travelDate:new Date(created.getTime()+30*day),travelers:n,travelerNames:[u.name],total:p.price*n,status:st,paymentStatus:pay,notes:'[DEMO]',isDemo:true,createdAt:created});
    await Payment.create({booking:b._id,amount:b.total,method:METHOD[i%4],reference:`PAY-D${1001+i}`,status:pay==='paid'?'paid':pay==='refunded'?'refunded':'pending',isDemo:true,createdAt:created});
  }
  const R=[['MGQ','DXB'],['MGQ','IST'],['HGA','NBO'],['MGQ','JED'],['MGQ','LHR'],['BBO','DXB'],['MGQ','CAI'],['NBO','CDG'],['MGQ','KUL'],['HGA','ADD']],FS=['New','Quoted','Ticketed','Cancelled'];
  for(let i=0;i<10;i++){const st=FS[i%4],tk=st==='Ticketed';await FlightRequest.create({ref:`FLT-D${101+i}`,user:users[i]._id,tripType:i%3===0?'Round-trip':'One-way',legs:[{from:R[i][0],to:R[i][1],date:iso(now+(15+i*5)*day)}],returnDate:i%3===0?iso(now+(22+i*5)*day):undefined,pax:1+i%3,cabin:['Economy','Business'][i%2],status:st,quote:i%4?300+i*55:undefined,airline:tk?'Demo Air':undefined,flightNo:tk?`DM${100+i}`:undefined,pnr:tk?`DEMO${i}X`:undefined,departTime:tk?'08:30':undefined,arriveTime:tk?'12:45':undefined,notes:'[DEMO] fictional request',isDemo:true})}
  await Review.insertMany(Array.from({length:15},(_,i)=>({user:users[i]._id,authorName:users[i].name,destinationName:dests[(i*3)%20].name,rating:i%4===0?4:5,comment:'[DEMO] '+COMMENTS[i%5],approved:true,isDemo:true})));
}
export async function seedIfEmpty(){
  const email=(process.env.ADMIN_EMAIL||'admin@somtrevel.com').toLowerCase();
  if(!(await User.findOne({role:'admin'}))){
    await User.create({name:'SOM TREVEL Admin',email,passwordHash:await bcrypt.hash(process.env.ADMIN_PASSWORD||'ChangeMe123!',12),role:'admin'});
    console.log('Admin created:',email,process.env.ADMIN_PASSWORD?'':'(default password — CHANGE IT)');
  }
  if(process.env.DEMO_ENABLED!=='false'&&!(await Destination.countDocuments())){await seedDemo();console.log('Demo data seeded')}
}
