// node scripts/make-worksheets.mjs > /tmp/worksheets.json — the data for scripts/worksheets.py
import { worksheetSpecs } from '../src/components/academy/curriculum/phonics.js';
console.log(JSON.stringify(worksheetSpecs(), null, 1));
