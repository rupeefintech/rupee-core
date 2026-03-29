import { getDb } from './database';

const db = getDb();
console.log('\n🌱 Seeding sample data...\n');

const states = [
  ['Telangana','TS'],['Andhra Pradesh','AP'],['Karnataka','KA'],
  ['Tamil Nadu','TN'],['Maharashtra','MH'],['Delhi','DL'],
  ['Gujarat','GJ'],['West Bengal','WB'],['Rajasthan','RJ'],['Uttar Pradesh','UP'],
];
const insState = db.prepare('INSERT OR IGNORE INTO states (name, code) VALUES (?, ?)');
for (const [name, code] of states) insState.run(name, code);
console.log(`✅ ${states.length} states`);

const banks = [
  ['State Bank of India',  'SBI',    'public',  'Mumbai',    'https://sbi.co.in'],
  ['HDFC Bank',            'HDFC',   'private', 'Mumbai',    'https://hdfcbank.com'],
  ['ICICI Bank',           'ICICI',  'private', 'Mumbai',    'https://icicibank.com'],
  ['Axis Bank',            'AXIS',   'private', 'Mumbai',    'https://axisbank.com'],
  ['Punjab National Bank', 'PNB',    'public',  'New Delhi', 'https://pnbindia.in'],
  ['Canara Bank',          'CANARA', 'public',  'Bengaluru', 'https://canarabank.com'],
  ['Kotak Mahindra Bank',  'KOTAK',  'private', 'Mumbai',    'https://kotak.com'],
  ['Bank of Baroda',       'BOB',    'public',  'Vadodara',  'https://bankofbaroda.in'],
];
const insBank = db.prepare(
  'INSERT OR IGNORE INTO banks (name, short_name, bank_type, headquarters, website) VALUES (?, ?, ?, ?, ?)'
);
for (const b of banks) insBank.run(...b);
console.log(`✅ ${banks.length} banks`);

const getState    = db.prepare('SELECT id FROM states WHERE name = ?');
const insDistrict = db.prepare('INSERT OR IGNORE INTO districts (name, state_id) VALUES (?, ?)');
const districts: [string, string][] = [
  ['Hyderabad','Telangana'],['Rangareddy','Telangana'],['Medchal','Telangana'],
  ['Sangareddy','Telangana'],['Nalgonda','Telangana'],['Warangal','Telangana'],
  ['Karimnagar','Telangana'],['Nizamabad','Telangana'],['Khammam','Telangana'],
  ['Mumbai','Maharashtra'],['Pune','Maharashtra'],
  ['Bengaluru Urban','Karnataka'],['Chennai','Tamil Nadu'],
  ['Central Delhi','Delhi'],['South Delhi','Delhi'],
];
for (const [dname, sname] of districts) {
  const s = getState.get(sname) as any;
  if (s) insDistrict.run(dname, s.id);
}
console.log(`✅ ${districts.length} districts`);

const getBank     = db.prepare('SELECT id FROM banks WHERE name = ?');
const getDistrict = db.prepare('SELECT id FROM districts WHERE name = ? AND state_id = ?');
const insBranch   = db.prepare(`
  INSERT OR REPLACE INTO branches
    (ifsc,micr,bank_id,branch_name,address,city,district_id,state_id,pincode,phone,neft,rtgs,imps,upi,latitude,longitude)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

const branches: any[][] = [
  // State Bank of India — Telangana
  ['SBIN0000001','500002001','State Bank of India','Hyderabad Main',          'Bank Street, Koti, Hyderabad',                       'Hyderabad',    'Telangana',   'Hyderabad',    '500095','040-23456789',1,1,1,1,17.3850,78.4867],
  ['SBIN0001234','500002002','State Bank of India','Secunderabad',            '1-8-303, MG Road, Secunderabad',                     'Secunderabad', 'Telangana',   'Hyderabad',    '500003','040-27801234',1,1,1,1,17.4399,78.4983],
  ['SBIN0009001','500002005','State Bank of India','Warangal Main',           'Hanamkonda, Warangal',                               'Warangal',     'Telangana',   'Warangal',     '506001','0870-2577901',1,1,1,1,17.9784,79.5941],
  ['SBIN0009002','500002006','State Bank of India','Nalgonda',                'Main Road, Nalgonda',                                'Nalgonda',     'Telangana',   'Nalgonda',     '508001','08682-222083',1,1,1,1,17.0575,79.2671],
  // State Bank of India — other states
  ['SBIN0004321','400002001','State Bank of India','Mumbai Main',             'Madam Cama Road, Fort, Mumbai',                      'Mumbai',       'Maharashtra', 'Mumbai',       '400001','022-22023456',1,1,1,1,18.9322,72.8347],
  ['SBIN0012345','110002001','State Bank of India','New Delhi Main',          '11 Sansad Marg, New Delhi',                          'New Delhi',    'Delhi',       'Central Delhi','110001','011-23744011',1,1,1,1,28.6328,77.2197],

  // HDFC Bank — Telangana (spread across correct districts)
  ['HDFC0003949','500240069','HDFC Bank','Nizampet',                          'HDFC Bank Ltd, 3-99/4 Kolan Veera Reddy Complex, Nizampet, Hyderabad', 'Hyderabad', 'Telangana', 'Medchal',      '500090','+919840673333',1,1,1,1,17.5197,78.3893],
  ['HDFC0000001','500240001','HDFC Bank','Banjara Hills',                     'Road No 12, Banjara Hills, Hyderabad',               'Hyderabad',    'Telangana',   'Hyderabad',    '500034','040-23548877',1,1,1,1,17.4126,78.4351],
  ['HDFC0001122','500240002','HDFC Bank','Kukatpally',                        'KPHB Colony Phase 3, Kukatpally, Hyderabad',         'Hyderabad',    'Telangana',   'Medchal',      '500072','040-23098776',1,1,1,1,17.4947,78.3996],
  ['HDFC0001500','500240030','HDFC Bank','Gachibowli',                        'Plot No 1, APIIC Layout, Gachibowli, Hyderabad',     'Hyderabad',    'Telangana',   'Hyderabad',    '500032','040-44614001',1,1,1,1,17.4401,78.3489],
  ['HDFC0001501','500240031','HDFC Bank','Kondapur',                          'Hi-Tech City Road, Kondapur, Hyderabad',             'Hyderabad',    'Telangana',   'Medchal',      '500084','040-44614002',1,1,1,1,17.4604,78.3777],
  ['HDFC0001502','500240032','HDFC Bank','Secunderabad',                      '5-9-22, MG Road, Secunderabad',                      'Secunderabad', 'Telangana',   'Hyderabad',    '500003','040-27840303',1,1,1,1,17.4399,78.4983],
  ['HDFC0001503','500240033','HDFC Bank','Dilsukhnagar',                      'Dilsukhnagar, Hyderabad',                            'Hyderabad',    'Telangana',   'Hyderabad',    '500060','040-24055001',1,1,1,1,17.3685,78.5247],
  ['HDFC0001504','500240034','HDFC Bank','Ameerpet',                          'Ameerpet, Hyderabad',                                'Hyderabad',    'Telangana',   'Hyderabad',    '500016','040-23748001',1,1,1,1,17.4374,78.4487],
  ['HDFC0001600','500240050','HDFC Bank','Warangal',                          'Hanamkonda, Warangal',                               'Warangal',     'Telangana',   'Warangal',     '506001','0870-2431001',1,1,1,1,17.9784,79.5941],
  ['HDFC0001601','500240051','HDFC Bank','Karimnagar',                        'Manakondur Road, Karimnagar',                        'Karimnagar',   'Telangana',   'Karimnagar',   '505001','0878-2241001',1,1,1,1,18.4386,79.1288],
  ['HDFC0001602','500240052','HDFC Bank','Nizamabad',                         'Beside RTC Bus Stand, Nizamabad',                    'Nizamabad',    'Telangana',   'Nizamabad',    '503001','08462-221001',1,1,1,1,18.6725,78.0940],
  ['HDFC0001603','500240053','HDFC Bank','Khammam',                           'Balaji Nagar, Khammam',                              'Khammam',      'Telangana',   'Khammam',      '507001','08742-221001',1,1,1,1,17.2473,80.1514],
  ['HDFC0001604','500240054','HDFC Bank','Nalgonda',                          'Trunk Road, Nalgonda',                               'Nalgonda',     'Telangana',   'Nalgonda',     '508001','08682-222001',1,1,1,1,17.0575,79.2671],
  ['HDFC0001605','500240055','HDFC Bank','Sangareddy',                        'Main Road, Sangareddy',                              'Sangareddy',   'Telangana',   'Sangareddy',   '502001','08455-221001',1,1,1,1,17.6241,78.0868],
  // HDFC Bank — other states
  ['HDFC0002233','400240001','HDFC Bank','Lower Parel',                       'Lower Parel, Mumbai',                                'Mumbai',       'Maharashtra', 'Mumbai',       '400013','022-66588800',1,1,1,1,18.9940,72.8296],

  // ICICI Bank
  ['ICIC0000001','500229001','ICICI Bank','Somajiguda',                        'Rajbhavan Road, Somajiguda, Hyderabad',              'Hyderabad',    'Telangana',   'Hyderabad',    '500082','040-66261600',1,1,1,1,17.4225,78.4591],
  ['ICIC0001234','400229001','ICICI Bank','Andheri',                           'Andheri West, Mumbai',                               'Mumbai',       'Maharashtra', 'Mumbai',       '400053','022-67606000',1,1,1,1,19.1136,72.8697],
  // Axis Bank
  ['UTIB0000001','500211001','Axis Bank','Himayatnagar',                       'Himayatnagar, Hyderabad',                            'Hyderabad',    'Telangana',   'Hyderabad',    '500029','040-27632900',1,1,1,1,17.4010,78.4845],
  // Others
  ['CNRB0000001','560015001','Canara Bank','Head Office Bengaluru',            '112 JC Road, Bengaluru',                             'Bengaluru',    'Karnataka',   'Bengaluru Urban','560002','080-22221581',1,1,1,1,12.9623,77.5922],
  ['KKBK0000001','500485001','Kotak Mahindra Bank','Jubilee Hills',            'Jubilee Hills, Hyderabad',                           'Hyderabad',    'Telangana',   'Hyderabad',    '500033','040-44666000',1,1,1,1,17.4239,78.4083],
  ['PUNB0000100','500024001','Punjab National Bank','Hyderabad Abids',         'Abids Circle, Hyderabad',                            'Hyderabad',    'Telangana',   'Hyderabad',    '500001','040-24748080',1,1,1,0,17.3938,78.4862],
  ['BARB0MUMBAI','400012001','Bank of Baroda','Mumbai Main',                   'Mandvi, Mumbai',                                     'Mumbai',       'Maharashtra', 'Mumbai',       '400009','022-23001234',1,1,1,1,18.9542,72.8362],
];

let count = 0;
for (const [ifsc,micr,bankName,branchName,addr,city,stateName,distName,pin,phone,neft,rtgs,imps,upi,lat,lng] of branches) {
  const bank  = getBank.get(bankName)    as any;
  const state = getState.get(stateName)  as any;
  if (!bank || !state) continue;
  const dist  = getDistrict.get(distName, state.id) as any;
  insBranch.run(ifsc,micr,bank.id,branchName,addr,city,dist?.id??null,state.id,pin,phone,neft,rtgs,imps,upi,lat,lng);
  count++;
}
console.log(`✅ ${count} branches`);

const t = (sql: string) => (db.prepare(sql).get() as any).c;
console.log(`\n📊 Totals: ${t('SELECT COUNT(*) AS c FROM states')} states | ${t('SELECT COUNT(*) AS c FROM banks')} banks | ${t('SELECT COUNT(*) AS c FROM branches')} branches`);
console.log('\n🎉 Seeding complete!\n');
