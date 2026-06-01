// scripts/seed.js
// Run: node scripts/seed.js --key=./service-account.json --sheet=YOUR_SHEET_ID

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Parse CLI args ───────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; })
);

const KEY_FILE  = args.key   || './service-account.json';
const SHEET_ID  = args.sheet || process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Expenses';

if (!SHEET_ID) {
  console.error('❌  Missing sheet ID. Pass it as: node scripts/seed.js --sheet=YOUR_SHEET_ID');
  process.exit(1);
}

// ─── Load & fix service account key ──────────────────────────────────────
let credentials;
try {
  const raw = readFileSync(resolve(KEY_FILE), 'utf8');
  credentials = JSON.parse(raw);

  // Fix mangled private key line breaks (common on Windows copy-paste)
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key
      .replace(/\\n/g, '\n')       // literal \n → real newline
      .replace(/\r\n/g, '\n')      // Windows CRLF → LF
      .replace(/\r/g, '\n');       // stray CR → LF
  }

  console.log('✅  Loaded service account:', credentials.client_email);
} catch (e) {
  console.error('❌  Could not read key file at:', KEY_FILE);
  console.error('    ' + e.message);
  console.error('\n    Make sure service-account.json is in the expense-tracker folder.');
  process.exit(1);
}

// ─── Historical data ──────────────────────────────────────────────────────
const HISTORICAL_DATA = [
  {"date":"2026-02-04","item":"Yati ez link","cat":"Transport","amount":50},
  {"date":"2026-02-04","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-02-04","item":"Lunch","cat":"Food","amount":7},
  {"date":"2026-02-04","item":"Coffee","cat":"Food","amount":3.59},
  {"date":"2026-02-04","item":"Li Chun wendy","cat":"Other","amount":50},
  {"date":"2026-02-04","item":"Li Chun mimi","cat":"Other","amount":50},
  {"date":"2026-02-04","item":"Li Chun mae","cat":"Other","amount":50},
  {"date":"2026-02-05","item":"Petrol","cat":"Transport","amount":82.2},
  {"date":"2026-02-05","item":"Lunch","cat":"Food","amount":4.3},
  {"date":"2026-02-05","item":"Groceries","cat":"Groceries","amount":18.5},
  {"date":"2026-02-06","item":"Lunch","cat":"Food","amount":3.2},
  {"date":"2026-02-07","item":"Timber top up","cat":"Transport","amount":20},
  {"date":"2026-02-07","item":"Lunch","cat":"Food","amount":5},
  {"date":"2026-02-07","item":"Eye wash","cat":"Groceries","amount":10.2},
  {"date":"2026-02-07","item":"Muah chee","cat":"Food","amount":4.5},
  {"date":"2026-02-09","item":"Groceries","cat":"Groceries","amount":39},
  {"date":"2026-02-09","item":"Pokemon tcg","cat":"Entertainment","amount":5},
  {"date":"2026-02-09","item":"Lac","cat":"Entertainment","amount":69.6},
  {"date":"2026-02-09","item":"Lunch","cat":"Food","amount":11.8},
  {"date":"2026-02-09","item":"Donki","cat":"Groceries","amount":9.9},
  {"date":"2026-02-09","item":"Almond drink","cat":"Food","amount":4},
  {"date":"2026-02-09","item":"Shopee","cat":"Shopping","amount":12.37},
  {"date":"2026-02-10","item":"Groceries","cat":"Groceries","amount":6.95},
  {"date":"2026-02-10","item":"Groceries","cat":"Groceries","amount":10.45},
  {"date":"2026-02-10","item":"Lunch","cat":"Food","amount":11.5},
  {"date":"2026-02-11","item":"Home groceries","cat":"Groceries","amount":50},
  {"date":"2026-02-11","item":"Groceries","cat":"Groceries","amount":15.3},
  {"date":"2026-02-12","item":"Lunch","cat":"Food","amount":4.8},
  {"date":"2026-02-12","item":"Mimi enrich","cat":"Other","amount":92.65},
  {"date":"2026-02-12","item":"Mae enrich","cat":"Other","amount":92.65},
  {"date":"2026-02-13","item":"Aircond","cat":"Health","amount":261.6},
  {"date":"2026-02-13","item":"Dinner mimi","cat":"Food","amount":6.5},
  {"date":"2026-02-13","item":"Dinner","cat":"Food","amount":11.4},
  {"date":"2026-02-13","item":"Fu hua","cat":"Food","amount":6.5},
  {"date":"2026-02-14","item":"Bread","cat":"Food","amount":1.3},
  {"date":"2026-02-15","item":"Soon kuay","cat":"Food","amount":14.3},
  {"date":"2026-02-15","item":"Lunch","cat":"Food","amount":60.2},
  {"date":"2026-02-15","item":"Fun claw","cat":"Entertainment","amount":20},
  {"date":"2026-02-20","item":"Petrol","cat":"Transport","amount":80.92},
  {"date":"2026-02-20","item":"Photo","cat":"Utilities","amount":4.8},
  {"date":"2026-02-20","item":"Soap","cat":"Groceries","amount":2.9},
  {"date":"2026-02-20","item":"Bowl","cat":"Utilities","amount":8.9},
  {"date":"2026-02-20","item":"Cash card","cat":"Transport","amount":50},
  {"date":"2026-02-20","item":"Lunch","cat":"Food","amount":4.8},
  {"date":"2026-02-20","item":"Dinner","cat":"Food","amount":9},
  {"date":"2026-02-20","item":"Daiso","cat":"Groceries","amount":1.54},
  {"date":"2026-02-20","item":"Bbt","cat":"Food","amount":5.2},
  {"date":"2026-02-21","item":"Fever patch","cat":"Health","amount":8},
  {"date":"2026-02-21","item":"Coffee","cat":"Food","amount":1.4},
  {"date":"2026-02-21","item":"Lunch","cat":"Food","amount":6.5},
  {"date":"2026-02-21","item":"Dinner","cat":"Food","amount":109.3},
  {"date":"2026-02-22","item":"Prime","cat":"Groceries","amount":15},
  {"date":"2026-02-22","item":"Lunch","cat":"Food","amount":15.1},
  {"date":"2026-02-22","item":"Bread","cat":"Food","amount":6.7},
  {"date":"2026-02-22","item":"Fu hua","cat":"Food","amount":4.2},
  {"date":"2026-02-22","item":"Bb","cat":"Other","amount":5.1},
  {"date":"2026-02-22","item":"Gbtb","cat":"Entertainment","amount":16},
  {"date":"2026-02-22","item":"Dinner","cat":"Food","amount":6},
  {"date":"2026-02-22","item":"Cpcm","cat":"Entertainment","amount":42},
  {"date":"2026-02-23","item":"Lunch","cat":"Food","amount":4.6},
  {"date":"2026-02-23","item":"Coffee","cat":"Food","amount":1.7},
  {"date":"2026-02-23","item":"Season Parking","cat":"Transport","amount":120},
  {"date":"2026-02-23","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-02-23","item":"Tcm","cat":"Health","amount":60},
  {"date":"2026-02-24","item":"Lunch","cat":"Food","amount":15.5},
  {"date":"2026-02-24","item":"Shopee","cat":"Shopping","amount":15.15},
  {"date":"2026-02-25","item":"Lunch","cat":"Food","amount":5.4},
  {"date":"2026-02-25","item":"Battery","cat":"Groceries","amount":5.9},
  {"date":"2026-02-26","item":"Decath","cat":"Shopping","amount":56.1},
  {"date":"2026-02-26","item":"Pokemon tcg","cat":"Entertainment","amount":17},
  {"date":"2026-02-26","item":"Shopee","cat":"Shopping","amount":41.31},
  {"date":"2026-02-27","item":"Pokemon 2026","cat":"Entertainment","amount":58},
  {"date":"2026-02-27","item":"Lunch","cat":"Food","amount":4.7},
  {"date":"2026-02-27","item":"Ah","cat":"Other","amount":170},
  {"date":"2026-02-27","item":"Dinner","cat":"Food","amount":12.3},
  {"date":"2026-02-27","item":"Prime","cat":"Groceries","amount":18.2},
  {"date":"2026-02-27","item":"Toto","cat":"Other","amount":20},
  {"date":"2026-02-28","item":"Drinks","cat":"Food","amount":5},
  {"date":"2026-03-01","item":"Breakfast","cat":"Food","amount":21.6},
  {"date":"2026-03-01","item":"Donki","cat":"Groceries","amount":16.1},
  {"date":"2026-03-01","item":"Shopee","cat":"Shopping","amount":18.82},
  {"date":"2026-03-01","item":"Ntuc","cat":"Groceries","amount":89.8},
  {"date":"2026-03-02","item":"Coffee","cat":"Food","amount":10.1},
  {"date":"2026-03-02","item":"Aircond","cat":"Health","amount":150},
  {"date":"2026-03-02","item":"Nets","cat":"Utilities","amount":100},
  {"date":"2026-03-03","item":"Ya kun","cat":"Food","amount":2.4},
  {"date":"2026-03-03","item":"T luck","cat":"Groceries","amount":7.5},
  {"date":"2026-03-03","item":"Lunch","cat":"Food","amount":22},
  {"date":"2026-03-04","item":"Pokemon tcg","cat":"Entertainment","amount":121},
  {"date":"2026-03-04","item":"Lunch and coffee","cat":"Food","amount":8},
  {"date":"2026-03-04","item":"Tcg","cat":"Entertainment","amount":18},
  {"date":"2026-03-04","item":"Shopee","cat":"Shopping","amount":22.27},
  {"date":"2026-03-05","item":"Car servicing","cat":"Transport","amount":0},
  {"date":"2026-03-05","item":"Soya","cat":"Food","amount":3.1},
  {"date":"2026-03-05","item":"Lunch","cat":"Food","amount":4},
  {"date":"2026-03-05","item":"FairPrice","cat":"Groceries","amount":60.85},
  {"date":"2026-03-06","item":"Chee kuay","cat":"Food","amount":1.4},
  {"date":"2026-03-06","item":"Lunch","cat":"Food","amount":8.4},
  {"date":"2026-03-06","item":"Ba zhang","cat":"Food","amount":11.2},
  {"date":"2026-03-07","item":"Lunch","cat":"Food","amount":12.4},
  {"date":"2026-03-07","item":"Groceries","cat":"Groceries","amount":15.65},
  {"date":"2026-03-07","item":"Past groceries","cat":"Groceries","amount":116},
  {"date":"2026-03-07","item":"Hair","cat":"Health","amount":14},
  {"date":"2026-03-07","item":"Kueh","cat":"Food","amount":3},
  {"date":"2026-03-08","item":"Lunch","cat":"Food","amount":47.1},
  {"date":"2026-03-08","item":"Shopee","cat":"Shopping","amount":9.61},
  {"date":"2026-03-08","item":"Sugar cane","cat":"Food","amount":5.6},
  {"date":"2026-03-08","item":"Kooza photo","cat":"Entertainment","amount":10},
  {"date":"2026-03-09","item":"Coffee","cat":"Food","amount":2.4},
  {"date":"2026-03-09","item":"Prime","cat":"Groceries","amount":15.25},
  {"date":"2026-03-09","item":"Lunch","cat":"Food","amount":6.7},
  {"date":"2026-03-09","item":"Shopee","cat":"Shopping","amount":10.91},
  {"date":"2026-03-09","item":"Petrol","cat":"Transport","amount":79.08},
  {"date":"2026-03-09","item":"Tcg","cat":"Entertainment","amount":15},
  {"date":"2026-03-10","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-03-10","item":"Lunch","cat":"Food","amount":5.2},
  {"date":"2026-03-10","item":"Shopee","cat":"Shopping","amount":7.25},
  {"date":"2026-03-10","item":"Decathlon","cat":"Shopping","amount":93.5},
  {"date":"2026-03-11","item":"Breakfast","cat":"Food","amount":4.5},
  {"date":"2026-03-11","item":"NTUC","cat":"Groceries","amount":22.25},
  {"date":"2026-03-12","item":"Open AI","cat":"Health","amount":15},
  {"date":"2026-03-12","item":"Lunch","cat":"Food","amount":3.5},
  {"date":"2026-03-13","item":"Lunch","cat":"Food","amount":4.5},
  {"date":"2026-03-13","item":"Dinner","cat":"Food","amount":6.8},
  {"date":"2026-03-13","item":"Dinner","cat":"Food","amount":4.5},
  {"date":"2026-03-14","item":"Prime","cat":"Groceries","amount":20.3},
  {"date":"2026-03-14","item":"Lunch","cat":"Food","amount":12},
  {"date":"2026-03-14","item":"Dinner","cat":"Food","amount":5.5},
  {"date":"2026-03-14","item":"Bread","cat":"Food","amount":4.5},
  {"date":"2026-03-14","item":"Fruits","cat":"Food","amount":8.6},
  {"date":"2026-03-15","item":"Timber","cat":"Transport","amount":20},
  {"date":"2026-03-15","item":"Ntuc","cat":"Groceries","amount":47.19},
  {"date":"2026-03-15","item":"Koi","cat":"Food","amount":5.3},
  {"date":"2026-03-15","item":"Lunch","cat":"Food","amount":88},
  {"date":"2026-03-16","item":"Lunch","cat":"Food","amount":9.9},
  {"date":"2026-03-16","item":"Prime","cat":"Groceries","amount":27.35},
  {"date":"2026-03-16","item":"Groceries","cat":"Groceries","amount":100},
  {"date":"2026-03-17","item":"Lunch","cat":"Food","amount":5.8},
  {"date":"2026-03-17","item":"Nets","cat":"Utilities","amount":100},
  {"date":"2026-03-17","item":"Pokemon tcg 151","cat":"Entertainment","amount":303},
  {"date":"2026-03-17","item":"Eeveelution","cat":"Entertainment","amount":21.7},
  {"date":"2026-03-18","item":"Lunch","cat":"Food","amount":17.4},
  {"date":"2026-03-18","item":"Petrol","cat":"Transport","amount":97},
  {"date":"2026-03-18","item":"Pokemon tcg","cat":"Entertainment","amount":90},
  {"date":"2026-03-19","item":"Prime","cat":"Groceries","amount":21.53},
  {"date":"2026-03-19","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-03-19","item":"Breakfast","cat":"Food","amount":9.6},
  {"date":"2026-03-19","item":"Lunch","cat":"Food","amount":6.7},
  {"date":"2026-03-19","item":"Waffle","cat":"Food","amount":1.8},
  {"date":"2026-03-20","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-03-20","item":"Car wash","cat":"Transport","amount":12},
  {"date":"2026-03-20","item":"Mouth wash","cat":"Groceries","amount":18.3},
  {"date":"2026-03-20","item":"Lunch","cat":"Food","amount":24.5},
  {"date":"2026-03-20","item":"Card","cat":"Utilities","amount":25.5},
  {"date":"2026-03-20","item":"Dinner","cat":"Food","amount":7},
  {"date":"2026-03-21","item":"Lunch","cat":"Food","amount":109},
  {"date":"2026-03-21","item":"Dinner","cat":"Food","amount":7.5},
  {"date":"2026-03-21","item":"Daiso","cat":"Groceries","amount":4.36},
  {"date":"2026-03-22","item":"Biscuit","cat":"Food","amount":6},
  {"date":"2026-03-22","item":"Yati","cat":"Other","amount":50},
  {"date":"2026-03-22","item":"Breakfast","cat":"Food","amount":11.6},
  {"date":"2026-03-22","item":"Dinner","cat":"Food","amount":49.76},
  {"date":"2026-03-22","item":"Bread","cat":"Food","amount":3.9},
  {"date":"2026-03-23","item":"Coffee","cat":"Food","amount":2.4},
  {"date":"2026-03-24","item":"Petrol","cat":"Transport","amount":60},
  {"date":"2026-03-24","item":"Esim","cat":"Transport","amount":7.53},
  {"date":"2026-03-24","item":"Groceries","cat":"Groceries","amount":100},
  {"date":"2026-03-24","item":"Prime","cat":"Groceries","amount":13.1},
  {"date":"2026-03-27","item":"Taiwan uber","cat":"Transport","amount":1},
  {"date":"2026-03-31","item":"Dfs","cat":"Shopping","amount":91.1},
  {"date":"2026-04-01","item":"Lunch","cat":"Food","amount":3.6},
  {"date":"2026-04-01","item":"Dinner","cat":"Food","amount":47.5},
  {"date":"2026-04-02","item":"Lunch","cat":"Food","amount":4.8},
  {"date":"2026-04-02","item":"Dinner","cat":"Food","amount":3.55},
  {"date":"2026-04-02","item":"Prime","cat":"Groceries","amount":1.95},
  {"date":"2026-04-02","item":"Prime","cat":"Groceries","amount":11.3},
  {"date":"2026-04-02","item":"Pokemon tcg","cat":"Entertainment","amount":30},
  {"date":"2026-04-03","item":"Shopee","cat":"Shopping","amount":81.98},
  {"date":"2026-04-04","item":"Breakfast","cat":"Food","amount":10.2},
  {"date":"2026-04-04","item":"Lunch","cat":"Food","amount":10},
  {"date":"2026-04-04","item":"Drink","cat":"Food","amount":6.5},
  {"date":"2026-04-04","item":"Tcg","cat":"Entertainment","amount":116.1},
  {"date":"2026-04-04","item":"Fairprice","cat":"Groceries","amount":5},
  {"date":"2026-04-05","item":"Lunch","cat":"Food","amount":46.8},
  {"date":"2026-04-05","item":"Gallop","cat":"Entertainment","amount":10},
  {"date":"2026-04-06","item":"Coffee and tea","cat":"Food","amount":4.6},
  {"date":"2026-04-06","item":"Lunch","cat":"Food","amount":4.5},
  {"date":"2026-04-07","item":"Groceries","cat":"Groceries","amount":100},
  {"date":"2026-04-07","item":"Prime","cat":"Groceries","amount":11.2},
  {"date":"2026-04-07","item":"Lunch","cat":"Food","amount":6},
  {"date":"2026-04-08","item":"Tea","cat":"Food","amount":4.4},
  {"date":"2026-04-08","item":"Prime","cat":"Groceries","amount":16.35},
  {"date":"2026-04-09","item":"Lac","cat":"Entertainment","amount":147.67},
  {"date":"2026-04-09","item":"Dinner","cat":"Food","amount":26},
  {"date":"2026-04-09","item":"Lunch","cat":"Food","amount":4},
  {"date":"2026-04-10","item":"Lunch","cat":"Food","amount":8.3},
  {"date":"2026-04-10","item":"Petrol","cat":"Transport","amount":90},
  {"date":"2026-04-10","item":"Shoe","cat":"Shopping","amount":162.5},
  {"date":"2026-04-10","item":"Dinner","cat":"Food","amount":6.9},
  {"date":"2026-04-11","item":"Timbre","cat":"Transport","amount":20},
  {"date":"2026-04-11","item":"Night safari","cat":"Entertainment","amount":112},
  {"date":"2026-04-11","item":"Ss","cat":"Other","amount":3.15},
  {"date":"2026-04-11","item":"Prime","cat":"Groceries","amount":17.6},
  {"date":"2026-04-11","item":"Lunch","cat":"Food","amount":12.6},
  {"date":"2026-04-12","item":"Night safari pic","cat":"Entertainment","amount":35},
  {"date":"2026-04-12","item":"Lunch","cat":"Food","amount":26},
  {"date":"2026-04-12","item":"Ikea","cat":"Shopping","amount":111.7},
  {"date":"2026-04-13","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-04-13","item":"Prime","cat":"Groceries","amount":7.35},
  {"date":"2026-04-14","item":"Lunch","cat":"Food","amount":5},
  {"date":"2026-04-15","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-04-15","item":"Detergent","cat":"Groceries","amount":64.85},
  {"date":"2026-04-15","item":"Shopee","cat":"Shopping","amount":5.34},
  {"date":"2026-04-15","item":"Lunch","cat":"Food","amount":3.5},
  {"date":"2026-04-15","item":"Prime","cat":"Groceries","amount":13.05},
  {"date":"2026-04-16","item":"Lunch","cat":"Food","amount":8.5},
  {"date":"2026-04-16","item":"Coffee","cat":"Food","amount":4.5},
  {"date":"2026-04-16","item":"T luck","cat":"Groceries","amount":14.5},
  {"date":"2026-04-16","item":"Prime","cat":"Groceries","amount":14.9},
  {"date":"2026-04-16","item":"Aair","cat":"Health","amount":35},
  {"date":"2026-04-17","item":"Lunch","cat":"Food","amount":3.9},
  {"date":"2026-04-17","item":"Shopee","cat":"Shopping","amount":18.9},
  {"date":"2026-04-19","item":"Lunch","cat":"Food","amount":16},
  {"date":"2026-04-19","item":"Pancake","cat":"Food","amount":2.4},
  {"date":"2026-04-19","item":"Boost","cat":"Food","amount":6},
  {"date":"2026-04-19","item":"Curiosity cove","cat":"Entertainment","amount":91},
  {"date":"2026-04-20","item":"Yakun","cat":"Food","amount":5.7},
  {"date":"2026-04-20","item":"Lunch","cat":"Food","amount":11.9},
  {"date":"2026-04-21","item":"Lunch","cat":"Food","amount":3.9},
  {"date":"2026-04-22","item":"Ez link","cat":"Transport","amount":50},
  {"date":"2026-04-22","item":"Dinner","cat":"Food","amount":63.43},
  {"date":"2026-04-22","item":"Lunch","cat":"Food","amount":10},
  {"date":"2026-04-22","item":"Coffee","cat":"Food","amount":3},
  {"date":"2026-04-22","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-04-23","item":"Dinner","cat":"Food","amount":63.43},
  {"date":"2026-04-23","item":"Lunch","cat":"Food","amount":13},
  {"date":"2026-04-24","item":"Prime","cat":"Groceries","amount":10.5},
  {"date":"2026-04-25","item":"Drink","cat":"Food","amount":2.6},
  {"date":"2026-04-25","item":"Spc","cat":"Transport","amount":83.36},
  {"date":"2026-04-25","item":"Wedding","cat":"Other","amount":300},
  {"date":"2026-04-25","item":"Breakfast","cat":"Food","amount":11},
  {"date":"2026-04-26","item":"Bbt","cat":"Food","amount":5.2},
  {"date":"2026-04-26","item":"Dinner","cat":"Food","amount":21},
  {"date":"2026-04-26","item":"Lac","cat":"Entertainment","amount":100},
  {"date":"2026-04-26","item":"Ice cream","cat":"Food","amount":13.7},
  {"date":"2026-04-26","item":"Breakfast","cat":"Food","amount":11.6},
  {"date":"2026-04-27","item":"Coffee","cat":"Food","amount":10.9},
  {"date":"2026-04-27","item":"Lunch","cat":"Food","amount":12},
  {"date":"2026-04-27","item":"Dinner","cat":"Food","amount":4.3},
  {"date":"2026-04-28","item":"Lunch","cat":"Food","amount":6.2},
  {"date":"2026-04-28","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-04-29","item":"Shopee","cat":"Shopping","amount":4.2},
  {"date":"2026-04-29","item":"Lunch","cat":"Food","amount":8},
  {"date":"2026-04-30","item":"Prime","cat":"Groceries","amount":35.5},
  {"date":"2026-04-30","item":"Lunch","cat":"Food","amount":4},
  {"date":"2026-05-01","item":"Lunch","cat":"Food","amount":56},
  {"date":"2026-05-01","item":"Dessert","cat":"Food","amount":21.3},
  {"date":"2026-05-01","item":"Breakfast","cat":"Food","amount":5.3},
  {"date":"2026-05-01","item":"Van Gogh","cat":"Entertainment","amount":105.8},
  {"date":"2026-05-01","item":"Dinner","cat":"Food","amount":82},
  {"date":"2026-05-02","item":"Chagee","cat":"Food","amount":11.2},
  {"date":"2026-05-02","item":"Lazada","cat":"Shopping","amount":34.45},
  {"date":"2026-05-02","item":"Prime","cat":"Groceries","amount":9.95},
  {"date":"2026-05-02","item":"Mcd","cat":"Food","amount":5.5},
  {"date":"2026-05-02","item":"Parking","cat":"Transport","amount":5.2},
  {"date":"2026-05-02","item":"NTUC","cat":"Groceries","amount":25.25},
  {"date":"2026-05-02","item":"Shopee","cat":"Shopping","amount":78.54},
  {"date":"2026-05-03","item":"Ichiban","cat":"Food","amount":95.56},
  {"date":"2026-05-04","item":"Lunch","cat":"Food","amount":5},
  {"date":"2026-05-04","item":"Petrol","cat":"Transport","amount":90.16},
  {"date":"2026-05-04","item":"Prime","cat":"Groceries","amount":19.7},
  {"date":"2026-05-05","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-05-05","item":"Tluck","cat":"Groceries","amount":9.9},
  {"date":"2026-05-05","item":"Prime","cat":"Groceries","amount":44.2},
  {"date":"2026-05-05","item":"Crossiant","cat":"Food","amount":11.8},
  {"date":"2026-05-05","item":"Hans","cat":"Food","amount":4.8},
  {"date":"2026-05-05","item":"Lunch","cat":"Food","amount":6.8},
  {"date":"2026-05-07","item":"Lazada","cat":"Shopping","amount":21.2},
  {"date":"2026-05-10","item":"Prime","cat":"Groceries","amount":12.4},
  {"date":"2026-05-10","item":"Prime","cat":"Groceries","amount":13.9},
  {"date":"2026-05-10","item":"Prime","cat":"Groceries","amount":5.35},
  {"date":"2026-05-10","item":"T luck","cat":"Groceries","amount":5.9},
  {"date":"2026-05-11","item":"Lunch","cat":"Food","amount":8.9},
  {"date":"2026-05-11","item":"Coffee","cat":"Food","amount":1.6},
  {"date":"2026-05-11","item":"Shopee","cat":"Shopping","amount":4.19},
  {"date":"2026-05-11","item":"Prime","cat":"Groceries","amount":10.3},
  {"date":"2026-05-12","item":"Groceries","cat":"Groceries","amount":50},
  {"date":"2026-05-12","item":"Lunch","cat":"Food","amount":5},
  {"date":"2026-05-12","item":"T luck","cat":"Groceries","amount":4.9},
  {"date":"2026-05-13","item":"Prime","cat":"Groceries","amount":6.35},
  {"date":"2026-05-13","item":"Lunch","cat":"Food","amount":3.9},
  {"date":"2026-05-14","item":"Coffee","cat":"Food","amount":5.1},
  {"date":"2026-05-15","item":"Lunch","cat":"Food","amount":5.3},
  {"date":"2026-05-15","item":"SF excursion","cat":"Entertainment","amount":38.15},
  {"date":"2026-05-15","item":"SF excursion","cat":"Entertainment","amount":38.15},
  {"date":"2026-05-15","item":"Dinner","cat":"Food","amount":5},
  {"date":"2026-05-15","item":"Dinner","cat":"Food","amount":8.3},
  {"date":"2026-05-16","item":"Lunch","cat":"Food","amount":9},
  {"date":"2026-05-16","item":"Dinner","cat":"Food","amount":23.5},
  {"date":"2026-05-17","item":"Giant","cat":"Groceries","amount":15.49},
  {"date":"2026-05-17","item":"Decath","cat":"Shopping","amount":39.9},
  {"date":"2026-05-17","item":"Sheng siong","cat":"Groceries","amount":16.17},
  {"date":"2026-05-17","item":"Fu hai tang","cat":"Food","amount":5.3},
  {"date":"2026-05-17","item":"Lunch","cat":"Food","amount":7.9},
  {"date":"2026-05-17","item":"Breakfast","cat":"Food","amount":3.5},
  {"date":"2026-05-17","item":"Prime","cat":"Groceries","amount":3.5},
  {"date":"2026-05-17","item":"Petrol","cat":"Transport","amount":91.2},
  {"date":"2026-05-19","item":"Prime","cat":"Groceries","amount":8.33},
  {"date":"2026-05-19","item":"Lunch","cat":"Food","amount":4},
  {"date":"2026-05-20","item":"Dinner","cat":"Food","amount":5},
  {"date":"2026-05-20","item":"Bread","cat":"Food","amount":4.8},
  {"date":"2026-05-20","item":"Coffee","cat":"Food","amount":1.6},
  {"date":"2026-05-22","item":"Popular","cat":"Shopping","amount":28},
  {"date":"2026-05-23","item":"Cash card","cat":"Transport","amount":50},
  {"date":"2026-05-23","item":"Timber","cat":"Transport","amount":50},
  {"date":"2026-05-23","item":"Dinner","cat":"Food","amount":20},
  {"date":"2026-05-23","item":"Ez link","cat":"Transport","amount":50},
  {"date":"2026-05-23","item":"Taxi","cat":"Transport","amount":30},
  {"date":"2026-05-24","item":"Lunch","cat":"Food","amount":8.9},
  {"date":"2026-05-24","item":"Breakfast","cat":"Food","amount":8.9},
  {"date":"2026-05-24","item":"River wonders","cat":"Entertainment","amount":140},
  {"date":"2026-05-25","item":"Prime","cat":"Groceries","amount":38.2},
  {"date":"2026-05-26","item":"Petrol","cat":"Transport","amount":94.5}
];

// ─── Seed ─────────────────────────────────────────────────────────────────
async function seed() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📋  Connecting to sheet:', SHEET_ID);

  // Write header row
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:E1`,
    valueInputOption: 'RAW',
    requestBody: { values: [['id', 'date', 'item', 'cat', 'amount']] },
  });

  // Write all data rows in one batch
  const rows = HISTORICAL_DATA.map((r, i) => [
    `exp_seed_${String(i).padStart(4, '0')}`,
    r.date, r.item, r.cat, r.amount
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:E`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });

  console.log(`✅  Seeded ${rows.length} rows into "${SHEET_NAME}" tab`);
  console.log('    Open your Google Sheet to verify the data.');
}

seed().catch(e => {
  console.error('\n❌  Seed failed:', e.message);
  if (e.message.includes('invalid_grant') || e.message.includes('JWT')) {
    console.error('\n🔧  Fix: The private key in your service-account.json may be malformed.');
    console.error('    Try re-downloading the key from Google Cloud Console:');
    console.error('    IAM → Service Accounts → Keys → Add Key → JSON');
  }
  if (e.message.includes('not found') || e.message.includes('404')) {
    console.error('\n🔧  Fix: Sheet not found. Check your SHEET_ID and that the tab is named "Expenses".');
  }
  if (e.message.includes('403') || e.message.includes('permission')) {
    console.error('\n🔧  Fix: Share your Google Sheet with:', credentials?.client_email);
  }
  process.exit(1);
});
