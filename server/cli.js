import 'dotenv/config';
import mongoose from 'mongoose';
import {seedIfEmpty,wipeDemo,seedDemo} from './seed.js';
await mongoose.connect(process.env.MONGODB_URI);
if(process.argv[2]==='reset'){if(process.env.DEMO_ENABLED==='false'){console.log('Demo disabled');process.exit(1)}await wipeDemo('all');await seedDemo();}
else await seedIfEmpty();
console.log('Done');process.exit(0);
