import { getDatabase } from '@netlify/database';
export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('token') !== Netlify.env.get('SAM_SYNC_TOKEN')) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDatabase();
  let n = 0; const errs = [];

  // ── NEW ORGS ──────────────────────────────────────────────────────────────
  const orgs = [
    ['osa','Army Secretariat','Army','Army HQ','Secretary of the Army','Pentagon, VA','Office of the Secretary of the Army'],
    ['army-usasmdc','USASMDC','Army','Army HQ','Space and Missile Defense','Redstone Arsenal, AL','Army Space and Missile Defense Command'],
    ['army-t2com','T2COM','Army','Army Training','T2COM','Fort Eustis, VA','Army Transformation and Training Command'],
    ['army-hrc','HRC','Army','Army HR','Human Resources Command','Fort Knox, KY','Army Human Resources Command'],
    ['army-fcc','FCC','Army','Army Training','Futures and Concepts Command','Fort Eustis, VA','Army Futures and Concepts Command'],
    ['army-pit','Army PIT','Army','Army Acquisition','Pathway for Innovation and Technology','Pentagon, VA','Army Pathway for Innovation and Technology'],
    ['army-es2','CPE ES2','Army','Army Acquisition','Enterprise Software and Service','Fort Sam Houston, TX','Army CPE Enterprise Software and Service'],
    ['army-cio','Army CIO','Army','Army HQ','Army CIO','Pentagon, VA','Office of the Army Chief Information Officer'],
    ['army-ie-e','ASA IE&E','Army','Army HQ','Installations Energy Environment','Pentagon, VA','Asst Secretary of the Army Installations Energy Environment'],
    ['army-ng','Army NG','Army','Army HQ','National Guard Bureau','Arlington, VA','Army National Guard Bureau'],
    ['army-usace','USACE','Army','Army Engineers','Corps of Engineers','Washington, DC','Army Corps of Engineers'],
    ['army-cac','CAC','Army','Army Training','Combined Arms Command','Fort Leavenworth, KS','Army Combined Arms Command'],
    ['army-mrdc','MRDC','Army','Army R&D','Medical R&D','Fort Detrick, MD','Army Medical Research and Development Command'],
    ['army-aal','Army AAL','Army','Army Innovation','Army Application Lab','Austin, TX','Army Application Lab'],
    ['osw-dote','DOT&E','DoW HQ','OSD','Director Operational Test & Evaluation','Pentagon, VA','Director of Operational Test and Evaluation'],
    ['osw-p','USD(P)','DoW HQ','OSD','Under Secretary for Policy','Pentagon, VA','Office of the Under Secretary of War for Policy'],
    ['osw-is','USD(I&S)','DoW HQ','OSD','Under Secretary Intelligence & Security','Pentagon, VA','Office of the Under Secretary of War for Intelligence and Security'],
    ['osw-dam','DA&M','DoW HQ','OSD','Director Administration and Management','Pentagon, VA','Office of the Director of Administration and Management'],
  ];
  for (const [id,sub,branch,major,subtier,loc,description] of orgs) {
    try { await db.sql`INSERT INTO orgs (id,sub,branch,major,subtier,loc,description) VALUES (${id},${sub},${branch},${major},${subtier},${loc},${description}) ON CONFLICT (id) DO UPDATE SET sub=EXCLUDED.sub,branch=EXCLUDED.branch,major=EXCLUDED.major,subtier=EXCLUDED.subtier,loc=EXCLUDED.loc,description=EXCLUDED.description`; } catch(e) { errs.push('org:'+id+' '+e.message.slice(0,80)); }
  }

  // ── OSW: DOT&E ────────────────────────────────────────────────────────────
  const c = async (id,name,initials,title,org_id,org_full,color,tags,ho) => {
    try { await db.sql`INSERT INTO contacts (id,name,initials,title,org_id,org_full,color,tags,opps,hierarchy_order) VALUES (${id},${name},${initials},${title},${org_id},${org_full},${color},${tags},0,${ho}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,title=EXCLUDED.title,org_id=EXCLUDED.org_id,org_full=EXCLUDED.org_full,color=EXCLUDED.color,tags=EXCLUDED.tags,hierarchy_order=EXCLUDED.hierarchy_order`; n++; } catch(e) { errs.push(e.message.slice(0,120)); }
  };

  await c('amy-henninger-osw-dote','Ms. Amy Henninger','AH','Director, Operational Test and Evaluation (DOT&E)','osw-dote','Director of Operational Test and Evaluation','#1e40af',['senior-civilian'],1);
  await c('john-h-pearson-osw-dote','Mr. John H. Pearson','JHP','Deputy Director, DOT&E, Air Warfare','osw-dote','Director of Operational Test and Evaluation','#374151',['senior-civilian'],2);
  await c('lisa-e-perez-osw-dote','Ms. Lisa E. Perez','LEP','Deputy Director, DOT&E, Cyber Assessment Program','osw-dote','Director of Operational Test and Evaluation','#374151',['senior-civilian','tech-leader'],3);
  await c('randall-s-verde-osw-dote','COL Randall S. Verde','RSV','Deputy Director, DOT&E, Land and Expeditionary Warfare','osw-dote','Director of Operational Test and Evaluation','#065f46',['flag-officer'],4);
  await c('russell-e-kupferer-osw-dote','Mr. Russell E. Kupferer','REK','Deputy Director, DOT&E, Naval Warfare','osw-dote','Director of Operational Test and Evaluation','#374151',['senior-civilian'],5);
  await c('kevin-g-westburg-osw-dote','Mr. Kevin G. Westburg','KGW','Deputy Director, DOT&E, Space and Strategic Warfare','osw-dote','Director of Operational Test and Evaluation','#374151',['senior-civilian'],6);
  await c('daria-stafford-osw-dote','Ms. Daria Stafford','DS','Technical Director, DOT&E','osw-dote','Director of Operational Test and Evaluation','#374151',['senior-civilian','tech-leader'],7);

  // ── OSW(P): Under Secretary for Policy ───────────────────────────────────
  await c('elbridge-colby-osw-p','HON Elbridge Colby','EC','Under Secretary of War for Policy','osw-p','Office of the Under Secretary of War for Policy','#1e40af',['senior-civilian'],1);
  await c('austin-dahmer-osw-p','Austin Dahmer','AD','Performing the Duties of Deputy Under Secretary of War for Policy','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],2);
  await c('alexander-velez-green-osw-p','Alexander Velez-Green','AVG','Deputy, Under Secretary for Policy / Senior Advisor','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],3);
  await c('john-kreul-osw-p','John Kreul','JK','Chief Operating Officer, Policy','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],4);
  await c('christel-fonzo-eberhard-osw-p','Christel Fonzo-Eberhard','CFE','Deputy Chief Operating Officer, Policy','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],5);
  await c('robyn-w-klein-osw-p','Robyn W. Klein','RWK','Executive Director, DoD Emerging Threats Cross-Functional Team','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],6);
  await c('katherine-sutton-osw-p','Katherine Sutton','KS','Assistant Secretary of Defense for Cyber Policy','osw-p','Office of the Under Secretary of War for Policy','#0e7490',['senior-civilian','tech-leader'],7);
  await c('paul-lyons-osw-p','Dr. Paul Lyons','PL','Principal Deputy Assistant Secretary of War for Cyber Policy','osw-p','Office of the Under Secretary of War for Policy','#0e7490',['senior-civilian','tech-leader'],8);
  await c('joseph-humire-osw-p','Joseph Humire','JH','Acting Assistant Secretary of War, Homeland Defense & Americas Security Affairs','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],9);
  await c('mark-roosevelt-ditlevson-osw-p','Mark Roosevelt Ditlevson','MRD','Principal Deputy Assistant Secretary of War, Homeland Defense & Hemispheric Affairs','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],10);
  await c('andrew-winternitz-osw-p','Andrew Winternitz','AW','Principal Director for Defense Continuity and Mission Assurance','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],11);
  await c('john-noh-osw-p','HON John Noh','JN','Assistant Secretary of War for Indo-Pacific Security Affairs','osw-p','Office of the Under Secretary of War for Policy','#1e40af',['senior-civilian'],12);
  await c('jedidiah-royal-osw-p','Jedidiah Royal','JR','Acting Assistant Secretary of War for Indo-Pacific Security Affairs','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],13);
  await c('alvaro-smith-osw-p','Alvaro Smith','AS','DASD China, Taiwan, and Mongolia','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],14);
  await c('lori-durham-abele-osw-p','Lori Durham Abele','LDA','Acting Deputy Assistant Secretary of War for South and Southeast Asia','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],15);
  await c('daniel-zimmerman-osw-p','HON Daniel Zimmerman','DZ','Assistant Secretary of War for International Security Affairs','osw-p','Office of the Under Secretary of War for Policy','#1e40af',['senior-civilian'],16);
  await c('julia-sokol-osw-p','Julia Sokol, SES','JS','Acting Principal Deputy Assistant Secretary of War for International Security Affairs','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],17);
  await c('christopher-mamaux-osw-p','Christopher Mamaux','CM','Deputy Assistant Secretary of War for Security Cooperation','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],18);
  await c('kathleen-heesch-eccles-osw-p','Kathleen Heesch-Eccles','KHE','Acting Deputy Assistant Secretary of War for Russia, Ukraine, Eurasia','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],19);
  await c('david-baker-osw-p','David Baker','DB','Deputy Assistant Secretary of War for Europe and NATO','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],20);
  await c('michael-p-dimino-iv-osw-p','Michael P. DiMino IV','MPD','Deputy Assistant Secretary of War for the Middle East','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],21);
  await c('bryan-ellis-osw-p','Bryan Ellis','BE','Deputy Assistant Secretary of War for African Affairs','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],22);
  await c('marc-berkowitz-osw-p','Marc Berkowitz','MB','Assistant Secretary of War for Space Policy','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],23);
  await c('rachel-smith-mcneal-osw-p','Rachel (Smith) McNeal','RSM','Acting Principal Deputy Assistant Secretary for Space Policy','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],24);
  await c('robert-brose-osw-p','Robert Brose','RB','Deputy Assistant Secretary of War for Space and Missile Defense','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],25);
  await c('drew-walter-osw-p','Mr. Drew Walter','DW','PTDO Assistant Secretary of War for Nuclear Deterrence, Chemical, and Biological Defense Policy','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],26);
  await c('rob-soofer-osw-p','Dr. Rob Soofer','RS','Performing the Duties of Principal Deputy Assistant Secretary of War for Nuclear Deterrence','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],27);
  await c('derrick-anderson-osw-p','HON Derrick Anderson','DA','Assistant Secretary of War for Special Operations and Low Intensity Conflict','osw-p','Office of the Under Secretary of War for Policy','#1e40af',['senior-civilian'],28);
  await c('richard-tilley-osw-p','Dr. Richard Tilley','RT','Principal Deputy Assistant Secretary of War for Special Ops & Low Intensity Conflict','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],29);
  await c('carlton-griffin-osw-p','Carlton Griffin','CG','Principal Deputy Assistant Secretary of War for Special Operations','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],30);
  await c('randall-harvey-osw-p','Randall Harvey','RH','DASD Special Operations Policy and Programs','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],31);
  await c('rob-satrom-osw-p','Rob Satrom','RS2','Principal Director, Irregular Warfare and Counterterrorism','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],32);
  await c('austin-j-dahmer-osw-p2','Austin J. Dahmer','AJD','Nominee Assistant Secretary of War for Strategy, Plans, and Capabilities','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],33);
  await c('rafael-f-leonardo-osw-p','Rafael F. Leonardo','RFL','Acting Assistant Secretary of War for Strategy, Plans, and Capabilities','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],34);
  await c('madeline-mortelmans-osw-p','Madeline Mortelmans','MM','Principal Deputy Assistant Secretary of War for Strategy, Plans, and Forces','osw-p','Office of the Under Secretary of War for Policy','#374151',['senior-civilian'],35);

  // ── OSW(I&S) ──────────────────────────────────────────────────────────────
  await c('bradley-hansell-osw-is','HON Bradley Hansell','BH','Under Secretary of War for Intelligence & Security','osw-is','Office of the Under Secretary of War for Intelligence and Security','#1e40af',['senior-civilian'],1);
  await c('justin-overbaugh-osw-is','Justin Overbaugh','JO','Deputy Under Secretary of War for Intelligence & Security','osw-is','Office of the Under Secretary of War for Intelligence and Security','#374151',['senior-civilian'],2);
  await c('david-a-harris-jr-osw-is','LTG David A. Harris Jr.','DAH','Special Assistant to the Under Secretary, USD(I&S)','osw-is','Office of the Under Secretary of War for Intelligence and Security','#065f46',['flag-officer'],3);
  await c('michael-mccabe-osw-is','Michael McCabe','MMC','Chief Data and AI Officer, Intelligence & Security','osw-is','Office of the Under Secretary of War for Intelligence and Security','#0e7490',['senior-civilian','tech-leader'],4);
  await c('nermine-nakhla-el-shammaa-osw-is','Nermine Nakhla El-Shammaa','NNE','Chief of Staff, Under Secretary of War for Intelligence & Security','osw-is','Office of the Under Secretary of War for Intelligence and Security','#374151',['senior-civilian'],5);
  await c('thomas-y-headen-osw-is','Thomas Y. Headen','TYH','Director of Operations, Programs, Resources, and Enterprise Management (PREM)','osw-is','Office of the Under Secretary of War for Intelligence and Security','#374151',['senior-civilian'],6);
  await c('constantin-e-nicolet-osw-is','LTG Constantin E. Nicolet','CEN','Director, Warfighter Support','osw-is','Office of the Under Secretary of War for Intelligence and Security','#065f46',['flag-officer','tech-leader'],7);
  await c('michael-m-dulak-osw-is','Michael M. Dulak','MMD','Director, Counterintelligence, Law Enforcement & Security','osw-is','Office of the Under Secretary of War for Intelligence and Security','#374151',['senior-civilian'],8);
  await c('theresa-whelan-osw-is','Theresa Whelan','TW','Director, Defense Intelligence for Sensitive Activities and Special Programs','osw-is','Office of the Under Secretary of War for Intelligence and Security','#374151',['senior-civilian'],9);

  // ── DISA additional contacts ───────────────────────────────────────────────
  await c('paul-t-stanton-disa','LTG Paul T. Stanton','PTS','Director DISA','disa','Defense Information Systems Agency','#374151',['flag-officer','tech-leader'],1);
  await c('christopher-barnhurst-disa','Christopher Barnhurst, SES','CB','Deputy Director DISA','disa','Defense Information Systems Agency','#374151',['senior-civilian','tech-leader'],2);
  await c('royce-p-resoso-disa','BG Royce P. Resoso','RPR','Chief Of Staff DISA','disa','Defense Information Systems Agency','#374151',['flag-officer'],3);
  await c('jason-g-martin-disa','Jason G. Martin','JGM','DISA Component Acquisition Executive and Acquisition Director','disa','Defense Information Systems Agency','#7c3aed',['senior-civilian','acquisition'],4);
  await c('douglas-packard-disa','Douglas Packard','DP','DISA Director Procurement Services Executive / Director DITCO','disa','Defense Information Systems Agency','#374151',['senior-civilian','acquisition'],5);
  await c('steve-wallace-disa','Steve Wallace','SW','Chief Technology Officer and Director of Emerging Technology Directorate','disa','Defense Information Systems Agency','#0e7490',['senior-civilian','tech-leader'],6);
  await c('wayne-k-walsh-disa','Wayne K. Walsh','WKW','Acting Chief Data Officer DISA','disa','Defense Information Systems Agency','#0e7490',['senior-civilian','tech-leader'],7);
  await c('sajeel-ahmed-disa','Sajeel Ahmed','SA','Performing Duties Director J6, Command, Control, Communications, and Computer Enterprise','disa','Defense Information Systems Agency','#0e7490',['senior-civilian','tech-leader'],8);
  await c('barbara-crawford-disa','Barbara Crawford','BC','Chief Financial Officer / J8, DISA','disa','Defense Information Systems Agency','#374151',['senior-civilian'],9);
  await c('korie-seville-disa','Korie Seville','KS','Deputy CTO for Compute','disa','Defense Information Systems Agency','#0e7490',['senior-civilian','tech-leader'],10);
  await c('col-toby-hlad-disa','COL Toby Hlad','TH','Commander, Defense Information Systems Agency Pacific','disa','Defense Information Systems Agency','#065f46',['flag-officer'],11);
  await c('col-tilisha-c-lockley-disa','COL Tilisha C. Lockley','TCL','Commander, DISA Europe','disa','Defense Information Systems Agency','#065f46',['flag-officer'],12);
  await c('brian-hermann-disa','Brian Hermann','BH','Cyber Director and Program Executive Officer (PEO Cyber)','disa','Defense Information Systems Agency','#0e7490',['senior-civilian','tech-leader'],13);

  // ── DIA additional contacts ──────────────────────────────────────────────
  await c('james-h-adams-dia','LTG James H. Adams','JHA','Director, Defense Intelligence Agency','dia','Defense Intelligence Agency','#374151',['flag-officer','tech-leader'],1);
  await c('alan-macdougall-dia','Dr. Alan MacDougall','AMD','Chief of Staff, Defense Intelligence Agency','dia','Defense Intelligence Agency','#374151',['senior-civilian'],2);
  await c('robert-kinney-dia','MG Robert Kinney','RK','Chief AI Officer, DIA','dia','Defense Intelligence Agency','#0e7490',['flag-officer','tech-leader'],3);
  await c('ep-mathew-dia','E.P. Mathew','EPM','CIO, DIA','dia','Defense Intelligence Agency','#0e7490',['senior-civilian','tech-leader'],4);

  // ── DCSA additional contacts ─────────────────────────────────────────────
  await c('joseph-tonon-dcsa','Joseph Tonon','JT','Director DCSA','dcsa','Defense Counterintelligence and Security Agency','#7c3aed',['senior-civilian'],1);
  await c('tara-jones-dcsa','Tara Jones','TJ','Acting Deputy Director / Deputy Director Defense Intelligence, Counterintelligence, Law Enforcement and Security','dcsa','Defense Counterintelligence and Security Agency','#7c3aed',['senior-civilian'],2);
  await c('brook-carr-dcsa','COL Brook Carr','BC','Acting Chief of Staff DCSA','dcsa','Defense Counterintelligence and Security Agency','#065f46',['flag-officer'],3);
  await c('ryan-christianson-dcsa','Ryan Christianson','RC','Director Business Transformation Office DCSA','dcsa','Defense Counterintelligence and Security Agency','#7c3aed',['senior-civilian'],4);
  await c('mark-sherwin-dcsa','Mark Sherwin','MS','Associate Director, Personnel Vetting','dcsa','Defense Counterintelligence and Security Agency','#7c3aed',['senior-civilian'],5);
  await c('matthew-d-redding-dcsa','Matthew D. Redding','MDR','Associate Director, Industrial Security','dcsa','Defense Counterintelligence and Security Agency','#7c3aed',['senior-civilian'],6);
  await c('edward-lane-dcsa','Edward Lane','EL','Program Executive Officer DCSA','dcsa','Defense Counterintelligence and Security Agency','#7c3aed',['senior-civilian','acquisition'],7);

  // ── DA&M ──────────────────────────────────────────────────────────────────
  await c('robert-g-salesses-osw-dam','Mr. Robert G. Salesses','RGS','Director of Administration and Management (DA&M)','osw-dam','Office of the Director of Administration and Management','#374151',['senior-civilian'],1);
  await c('charles-osborn-osw-dam','Mr. Charles Osborn','CO','Acting Director IM&T and Deputy CIO, Office of the Secretary of War','osw-dam','Office of the Director of Administration and Management','#0e7490',['senior-civilian','tech-leader'],2);
  await c('jeff-eanes-osw-dam','Mr. Jeff Eanes','JE','Director for Organizational and Management Policy','osw-dam','Office of the Director of Administration and Management','#374151',['senior-civilian'],3);
  await c('raymond-otoole-osw-dam','Raymond O\'Toole','ROT','Senior Advisor to Director, Administration & Management','osw-dam','Office of the Director of Administration and Management','#374151',['senior-civilian'],4);
  await c('regina-f-meiners-osw-dam','Regina F. Meiners','RFM','Director, Washington Headquarters Services','osw-dam','Office of the Director of Administration and Management','#374151',['senior-civilian'],5);
  await c('jae-w-lee-osw-dam','Jae W. Lee','JWL','Acting Deputy Director, Washington Headquarters Services','osw-dam','Office of the Director of Administration and Management','#374151',['senior-civilian'],6);
  await c('david-d-sanders-osw-dam','David D. Sanders','DDS','Director, Acquisition Directorate, WHS','osw-dam','Office of the Director of Administration and Management','#374151',['senior-civilian','acquisition'],7);
  await c('christine-nez-nalli-osw-dam','Christine Nez Nalli','CNN','Chief Human Resources Officer, WHS','osw-dam','Office of the Director of Administration and Management','#374151',['senior-civilian'],8);

  // ── ARMY SECRETARIAT (OSA) ────────────────────────────────────────────────
  await c('daniel-p-driscoll-osa','HON Daniel P. Driscoll','DPD','Secretary of the Army','osa','Office of the Secretary of the Army','#1e40af',['senior-civilian'],1);
  await c('michael-obadal-osa','HON Michael Obadal','MO','Undersecretary of the Army','osa','Office of the Secretary of the Army','#1e40af',['senior-civilian'],2);
  await c('david-r-fitzgerald-osa','David R. Fitzgerald','DRF','Deputy Under Secretary of the Army','osa','Office of the Secretary of the Army','#374151',['senior-civilian'],3);
  await c('terence-e-hagans-osa','Terence E. Hagans','TEH','Chief of Staff to the Secretary of the Army','osa','Office of the Secretary of the Army','#374151',['senior-civilian'],4);
  await c('brandon-pugh-osa','Brandon Pugh','BP','Principal Cyber Advisor to the Army Secretary and Army Chief of Staff','osa','Office of the Secretary of the Army','#0e7490',['senior-civilian','tech-leader'],5);
  await c('charlie-dietz-osa','LTC Charlie Dietz','CD','Public Affairs Advisor for the Undersecretary of the Army','osa','Office of the Secretary of the Army','#065f46',['flag-officer'],6);
  await c('matthew-l-sannito-osa','Mr. Matthew L. Sannito','MLS','Administrative Assistant To The Secretary Of The Army','osa','Office of the Secretary of the Army','#374151',['senior-civilian'],7);
  await c('charles-young-iii-osa','Charles Young III','CY3','Army General Counsel','osa','Office of the Secretary of the Army','#374151',['senior-civilian'],8);
  await c('marc-e-andersen-osa','HON Marc E. Andersen','MEA','Assistant Secretary of the Army Financial Management and Comptroller','osa','Office of the Secretary of the Army','#1e40af',['senior-civilian'],9);
  await c('candice-m-kinn-osa','Ms. Candice M. Kinn','CMK','Principal Deputy Assistant Secretary, Financial Management and Comptroller','osa','Office of the Secretary of the Army','#374151',['senior-civilian'],10);
  await c('mark-s-bennett-osa','LTG Mark S. Bennett','MSB','Military Deputy for Budget, Financial Management & Comptroller','osa','Office of the Secretary of the Army','#065f46',['flag-officer'],11);
  await c('rebecca-mcelwain-osa','MG Rebecca McElwain','RM','Director of Army Budget, Financial Management & Comptroller','osa','Office of the Secretary of the Army','#065f46',['flag-officer'],12);
  await c('william-jordan-gillis-osa','HON William Jordan Gillis','WJG','ASA Installations, Energy, and Environment','osa','Office of the Secretary of the Army','#1e40af',['senior-civilian'],13);
  await c('jeff-waksman-osa','Dr. Jeff Waksman','JW','Principal Deputy Assistant Secretary of the Army for IE&E','osa','Office of the Secretary of the Army','#374151',['senior-civilian'],14);
  await c('jimmy-byrn-osa','Mr. Jimmy Byrn','JB','Chief Legislative Liaison','osa','Office of the Secretary of the Army','#374151',['senior-civilian'],15);
  await c('scott-d-wilkinson-osa','BG Scott D. Wilkinson','SDW','Military Deputy to the Chief, Legislative Liaison','osa','Office of the Secretary of the Army','#065f46',['flag-officer'],16);
  await c('adam-telle-osa','Adam Telle','AT','Assistant Secretary of the Army for Civil Works','osa','Office of the Secretary of the Army','#374151',['senior-civilian'],17);

  // ── ARMY HQ STAFF ─────────────────────────────────────────────────────────
  await c('christopher-c-laneve-army-hq','LTG Christopher C. LaNeve','CCL','Army Vice Chief of Staff','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],1);
  await c('alex-miller-army-hq','Alex Miller','AM','Senior Advisor for Science and Technology and CTO to the Army Chief of Staff','army-hq','Army Headquarters Staff','#0e7490',['senior-civilian','tech-leader'],2);
  await c('marcus-evans-army-hq','LTG Marcus Evans','ME','Director of the Army Staff','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],3);
  await c('kelly-k-steele-army-hq','BG Kelly K. Steele','KKS','Chief, General Officer Management Office','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],4);
  await c('brian-s-eifler-army-hq','LTG Brian S. Eifler','BSE','Deputy Chief Of Staff, G-1','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],5);
  await c('gregory-s-johnson-army-hq','BG Gregory S. Johnson','GSJ','Director, Military Personnel Management','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],6);
  await c('michelle-a-schmidt-army-hq','LTG Michelle A. Schmidt','MAS','Deputy Chief Of Staff, G-2','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],7);
  await c('rhett-r-cox-army-hq','MG Rhett R. Cox','RRC','Special Assistant to Deputy Chief of Staff, G-2','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],8);
  await c('mario-roberts-army-hq','Mario Roberts','MR','Chief AI Officer & Deputy Director, Army Military Intelligence','army-hq','Army Headquarters Staff','#0e7490',['senior-civilian','tech-leader'],9);
  await c('stephanie-r-ahern-army-hq','MG Stephanie R. Ahern','SRA','Deputy Chief of Staff Director Strategy, Plans and Policy G-35','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],10);
  await c('joseph-d-becker-army-hq','BG Joseph D. Becker','JDB','Military Deputy to the Director, Strategy, Plans and Policy','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],11);
  await c('jake-s-kwon-army-hq','MG Jake S. Kwon','JSK','Director of Strategic Operations (IMA)','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],12);
  await c('david-f-stewart-army-hq','MG David F. Stewart','DFS','Director, Joint Counter-Small UAS Office / Director of Fires','army-hq','Army Headquarters Staff','#065f46',['flag-officer','tech-leader'],13);
  await c('matthew-n-metzel-army-hq','BG Matthew N. Metzel','MNM','Deputy Chief of Staff, G-3/5/7 (IMA) - U.S. Army Reserve Command','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],14);
  await c('stephen-e-capehart-army-hq','BG Stephen E. Capehart','SEC','Director, Force Management G-3/5/7','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],15);
  await c('jarrod-j-h-gillam-army-hq','BG Jarrod J.H. Gillam','JJHG','Director, Army Nuclear and CWMD Agency (USANCA)','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],16);
  await c('michelle-k-donahue-army-hq','LTG Michelle K. Donahue','MKD','Deputy Chief Of Staff, Logistics G-4','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],17);
  await c('john-m-dreska-army-hq','BG John M. Dreska','JMD','Assistant Deputy Chief of Staff (IMA), Mobilization and Training','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],18);
  await c('landis-c-maddox-army-hq','BG Landis C. Maddox','LCM','Director of Operations, G-43/5/7','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],19);
  await c('jeth-b-rey-army-hq','LTG Jeth B. Rey','JBR','Deputy Chief Of Staff, G-6','army-hq','Army Headquarters Staff','#065f46',['flag-officer','tech-leader'],20);
  await c('ronald-iammartino-jr-army-hq','BG Ronald Iammartino Jr.','RI','Director for the Unified Network Task Force, G-6','army-hq','Army Headquarters Staff','#065f46',['flag-officer','tech-leader'],21);
  await c('marne-l-sutten-army-hq','BG Marne L. Sutten','MLS','Director, Networks And C4 Services','army-hq','Army Headquarters Staff','#065f46',['flag-officer','tech-leader'],22);
  await c('christopher-thomas-army-hq','Mr. Christopher Thomas','CT','Director, Cybersecurity Integration And Synchronization','army-hq','Army Headquarters Staff','#0e7490',['senior-civilian','tech-leader'],23);
  await c('peter-n-bechoff-army-hq','LTG Peter N. Bechoff','PNB','Deputy Chief Of Staff, G-8','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],24);
  await c('thomas-oconnor-army-hq','MG Thomas O\'Connor','TOC','Director Force Development, G-8','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],25);
  await c('peter-n-benchoff-army-hq','MG Peter N. Benchoff','PNB2','Director, Program Analysis and Evaluation, G-8','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],26);
  await c('patrick-workman-army-hq','BG Patrick Workman','PW','Military Deputy Director Program Analysis and Evaluation','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],27);
  await c('david-j-zinn-army-hq','BG David J. Zinn','DJZ','Director of Training, G7','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],28);
  await c('eric-m-johnson-army-hq','BG Eric M. Johnson','EMJ','Director, Operations, Readiness and Mobilization','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],29);
  await c('timothy-d-brown-army-hq','MG Timothy D. Brown','TDB','Commanding General, INSCOM','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],30);
  await c('sean-f-stinchon-army-hq','BG Sean F. Stinchon','SFS','Commanding General Army Counterintelligence Command','army-hq','Army Headquarters Staff','#065f46',['flag-officer'],31);

  // ── ARMY HRC ──────────────────────────────────────────────────────────────
  await c('hope-c-rampy-army-hrc','MG Hope C. Rampy','HCR','Commanding General, Army Human Resources Command','army-hrc','Army Human Resources Command','#065f46',['flag-officer'],1);
  await c('steven-m-king-army-hrc','BG Steven M. King','SMK','Deputy CG and Director Reserve Personnel Management Directorate, Army HRC','army-hrc','Army Human Resources Command','#065f46',['flag-officer'],2);
  await c('jim-m-bradford-army-hrc','Jim M. Bradford','JMB','Chief of Staff, U.S. Army Human Resources Command','army-hrc','Army Human Resources Command','#374151',['senior-civilian'],3);
  await c('donald-a-fagnan-army-hrc','BG Donald A. Fagnan','DAF','Director, Military Personnel and Readiness Directorate, Army HRC','army-hrc','Army Human Resources Command','#065f46',['flag-officer'],4);

  // ── ARMY CIO ──────────────────────────────────────────────────────────────
  await c('david-m-markowitz-army-cio','Dr. David M. Markowitz','DMM','Deputy Chief Information Officer / Chief Data And Analytics Officer','army-cio','Office of the Army Chief Information Officer','#0e7490',['senior-civilian','tech-leader'],1);
  await c('nathan-colodney-army-cio','Mr. Nathan Colodney','NC','Acting Director For Cybersecurity / Chief Information Security Officer','army-cio','Office of the Army Chief Information Officer','#0e7490',['senior-civilian','tech-leader'],2);
  await c('wilfredo-caldero-army-cio','Mr. Wilfredo "Wil" Caldero','WC','Director, Architecture, Data, Standards','army-cio','Office of the Army Chief Information Officer','#0e7490',['senior-civilian','tech-leader'],3);
  await c('carrie-a-mcvicker-army-cio','Ms. Carrie A. McVicker','CAM','Executive Director, Enterprise Services Agency','army-cio','Office of the Army Chief Information Officer','#374151',['senior-civilian'],4);
  await c('urbi-lewis-army-cio','BG Urbi Lewis','UL','Director for Cybersecurity and Chief Information Security Officer (CISO)','army-cio','Office of the Army Chief Information Officer','#065f46',['flag-officer','tech-leader'],5);
  await c('adam-nucci-army-cio','Mr. Adam Nucci','AN','Principal Director for Policy, Resources, And Analysis/CFO','army-cio','Office of the Army Chief Information Officer','#374151',['senior-civilian'],6);

  // ── ARMY USASMDC ─────────────────────────────────────────────────────────
  await c('john-rafferty-army-usasmdc','LTG John Rafferty','JR','Commander, U.S. Army Space and Missile Defense Command','army-usasmdc','Army Space and Missile Defense Command','#065f46',['flag-officer'],1);
  await c('donald-k-brooks-army-usasmdc','BG Donald K. Brooks','DKB','Deputy Commanding General for Operations, USASMDC','army-usasmdc','Army Space and Missile Defense Command','#065f46',['flag-officer'],2);
  await c('jon-castro-army-usasmdc','COL Jon Castro','JC','Chief of Staff, USASMDC','army-usasmdc','Army Space and Missile Defense Command','#065f46',['flag-officer'],3);
  await c('steve-f-pierce-army-usasmdc','Dr. Steve F. Pierce','SFP','Chief Technology Officer, USASMDC','army-usasmdc','Army Space and Missile Defense Command','#0e7490',['senior-civilian','tech-leader'],4);
  await c('keith-krapels-army-usasmdc','Dr. Keith Krapels, SES','KK','Director, USAMDC Technical Center','army-usasmdc','Army Space and Missile Defense Command','#374151',['senior-civilian'],5);
  await c('timothy-f-bishop-army-usasmdc','Timothy F. Bishop, SES','TFB','Director, Space and Missile Defense Center of Excellence','army-usasmdc','Army Space and Missile Defense Command','#374151',['senior-civilian'],6);

  // ── ARMY CORPS OF ENGINEERS ───────────────────────────────────────────────
  await c('william-h-graham-jr-army-usace','LTG William H. Graham Jr.','WHG','Chief Of Engineers','army-usace','Army Corps of Engineers','#065f46',['flag-officer'],1);
  await c('kirk-e-gibbs-army-usace','MG Kirk E. Gibbs','KEG','Deputy Chief of Engineers / Deputy Commanding General, USACE','army-usace','Army Corps of Engineers','#065f46',['flag-officer'],2);
  await c('jason-e-kelly-army-usace','MG Jason E. Kelly','JEK','Deputy Commanding General for Civil Works and Emergency Operations','army-usace','Army Corps of Engineers','#065f46',['flag-officer'],3);
  await c('kimberly-a-peeples-army-usace','MG Kimberly A. Peeples','KAP','Commanding General, Mississippi Valley Division','army-usace','Army Corps of Engineers','#065f46',['flag-officer'],4);
  await c('beth-fleming-army-usace','Dr. Beth Fleming, SES','BF','Director, Engineer Research and Development Center (ERDC)','army-usace','Army Corps of Engineers','#374151',['senior-civilian','r&d'],5);
  await c('robert-d-moser-army-usace','Dr. Robert D. Moser, SES','RDM','Director of the Information Technology Laboratory ERDC','army-usace','Army Corps of Engineers','#374151',['senior-civilian','tech-leader'],6);

  // ── ARMY CYBER COMMAND ────────────────────────────────────────────────────
  await c('christopher-eubank-army-arcyber','LTG Christopher (Chris) Eubank','CCE','Commanding General, Army Cyber Command','army-arcyber','Army Cyber Command','#065f46',['flag-officer','tech-leader'],1);
  await c('matthew-j-lennox-army-arcyber','BG Matthew J. Lennox','MJL','Deputy Commanding General, Army Cyber Command','army-arcyber','Army Cyber Command','#065f46',['flag-officer','tech-leader'],2);
  await c('steven-d-rehn-army-arcyber','Mr. Steven D. Rehn','SDR','Deputy to the Commanding General / ARCYBER Chief Data Officer','army-arcyber','Army Cyber Command','#0e7490',['senior-civilian','tech-leader'],3);
  await c('john-f-popiak-army-arcyber','COL John F. Popiak','JFP','Deputy Commanding Officer for Operations','army-arcyber','Army Cyber Command','#065f46',['flag-officer'],4);
  await c('mark-a-mollenkopf-army-arcyber','Mr. Mark A. "Al" Mollenkopf','MAM','Science Advisor / Chief Analytics Officer','army-arcyber','Army Cyber Command','#0e7490',['senior-civilian','tech-leader'],5);
  await c('joseph-munger-army-arcyber','COL Joseph Munger','JM','Chief of Staff, U.S. Army Cyber Command','army-arcyber','Army Cyber Command','#065f46',['flag-officer'],6);

  // ── ASA(ALT) ──────────────────────────────────────────────────────────────
  await c('brent-ingraham-asa-alt','HON Brent Ingraham, SES','BI','Assistant Secretary of the Army Acquisition, Logistics and Technology (ASA/ALT)','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#1e40af',['senior-civilian','acquisition'],1);
  await c('jesse-d-tolleson-asa-alt','Mr. Jesse D. Tolleson','JDT','Principal Deputy Assistant Secretary ASA/ALT','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#374151',['senior-civilian','acquisition'],2);
  await c('robert-collins-asa-alt','LTG Robert Collins','RC','Principal Military Deputy DAAC to ASA for Acquisition, Logistics & Technology','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#065f46',['flag-officer','acquisition'],3);
  await c('marty-zybura-asa-alt','Mr. Marty Zybura','MZ','Deputy to the Deputy for Acquisition and Systems Management','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#374151',['senior-civilian','acquisition'],4);
  await c('jennifer-swanson-asa-alt','Jennifer Swanson','JS','Deputy Assistant Secretary of the Army for Data, Engineering & Software','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#0e7490',['senior-civilian','tech-leader','acquisition'],5);
  await c('christopher-schneider-asa-alt','MG Christopher Schneider','CS','Deputy for Acquisition and Systems Management (DASM)','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#065f46',['flag-officer','acquisition'],6);
  await c('chris-manning-asa-alt','Chris Manning','CM','Deputy Assistant Secretary for Research and Technology & Army Chief Scientist','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#374151',['senior-civilian','r&d'],7);
  await c('patrick-mason-asa-alt','Mr. Patrick Mason','PM','Deputy Assistant Secretary of the Army for Defense Exports and Cooperation','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#374151',['senior-civilian','acquisition'],8);
  await c('ronald-richardson-asa-alt','Mr. Ronald Richardson','RR','Director Acquisition Support Center and Director, Acquisition Career Management','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#374151',['senior-civilian','acquisition'],9);
  await c('tiffany-n-fair-asa-alt','Dr. Tiffany N. Fair','TNF','Director of Systems Special Programs','asa-alt','Asst Secretary of the Army Acquisition Logistics Tech','#374151',['senior-civilian','acquisition'],10);

  // ── PAE MANEUVER GROUND ───────────────────────────────────────────────────
  await c('colin-p-tuley-pae-mng','MG Colin P. Tuley','CPT','Portfolio Acquisition Executive (PAE) Maneuver Ground','pae-mng','PAE Maneuver - Ground','#065f46',['flag-officer','acquisition'],1);
  await c('troy-denomy-pae-mng','BG Troy Denomy','TD','Deputy PAE Maneuver Ground','pae-mng','PAE Maneuver - Ground','#065f46',['flag-officer','acquisition'],2);
  await c('andrew-t-clements-pae-mng','Andrew T. Clements','ATC','Capability Program Executive Ground, Fort Belvoir','pae-mng','PAE Maneuver - Ground','#374151',['senior-civilian','acquisition'],3);
  await c('michelle-link-pae-mng','MG Michelle Link','ML','Capability Program Executive Ground, Detroit Arsenal','pae-mng','PAE Maneuver - Ground','#065f46',['flag-officer','acquisition'],4);
  await c('chad-chalfont-pae-mng','BG Chad Chalfont','CC','Expanded Maneuver Future Capabilities Division Chief','pae-mng','PAE Maneuver - Ground','#065f46',['flag-officer','acquisition'],5);
  await c('ryan-howell-pae-mng','BG Ryan Howell','RH','Deputy CPE Maneuver Ground','pae-mng','PAE Maneuver - Ground','#065f46',['flag-officer','acquisition'],6);

  // ── PAE MANEUVER AIR ──────────────────────────────────────────────────────
  await c('clair-a-gill-pae-mna','MG Clair A. Gill','CAG','Portfolio Acquisition Executive (PAE) Maneuver Air','pae-mna','PAE Maneuver - Air','#065f46',['flag-officer','acquisition'],1);
  await c('david-c-phillips-pae-mna','BG David C. Phillips','DCP','Deputy PAE Maneuver Air, Redstone Arsenal','pae-mna','PAE Maneuver - Air','#065f46',['flag-officer','acquisition'],2);
  await c('rodney-davis-pae-mna','Mr. Rodney Davis','RD','Capability Program Executive Aviation, Redstone Arsenal','pae-mna','PAE Maneuver - Air','#374151',['senior-civilian','acquisition'],3);
  await c('anthony-r-gibbs-pae-mna','BG Anthony R. Gibbs','ARG','Capability Program Executive Autonomy, FT Belvoir','pae-mna','PAE Maneuver - Air','#065f46',['flag-officer','acquisition'],4);
  await c('phillip-cain-baker-pae-mna','MG Phillip (Cain) Baker','PCB','AV Future Capabilities Division (Force Development Chief)','pae-mna','PAE Maneuver - Air','#065f46',['flag-officer','acquisition'],5);
  await c('stephanie-reitmeier-pae-mna','Dr. Stephanie Reitmeier','SR','Air Systems Center, Redstone Arsenal','pae-mna','PAE Maneuver - Air','#374151',['senior-civilian','r&d'],6);

  // ── PAE FIRES ─────────────────────────────────────────────────────────────
  await c('frank-j-lozano-pae-fires','MG Frank J. Lozano','FJL','Portfolio Acquisition Executive (PAE) Fires, Redstone Arsenal','pae-fires','PAE Fires','#065f46',['flag-officer','acquisition'],1);
  await c('patrick-m-costello-pae-fires','BG Patrick M. Costello','PMC','Deputy PAE Fires / CG Army Fires Center of Excellence','pae-fires','PAE Fires','#065f46',['flag-officer','acquisition'],2);
  await c('robert-j-mikesh-jr-pae-fires','BG Robert J. (RJ) Mikesh Jr.','RJM','Capability Program Executive Offensive, Redstone Arsenal','pae-fires','PAE Fires','#065f46',['flag-officer','acquisition'],3);
  await c('guy-yelverton-iii-pae-fires','BG Guy Yelverton III','GY3','Capability Program Executive Defensive, Redstone Arsenal','pae-fires','PAE Fires','#065f46',['flag-officer','acquisition'],4);
  await c('miranda-oden-pae-fires','Ms. Miranda Oden, SES','MO','Capability Program Executive Integrated Fires / PAE Fires Executive Director','pae-fires','PAE Fires','#374151',['senior-civilian','acquisition'],5);
  await c('alric-francis-pae-fires','BG Alric Francis','AF','Fires Future Capabilities Division Chief','pae-fires','PAE Fires','#065f46',['flag-officer','acquisition'],6);
  await c('james-kirsch-pae-fires','Dr. James Kirsch, SES','JK','Redstone Arsenal Fires System Center Director','pae-fires','PAE Fires','#374151',['senior-civilian','r&d'],7);

  // ── PAE C2/CC2 ────────────────────────────────────────────────────────────
  await c('joseph-d-welch-pae-c2','Mr. Joseph D. Welch, SES','JDW','Portfolio Acquisition Executive (PAE) C2/CC2','pae-c2','PAE C2/CC2','#374151',['senior-civilian','acquisition'],1);
  await c('ryan-m-janovic-pae-c2','MG Ryan M. Janovic','RMJ','Deputy PAE C2/CC2 / CG Cyber Center of Excellence','pae-c2','PAE C2/CC2','#065f46',['flag-officer','acquisition','tech-leader'],2);
  await c('kevin-chaney-pae-c2','BG Kevin Chaney','KC','Capability Program Executive Intelligence','pae-c2','PAE C2/CC2','#065f46',['flag-officer','acquisition'],3);
  await c('shane-jack-taylor-pae-c2','BG Shane (Jack) Taylor','SJT','Capability Program Executive Command, Control, Communications and Network C2IN','pae-c2','PAE C2/CC2','#065f46',['flag-officer','acquisition','tech-leader'],4);
  await c('christine-a-beeler-pae-c2','BG Christine A. Beeler','CAB','Capability Program Executive Simulation, Training & Instrumentation','pae-c2','PAE C2/CC2','#065f46',['flag-officer','acquisition'],5);
  await c('mike-kaloostian-pae-c2','BG Mike Kaloostian','MK','Director Command and Control (C2) Cross Functional Team','pae-c2','PAE C2/CC2','#065f46',['flag-officer','acquisition'],6);
  await c('danielle-moyer-pae-c2','Ms. Danielle Moyer, SES','DM','Strategic Contracting Office, Executive Director Aberdeen Proving Ground','pae-c2','PAE C2/CC2','#374151',['senior-civilian','acquisition'],7);
  await c('jennifer-jenn-reed-pae-c2','Ms. Jennifer (Jenn) Reed','JJR','Communications-Electronics Command (CECOM), Aberdeen Proving Ground','pae-c2','PAE C2/CC2','#374151',['senior-civilian','acquisition'],8);

  // ── PAE SUSTAINMENT ───────────────────────────────────────────────────────
  await c('john-b-reim-pae-sustainment','MG John B. Reim','JBR','Portfolio Acquisition Executive (PAE) Agile Sustainment/Ammo, Picatinny','pae-sustainment','PAE Agile Sustainment and Ammunition','#065f46',['flag-officer','acquisition'],1);
  await c('sean-p-davis-pae-sustainment','MG Sean P. Davis','SPD','Deputy PAE Agile Sustainment / CG Combined Arms Support Command','pae-sustainment','PAE Agile Sustainment and Ammunition','#065f46',['flag-officer','acquisition'],2);
  await c('camilla-a-white-pae-sustainment','BG Camilla A. White','CAW','Capability Program Executive Combat Logistics','pae-sustainment','PAE Agile Sustainment and Ammunition','#065f46',['flag-officer','acquisition'],3);
  await c('jason-bohannon-pae-sustainment','COL Jason Bohannon','JB','Capability Program Executive Ammo and Energetics','pae-sustainment','PAE Agile Sustainment and Ammunition','#065f46',['flag-officer','acquisition'],4);
  await c('lynda-armer-pae-sustainment','Ms. Lynda Armer','LA','Senior Contracting Official (SCO), Rock Island','pae-sustainment','PAE Agile Sustainment and Ammunition','#374151',['senior-civilian','acquisition'],5);

  // ── PAE CBRN ──────────────────────────────────────────────────────────────
  await c('christopher-beck-pae-cbrn','MG Christopher (Chris) Beck','CCB','Portfolio Acquisition Executive (PAE) Layered Protection & CBRN','pae-cbrn','PAE Layered Protection and CBRN','#065f46',['flag-officer','acquisition'],1);
  await c('daryl-colvin-pae-cbrn','Mr. Daryl Colvin','DC','Deputy PAE, Aberdeen Proving Ground','pae-cbrn','PAE Layered Protection and CBRN','#374151',['senior-civilian','acquisition'],2);
  await c('nicole-kilgore-pae-cbrn','Nicole Kilgore','NK','Capability Program Executive CBRND, Aberdeen Proving Ground','pae-cbrn','PAE Layered Protection and CBRN','#374151',['senior-civilian','acquisition'],3);
  await c('wyatt-ulrich-pae-cbrn','Mr. Wyatt Ulrich','WU','Interim Deputy CPE CBRND / Director Acquisition & Systems Management CBRND','pae-cbrn','PAE Layered Protection and CBRN','#374151',['senior-civilian','acquisition'],4);

  // ── ARMY CPE ES2 ──────────────────────────────────────────────────────────
  await c('miranda-coleman-army-es2','Ms. Miranda Coleman','MC','Acting Capability Program Executive CPE ES2','army-es2','Army CPE Enterprise Software and Service','#374151',['senior-civilian','tech-leader'],1);
  await c('matthew-paul-army-es2','COL Matthew (Matt) Paul','MMP','Deputy Capability Program Executive CPE ES2','army-es2','Army CPE Enterprise Software and Service','#065f46',['flag-officer','tech-leader'],2);
  await c('patrick-mckinney-army-es2','Mr. Patrick McKinney','PM','Acting Chief Of Staff, Enterprise Information Systems','army-es2','Army CPE Enterprise Software and Service','#374151',['senior-civilian','tech-leader'],3);
  await c('ali-mohammed-army-es2','Mr. Ali Mohammed','AM','Acting Assistant CPE Chief Technology Officer CPE ES2','army-es2','Army CPE Enterprise Software and Service','#0e7490',['senior-civilian','tech-leader'],4);

  // ── ARMY PIT ──────────────────────────────────────────────────────────────
  await c('shermoan-daiyaan-army-pit','COL Shermoan Daiyaan','SD','Director, Army Pathway for Innovation and Technology (PIT)','army-pit','Army Pathway for Innovation and Technology','#065f46',['flag-officer','acquisition'],1);
  await c('matt-willis-army-pit','Matt Willis','MW','Director, Army FUZE Program','army-pit','Army Pathway for Innovation and Technology','#374151',['senior-civilian','acquisition'],2);
  await c('casey-perley-army-aal','Dr. Casey Perley','CP','Executive Director, Army Application Lab','army-aal','Army Application Lab','#374151',['senior-civilian','r&d','tech-leader'],1);
  await c('robert-clay-mcvay-army-aal','COL Robert (Clay) McVay','RCM','Deputy Director, Army Application Lab','army-aal','Army Application Lab','#065f46',['flag-officer'],2);
  await c('barry-tishgart-army-aal','Barry Tishgart','BT','Entrepreneur in Residence / Director of Corporate Ventures, AAL','army-aal','Army Application Lab','#374151',['senior-civilian','tech-leader'],3);
  await c('zach-harrell-army-aal','Dr. Zach Harrell','ZH','Director of Insights and Analysis, Army Application Lab','army-aal','Army Application Lab','#374151',['senior-civilian','r&d'],4);

  // ── ARMY RCCTO ────────────────────────────────────────────────────────────
  await c('warren-odonell-army-rccto','Mr. Warren O\'Donell','WOD','Deputy Director, Rapid Capabilities and Critical Technologies Office','army-rccto','Army Rapid Capabilities and Critical Technologies Office','#374151',['senior-civilian','acquisition'],1);
  await c('julian-r-williams-army-rccto','Mr. Julian R. Williams','JRW','Director, Cyber, Electronic Warfare, and Information Dominance','army-rccto','Army Rapid Capabilities and Critical Technologies Office','#0e7490',['senior-civilian','tech-leader'],2);

  // ── ARMY T2COM ────────────────────────────────────────────────────────────
  await c('edmond-miles-brown-army-t2com','LTG Edmond "Miles" Brown','EMB','Acting Commanding General, T2COM','army-t2com','Army Transformation and Training Command','#065f46',['flag-officer'],1);
  await c('joseph-d-welch-army-t2com','Mr. Joseph D. Welch, SES','JDW2','Deputy to the CG / Army Executive NGC2 Lead / PAE C2/CC2','army-t2com','Army Transformation and Training Command','#374151',['senior-civilian'],2);
  await c('david-hall-army-t2com','MG David Hall','DH','Deputy CG, Army National Guard, T2COM','army-t2com','Army Transformation and Training Command','#065f46',['flag-officer'],3);
  await c('john-m-cushing-army-t2com','MG John M. Cushing','JMC','Chief of Staff, T2COM','army-t2com','Army Transformation and Training Command','#065f46',['flag-officer'],4);
  await c('james-p-isenhower-iii-army-t2com','LTG James P. Isenhower III','JPI','Commanding General, Combined Arms Command','army-t2com','Army Transformation and Training Command','#065f46',['flag-officer'],5);
  await c('michael-c-mccurry-army-t2com','LTG Michael C. McCurry','MCM','Commanding General, Futures and Concepts Command','army-t2com','Army Transformation and Training Command','#065f46',['flag-officer'],6);
  await c('paula-c-lodi-army-mrdc','MG Paula C. Lodi','PCL','Commanding General, Army Medical Research and Development Command / Director R&D Defense Health Agency','army-mrdc','Army Medical Research and Development Command','#065f46',['flag-officer','r&d'],1);
  await c('robert-k-bryant-army-t2com','BG Robert K. Bryant','RKB','Chief of Staff, Futures and Concepts Command','army-t2com','Army Transformation and Training Command','#065f46',['flag-officer'],7);

  // ── ARMY DEVCOM ───────────────────────────────────────────────────────────
  await c('robert-g-born-army-devcom','BG Robert G. Born','RGB','Commanding General, Army Combat Capabilities Development Command (DEVCOM)','army-devcom','Army Combat Capabilities Development Command','#065f46',['flag-officer','r&d'],1);
  await c('eric-l-moore-army-devcom','Dr. Eric L. Moore, SES','ELM','Deputy to the Commanding General DEVCOM','army-devcom','Army Combat Capabilities Development Command','#374151',['senior-civilian','r&d'],2);
  await c('george-chris-hackler-army-devcom','BG George "Chris" Hackler','GCH','Deputy Commanding General, DEVCOM / Principal Military Advisor','army-devcom','Army Combat Capabilities Development Command','#065f46',['flag-officer','r&d'],3);
  await c('jeffrey-thomas-army-devcom','Jeffrey Thomas, SES','JT','Director, Science and Technology Integration Directorate DEVCOM','army-devcom','Army Combat Capabilities Development Command','#374151',['senior-civilian','r&d','tech-leader'],4);
  await c('james-kirsch-army-devcom','Dr. James Kirsch, SES','JK2','Director DEVCOM PAE Fires Systems Center','army-devcom','Army Combat Capabilities Development Command','#374151',['senior-civilian','r&d'],5);

  // ── ARMY NATIONAL GUARD ───────────────────────────────────────────────────
  await c('jonathan-m-stubbs-army-ng','LTG Jonathan M. Stubbs','JMS','Director, Army National Guard','army-ng','Army National Guard Bureau','#065f46',['flag-officer'],1);

  return Response.json({ seeded: n, errors: errs });
};
export const config = { path: '/api/seed-pdf-army' };
