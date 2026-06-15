import { getDatabase } from '@netlify/database';

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('token') !== Netlify.env.get('SAM_SYNC_TOKEN')) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDatabase();
  let n = 0; const errs = [];

  // ── NEW ORGS ──────────────────────────────────────────────────────────────

  // Navy Fleet / Component Commands
  const orgs = [
    ['pacflt', 'PACFLT', 'Navy', 'Navy Fleet', 'U.S. Pacific Fleet', 'Pearl Harbor, HI', 'U.S. Pacific Fleet'],
    ['7th-fleet', '7th Fleet', 'Navy', 'Navy Fleet', '7th Fleet', 'Yokosuka, Japan', 'U.S. 7th Fleet'],
    ['3rd-fleet', '3rd Fleet', 'Navy', 'Navy Fleet', '3rd Fleet', 'San Diego, CA', 'U.S. 3rd Fleet'],
    ['6th-fleet', '6th Fleet', 'Navy', 'Navy Fleet', '6th Fleet', 'Naples, Italy', 'U.S. 6th Fleet'],
    ['4th-fleet', '4th Fleet', 'Navy', 'Navy Fleet', '4th Fleet', 'Mayport, FL', 'U.S. 4th Fleet'],
    ['fcc', 'FCC/C10F', 'Navy', 'Navy Cyber', 'Fleet Cyber Command', 'Fort Meade, MD', 'U.S. Fleet Cyber Command / 10th Fleet'],
    ['naveur', 'NAVEUR-NAVAF', 'Navy', 'Navy Fleet', 'Naval Forces Europe-Africa', 'Naples, Italy', 'U.S. Naval Forces Europe-Africa'],
    ['navcent', 'NAVCENT/5th Fleet', 'Navy', 'Navy Fleet', '5th Fleet', 'Manama, Bahrain', 'Naval Forces Central Command / 5th Fleet'],
    ['navsouth', 'NAVSOUTH/4th Fleet', 'Navy', 'Navy Fleet', 'Naval Forces Southern', 'Mayport, FL', 'Naval Forces Southern Command / 4th Fleet'],
    ['comnavairpac', 'COMNAVAIRPAC', 'Navy', 'Navy Fleet', 'Naval Air Force Pacific', 'San Diego, CA', 'Naval Air Force U.S. Pacific Fleet'],
    ['marforpac', 'MARFORPAC', 'Marine Corps', 'USMC Component', 'Marine Forces Pacific', 'Camp Smith, HI', 'U.S. Marine Corps Forces Pacific'],
    ['i-mef', 'I MEF', 'Marine Corps', 'USMC Component', 'I Marine Expeditionary Force', 'Camp Pendleton, CA', 'I Marine Expeditionary Force'],
    ['iii-mef', 'III MEF', 'Marine Corps', 'USMC Component', 'III Marine Expeditionary Force', 'Okinawa, Japan', 'III Marine Expeditionary Force'],
    ['2nd-mardiv', '2nd MarDiv', 'Marine Corps', 'USMC Component', '2nd Marine Division', 'Camp Lejeune, NC', '2nd Marine Division'],
    ['3rd-mardiv', '3rd MarDiv', 'Marine Corps', 'USMC Component', '3rd Marine Division', 'Okinawa, Japan', '3rd Marine Division'],
    ['usarpac', 'USARPAC', 'Army', 'Army Component', 'U.S. Army Pacific', 'Fort Shafter, HI', 'U.S. Army Pacific'],
    ['i-corps', 'I Corps', 'Army', 'Army Component', 'I Corps', 'Joint Base Lewis-McChord, WA', 'I Corps'],
    ['25th-id', '25th ID', 'Army', 'Army Component', '25th Infantry Division', 'Schofield Barracks, HI', '25th Infantry Division'],
    ['4th-id', '4th ID', 'Army', 'Army Component', '4th Infantry Division', 'Fort Carson, CO', '4th Infantry Division'],
    ['7th-id', '7th ID', 'Army', 'Army Component', '7th Infantry Division', 'Joint Base Lewis-McChord, WA', '7th Infantry Division / Multi-Domain Command Pacific'],
    ['94th-aamdc', '94th AAMDC', 'Army', 'Army Component', '94th AAMDC', 'Fort Shafter, HI', '94th Army Air and Missile Defense Command'],
    ['pacaf', 'PACAF', 'Air Force', 'AF Component', 'Pacific Air Forces', 'Joint Base Pearl Harbor-Hickam, HI', 'Pacific Air Forces'],
    ['5th-af', '5th AF', 'Air Force', 'AF Component', '5th Air Force', 'Yokota AB, Japan', '5th Air Force'],
    ['7th-af', '7th AF', 'Air Force', 'AF Component', '7th Air Force', 'Osan AB, South Korea', '7th Air Force'],
    ['11th-af', '11th AF', 'Air Force', 'AF Component', '11th Air Force', 'Joint Base Elmendorf-Richardson, AK', '11th Air Force / Alaskan Command'],
    ['sf-indopacom', 'USSFINDOPACOM', 'Space Force', 'SF Component', 'Space Forces Indo-Pacific', 'Camp H.M. Smith, HI', 'U.S. Space Forces Indo-Pacific'],
    ['disa-pac', 'DISA Pacific', 'DoW HQ', 'DISA', 'DISA Pacific', 'Camp Smith, HI', 'Defense Information Systems Agency Pacific'],
    ['indopacom', 'USINDOPACOM', 'Combatant Commands', 'INDOPACOM', 'HQ INDOPACOM', 'Camp H.M. Smith, HI', 'U.S. Indo-Pacific Command'],
    ['centcom', 'USCENTCOM', 'Combatant Commands', 'CENTCOM', 'HQ CENTCOM', 'MacDill AFB, FL', 'U.S. Central Command'],
    ['eucom', 'USEUCOM', 'Combatant Commands', 'EUCOM', 'HQ EUCOM', 'Stuttgart, Germany', 'U.S. European Command'],
    ['southcom', 'USSOUTHCOM', 'Combatant Commands', 'SOUTHCOM', 'HQ SOUTHCOM', 'Doral, FL', 'U.S. Southern Command'],
    ['northcom', 'USNORTHCOM', 'Combatant Commands', 'NORTHCOM', 'HQ NORTHCOM', 'Peterson SFB, CO', 'U.S. Northern Command'],
    ['africom', 'USAFRICOM', 'Combatant Commands', 'AFRICOM', 'HQ AFRICOM', 'Stuttgart, Germany', 'U.S. Africa Command'],
    ['stratcom', 'USSTRATCOM', 'Combatant Commands', 'STRATCOM', 'HQ STRATCOM', 'Offutt AFB, NE', 'U.S. Strategic Command'],
    ['spacecom', 'USSPACECOM', 'Combatant Commands', 'SPACECOM', 'HQ SPACECOM', 'Peterson SFB, CO', 'U.S. Space Command'],
    ['transcom', 'USTRANSCOM', 'Combatant Commands', 'TRANSCOM', 'HQ TRANSCOM', 'Scott AFB, IL', 'U.S. Transportation Command'],
    ['cybercom', 'USCYBERCOM', 'Combatant Commands', 'CYBERCOM', 'HQ CYBERCOM', 'Fort Meade, MD', 'U.S. Cyber Command'],
    ['socpac', 'SOCPAC', 'Combatant Commands', 'INDOPACOM', 'SOCPAC', 'Camp H.M. Smith, HI', 'Special Operations Command Pacific'],
    ['soccent', 'SOCCENT', 'Combatant Commands', 'CENTCOM', 'SOCCENT', 'MacDill AFB, FL', 'Special Operations Command Central'],
    ['soceur', 'SOCEUR', 'Combatant Commands', 'EUCOM', 'SOCEUR', 'Stuttgart, Germany', 'Special Operations Command Europe'],
    ['socsouth', 'SOCSOUTH', 'Combatant Commands', 'SOUTHCOM', 'SOCSOUTH', 'Homestead ARB, FL', 'Special Operations Command South'],
    ['socnorth', 'SOCNORTH', 'Combatant Commands', 'NORTHCOM', 'SOCNORTH', 'Peterson SFB, CO', 'Special Operations Command North'],
    ['socafrica', 'SOCAFRICA', 'Combatant Commands', 'AFRICOM', 'SOCAFRICA', 'Stuttgart, Germany', 'Special Operations Command Africa'],
    ['afgsc', 'AFGSC', 'Air Force', 'AF Major Command', 'Air Force Global Strike Command', 'Barksdale AFB, LA', 'Air Force Global Strike Command'],
    ['amc-af', 'AMC', 'Air Force', 'AF Major Command', 'Air Mobility Command', 'Scott AFB, IL', 'Air Mobility Command'],
    ['afcyber', '16 AF', 'Air Force', 'AF Cyber', '16th Air Force (AF Cyber)', 'Joint Base San Antonio, TX', 'Sixteenth Air Force / Air Forces Cyber'],
    ['arcyber', 'ARCYBER', 'Army', 'Army Cyber', 'Army Cyber Command', 'Fort Eisenhower, GA', 'Army Cyber Command'],
    ['marforcyber', 'MARFORCYBER', 'Marine Corps', 'USMC Cyber', 'Marine Forces Cyberspace Command', 'Fort Eisenhower, GA', 'Marine Corps Forces Cyberspace Command'],
    ['dcdc', 'DCDC/DISA', 'DoW HQ', 'Cyber', 'DoD Cyber Defense Command', 'Fort Meade, MD', 'DoD Cyber Defense Command'],
    ['doe', 'DOE', 'Other Agencies', 'Department of Energy', 'Secretary of Energy', 'Washington, DC', 'Department of Energy'],
    ['nnsa', 'NNSA', 'Other Agencies', 'Department of Energy', 'NNSA', 'Washington, DC', 'National Nuclear Security Administration'],
    ['arpa-e', 'ARPA-E', 'Other Agencies', 'Department of Energy', 'ARPA-E', 'Washington, DC', 'Advanced Research Projects Agency-Energy'],
    ['doe-eia', 'EIA', 'Other Agencies', 'Department of Energy', 'Energy Information Administration', 'Washington, DC', 'DOE Energy Information Administration'],
    ['doe-oe', 'DOE OE', 'Other Agencies', 'Department of Energy', 'Office of Electricity', 'Washington, DC', 'DOE Office of Electricity'],
    ['doe-cmei', 'DOE CMEI', 'Other Agencies', 'Department of Energy', 'CMEI', 'Washington, DC', 'DOE Office of Critical Minerals and Energy Innovation'],
    ['doe-ne', 'DOE NE', 'Other Agencies', 'Department of Energy', 'Office of Nuclear Energy', 'Washington, DC', 'DOE Office of Nuclear Energy'],
    ['doe-em', 'DOE EM', 'Other Agencies', 'Department of Energy', 'Environmental Management', 'Washington, DC', 'DOE Office of Environmental Management'],
    ['doe-edf', 'DOE EDF', 'Other Agencies', 'Department of Energy', 'Energy Dominance Financing', 'Washington, DC', 'DOE Office of Energy Dominance Financing'],
    ['doe-osbp', 'DOE OSBP', 'Other Agencies', 'Department of Energy', 'Small Business Programs', 'Washington, DC', 'DOE Office of Small Business Programs'],
    ['doe-otc', 'DOE OTC', 'Other Agencies', 'Department of Energy', 'Technology Commercialization', 'Washington, DC', 'DOE Office of Technology Commercialization'],
    ['commerce', 'DOC', 'Other Agencies', 'Department of Commerce', 'Secretary of Commerce', 'Washington, DC', 'Department of Commerce'],
    ['bis', 'BIS', 'Other Agencies', 'Department of Commerce', 'Bureau of Industry and Security', 'Washington, DC', 'Bureau of Industry and Security'],
    ['noaa', 'NOAA', 'Other Agencies', 'Department of Commerce', 'NOAA', 'Silver Spring, MD', 'National Oceanic and Atmospheric Administration'],
    ['noaa-space', 'NOAA Space Commerce', 'Other Agencies', 'Department of Commerce', 'Office of Space Commerce', 'Silver Spring, MD', 'NOAA Office of Space Commerce'],
    ['nist', 'NIST', 'Other Agencies', 'Department of Commerce', 'NIST', 'Gaithersburg, MD', 'National Institute of Standards and Technology'],
    ['bea', 'BEA', 'Other Agencies', 'Department of Commerce', 'Bureau of Economic Analysis', 'Washington, DC', 'Bureau of Economic Analysis'],
    ['ita', 'ITA', 'Other Agencies', 'Department of Commerce', 'International Trade Administration', 'Washington, DC', 'International Trade Administration'],
    ['marcent', 'MARCENT', 'Marine Corps', 'USMC Component', 'Marine Forces Central', 'MacDill AFB, FL', 'Marine Corps Forces Central Command'],
    ['marforeur', 'MARFOREUR', 'Marine Corps', 'USMC Component', 'Marine Forces Europe and Africa', 'Stuttgart, Germany', 'Marine Corps Forces Europe and Africa'],
    ['marforsouth', 'MARFORSOUTH', 'Marine Corps', 'USMC Component', 'Marine Forces South', 'Doral, FL', 'Marine Corps Forces South'],
    ['marfornorth', 'MARFORNORTH', 'Marine Corps', 'USMC Component', 'Marine Forces North', 'New Orleans, LA', 'Marine Corps Forces Northern Command'],
    ['usareur', 'USAREUR-AF', 'Army', 'Army Component', 'Army Europe and Africa', 'Wiesbaden, Germany', 'U.S. Army Europe and Africa'],
    ['iii-ac', 'III Armored Corps', 'Army', 'Army Component', 'III Armored Corps', 'Fort Cavazos, TX', 'III Armored Corps'],
    ['usarcent', 'ARCENT', 'Army', 'Army Component', 'Army Central', 'Shaw AFB, SC', 'U.S. Army Central'],
    ['usasouth', 'USASOUTH', 'Army', 'Army Component', 'Army Western Hemisphere', 'Fort Sam Houston, TX', 'Army Western Hemisphere Command'],
    ['afcent', 'AFCENT', 'Air Force', 'AF Component', 'Air Forces Central', 'Shaw AFB, SC', 'Air Forces Central Command'],
    ['usafe', 'USAFE-AFAFRICA', 'Air Force', 'AF Component', 'Air Forces Europe-Africa', 'Ramstein AB, Germany', 'U.S. Air Forces in Europe - Air Forces Africa'],
    ['afsouth', 'AFSOUTH', 'Air Force', 'AF Component', 'Air Forces Southern', 'Davis-Monthan AFB, AZ', 'Air Forces Southern'],
    ['sf-central', 'SPACECENT', 'Space Force', 'SF Component', 'Space Forces Central', 'MacDill AFB, FL', 'U.S. Space Forces Central'],
    ['sf-southern', 'SF Southern', 'Space Force', 'SF Component', 'Space Forces Southern', 'Doral, FL', 'Space Forces Southern'],
    ['sf-northern', 'SF Northern', 'Space Force', 'SF Component', 'Space Forces Northern', 'Peterson SFB, CO', 'Space Forces Northern'],
    ['sf-africa', 'USSPACEFOREUR-AF', 'Space Force', 'SF Component', 'Space Forces Africa', 'Stuttgart, Germany', 'U.S. Space Forces Africa'],
    ['sf-space-s4s', 'S4S', 'Space Force', 'SF Component', 'Space Forces Space', 'Peterson SFB, CO', 'U.S. Space Forces Space (S4S)'],
    ['disa-europe', 'DISA Europe', 'DoW HQ', 'DISA', 'DISA Europe', 'Stuttgart, Germany', 'DISA Europe Command'],
    ['disa-africa', 'DISA Africa', 'DoW HQ', 'DISA', 'DISA Africa', 'Stuttgart, Germany', 'DISA Africa Field Command'],
    ['jecc', 'JECC', 'Combatant Commands', 'TRANSCOM', 'Joint Enabling Capabilities Command', 'Scott AFB, IL', 'Joint Enabling Capabilities Command'],
    ['jiatf-west', 'JIATF West', 'Combatant Commands', 'INDOPACOM', 'JIATF West', 'Pearl Harbor, HI', 'Joint Interagency Task Force West'],
    ['jiatf-south', 'JIATF South', 'Combatant Commands', 'SOUTHCOM', 'JIATF South', 'Key West, FL', 'Joint Interagency Task Force South'],
  ];

  for (const [id, sub, branch, major, subtier, loc, description] of orgs) {
    await db.sql`INSERT INTO orgs (id, sub, branch, major, subtier, loc, description) VALUES (${id}, ${sub}, ${branch}, ${major}, ${subtier}, ${loc}, ${description}) ON CONFLICT (id) DO UPDATE SET sub=EXCLUDED.sub, branch=EXCLUDED.branch, major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc, description=EXCLUDED.description`;
  }

  // ── CONTACTS ─────────────────────────────────────────────────────────────
  // Helper inline
  const ins = async (id, name, initials, title, org_id, org_full, color, tags, hierarchy_order) => {
    try {
      await db.sql`INSERT INTO contacts (id, name, initials, title, org_id, org_full, color, tags, opps, hierarchy_order) VALUES (${id}, ${name}, ${initials}, ${title}, ${org_id}, ${org_full}, ${color}, ${tags}, 0, ${hierarchy_order}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, title=EXCLUDED.title, org_id=EXCLUDED.org_id, org_full=EXCLUDED.org_full, color=EXCLUDED.color, tags=EXCLUDED.tags, hierarchy_order=EXCLUDED.hierarchy_order`; n++;
    } catch(e) { errs.push(e.message.slice(0,120)); }
  };

  // ── INDOPACOM HQ ─────────────────────────────────────────────────────────
  await ins('samuel-paparo-indopacom','Samuel Paparo','SP','Commander, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],1);
  await ins('george-rowell-indopacom','George B. Rowell','GBR','Deputy Commander, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],2);
  await ins('joel-carey-indopacom','Joel L. Carey','JLC','Chief of Staff, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],3);
  await ins('mike-richards-indopacom','Mike Richards','MR','Deputy Chief of Staff, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],4);
  await ins('carlos-ortiz-indopacom','Carlos Ortiz','CO','Chief Data Officer, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['tech-leader'],5);
  await ins('martin-lindsey-indopacom','Martin Lindsey','ML','Science & Technology Advisor, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['r&d'],6);
  // J1
  await ins('christopher-busque-indopacom','Christopher Busque','CB','Director J1, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],7);
  await ins('florenda-figueira-indopacom','Florenda Figueira','FF','Deputy Director J1, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],8);
  // J2
  await ins('david-elsen-indopacom','David P. Elsen','DPE','J2 Director for Intelligence, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],9);
  await ins('kent-breedlove-indopacom','Kent Breedlove','KB','J2 Deputy Director for Intelligence, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],10);
  await ins('christopher-alder-indopacom','Christopher Alder','CA','Vice Director for Intelligence, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],11);
  await ins('jamie-fraser-loria-indopacom','Jamie Fraser-Loria','JFL','JIOC/CO Commander, INDOPACOM Joint Intel Ops Center','indopacom','HQ INDOPACOM','#374151',[],12);
  await ins('deanna-willis-indopacom','Deanna Willis','DW','JIOC/DCO Deputy Commander, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],13);
  await ins('katherine-braun-indopacom','Katherine M. Braun','KMB','J2 Mobilization Assistant, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],14);
  await ins('ben-needles-indopacom','Ben Needles','BN','J2 CTO INDOPACOM','indopacom','HQ INDOPACOM','#374151',['tech-leader'],15);
  await ins('stephen-skells-indopacom','Stephen Skells','SS','Staff Director J2, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],16);
  // J3
  await ins('erik-eslich-indopacom','Erik J. Eslich','EJE','J3 Director Maritime Operations, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],17);
  await ins('michael-rose-indopacom','Michael D. Rose','MDR','J3 Deputy Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],18);
  await ins('matthew-bowen-indopacom','Matthew Bowen','MB','J3 Deputy Director International Operations, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],19);
  await ins('george-downs-indopacom','George H. Downs','GHD','J3 Mobilization Assistant, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],20);
  await ins('jacob-rhine-indopacom','Jacob Rhine','JR','Current SOF and Ground Operations, USINDOPACOM J33','indopacom','HQ INDOPACOM','#374151',[],21);
  // J4
  await ins('martine-kidd-indopacom','Martine S. Kidd','MSK','J4 Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],22);
  await ins('maxine-gardner-indopacom','Maxine Gardner','MG','J4 Deputy Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],23);
  await ins('jc-bliss-indopacom','J.C. Bliss','JCB','J4S Strategy, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],24);
  await ins('robert-degregorio-indopacom','Robert M. Degregorio','RMD','J4MA Mobilization Assistant, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],25);
  await ins('elijah-gamble-indopacom','Elijah K. Gamble','EKG','J4XO Executive Office, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],26);
  // J5
  await ins('walter-allman-indopacom','Walter Allman','WA','J5 Deputy Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],27);
  await ins('paul-ogrady-indopacom','Paul O\'Grady','POG','J5 Strategy Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],28);
  await ins('jonathan-lett-indopacom','Jonathan Lett','JL','J5 Policy Director (Royal Navy), INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],29);
  await ins('sarah-russ-indopacom','Sarah Russ','SR','J5 Mobilization Assistant, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],30);
  await ins('kenneth-michel-indopacom','Kenneth Michel','KM','J5 Director of Staff, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],31);
  await ins('thomas-hilleary-indopacom','Thomas Hilleary','TH','J5 Foreign Policy Advisor, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],32);
  await ins('christina-sheets-indopacom','Christina Sheets','CS','J5 Branch Chief, Posture and Policy, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],33);
  await ins('catherine-simons-indopacom','Catherine Coral Simons','CCS','Deputy Branch Chief Posture J562, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],34);
  await ins('daniel-misigoy-indopacom','Daniel Misigoy','DM','Chief of Logistics Plans and Exercises, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],35);
  await ins('stephen-sannis-indopacom','Stephen Sannis','SS2','J5 Ops Manager, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],36);
  // J6
  await ins('michael-smith-indopacom','Michael L. Smith','MLS','J6 Director C4, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer','tech-leader'],37);
  await ins('anthony-bumatay-indopacom','Anthony Bumatay','AB','J60 Deputy Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],38);
  await ins('jared-voneida-indopacom','Jared Voneida','JV','C4 Operations Division Chief, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],39);
  await ins('will-macugay-indopacom','Will Macugay','WM','Director J65, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],40);
  // J7
  await ins('richard-goodman-indopacom','Richard A. Goodman','RAG','J7 Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['flag-officer'],41);
  await ins('john-wood-indopacom','John Wood','JW','J7 Deputy Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],42);
  await ins('andrew-merz-indopacom','Andrew Merz','AM','J7 Director of Staff, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],43);
  await ins('katherine-van-meerten-indopacom','Katherine Van Meerten','KVM','J7 Operations Officer, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],44);
  await ins('andre-stridiron-indopacom','Andre Stridiron','AS','J7 PMTEC Implementation Office, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],45);
  await ins('brendan-fitzgerald-indopacom','Brendan D. Fitzgerald','BDF','J71 Joint Exercises Division Chief, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],46);
  await ins('vaimana-conner-indopacom','Vaimana Conner','VC','J72 All-Domain Training Division Chief, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],47);
  await ins('paul-tamaribuchi-indopacom','Paul S. Tamaribuchi','PST','J76 Pacific Warfighting Center Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],48);
  await ins('brent-parker-indopacom','Brent Parker','BP','Commercial Industry Engagement J708 PMTEC, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],49);
  // J8
  await ins('robert-stephenson-indopacom','Robert A. Stephenson','RAS','J8 Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],50);
  await ins('edmund-guy-indopacom','Edmund Guy','EG','J8 Deputy Director, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],51);
  await ins('tammy-low-indopacom','Tammy Low','TL','Director Joint International Experimentation, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['r&d'],52);
  await ins('sara-eighmey-indopacom','Sara Eighmey','SE','Future Capabilities Requirements, INDOPACOM','indopacom','HQ INDOPACOM','#374151',[],53);
  await ins('robert-smith-indopacom','Robert Smith','RS','Principal Technologist AI and Autonomy, INDOPACOM','indopacom','HQ INDOPACOM','#374151',['r&d'],54);
  // JIATF West
  await ins('george-howell-jiatfw','George Howell','GH','Director, JIATF West','jiatf-west','JIATF West INDOPACOM','#374151',[],1);
  await ins('charles-lee-jiatfw','Charles Lee','CL','Executive Director, JIATF West','jiatf-west','JIATF West INDOPACOM','#374151',[],2);
  await ins('brian-bagley-jiatfw','Brian Bagley','BB','Chief of Staff, JIATF West','jiatf-west','JIATF West INDOPACOM','#374151',[],3);

  // ── PACFLT ───────────────────────────────────────────────────────────────
  await ins('stephen-koehler-pacflt','Stephen T. Koehler','STK','Commander, U.S. Pacific Fleet','pacflt','U.S. Pacific Fleet','#1e3a8a',['flag-officer'],1);
  await ins('jeffrey-jablon-pacflt','Jeffrey T. Jablon','JTJ','Deputy Commander, U.S. Pacific Fleet','pacflt','U.S. Pacific Fleet','#1e3a8a',['flag-officer'],2);
  await ins('joaquin-martinez-pacflt','Joaquin J. Martinez de Pinillos','JJM','Reserve Deputy Commander, U.S. Pacific Fleet','pacflt','U.S. Pacific Fleet','#1e3a8a',['flag-officer'],3);
  await ins('adam-johnson-pacflt','Adam Johnson','AJ','Director for Intelligence N2, Pacific Fleet','pacflt','U.S. Pacific Fleet','#1e3a8a',[],4);
  await ins('victor-taylor-pacflt','Victor T. Taylor','VTT','Director Communications N6, Pacific Fleet','pacflt','U.S. Pacific Fleet','#1e3a8a',[],5);
  await ins('steven-sifuentes-pacflt','Steven Sifuentes','SS','C5I Planner N6, Pacific Fleet','pacflt','U.S. Pacific Fleet','#1e3a8a',[],6);
  // 7th Fleet
  await ins('patrick-hannifin-7thfleet','Patrick J. Hannifin','PJH','Commander, U.S. 7th Fleet','7th-fleet','U.S. 7th Fleet','#1e3a8a',['flag-officer'],1);
  await ins('katie-sheldon-7thfleet','Katie F. Sheldon','KFS','Vice Commander, U.S. 7th Fleet','7th-fleet','U.S. 7th Fleet','#1e3a8a',['flag-officer'],2);
  await ins('kyle-gantt-7thfleet','Kyle Gantt','KG','Deputy Commander, Seventh Fleet','7th-fleet','U.S. 7th Fleet','#1e3a8a',['flag-officer'],3);
  await ins('les-soble-7thfleet','Les Soble','LS','Chief of Staff, Seventh Fleet','7th-fleet','U.S. 7th Fleet','#1e3a8a',[],4);
  // 3rd Fleet
  await ins('suzanne-krauss-3rdfleet','Suzanne Krauss','SK','Deputy Commander, Third Fleet','3rd-fleet','U.S. 3rd Fleet','#1e3a8a',['flag-officer'],1);
  await ins('tony-nichols-3rdfleet','Tony Nichols','TN','Chief of Staff, Third Fleet','3rd-fleet','U.S. 3rd Fleet','#1e3a8a',[],2);
  // COMNAVAIRPAC
  await ins('douglas-verissimo-comnavairpac','Douglas C. Verissimo','DCV','Commander Naval Air Forces (COMNAVAIRFOR/COMNAVAIRPAC)','comnavairpac','Naval Air Force U.S. Pacific Fleet','#1e3a8a',['flag-officer'],1);
  // Cyber Group ONE
  await ins('ron-arellano-cybergrp1','Ron J. Arellano','RJA','Commander, Cyber Group ONE','fcc','Fleet Cyber Command','#1e3a8a',[],1);
  await ins('pete-koprowski-fcc','Pete Koprowski','PK','Chief of Staff, Fleet Cyber Command / Commander 10th Fleet','fcc','Fleet Cyber Command','#1e3a8a',[],2);

  // ── NAVEUR / 6TH FLEET ───────────────────────────────────────────────────
  await ins('george-wikoff-naveur','George M. Wikoff','GMW','Commander, U.S. Naval Forces Europe-Africa','naveur','U.S. Naval Forces Europe-Africa','#1e3a8a',['flag-officer'],1);
  await ins('scott-ruston-naveur','Scott W. Ruston','SWR','Vice Commander, U.S. Naval Forces Europe-Africa','naveur','U.S. Naval Forces Europe-Africa','#1e3a8a',['flag-officer'],2);
  await ins('juliet-beyler-naveur','Juliet Beyler','JB','Executive Director, U.S. Naval Forces Europe-Africa','naveur','U.S. Naval Forces Europe-Africa','#1e3a8a',[],3);
  await ins('bill-moeller-naveur','Bill Moeller','BM','Foreign Policy Advisor, U.S. Naval Forces Europe-Africa','naveur','U.S. Naval Forces Europe-Africa','#1e3a8a',[],4);
  await ins('andrew-miller-naveur','Andrew Miller','AM','Director Maritime Operations, NAVEUR-NAVAF','naveur','U.S. Naval Forces Europe-Africa','#1e3a8a',['flag-officer'],5);
  await ins('david-ludwa-naveur','David E. Ludwa','DEL','Director Maritime Headquarters, NAVEUR-NAVAF','naveur','U.S. Naval Forces Europe-Africa','#1e3a8a',['flag-officer'],6);
  await ins('michael-mattis-naveur','Michael Mattis','MM','Director Strategic Effects, NAVEUR-NAVAF / CTF-66','naveur','U.S. Naval Forces Europe-Africa','#1e3a8a',['flag-officer'],7);
  await ins('jeffrey-anderson-6thfleet','Jeffrey T. Anderson','JTA','Commander, U.S. 6th Fleet','6th-fleet','U.S. 6th Fleet','#1e3a8a',['flag-officer'],1);
  await ins('scott-miller-6thfleet','P. Scott Miller','PSM','Deputy Commander, U.S. 6th Fleet','6th-fleet','U.S. 6th Fleet','#1e3a8a',['flag-officer'],2);
  await ins('jason-naidyhorski-6thfleet','Jason Naidyhorski','JN','Vice Commander, U.S. Sixth Fleet','6th-fleet','U.S. 6th Fleet','#1e3a8a',['flag-officer'],3);
  await ins('kelly-ward-ctf66','Kelly Ward','KW','Director Strategic Effects CTF 66','6th-fleet','U.S. 6th Fleet CTF-66','#1e3a8a',['flag-officer'],4);

  // ── NAVCENT / 5TH FLEET ──────────────────────────────────────────────────
  await ins('curt-renshaw-navcent','Curt A. Renshaw','CAR','Commander, Naval Forces Central Command/5th Fleet','navcent','Naval Forces Central Command','#1e3a8a',['flag-officer'],1);
  await ins('matt-kawas-navcent','Matt Kawas','MK','Deputy Commander Naval Force CENTCOM/5th Fleet','navcent','Naval Forces Central Command','#1e3a8a',['flag-officer'],2);
  await ins('rigel-pirrone-navcent','Rigel D. Pirrone','RDP','Reserve Vice Commander, Naval Forces Central Command','navcent','Naval Forces Central Command','#1e3a8a',['flag-officer'],3);
  await ins('courtney-minetree-navcent','Courtney M. Minetree','CMM','Maritime Operation Center Director, NAVCENT','navcent','Naval Forces Central Command','#1e3a8a',[],4);
  await ins('anderson-perez-navcent','Anderson J. Perez','AJP','Chief of Staff, U.S. Naval Forces Central Command','navcent','Naval Forces Central Command','#1e3a8a',[],5);

  // ── NAVSOUTH / 4TH FLEET ─────────────────────────────────────────────────
  await ins('carlos-sardiello-navsouth','Carlos Sardiello','CS','Commander, U.S. Naval Forces Southern Command/4th Fleet','navsouth','Naval Forces Southern Command','#1e3a8a',['flag-officer'],1);
  await ins('matthew-hawkins-navsouth','Matthew A. Hawkins','MAH','Reserve Vice Commander, NAVSOUTH/4th Fleet','navsouth','Naval Forces Southern Command','#1e3a8a',['flag-officer'],2);
  await ins('chris-richard-navsouth','Chris Richard','CR','Chief of Staff, NAVSOUTH/4th Fleet','navsouth','Naval Forces Southern Command','#1e3a8a',[],3);
  await ins('jonathan-williams-navsouth','Jonathan Williams','JW','Director of Technology and Innovation, 4th Fleet','navsouth','Naval Forces Southern Command','#1e3a8a',['tech-leader'],4);

  // ── FLEET CYBER COMMAND ───────────────────────────────────────────────────
  await ins('heidi-berg-fcc','Heidi K. Berg','HKB','Commander, U.S. Fleet Cyber Command/10th Fleet','fcc','Fleet Cyber Command','#1e3a8a',['flag-officer'],1);
  await ins('randall-sharo-fcc','Randall Sharo','RS','CTO Navy Fleet Cyber Command','fcc','Fleet Cyber Command','#1e3a8a',['tech-leader'],3);

  // ── MARFORPAC ─────────────────────────────────────────────────────────────
  await ins('james-glynn-marforpac','James Glynn','JG','Commander, Marine Corps Forces Pacific','marforpac','MARFORPAC','#8b0000',['flag-officer'],1);
  await ins('roger-turner-marforpac','Roger B. Turner','RBT','Nominated Commander, Marine Corps Forces Pacific','marforpac','MARFORPAC','#8b0000',['flag-officer'],2);
  await ins('matthew-mowery-marforpac','Matthew T. Mowery','MTM','Deputy Commander, Marine Corps Forces Pacific','marforpac','MARFORPAC','#8b0000',['flag-officer'],3);
  await ins('bob-sholtis-marforpac','Robert Sholtis','RS2','CIO / Deputy AC/S G39 & G6, MARFORPAC','marforpac','MARFORPAC','#8b0000',['tech-leader'],4);
  await ins('lawrence-hussey-marforpac','Lawrence Hussey','LH','Assistant Chief of Staff G39 & G6, MARFORPAC','marforpac','MARFORPAC','#8b0000',[],5);
  await ins('mason-millsap-marforpac','Mason S. Millsap','MSM','Digital Transformation Officer, MARFORPAC','marforpac','MARFORPAC','#8b0000',['tech-leader'],6);
  // I MEF
  await ins('christian-wortman-imef','Christian F. Wortman','CFW','Commanding General, I Marine Expeditionary Force','i-mef','I MEF','#8b0000',['flag-officer'],1);
  await ins('michael-nakonieczny-imef','Michael R. Nakonieczny','MRN','Deputy CG, I Marine Expeditionary Force','i-mef','I MEF','#8b0000',['flag-officer'],2);
  await ins('steven-atkinson-imef','Steven Atkinson','SA','Assistant Chief of Staff G-9 Science and Technology, I MEF','i-mef','I MEF','#8b0000',['r&d'],3);
  await ins('jp-quinter-imef','J.P. Quinter','JPQ','Chief of Staff, I Marine Expeditionary Force','i-mef','I MEF','#8b0000',[],4);
  // III MEF
  await ins('benjamin-watson-iiimef','Benjamin T. Watson','BTW','Commanding General, III Marine Expeditionary Force','iii-mef','III MEF','#8b0000',['flag-officer'],1);
  await ins('simon-doran-iiimef','Simon M. Doran','SMD','CG 1st Marine Air Wing / III MEF','iii-mef','III MEF','#8b0000',['flag-officer'],2);
  await ins('robert-brodie-iiimef','Robert B. Brodie','RBB','Deputy CG, III Marine Expeditionary Force','iii-mef','III MEF','#8b0000',['flag-officer'],3);
  // 2nd MarDiv
  await ins('farrell-sullivan-2mardiv','Farrell J. Sullivan','FJS','Commander 2nd Marine Division','2nd-mardiv','2nd Marine Division','#8b0000',['flag-officer'],1);
  await ins('joel-schmidt-2mardiv','Joel F. Schmidt','JFS','Assistant Division Commander, 2nd Marine Division','2nd-mardiv','2nd Marine Division','#8b0000',['flag-officer'],2);
  // 3rd MarDiv
  await ins('kyle-ellison-3mardiv','Kyle B. Ellison','KBE','Commander 3rd Marine Division','3rd-mardiv','3rd Marine Division','#8b0000',['flag-officer'],1);
  await ins('matthew-good-3mardiv','Matthew T. Good','MTG','Assistant Division Commander, 3rd Marine Division','3rd-mardiv','3rd Marine Division','#8b0000',['flag-officer'],2);

  // ── USARPAC ───────────────────────────────────────────────────────────────
  await ins('ronald-clark-usarpac','Ronald Clark','RC','Commander, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',['flag-officer'],1);
  await ins('joel-vowell-usarpac','Joel B. Vowell','JBV','Deputy CG, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',['flag-officer'],2);
  await ins('lance-okamura-usarpac','Lance A. Okamura','LAO','Deputy CG Homeland Affairs, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',['flag-officer'],3);
  await ins('scott-winter-usarpac','Scott A. Winter','SAW','Deputy CG Strategy and Plans, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',['flag-officer'],4);
  await ins('thomas-burke-usarpac','Thomas E. Burke','TEB','Chief of Staff, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',['flag-officer'],5);
  await ins('meridith-fonseca-usarpac','Meridith Fonseca','MF','Chief Data Officer, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',['tech-leader'],6);
  await ins('carol-stauffer-usarpac','Carol Stauffer','CS','Director for Intelligence G-2, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',[],7);
  await ins('alton-johnson-usarpac','Alton Johnson','AJ','ACofS G-6, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',[],8);
  await ins('alan-delgado-usarpac','Alan Delgado','AD','Division Chief Joint Coalition Networks G-64, USARPAC','usarpac','U.S. Army Pacific','#374151',[],9);
  await ins('david-bellas-usarpac','David Bellas','DB','Deputy G62/Programs Projects Policy, USARPAC','usarpac','U.S. Army Pacific','#374151',[],10);
  await ins('daniel-murdough-usarpac','Daniel Murdough','DM','G62 Projects Officer, USARPAC','usarpac','U.S. Army Pacific','#374151',[],11);
  await ins('jeremy-schunke-usarpac','Jeremy Schunke','JS','Director of Concepts, U.S. Army Pacific','usarpac','U.S. Army Pacific','#374151',[],12);
  await ins('jon-holm-usarpac','Jon Holm','JH','5th Battlefield Coordination Detachment Commander','usarpac','U.S. Army Pacific','#374151',[],13);
  // I Corps
  await ins('matthew-mcfarlane-icorps','Matthew W. McFarlane','MWM','Commanding General, I Corps','i-corps','I Corps','#374151',['flag-officer'],1);
  await ins('joseph-escandon-icorps','Joseph Escandon','JE','Deputy CG, I Corps','i-corps','I Corps','#374151',['flag-officer'],2);
  await ins('drew-conover-icorps','Drew Conover','DC','Director Innovation and Concepts, I Corps','i-corps','I Corps','#374151',[],3);
  // 25th ID
  await ins('james-bartholomees-25id','James Bartholomees','JB','Commanding General, 25th Infantry Division','25th-id','25th Infantry Division','#374151',['flag-officer'],1);
  await ins('jim-keirsey-25id','Jim Keirsey','JK','Deputy Commander for Operations, 25th ID','25th-id','25th Infantry Division','#374151',['flag-officer'],2);
  await ins('jon-velishka-25id','Jon Velishka','JV','Deputy CG Support, 25th ID','25th-id','25th Infantry Division','#374151',['flag-officer'],3);
  await ins('aidan-shattock-25id','Aidan Shattock','AS','Deputy Commander Interoperability, 25th ID','25th-id','25th Infantry Division','#374151',[],4);
  await ins('dave-brunais-25id','Dave Brunais','DB','Chief of Staff, 25th Infantry Division','25th-id','25th Infantry Division','#374151',[],5);
  await ins('mike-woodall-25id','Mike Woodall','MW','Commander Sustainment Brigade, 25th ID','25th-id','25th Infantry Division','#374151',[],6);
  await ins('adam-brinkman-25id','Adam C. Brinkman','ACB','25th ID G6 / 125th Signal Battalion Commander','25th-id','25th Infantry Division','#374151',[],7);
  // 4th ID
  await ins('patrick-ellis-4id','Patrick Ellis','PE','Commanding General, 4th Infantry Division','4th-id','4th Infantry Division','#374151',['flag-officer'],1);
  await ins('edwin-matthaidess-4id','Edwin D. Matthaidess','EDM','Deputy Commander Support, 4th ID','4th-id','4th Infantry Division','#374151',['flag-officer'],2);
  await ins('brendan-raymond-4id','Brendan Raymond','BR','Deputy CG Maneuver, 4th ID','4th-id','4th Infantry Division','#374151',['flag-officer'],3);
  await ins('brian-gilbert-4id','Brian D. Gilbert','BDG','Chief of Staff, 4th Infantry Division','4th-id','4th Infantry Division','#374151',[],4);
  // 94th AAMDC
  await ins('william-parker-94aamdc','William Parker','WP','Commander, 94th Army Air and Missile Defense Command','94th-aamdc','94th AAMDC','#374151',['flag-officer'],1);
  await ins('matt-dalton-94aamdc','Matt Dalton','MD','Deputy Commander, 94th AAMDC','94th-aamdc','94th AAMDC','#374151',[],2);
  // 7th ID
  await ins('bernard-harrington-7id','Bernard J. Harrington','BJH','CG, 7th Infantry Division / Multi-Domain Command Pacific','7th-id','7th Infantry Division','#374151',['flag-officer'],1);
  await ins('charles-kean-7id','Charles Kean','CK','Commander 1st Multi-Domain Task Force, 7th ID','7th-id','7th Infantry Division','#374151',[],2);
  await ins('tiane-garner-7id','Tiane R. Garner','TRG','Commander Multi-Domain Effects Battalion','7th-id','7th Infantry Division','#374151',[],3);

  // ── PACAF ─────────────────────────────────────────────────────────────────
  await ins('kevin-schneider-pacaf','Kevin B. Schneider','KBS','Commander, Pacific Air Forces','pacaf','Pacific Air Forces','#1d4ed8',['flag-officer'],1);
  await ins('mike-drowley-pacaf','Mike Drowley','MD','Special Assistant to Commander PACAF','pacaf','Pacific Air Forces','#1d4ed8',['flag-officer'],2);
  await ins('laura-lenderman-pacaf','Laura L. Lenderman','LLL','Deputy Commander, Pacific Air Forces','pacaf','Pacific Air Forces','#1d4ed8',['flag-officer'],3);
  await ins('alan-matney-pacaf','Alan Matney','AM','Mobilization Asst to Deputy Commander, PACAF','pacaf','Pacific Air Forces','#1d4ed8',['flag-officer'],4);
  await ins('shane-vesely-pacaf','Shane Vesely','SV','Chief of Staff, HQ Pacific Air Forces','pacaf','Pacific Air Forces','#1d4ed8',['flag-officer'],5);
  await ins('ray-pia-pacaf','Gloiell Pia','GP','Chief Data and AI Officer, PACAF CDAO','pacaf','Pacific Air Forces','#1d4ed8',['tech-leader'],6);
  await ins('rosalie-duarte-pacaf','Rosalie Alejo Duarte','RAD','Director Manpower Personnel and Services, PACAF','pacaf','Pacific Air Forces','#1d4ed8',[],7);
  await ins('aaron-cooper-pacaf','Aaron Cooper','AC','Director of ISR, PACAF','pacaf','Pacific Air Forces','#1d4ed8',[],8);
  await ins('david-eaglin-pacaf','David Eaglin','DE','Director of Air Operations, PACAF','pacaf','Pacific Air Forces','#1d4ed8',['flag-officer'],9);
  await ins('mike-zuhlsdorf-pacaf','Mike Zuhlsdorf','MZ','Director Logistics Engineering Force Protection, PACAF','pacaf','Pacific Air Forces','#1d4ed8',['flag-officer'],10);
  await ins('christopher-sheppard-pacaf','Christopher Sheppard','CS','Director Strategy Plans Programs, PACAF','pacaf','Pacific Air Forces','#1d4ed8',['flag-officer'],11);
  await ins('eric-crowell-pacaf','Eric Crowell','EC','Director Cyber Ops & Warfighting Comms, PACAF','pacaf','Pacific Air Forces','#1d4ed8',[],12);
  await ins('tassika-davis-pacaf','Tassika Davis','TD','PACAF A6 Deputy Director Cyber Ops','pacaf','Pacific Air Forces','#1d4ed8',[],13);
  await ins('andrew-rekieta-pacaf','Andrew W. Rekieta','AWR','Branch Chief C5 Plans Exercises PACAF A6','pacaf','Pacific Air Forces','#1d4ed8',[],14);
  await ins('todd-paciencia-pacaf','Todd Paciencia','TP','Director Analyses Assessments Lessons Learned, PACAF','pacaf','Pacific Air Forces','#1d4ed8',[],15);
  await ins('melissa-milner-pacaf','Melissa Milner','MM','Director of Public Affairs, PACAF','pacaf','Pacific Air Forces','#1d4ed8',[],16);
  await ins('johnny-bland-pacaf','Johnny M. Bland','JMB','Director of Information Protection, PACAF','pacaf','Pacific Air Forces','#1d4ed8',[],17);
  await ins('kenneth-burton-pacaf','Kenneth Burton','KB','Director Pacific Air Forces Watch Center','pacaf','Pacific Air Forces','#1d4ed8',[],18);
  // 5th AF
  await ins('joel-carey-5af','Joel L. Carey','JLC','Commander, 5th Air Force','5th-af','5th Air Force','#1d4ed8',['flag-officer'],1);
  await ins('john-schutte-5af','John Schutte','JS','Deputy Commander, 5th Air Force','5th-af','5th Air Force','#1d4ed8',[],2);
  // 7th AF
  await ins('david-iverson-7af','David R. Iverson','DRI','Commander, Seventh Air Force','7th-af','7th Air Force','#1d4ed8',['flag-officer'],1);
  await ins('kurt-helphinstine-7af','Kurt Helphinstine','KH','Deputy Commander, Seventh Air Force','7th-af','7th Air Force','#1d4ed8',['flag-officer'],2);
  // 11th AF
  await ins('case-cunningham-11af','Case A. Cunningham','CAC','Commander, 11th Air Force / Alaskan Command','11th-af','11th Air Force','#1d4ed8',['flag-officer'],1);
  await ins('philip-lancaster-11af','Philip D. Lancaster','PDL','Deputy Commander, 11th Air Force','11th-af','11th Air Force','#1d4ed8',[],2);
  // SOCPAC
  await ins('jeffrey-vanantwerp-socpac','Jeffrey A. VanAntwerp','JAV','Commander Special Operations Command Pacific','socpac','SOCPAC','#374151',['flag-officer'],1);
  await ins('keith-vanyo-socpac','Keith Vanyo','KV','Assistant Chief of Staff G-6, SOCPAC','socpac','SOCPAC','#374151',[],2);
  // SF Indo-Pacific
  await ins('brian-denaro-sfindopacom','Brian A. Denaro','BAD','Commander, Space Forces Indo-Pacific','sf-indopacom','Space Forces Indo-Pacific','#1e1b4b',['flag-officer'],1);
  await ins('denise-der-sfindopacom','Denise Der','DD','Acting Director S5, Space Forces Indo-Pacific','sf-indopacom','Space Forces Indo-Pacific','#1e1b4b',[],2);
  await ins('nathan-vosters-sfindopacom','Nathan Vosters','NV','Director Requirements Resources Programs S8/9, USSFINDOPACOM','sf-indopacom','Space Forces Indo-Pacific','#1e1b4b',[],3);
  // DISA Pacific
  await ins('toby-hlad-disapac','Toby Hlad','TH','Commander, DISA Pacific','disa-pac','DISA Pacific','#374151',[],1);
  await ins('bruce-morgan-disapac','Bruce A. Morgan','BAM','Deputy Commander, DISA Pacific','disa-pac','DISA Pacific','#374151',[],2);
  await ins('jon-fahsl-disapac','Jon Fahsl','JF','Chief Infrastructure & Services Division, DISA Pacific','disa-pac','DISA Pacific','#374151',[],3);
  await ins('miyi-chung-disapac','Miyi Chung','MC','Chief Plans and Programs Division, DISA Pacific','disa-pac','DISA Pacific','#374151',[],4);
  // U.S. Forces Korea
  await ins('xavier-brunson-usfk','Xavier T. Brunson','XTB','Commander U.S. Forces Korea','indopacom','U.S. Forces Korea','#374151',['flag-officer'],1);
  await ins('dave-womack-usfk','Dave Womack','DW','Chief of Staff, U.S. Forces Korea','indopacom','U.S. Forces Korea','#374151',['flag-officer'],2);
  // U.S. Forces Japan
  await ins('stephen-jost-usfj','Stephen F. Jost','SFJ','Commander, U.S. Forces Japan','indopacom','U.S. Forces Japan','#374151',['flag-officer'],1);

  // ── CENTCOM ───────────────────────────────────────────────────────────────
  await ins('brad-cooper-centcom','Brad Cooper','BC','Commander, CENTCOM','centcom','HQ CENTCOM','#374151',['flag-officer'],1);
  await ins('patrick-frank-centcom','Patrick M. Frank','PMF','Deputy Commander, U.S. Central Command','centcom','HQ CENTCOM','#374151',['flag-officer'],2);
  await ins('richard-harrison-centcom','Richard A. Harrison','RAH','Chief of Staff, CENTCOM','centcom','HQ CENTCOM','#374151',['flag-officer'],3);
  await ins('matthew-bigelow-centcom','Matthew Bigelow','MB','Executive Officer to Chief of Staff, CENTCOM','centcom','HQ CENTCOM','#374151',[],4);
  await ins('curtis-bass-centcom','Curtis R. Bass','CRB','Director Operations J3, CENTCOM','centcom','HQ CENTCOM','#374151',['flag-officer'],5);
  await ins('paul-billy-centcom','Paul J. Billy','PJB','J3 Joint Fires and Effects, CENTCOM','centcom','HQ CENTCOM','#374151',[],6);
  await ins('heather-price-centcom','Heather Price','HP','Plans Officer J-35, CENTCOM','centcom','HQ CENTCOM','#374151',[],7);
  await ins('adam-chalkley-centcom','Adam Chalkley','AC','Director Logistics J4, CENTCOM','centcom','HQ CENTCOM','#374151',['flag-officer'],8);
  await ins('carl-hennemann-centcom','Carl Hennemann','CH','J45, CENTCOM','centcom','HQ CENTCOM','#374151',[],9);
  await ins('adan-cruz-centcom','Adan G. Cruz','AGC','Director Strategy Plans and Policy J5, CENTCOM','centcom','HQ CENTCOM','#374151',['flag-officer'],10);
  await ins('paul-howard-centcom','Paul D. Howard','PDH','Director Cyber J6, CENTCOM','centcom','HQ CENTCOM','#374151',['flag-officer','tech-leader'],11);
  await ins('jon-mott-centcom','Jon K. Mott','JKM','Director Exercises and Training J7, CENTCOM','centcom','HQ CENTCOM','#374151',['flag-officer'],12);
  await ins('robert-unger-centcom','Robert Unger','RU','Director J8, CENTCOM','centcom','HQ CENTCOM','#374151',[],13);
  await ins('stephen-sapol-centcom','Stephen Sapol','SS','Analysis and Plans Division Chief, CENTCOM','centcom','HQ CENTCOM','#374151',[],14);
  await ins('joy-shanaberger-centcom','Joy Anglean Shanaberger','JAS','CENTCOM Chief Technology Officer','centcom','HQ CENTCOM','#374151',['tech-leader'],15);
  await ins('cyrus-jabbari-centcom','Cyrus Jabbari','CJ','Chief Data Officer, CENTCOM','centcom','HQ CENTCOM','#374151',['tech-leader'],16);
  await ins('nate-huston-centcom','Nate Huston','NH','Deputy CTO and Data Officer, CENTCOM','centcom','HQ CENTCOM','#374151',['tech-leader'],17);
  await ins('michelle-dryden-centcom','Michelle Dryden','MD','Director Strategic Affairs OCTO, CENTCOM','centcom','HQ CENTCOM','#374151',[],18);
  // NAVCENT
  await ins('curt-renshaw-centcom-nav','Curt A. Renshaw','CAR2','Commander NAVCENT/5th Fleet','navcent','Naval Forces Central Command','#1e3a8a',['flag-officer'],1);
  // MARCENT
  await ins('joseph-clearfield-marcent','Joseph Clearfield','JC','Commander, Marine Corps Forces Central Command','marcent','MARCENT','#8b0000',['flag-officer'],1);
  await ins('sean-dynan-marcent','Sean Dynan','SD','Chief of Staff, MARCENT','marcent','MARCENT','#8b0000',[],2);
  // AFCENT
  await ins('derek-france-afcent','Derek C. France','DCF','Commander, Ninth Air Force (Air Forces Central)','afcent','Air Forces Central Command','#1d4ed8',['flag-officer'],1);
  await ins('david-shoemaker-afcent','David G. Shoemaker','DGS','Deputy Commander 9th AF/Air Forces Central','afcent','Air Forces Central Command','#1d4ed8',['flag-officer'],2);
  await ins('claire-randolph-afcent','Claire Randolph','CR','Chief of Weapons and Tactics, AFCENT A35W','afcent','Air Forces Central Command','#1d4ed8',[],3);
  await ins('nicklaus-walker-afcent','Nicklaus Walker','NW','Commander Air Warfare Center - Central','afcent','Air Forces Central Command','#1d4ed8',[],4);
  // SOCCENT
  await ins('jasper-jeffers-soccent','Jasper Jeffers','JJ','Commander U.S. Special Operations Command Central','soccent','SOCCENT','#374151',['flag-officer'],1);
  // SF Central
  await ins('chris-putman-sfcentral','Chris Putman','CP','Commander, US Space Forces Central','sf-central','Space Forces Central','#1e1b4b',[],1);
  // DISA Central
  await ins('ivan-alvarado-disacentral','Ivan Alvarado','IA','DISA Central Commander','centcom','DISA Central Field Command','#374151',[],1);

  // ── EUCOM ─────────────────────────────────────────────────────────────────
  await ins('alexus-grynkewich-eucom','Alexus G. Grynkewich','AGG','Commander EUCOM / NATO Supreme Allied Commander Europe','eucom','HQ EUCOM','#374151',['flag-officer'],1);
  await ins('robert-fulford-eucom','Robert C. Fulford','RCF','Deputy Commander EUCOM','eucom','HQ EUCOM','#374151',['flag-officer'],2);
  await ins('samantha-rix-eucom','Samantha Rix','SR','Deputy Chief Data and AI Officer, EUCOM','eucom','HQ EUCOM','#374151',['tech-leader'],3);
  await ins('mike-adamski-eucom','Mike Adamski','MA','Director J2, EUCOM','eucom','HQ EUCOM','#374151',['flag-officer'],4);
  await ins('daniel-lasica-eucom','Daniel T. Lasica','DTL','Director of Operations J3, EUCOM','eucom','HQ EUCOM','#374151',['flag-officer'],5);
  await ins('shane-upton-eucom','Shane M. Upton','SMU','Director Logistics J-4, EUCOM','eucom','HQ EUCOM','#374151',['flag-officer'],6);
  await ins('russell-driggers-eucom','Russell D. Driggers','RDD','Director Plans Policy Strategy J5, EUCOM','eucom','HQ EUCOM','#374151',['flag-officer'],7);
  await ins('chris-mckinney-eucom','Chris McKinney','CM','J5 Deputy Director, EUCOM','eucom','HQ EUCOM','#374151',['flag-officer'],8);
  await ins('quaid-quadri-eucom','Quaid Quadri','QQ','Deputy Director J5, EUCOM','eucom','HQ EUCOM','#374151',['flag-officer'],9);
  await ins('jonathan-sirard-eucom','Jonathan Sirard','JS','Strategy Division Chief J5, EUCOM','eucom','HQ EUCOM','#374151',[],10);
  await ins('john-phillips-eucom','John H. Phillips','JHP','Director J6 Cyber/C4 IMA, EUCOM','eucom','HQ EUCOM','#374151',['flag-officer','tech-leader'],11);
  await ins('darren-friesz-eucom','Darren Friesz','DF','EUCOM J6 Chief of Staff','eucom','HQ EUCOM','#374151',[],12);
  await ins('valerie-parks-eucom','Valerie Parks','VP','Mission Partner Environment Strategy Lead J6, EUCOM','eucom','HQ EUCOM','#374151',[],13);
  await ins('sally-pfenning-eucom','Sally Pfenning','SP','Director Requirements & Resource Integration J8, EUCOM','eucom','HQ EUCOM','#374151',[],14);
  await ins('alexander-shalak-eucom','Alexander Shalak','AS','Portfolio Manager USEUCOM J8','eucom','HQ EUCOM','#374151',[],15);
  // SOCEUR
  await ins('richard-angle-soceur','Richard E. Angle','REA','Deputy Commander SOCEUR / Director Special Operations EUCOM','soceur','SOCEUR','#374151',['flag-officer'],1);
  await ins('ned-marsh-soceur','Ned Beechinor Marsh','NBM','Deputy Commanding Officer for Support, SOCEUR','soceur','SOCEUR','#374151',[],2);
  await ins('roben-alfonso-soceur','Roben E. Alfonso','REA2','Chief of Staff SOCEUR','soceur','SOCEUR','#374151',[],3);
  // USAFE
  await ins('jason-hinds-usafe','Jason T. Hinds','JTH','Commander U.S. Air Forces in Europe - Air Forces Africa','usafe','USAFE-AFAFRICA','#1d4ed8',['flag-officer'],1);
  await ins('stephen-snelson-usafe','Stephen P. Snelson','SPS','Deputy Commander, USAFE-Air Forces Africa','usafe','USAFE-AFAFRICA','#1d4ed8',['flag-officer'],2);
  await ins('chris-mcfarland-usafe','Chris McFarland','CM','Director Plans and Programs, USAFE-AFAFRICA','usafe','USAFE-AFAFRICA','#1d4ed8',['flag-officer'],3);
  await ins('matthew-bartlett-usafe','Matthew A. Bartlett','MAB','Deputy Commander, 3rd Air Force','usafe','USAFE-AFAFRICA','#1d4ed8',[],4);
  // MARFOREUR
  await ins('daniel-shipley-marforeur','Daniel Shipley','DS','Commander Marine Corps Forces Europe and Africa','marforeur','MARFOREUR','#8b0000',['flag-officer'],1);
  await ins('matthew-robbins-marforeur','Matthew B. Robbins','MBR','Deputy Commander, MARFOREUR','marforeur','MARFOREUR','#8b0000',[],2);
  await ins('richard-wilkerson-marforeur','Richard T. Wilkerson','RTW','Chief of Staff, MARFOREUR','marforeur','MARFOREUR','#8b0000',[],3);
  // USAREUR
  await ins('christopher-donahue-usareur','Christopher Donahue','CD','Commanding General, U.S. Army Europe and Africa','usareur','USAREUR-AF','#374151',['flag-officer'],1);
  await ins('charles-costanza-usareur','Charles D. Costanza','CDC','CG V Corps, USAREUR-AF','usareur','USAREUR-AF','#374151',['flag-officer'],2);
  await ins('christopher-norrie-usareur','Christopher R. Norrie','CRN','Deputy CG, USAREUR-AF','usareur','USAREUR-AF','#374151',['flag-officer'],3);
  await ins('ronald-ragin-usareur','Ronald R. Ragin','RRR','Chief of Staff, USAREUR-AF','usareur','USAREUR-AF','#374151',['flag-officer'],4);
  await ins('levon-cumpton-usareur','Levon E. Cumpton','LEC','Deputy CG Army National Guard, USAREUR-AF','usareur','USAREUR-AF','#374151',['flag-officer'],5);
  await ins('andrew-gainey-usareur','Andrew C. Gainey','ACG','Deputy CG Africa and SETAF-AF Commander','usareur','USAREUR-AF','#374151',['flag-officer'],6);
  await ins('bjorn-schulz-usareur','Bjorn F. Schulz','BFS','Deputy CG Integration (Germany), USAREUR-AF','usareur','USAREUR-AF','#374151',['flag-officer'],7);
  await ins('steven-carpenter-usareur','Steven Carpenter','SC','CG 56th Multidomain Command Europe','usareur','USAREUR-AF','#374151',['flag-officer'],8);
  await ins('andrew-cecil-usareur','Andrew Cecil','AC','Deputy CG Mobilization & Reserve Affairs, USAREUR-AF','usareur','USAREUR-AF','#374151',['flag-officer'],9);
  await ins('dena-bellack-usareur','Dena Bellack','DB','Chief Data Officer, Army Europe and Africa','usareur','USAREUR-AF','#374151',['tech-leader'],10);
  // III Armored Corps
  await ins('kevin-admiral-iiiac','Kevin D. Admiral','KDA','Commanding General III Armored Corps','iii-ac','III Armored Corps','#374151',['flag-officer'],1);
  await ins('andy-cox-iiiac','Andy Cox','AC','Deputy CG Support, III Armored Corps','iii-ac','III Armored Corps','#374151',['flag-officer'],2);
  await ins('geoff-van-epps-iiiac','Geoff Van Epps','GVE','Deputy CG Maneuver, III Armored Corps','iii-ac','III Armored Corps','#374151',['flag-officer'],3);
  await ins('thomas-feltey-1cav','Thomas Feltey','TF','Commander 1st Cavalry Division','iii-ac','1st Cavalry Division','#374151',['flag-officer'],4);
  // DISA Europe
  await ins('tilisha-lockley-disaeur','Tilisha C. Lockley','TCL','Commander, DISA Europe','disa-europe','DISA Europe','#374151',[],1);
  await ins('rodolfo-fuentes-disaeur','Rodolfo Fuentes','RF','Technical Director, DISA Europe','disa-europe','DISA Europe','#374151',[],2);

  // ── SOUTHCOM ──────────────────────────────────────────────────────────────
  await ins('frank-donovan-southcom','Frank Donovan','FD','Commander/Vice Commander SOUTHCOM','southcom','HQ SOUTHCOM','#374151',['flag-officer'],1);
  await ins('evan-pettus-southcom','Evan L. Pettus','ELP','Deputy Commander, U.S. Southern Command','southcom','HQ SOUTHCOM','#374151',['flag-officer'],2);
  await ins('stephanie-syptak-ramnath-southcom','Stephanie Syptak-Ramnath','SSR','Civilian Deputy to Commander, SOUTHCOM','southcom','HQ SOUTHCOM','#374151',['senior-civilian'],3);
  await ins('kristina-green-southcom','Kristina J. Green','KJG','Director J2, SOUTHCOM','southcom','HQ SOUTHCOM','#374151',['flag-officer'],4);
  await ins('brendan-mcpherson-southcom','Brendan C. McPherson','BCM','Deputy Commander / Coast Guard Pacific Area J3, SOUTHCOM','southcom','HQ SOUTHCOM','#374151',['flag-officer'],5);
  await ins('julian-cheater-southcom','Julian C. Cheater','JCC','Director Strategy Policy Plans J5, SOUTHCOM','southcom','HQ SOUTHCOM','#374151',['flag-officer'],6);
  await ins('carlos-braziel-southcom','Carlos Braziel','CB','Director Resources & Analysis J-8, SOUTHCOM','southcom','HQ SOUTHCOM','#374151',[],7);
  // MARFORSOUTH
  await ins('len-anderson-marforsouth','Len Anderson','LA','Commander, Marine Forces South','marforsouth','MARFORSOUTH','#8b0000',['flag-officer'],1);
  await ins('douglas-clark-marforsouth','Douglas K. Clark','DKC','Deputy Commander, Marine Forces South','marforsouth','MARFORSOUTH','#8b0000',['flag-officer'],2);
  await ins('austine-rawlins-marforsouth','Austine L. Rawlins','ALR','Chief of Staff, Marine Forces South','marforsouth','MARFORSOUTH','#8b0000',[],3);
  // SOCSOUTH
  await ins('mark-schafer-socsouth','Mark A. Schafer','MAS','Commander, Special Operations Command South','socsouth','SOCSOUTH','#374151',['flag-officer'],1);
  // AFSOUTH
  await ins('david-mineau-afsouth','David A. Mineau','DAM','Commander, Air Forces Southern','afsouth','Air Forces Southern','#1d4ed8',['flag-officer'],1);
  await ins('tara-nolan-afsouth','Tara E. Nolan','TEN','Mobilization Asst to Commander, Air Forces Southern','afsouth','Air Forces Southern','#1d4ed8',['flag-officer'],2);
  await ins('henry-jeffress-afsouth','Henry R. Jeffress III','HRJ','Deputy Commander, Air Forces Southern','afsouth','Air Forces Southern','#1d4ed8',[],3);
  // Army Western Hemisphere / USASOUTH
  await ins('joseph-ryan-usasouth','Joseph A. Ryan','JAR','CG, Army Western Hemisphere Command','usasouth','Army Western Hemisphere Command','#374151',['flag-officer'],1);
  await ins('michael-eastridge-usasouth','Michael J. Eastridge','MJE','Deputy CG, U.S. Army South','usasouth','Army Western Hemisphere Command','#374151',['flag-officer'],2);
  await ins('troy-mills-usasouth','Troy Allen Mills','TAM','Deputy Commander, U.S. Army South','usasouth','Army Western Hemisphere Command','#374151',[],3);
  await ins('osvaldo-ortiz-usasouth','Osvaldo Ortiz','OO','Chief of Staff, U.S. Army South','usasouth','Army Western Hemisphere Command','#374151',[],4);
  // JIATF South
  await ins('jeff-randall-jiatfsouth','Jeff Randall','JR','Director, Joint Interagency Task Force South','jiatf-south','JIATF South','#374151',['flag-officer'],1);
  await ins('jeffrey-jurgemeyer-jiatfsouth','Jeffrey A. Jurgemeyer','JAJ','Deputy Director, JIATF South','jiatf-south','JIATF South','#374151',['flag-officer'],2);
  await ins('matt-lesnowicz-jiatfsouth','Matt Lesnowicz','ML','Chief of Staff, JIATF South','jiatf-south','JIATF South','#374151',[],3);
  // Space Forces Southern
  await ins('brandon-alford-sfsouth','Brandon Alford','BA','Commander, Space Forces Southern','sf-southern','Space Forces Southern','#1e1b4b',[],1);

  // ── NORTHCOM ──────────────────────────────────────────────────────────────
  await ins('gregory-guillot-northcom','Gregory M. Guillot','GMG','Commander NORAD and Northern Command','northcom','HQ NORTHCOM','#374151',['flag-officer'],1);
  await ins('joseph-jarrard-northcom','Joseph F. Jarrard','JFJ','Deputy Commander NORTHCOM / Vice Commander NORAD','northcom','HQ NORTHCOM','#374151',['flag-officer'],2);
  await ins('john-meyer-northcom','John V. Meyer III','JVM','Chief of Staff, Northern Command','northcom','HQ NORTHCOM','#374151',['flag-officer'],3);
  await ins('maurizio-calabrese-northcom','Maurizio D. Calabrese','MDC','Director Intelligence J2, NORTHCOM','northcom','HQ NORTHCOM','#374151',['flag-officer'],4);
  await ins('robert-davis-northcom','Robert D. Davis','RDD','Director Operations J-3/TCJ3, NORTHCOM','northcom','HQ NORTHCOM','#374151',['flag-officer'],5);
  await ins('maxwell-cover-northcom','Maxwell Cover','MC','Chief of Operations NORAD J3','northcom','HQ NORTHCOM','#374151',[],6);
  await ins('justin-elliott-northcom','Justin Elliott','JE','Chief of Current Operations NORAD J33','northcom','HQ NORTHCOM','#374151',[],7);
  await ins('mark-siekman-northcom','Mark W. Siekman','MWS','Director for Logistics J-4, NORTHCOM','northcom','HQ NORTHCOM','#374151',['flag-officer'],8);
  await ins('gregory-newkirk-northcom','Gregory D. Newkirk','GDN','Director Strategy Policy & Plans J5, NORTHCOM','northcom','HQ NORTHCOM','#374151',[],9);
  await ins('christine-rummel-northcom','Christine V. Rummel','CVR','Director Cyberspace Operations J-6, NORTHCOM','northcom','HQ NORTHCOM','#374151',['flag-officer','tech-leader'],10);
  await ins('dennis-knoop-northcom','Dennis Knoop','DK','Integration Division Chief NORAD NORTHCOM J6','northcom','HQ NORTHCOM','#374151',[],11);
  await ins('ruth-moser-northcom','Ruth Moser','RM','Director Requirements Analysis & Resources J8, NORTHCOM','northcom','HQ NORTHCOM','#374151',[],12);
  // SOCNORTH
  await ins('matthew-tucker-socnorth','Matthew P. Tucker','MPT','Commander Special Operations Command North','socnorth','SOCNORTH','#374151',[],1);
  await ins('kevin-rowlette-socnorth','Kevin Rowlette','KR','Chief of Staff, SOCNORTH','socnorth','SOCNORTH','#374151',[],2);
  // MARFORNORTH
  await ins('roberta-shea-marfornorth','Roberta L. Shea','RLS','Commander MARFORCOM and FMFLANT','marfornorth','MARFORNORTH/FMFLANT','#8b0000',['flag-officer'],1);
  await ins('calvert-worth-marfornorth','Calvert L. Worth Jr.','CLW','Nominated Commander MARFORCOM/FMFLANT','marfornorth','MARFORNORTH/FMFLANT','#8b0000',['flag-officer'],2);
  await ins('thomas-armas-marfornorth','Thomas M. Armas','TMA','Deputy Commander MARFORCOM and FMFLANT','marfornorth','MARFORNORTH/FMFLANT','#8b0000',['flag-officer'],3);
  // 1st AF AFNORTH
  await ins('luke-ahmann-afnorth','M. Luke Ahmann','MLA','Commander 1st Air Force (AFNORTH & AFSPACE)','northcom','Air Forces Northern','#1d4ed8',['flag-officer'],1);
  // SF Northern
  await ins('robert-schreiner-sfnorth','Robert Schreiner','RS','Commander, Space Forces Northern','sf-northern','Space Forces Northern','#1e1b4b',['flag-officer'],1);

  // ── AFRICOM ───────────────────────────────────────────────────────────────
  await ins('dagvin-anderson-africom','Dagvin R.M. Anderson','DRA','Commander AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],1);
  await ins('john-brennan-africom','John W. Brennan Jr.','JWB','Deputy Commander AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],2);
  await ins('matthew-trollinger-africom','Matthew G. Trollinger','MGT','Chief of Staff AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],3);
  await ins('troy-van-zummeren-africom','Troy Van Zummeren','TVZ','Planner, Commanders Action Group USAFRICOM','africom','HQ AFRICOM','#374151',[],4);
  await ins('bryan-duncan-africom','Bryan G. Duncan','BGD','Chief Technical Advisor, USAFRICOM','africom','HQ AFRICOM','#374151',['tech-leader'],5);
  await ins('taylor-heim-africom','Taylor Heim','TH','Chief Data and AI Officer CDAO AFRICOM','africom','HQ AFRICOM','#374151',['tech-leader'],6);
  await ins('ben-snell-africom','Ben Snell','BS','Director J2, AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],7);
  await ins('justin-hoffman-africom','Justin R. Hoffman','JRH','Director Operations J3, AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],8);
  await ins('cameron-chen-africom','Cameron Chen','CC','Deputy Director Operations J3, AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],9);
  await ins('tina-boyd-africom','Tina B. Boyd','TBB','Deputy Director J3 IMA, AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],10);
  await ins('jonathan-chango-africom','Jonathan Chango','JC','JEMSO Cell Director AFRICOM','africom','HQ AFRICOM','#374151',[],11);
  await ins('george-dietrich-africom','George Dietrich III','GD','Director Logistics J4, AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],12);
  await ins('garrick-harmon-africom','Garrick M. Harmon','GMH','Director Strategy Engagement Programs J5, AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],13);
  await ins('eero-keravuori-africom','Eero R. Keravuori','ERK','Deputy Director Plans and Strategic Integration J-5, AFRICOM','africom','HQ AFRICOM','#374151',['flag-officer'],14);
  await ins('tanner-woolsey-africom','Tanner Woolsey','TW','Chief AFRICOM J5 Plans','africom','HQ AFRICOM','#374151',[],15);
  await ins('joseph-gardner-africom','Joseph Gardner','JG','J6 Director, AFRICOM','africom','HQ AFRICOM','#374151',['tech-leader'],16);
  await ins('paul-landauer-africom','Paul S. Landauer','PSL','Director Requirements Analysis Resources J8, AFRICOM','africom','HQ AFRICOM','#374151',[],17);
  await ins('jason-hinds-africom','Jason T. Hinds','JTH2','Commander Air Forces Africa / USAFE-AFAFRICA','usafe','USAFE-AFAFRICA','#1d4ed8',['flag-officer'],1);
  await ins('paul-moga-africom','Paul D. Moga','PDM','Commander, 3rd Air Force','usafe','3rd Air Force','#1d4ed8',['flag-officer'],1);
  await ins('gabriel-brown-africom','Gabriel C. Brown','GCB','Commander 406th Air Expeditionary Wing','africom','AFRICOM','#1d4ed8',[],1);
  await ins('claude-tudor-socafrica','Claude K. Tudor Jr.','CKT','Commander Special Operations Command Africa','socafrica','SOCAFRICA','#374151',['flag-officer'],1);
  await ins('christopher-miller-disaafrica','Christopher Miller','CM','Director DISA-Africa','disa-africa','DISA Africa','#374151',[],1);
  await ins('jacob-middleton-sfafrica','Jacob Middleton','JM','Commander U.S. Space Forces Africa','sf-africa','Space Forces Africa','#1e1b4b',['flag-officer'],1);

  // ── STRATCOM ──────────────────────────────────────────────────────────────
  await ins('richard-correll-stratcom','Richard Correll','RC','Commander, STRATCOM','stratcom','HQ STRATCOM','#374151',['flag-officer'],1);
  await ins('michael-lutton-stratcom','Michael J. Lutton','MJL','Deputy Commander, STRATCOM','stratcom','HQ STRATCOM','#374151',['flag-officer'],2);
  await ins('john-weidner-stratcom','John Weidner','JW','Chief of Staff, STRATCOM','stratcom','HQ STRATCOM','#374151',['flag-officer'],3);
  await ins('ryan-richardson-stratcom','Ryan E. Richardson','RER','Director J1, STRATCOM','stratcom','HQ STRATCOM','#374151',[],4);
  await ins('ralph-smith-stratcom','Ralph R. Smith','RRS','Director J2, STRATCOM','stratcom','HQ STRATCOM','#374151',['flag-officer'],5);
  await ins('john-french-stratcom','John French','JF','Director J4, STRATCOM','stratcom','HQ STRATCOM','#374151',[],6);
  await ins('thomas-buchanan-stratcom','Thomas R. Buchanan','TRB','Director J5, STRATCOM','stratcom','HQ STRATCOM','#374151',['flag-officer'],7);
  await ins('elizabeth-durham-ruiz-stratcom','Elizabeth M. Durham-Ruiz','EMD','Director J6, STRATCOM','stratcom','HQ STRATCOM','#374151',['tech-leader'],8);
  await ins('robert-taylor-stratcom','Robert J. Taylor Jr.','RJT','Director J8, STRATCOM','stratcom','HQ STRATCOM','#374151',[],9);
  await ins('amanda-kato-stratcom','Amanda G. Kato','AGK','Director NEC, STRATCOM','stratcom','HQ STRATCOM','#374151',[],10);
  await ins('stacy-furcini-stratcom','Stacy Furcini','SF','Program Manager COCOM C2, STRATCOM','stratcom','HQ STRATCOM','#374151',[],11);
  await ins('annmarie-anthony-stratcom','AnnMarie K. Anthony','AKA','Director JEC, STRATCOM','stratcom','HQ STRATCOM','#374151',['flag-officer'],12);
  // AFGSC
  await ins('stephen-davis-afgsc','Stephen L. Davis','SLD','Commander AFGSC / Deputy Commander Air Forces Strategic','afgsc','Air Force Global Strike Command','#1d4ed8',['flag-officer'],1);
  await ins('jason-armagost-afgsc','Jason R. Armagost','JRA','Deputy Commander AFGSC','afgsc','Air Force Global Strike Command','#1d4ed8',['flag-officer'],2);
  await ins('donna-senft-afgsc','Donna Cowell Senft','DCS','AFGSC Chief Scientist','afgsc','Air Force Global Strike Command','#1d4ed8',['r&d'],3);
  await ins('william-weiford-afgsc','William Weiford','WW','STRIKEWERX Deputy Director','afgsc','Air Force Global Strike Command','#1d4ed8',[],4);
  await ins('ty-neuman-afgsc','Ty W. Neuman','TWN','Commander 8th Air Force','afgsc','Air Force Global Strike Command','#1d4ed8',['flag-officer'],5);
  await ins('stacey-huser-afgsc','Stacey J. Huser','SJH','Commander, 20th Air Force','afgsc','Air Force Global Strike Command','#1d4ed8',['flag-officer'],6);
  await ins('karl-thomas-stratcom','Karl Thomas','KT','Commander Joint Force Maritime Component Command','stratcom','HQ STRATCOM','#374151',['flag-officer'],13);

  // ── SPACECOM ──────────────────────────────────────────────────────────────
  await ins('stephen-whiting-spacecom','Stephen N. Whiting','SNW','Commander, U.S. Space Command','spacecom','HQ SPACECOM','#374151',['flag-officer'],1);
  await ins('thomas-james-spacecom','Thomas L. James','TLJ','Deputy Commander, SPACECOM','spacecom','HQ SPACECOM','#374151',['flag-officer'],2);
  await ins('sean-day-spacecom','Sean N. Day','SND','Mobilization Asst to Deputy Commander, SPACECOM','spacecom','HQ SPACECOM','#374151',['flag-officer'],3);
  await ins('sean-bailey-spacecom','Sean R. Bailey','SRB','Chief of Staff, SPACECOM','spacecom','HQ SPACECOM','#374151',['flag-officer'],4);
  await ins('scott-anderson-spacecom','Scott M. Anderson','SMA','Executive Director, SPACECOM','spacecom','HQ SPACECOM','#374151',[],5);
  await ins('david-stenglein-spacecom','David Stenglein','DS','Deputy Director Human Capital J1, SPACECOM','spacecom','HQ SPACECOM','#374151',[],6);
  await ins('nathan-rusin-spacecom','Nathan Rusin','NR','Director Intelligence J2, SPACECOM','spacecom','HQ SPACECOM','#374151',['flag-officer'],7);
  await ins('anthony-mastalir-spacecom','Anthony J. Mastalir','AJM','Director Global Space Operations J3, SPACECOM','spacecom','HQ SPACECOM','#374151',['flag-officer'],8);
  await ins('jay-barnard-spacecom','Jay Barnard','JB','J4 Director, SPACECOM','spacecom','HQ SPACECOM','#374151',[],9);
  await ins('brian-gibson-spacecom','Brian Gibson','BG','Director Plans and Policy J-5, SPACECOM','spacecom','HQ SPACECOM','#374151',['flag-officer'],10);
  await ins('richard-yu-spacecom','Richard Yu','RY','J-6 Director and CIO, SPACECOM','spacecom','HQ SPACECOM','#374151',['tech-leader'],11);
  await ins('thomas-lockhart-spacecom','Thomas A. Lockhart Jr.','TAL','J-8 Director, SPACECOM','spacecom','HQ SPACECOM','#374151',[],12);
  // SF Space (S4S)
  await ins('dennis-bythewood-s4s','Dennis Bythewood','DB','Commander, U.S. Space Forces Space (S4S)','sf-space-s4s','Space Forces Space','#1e1b4b',['flag-officer'],1);
  await ins('nathaniel-peace-s4s','Nathaniel Peace','NP','Director S4S/S2, U.S. Space Forces','sf-space-s4s','Space Forces Space','#1e1b4b',[],2);

  // ── TRANSCOM ──────────────────────────────────────────────────────────────
  await ins('randall-reed-transcom','Randall Reed','RR','Commander TRANSCOM','transcom','HQ TRANSCOM','#374151',['flag-officer'],1);
  await ins('jered-helwig-transcom','Jered P. Helwig','JPH','Deputy Commander TRANSCOM','transcom','HQ TRANSCOM','#374151',['flag-officer'],2);
  await ins('kristin-acquavella-transcom','Kristin Acquavella','KA','Chief of Staff, U.S. Transportation Command','transcom','HQ TRANSCOM','#374151',['flag-officer'],3);
  await ins('markus-rogers-transcom','Markus Rogers','MR','Chief Data Officer, U.S. Transportation Command','transcom','HQ TRANSCOM','#374151',['tech-leader'],4);
  await ins('will-cooper-transcom','Will Cooper','WC','Director J1, TRANSCOM','transcom','HQ TRANSCOM','#374151',[],5);
  await ins('tim-raymie-transcom','Tim Raymie','TR','Director J2, TRANSCOM','transcom','HQ TRANSCOM','#374151',[],6);
  await ins('christopher-stone-transcom','Christopher D. Stone','CDS','Director J5, TRANSCOM','transcom','HQ TRANSCOM','#374151',['flag-officer'],7);
  await ins('mark-cyr-transcom','Mark Cyr','MC','Deputy Director Strategic Plans Policy Logistics, TRANSCOM','transcom','HQ TRANSCOM','#374151',[],8);
  await ins('michael-mcfeeters-transcom','Michael McFeeters','MM','Director J6, TRANSCOM','transcom','HQ TRANSCOM','#374151',['tech-leader'],9);
  await ins('patrick-grimsley-transcom','Patrick Grimsley','PG','Executive Director J6 and Deputy CIO, TRANSCOM','transcom','HQ TRANSCOM','#374151',['tech-leader'],10);
  await ins('james-mcginley-transcom','James McGinley','JM','Director Program Analysis Financial Management J8, TRANSCOM','transcom','HQ TRANSCOM','#374151',[],11);
  // JECC
  await ins('michael-mcwilliams-jecc','Michael E. McWilliams','MEM','Commander JECC, TRANSCOM','jecc','JECC','#374151',['flag-officer'],1);
  await ins('christopher-zidek-jecc','Christopher M. Zidek','CMZ','Deputy Commander JECC','jecc','JECC','#374151',['flag-officer'],2);
  await ins('marshall-ramsey-jecc','Marshall Ramsey','MR','Executive Director JECC','jecc','JECC','#374151',[],3);
  await ins('kyle-yates-jecc','Kyle R. Yates','KRY','Commander Joint Communications Support Element','jecc','JECC','#374151',[],4);
  await ins('evan-parr-jecc','Evan C. Parr','ECP','Commander Joint Planning Support Element','jecc','JECC','#374151',[],5);
  // AMC
  await ins('daniel-tulley-amc','Daniel H. Tulley','DHT','Nominated Head of Air Mobility Command','amc-af','Air Mobility Command','#1d4ed8',['flag-officer'],1);
  await ins('rebecca-sonkiss-amc','Rebecca J. Sonkiss','RJS','Deputy Commander, Air Mobility Command','amc-af','Air Mobility Command','#1d4ed8',['flag-officer'],2);

  // ── CYBERCOM ──────────────────────────────────────────────────────────────
  await ins('joshua-rudd-cybercom','Joshua M. Rudd','JMR','Commander, CYBERCOM and NSA','cybercom','HQ CYBERCOM','#374151',['flag-officer'],1);
  await ins('lorna-mahlock-cybercom','Lorna M. Mahlock','LMM','Deputy Commander, U.S. Cyber Command','cybercom','HQ CYBERCOM','#374151',['flag-officer'],2);
  await ins('dennis-velez-cybercom','Dennis Velez','DV','Acting Deputy Commander, CYBERCOM','cybercom','HQ CYBERCOM','#374151',['flag-officer'],3);
  await ins('patrick-ware-cybercom','Patrick Ware','PW','Executive Director, CYBERCOM','cybercom','HQ CYBERCOM','#374151',[],4);
  await ins('kevin-lenox-cybercom','Kevin P. Lenox','KPL','Acting Chief of Staff, USCYBERCOM','cybercom','HQ CYBERCOM','#374151',['flag-officer'],5);
  await ins('kayle-stevens-cybercom','Kayle M. Stevens','KMS','Director Intelligence J-2, CYBERCOM','cybercom','HQ CYBERCOM','#374151',['flag-officer'],6);
  await ins('ronald-foy-cybercom','Ronald A. Foy','RAF','Director Operations J3, CYBERCOM','cybercom','HQ CYBERCOM','#374151',['flag-officer'],7);
  await ins('brian-vile-cybercom','Brian D. Vile','BDV','Deputy Director Future Operations J-3, CYBERCOM','cybercom','HQ CYBERCOM','#374151',['flag-officer'],8);
  await ins('john-popiak-cybercom','John F. Popiak','JFP','Deputy Commander Operations, CYBERCOM','cybercom','HQ CYBERCOM','#374151',['flag-officer'],9);
  await ins('tim-turner-cybercom','Tim Turner','TT','Director Communications and CIO J6, CYBERCOM','cybercom','HQ CYBERCOM','#374151',['tech-leader'],10);
  await ins('kenneth-burgess-cybercom','Kenneth J. Burgess','KJB','Director Capability & Resource Integration J-8, CYBERCOM','cybercom','HQ CYBERCOM','#374151',['flag-officer'],11);
  // DCDC
  await ins('paul-stanton-dcdc','Paul T. Stanton','PTS','Commander/Director DCDC/DISA','dcdc','DoD Cyber Defense Command','#374151',['flag-officer'],1);
  await ins('ivory-carter-dcdc','Ivory D. Carter','IDC','Deputy Commander, DCDC','dcdc','DoD Cyber Defense Command','#374151',['flag-officer'],2);
  await ins('wendell-foster-dcdc','Wendell Foster','WF','Executive Director, DCDC','dcdc','DoD Cyber Defense Command','#374151',[],3);
  await ins('nadine-nally-dcdc','Nadine Nally','NN','Director of Operations Cyber National Mission Force','dcdc','DoD Cyber Defense Command','#374151',[],4);
  // 16th AF AFCYBER
  await ins('thomas-hensley-afcyber','Thomas K. Hensley','TKH','Commander 16th Air Force (Air Forces Cyber)','afcyber','16th Air Force (AF Cyber)','#1d4ed8',['flag-officer'],1);
  await ins('heather-blackwell-afcyber','Heather W. Blackwell','HWB','Deputy Commander JFHQ-C Air Forces Cyber','afcyber','16th Air Force (AF Cyber)','#1d4ed8',['flag-officer'],2);
  // Army Cyber
  await ins('christopher-eubank-arcyber','Christopher Eubank','CE','Commanding General Army Cyber Command','arcyber','Army Cyber Command','#374151',['flag-officer'],1);
  await ins('matthew-lennox-arcyber','Matthew J. Lennox','MJL','Deputy CG, Army Cyber Command','arcyber','Army Cyber Command','#374151',['flag-officer'],2);
  await ins('steven-rehn-arcyber','Steven D. Rehn','SDR','Deputy to CG / Chief Data Officer, ARCYBER','arcyber','Army Cyber Command','#374151',['tech-leader'],3);
  await ins('joseph-munger-arcyber','Joseph Munger','JM','Chief of Staff, U.S. Army Cyber Command','arcyber','Army Cyber Command','#374151',[],4);
  // MARFORCYBER
  await ins('joseph-matos-marforcyber','Joseph A. Matos III','JAM','Commanding General, MARFORCYBER','marforcyber','Marine Corps Forces Cyberspace Command','#8b0000',['flag-officer'],1);
  await ins('russell-meade-marforcyber','Russell Meade','RM','Executive Director MARFORCYBER','marforcyber','Marine Corps Forces Cyberspace Command','#8b0000',[],2);
  await ins('shery-thomas-marforcyber','Shery Thomas','ST','Chief Technology Officer, MARFORCYBER','marforcyber','Marine Corps Forces Cyberspace Command','#8b0000',['tech-leader'],3);

  // ── DEPARTMENT OF ENERGY ──────────────────────────────────────────────────
  await ins('chris-wright-doe','Chris Wright','CW','Secretary of Energy','doe','Department of Energy','#065f46',['senior-civilian'],1);
  await ins('james-danly-doe','James Danly','JD','Deputy Secretary of Energy','doe','Department of Energy','#065f46',['senior-civilian'],2);
  await ins('tina-pierce-doe','Tina Pierce','TP','Chief Financial Officer, Dept of Energy','doe','Department of Energy','#065f46',[],3);
  await ins('dawn-zimmer-doe','Dawn Zimmer','DZ','Chief Information Officer, DOE','doe','Department of Energy','#065f46',['tech-leader'],4);
  await ins('jay-tilden-doe','Jay A. Tilden','JAT','Director Office of Intelligence and Counterintelligence, DOE','doe','Department of Energy','#065f46',[],5);
  await ins('tommy-joyce-doe','Tommy Joyce','TJ','Acting Asst Secretary International Affairs, DOE','doe','Department of Energy','#065f46',[],6);
  await ins('kyle-haustveit-doe','Kyle Haustveit','KH','Under Secretary for Fossil Energy, DOE','doe','Department of Energy','#065f46',['senior-civilian'],7);
  await ins('dario-gil-doe','Dario Gil','DG','Under Secretary for Science, DOE','doe','Department of Energy','#065f46',['senior-civilian'],8);
  await ins('audrey-robertson-doe','Audrey Robertson','AR','Assistant Secretary, DOE CMEI','doe-cmei','DOE CMEI','#065f46',['senior-civilian'],1);
  await ins('timothy-walsh-doe','Timothy John Walsh','TJW','Assistant Secretary Environmental Management, DOE','doe-em','DOE Environmental Management','#065f46',['senior-civilian'],1);
  // ARPA-E
  await ins('conner-prochaska-arpae','Conner Prochaska','CP','Director, ARPA-E','arpa-e','ARPA-E','#065f46',[],1);
  await ins('spencer-silverman-arpae','Spencer Silverman','SS','Chief of Staff, ARPA-E','arpa-e','ARPA-E','#065f46',[],2);
  await ins('daniel-cunningham-arpae','Daniel Cunningham','DC','Deputy Director Technology, ARPA-E','arpa-e','ARPA-E','#065f46',['r&d'],3);
  await ins('luis-ortiz-arpae','Luis Ortiz','LO','Deputy Director Commercialization, ARPA-E','arpa-e','ARPA-E','#065f46',[],4);
  await ins('hai-duong-arpae','Hai Duong','HD','Associate Director for Finance, ARPA-E','arpa-e','ARPA-E','#065f46',[],5);
  // NNSA
  await ins('brandon-williams-nnsa','Brandon M. Williams','BMW','Under Secretary for Nuclear Security and Administrator, NNSA','nnsa','NNSA','#065f46',['senior-civilian'],1);
  await ins('scott-pappano-nnsa','Scott Pappano','SP','Principal Deputy Administrator, NNSA','nnsa','NNSA','#065f46',[],2);
  await ins('james-mcconnell-nnsa','James McConnell','JM','Associate Principal Deputy Administrator, NNSA','nnsa','NNSA','#065f46',[],3);
  await ins('chris-moran-nnsa','Chris Moran','CM','Associate Administrator External Affairs, NNSA','nnsa','NNSA','#065f46',[],4);
  await ins('matthew-napoli-nnsa','Matthew Napoli','MN','Deputy Administrator Defense Nuclear Nonproliferation, NNSA','nnsa','NNSA','#065f46',[],5);
  await ins('william-houston-nnsa','William J. Houston','WJH','Deputy Administrator for Naval Reactors, NNSA','nnsa','NNSA','#065f46',['flag-officer'],6);
  await ins('wendin-smith-nnsa','Wendin D. Smith','WDS','Associate Administrator Counterterrorism/Counterproliferation, NNSA','nnsa','NNSA','#065f46',[],7);
  await ins('lewis-monroe-nnsa','Lewis Monroe III','LM','Associate Administrator Defense Nuclear Security, NNSA','nnsa','NNSA','#065f46',[],8);
  await ins('nicole-nelson-jean-nnsa','Nicole Nelson-Jean','NNJ','Associate Administrator Infrastructure, NNSA','nnsa','NNSA','#065f46',[],9);
  await ins('james-wolff-nnsa','James Wolff','JW','Associate Administrator CIO, NNSA','nnsa','NNSA','#065f46',['tech-leader'],10);
  // DOE EIA
  await ins('tristan-abbey-eia','Tristan Abbey','TA','Administrator, Energy Information Administration','doe-eia','DOE EIA','#065f46',[],1);
  await ins('angelina-larose-eia','Angelina LaRose','AL','Deputy Administrator, EIA','doe-eia','DOE EIA','#065f46',[],2);
  // DOE OE
  await ins('catherine-jereza-doe','Catherine Jereza','CJ','Assistant Secretary, Office of Electricity','doe-oe','DOE Office of Electricity','#065f46',['senior-civilian'],1);
  await ins('gilbert-bindewald-doe','Gilbert Bindewald III','GB','Principal Deputy Asst Secretary, Office of Electricity','doe-oe','DOE Office of Electricity','#065f46',[],2);
  await ins('michael-pesin-doe','Michael Pesin','MP','Deputy Asst Secretary Grid Systems and Components','doe-oe','DOE Office of Electricity','#065f46',[],3);
  // DOE Nuclear Energy
  await ins('ted-garrish-doe','Ted Garrish','TG','Assistant Secretary for Nuclear Energy, DOE','doe-ne','DOE Office of Nuclear Energy','#065f46',['senior-civilian'],1);
  await ins('michael-goff-doe','Michael Goff','MG','Principal Deputy Asst Secretary, Nuclear Energy','doe-ne','DOE Office of Nuclear Energy','#065f46',[],2);
  await ins('rian-bahran-doe','Rian Bahran','RB','Deputy Asst Secretary Nuclear Reactors, DOE','doe-ne','DOE Office of Nuclear Energy','#065f46',[],3);
  // DOE OTC
  await ins('anthony-pugliese-doe-otc','Anthony Pugliese','AP','Director & Chief Commercialization Officer, DOE OTC','doe-otc','DOE Office of Technology Commercialization','#065f46',[],1);
  await ins('marcos-gonzales-doe-otc','Marcos Gonzales Harsha','MGH','Principal Deputy Director, DOE OTC','doe-otc','DOE Office of Technology Commercialization','#065f46',[],2);
  // DOE OSBP
  await ins('charles-smith-doe-osbp','Charles Smith','CS','Director, DOE Office of Small Business Programs','doe-osbp','DOE OSBP','#065f46',[],1);
  await ins('tamara-miles-doe-osbp','Tamara L. Miles','TLM','Principal Deputy Director, DOE OSBP','doe-osbp','DOE OSBP','#065f46',[],2);
  // DOE EDF
  await ins('greg-beard-doe-edf','Greg Beard','GB','Senior Advisor, DOE EDF','doe-edf','DOE EDF','#065f46',[],1);
  await ins('phil-kangas-doe-edf','Phil Kangas','PK','Acting Deputy Director, DOE EDF','doe-edf','DOE EDF','#065f46',[],2);

  // ── DEPARTMENT OF COMMERCE ────────────────────────────────────────────────
  await ins('howard-lutnick-commerce','Howard Lutnick','HL','Secretary of Commerce','commerce','Department of Commerce','#065f46',['senior-civilian'],1);
  await ins('paul-dabbar-commerce','Paul M. Dabbar','PMD','Deputy Secretary of Commerce','commerce','Department of Commerce','#065f46',['senior-civilian'],2);
  await ins('william-kimmit-commerce','William Kimmit','WK','Under Secretary of Commerce for International Trade','commerce','Department of Commerce','#065f46',['senior-civilian'],3);
  await ins('arielle-roth-commerce','Arielle Roth','AR','Asst Secretary Communications and Information Administrator','commerce','Department of Commerce','#065f46',['senior-civilian'],4);
  await ins('brian-epley-commerce','Brian Epley','BE','Chief Information Officer, Commerce','commerce','Department of Commerce','#065f46',['tech-leader'],5);
  await ins('ryan-higgins-commerce','Ryan A. Higgins','RAH','Deputy CIO and CISO, Commerce','commerce','Department of Commerce','#065f46',['tech-leader'],6);
  await ins('matt-passos-commerce','Matt Passos','MP','Acting CTO, Dept. of Commerce','commerce','Department of Commerce','#065f46',['tech-leader'],7);
  // BIS
  await ins('jeffrey-kessler-bis','Jeffrey Kessler','JK','Under Secretary for Industry and Security, BIS','bis','Bureau of Industry and Security','#065f46',['senior-civilian'],1);
  await ins('joe-bartlett-bis','Joe Bartlett','JB','Deputy Under Secretary, BIS','bis','Bureau of Industry and Security','#065f46',[],2);
  await ins('kevin-coyne-bis','Kevin Coyne','KC','Acting CIO; Director Office of Technology Evaluation, BIS','bis','Bureau of Industry and Security','#065f46',['tech-leader'],3);
  await ins('robert-burkett-bis','Robert Burkett','RB','Chief of Staff, BIS','bis','Bureau of Industry and Security','#065f46',[],4);
  await ins('anna-bruse-bis','Anna Bruse','AB','Director Office of Nonproliferation and Foreign Policy Controls, BIS','bis','Bureau of Industry and Security','#065f46',[],5);
  await ins('sarah-rodjom-bis','Sarah Rodjom','SR','Director Office of National Security Controls, BIS','bis','Bureau of Industry and Security','#065f46',[],6);
  await ins('katherine-reid-bis','Katherine Reid','KR','Director Office of Strategic Industries and Economic Security, BIS','bis','Bureau of Industry and Security','#065f46',[],7);
  await ins('stephen-astle-bis','Stephen Astle','SA','Director Defense Industrial Base Division, BIS','bis','Bureau of Industry and Security','#065f46',[],8);
  await ins('tara-gonzalez-bis','Tara Gonzalez','TG','Director Emerging Technology Division, BIS','bis','Bureau of Industry and Security','#065f46',[],9);
  await ins('deniz-muslu-bis','Deniz Muslu','DM','Director Office of Enforcement Analysis, BIS','bis','Bureau of Industry and Security','#065f46',[],10);
  await ins('david-peters-bis','David Peters','DP','Assistant Secretary for Export Enforcement, BIS','bis','Bureau of Industry and Security','#065f46',['senior-civilian'],11);
  await ins('carmen-quesenberry-bis','Carmen Quesenberry','CQ','Chair End-User Review Committee, BIS','bis','Bureau of Industry and Security','#065f46',[],12);
  // NOAA
  await ins('neil-jacobs-noaa','Neil Jacobs','NJ','NOAA Administrator / Under Secretary Commerce for Oceans','noaa','NOAA','#065f46',['senior-civilian'],1);
  await ins('laura-grimm-noaa','Laura Grimm','LG','Deputy Under Secretary / Acting Chief of Staff, NOAA','noaa','NOAA','#065f46',[],2);
  await ins('timothy-petty-noaa','Timothy R. Petty','TRP','Deputy NOAA Administrator','noaa','NOAA','#065f46',['senior-civilian'],3);
  await ins('taylor-jordan-noaa','Taylor Jordan','TJ','Asst Secretary Environmental Observation and Prediction / Space Commerce','noaa','NOAA','#065f46',['senior-civilian'],4);
  await ins('annie-hawkins-noaa','Annie Hawkins','AH','Chief of Strategy, NOAA','noaa','NOAA','#065f46',[],5);
  await ins('erik-noble-noaa','Erik Noble','EN','Principal Deputy Asst Secretary Oceans and Atmosphere, NOAA','noaa','NOAA','#065f46',[],6);
  await ins('juan-caro-noaa','Juan Caro','JC','Deputy Asst Secretary International and Space Affairs, NOAA','noaa','NOAA','#065f46',[],7);
  // NOAA Office of Space Commerce
  await ins('janice-starzyk-noaa-space','Janice Starzyk','JS','Deputy Director, Office of Space Commerce NOAA','noaa-space','NOAA Office of Space Commerce','#065f46',[],1);
  await ins('mariel-borowitz-noaa-space','Mariel Borowitz','MB','Head of International SSA Engagement, NOAA Space Commerce','noaa-space','NOAA Office of Space Commerce','#065f46',[],2);
  // ITA
  await ins('william-kimmit-ita','William Kimmit','WK2','Under Secretary for International Trade','ita','International Trade Administration','#065f46',['senior-civilian'],1);
  await ins('brandon-remington-ita','Brandon Remington','BR','Deputy Under Secretary Policy, ITA','ita','International Trade Administration','#065f46',[],2);
  await ins('diane-farrell-ita','Diane Farrell','DF','Deputy Under Secretary for International Trade, ITA','ita','International Trade Administration','#065f46',[],3);
  // BEA
  await ins('vipin-arora-bea','Vipin Arora','VA','Director Bureau of Economic Analysis','bea','Bureau of Economic Analysis','#065f46',[],1);
  await ins('patricia-abaroa-bea','Patricia Abaroa','PA','Deputy Director, BEA','bea','Bureau of Economic Analysis','#065f46',[],2);
  await ins('param-soni-bea','Param Soni','PS','Chief Information Officer, BEA','bea','Bureau of Economic Analysis','#065f46',['tech-leader'],3);
  await ins('anna-libkhen-bea','Anna Libkhen','AL','Acting CISO, BEA Dept. of Commerce','bea','Bureau of Economic Analysis','#065f46',['tech-leader'],4);
  // NIST
  await ins('arvind-raman-nist','Arvind Raman','AR','Under Secretary Commerce for Standards / NIST Director','nist','NIST','#065f46',['senior-civilian'],1);
  await ins('craig-burkhardt-nist','Craig Burkhardt','CB','Deputy Under Secretary Standards / Deputy Director NIST','nist','NIST','#065f46',[],2);
  await ins('shyam-sunder-nist','S. Shyam Sunder','SSS','Associate Director Laboratory Programs, NIST','nist','NIST','#065f46',['r&d'],3);
  await ins('jason-boehm-nist','Jason Boehm','JB','NIST Chief of Staff','nist','NIST','#065f46',[],4);
  await ins('bethany-loftin-nist','Bethany Loftin','BL','Director Technology Partnerships Office, NIST','nist','NIST','#065f46',[],5);
  await ins('cherilyn-pascoe-nist','Cherilyn Pascoe','CP','Director National Cybersecurity Center of Excellence, NIST','nist','NIST','#065f46',['tech-leader'],6);
  await ins('kevin-stine-nist','Kevin Stine','KS','Director Information Technology Laboratory, NIST','nist','NIST','#065f46',['tech-leader'],7);
  await ins('kathryn-beers-nist','Kathryn Beers','KB','Director Material Measurement Laboratory, NIST','nist','NIST','#065f46',['r&d'],8);
  await ins('james-kushmerick-nist','James G. Kushmerick','JGK','Director Physical Measurement Laboratory, NIST','nist','NIST','#065f46',['r&d'],9);
  await ins('joannie-chin-nist','Joannie Chin','JC','Director Engineering Laboratory, NIST','nist','NIST','#065f46',['r&d'],10);
  await ins('mike-molnar-nist','Mike Molnar','MM','Director Office of Advanced Manufacturing, NIST','nist','NIST','#065f46',[],11);

  return Response.json({ seeded: n, errors: errs });
};

export const config = { path: '/api/seed-pdf-remaining' };
