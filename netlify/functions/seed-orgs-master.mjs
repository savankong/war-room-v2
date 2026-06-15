import { getDatabase } from '@netlify/database';

/**
 * Master org seed from Orgs_PDF_Final.csv — 182 canonical orgs
 * GET /api/seed-orgs-master?token=<SAM_SYNC_TOKEN>
 */
export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('token') !== Netlify.env.get('SAM_SYNC_TOKEN'))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDatabase();
  let orgsUpserted = 0, contactsMigrated = 0;
  const errs = [];

  const upsert = async (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description) => {
    try {
      await db.sql`INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
        VALUES (${id},${sub},${branch},${budget},${major},${subtier},${loc},${budget_detail},${r_and_d},${contract_vehicles},${description})
        ON CONFLICT (id) DO UPDATE SET
          sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
          major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
          budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
          contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description`;
      orgsUpserted++;
    } catch(e) { errs.push('org:' + id + ':' + e.message.slice(0,80)); }
  };

  await upsert('jcs','JCS','DoW',null,'Joint Chiefs of Staff','JCS','Pentagon, Arlington, VA',null,null,[],'Joint Chiefs of Staff');
  await upsert('osw','OSW','DoW',null,'OSD','OSW','Pentagon, Arlington, VA',null,null,[],'Office of the Secretary of War');
  await upsert('sapco','OSW','DoW',null,'OSD','SAPCO','Pentagon, Arlington, VA',null,null,[],'Special Access Programs Central Office');
  await upsert('cape','OSW','DoW',null,'OSD','CAPE','Pentagon, Arlington, VA',null,null,[],'Office of Cost Assessment and Program Evaluation');
  await upsert('dow_cio','OSW','DoW',null,'OSD','CIO','Pentagon, Arlington, VA',null,null,[],'DoW Chief Information Officer');
  await upsert('sco','OSW','DoW',null,'OSD','SCO','Pentagon, Arlington, VA',null,null,[],'Strategic Capabilities Office');
  await upsert('ousd_as','OSD','DoW',null,'OSD','OUSD(A&S)','Pentagon, Arlington, VA',null,null,[],'Office of the Under Secretary of War for Acquisition and Sustainment');
  await upsert('asd_a','OSD','DoW',null,'OSD','ASD(A)','Pentagon, Arlington, VA',null,null,[],'Assistant Secretary of War for Acquisition');
  await upsert('asd_s','OSD','DoW',null,'OSD','ASD(S)','Pentagon, Arlington, VA',null,null,[],'Assistant Secretary of War for Sustainment');
  await upsert('asd_eie','OSD','DoW',null,'OSD','ASD(EI&E)','Pentagon, Arlington, VA',null,null,[],'Assistant Secretary of War for Energy, Installations, and Environment');
  await upsert('asd_nd_cbd','OSD','DoW',null,'OSD','ASD(ND-CBD)','Pentagon, Arlington, VA',null,null,[],'Assistant Secretary of War for Nuclear Deterrence, Chemical, and Biological Defense');
  await upsert('asd_ibp','OSD','DoW',null,'OSD','ASD(IBP)','Pentagon, Arlington, VA',null,null,[],'Assistant Secretary of War for Industrial Base Policy');
  await upsert('ousd_pr','OSD','DoW',null,'OSD','OUSD(P&R)','Pentagon, Arlington, VA',null,null,[],'Office of the Under Secretary of Defense for Personnel and Readiness');
  await upsert('ousd_re','OSD R&E','DoW',null,'OSD','OUSD(R&E)','Pentagon, Arlington, VA',null,null,[],'Office of the Under Secretary of War for Research and Engineering');
  await upsert('cdao','OSD R&E','DoW',null,'OSD','CDAO','Pentagon, Arlington, VA',null,'Y',[],'Chief Digital and Artificial Intelligence Office');
  await upsert('darpa','OSD R&E','DoW',null,'OSD','DARPA','Arlington, VA',null,'Y',['Y'],'Defense Advanced Research Projects Agency');
  await upsert('mda','OSD R&E','DoW',null,'OSD','MDA','Huntsville, AL',null,'Y',['Y'],'Missile Defense Agency');
  await upsert('osc','OSD R&E','DoW',null,'OSD','OSC','Pentagon, Arlington, VA',null,null,[],'Office of Strategic Capital');
  await upsert('edu','OSD','DoW',null,'OSD','EDU','Washington, DC',null,null,[],'Economic Defense Unit');
  await upsert('exim','OSD','DoW',null,'OSD','EXIM','Washington, DC',null,null,[],'Export Import Bank');
  await upsert('dfc','OSD','DoW',null,'OSD','DFC','Washington, DC',null,null,[],'U.S. International Development Finance Corporation');
  await upsert('diu','OSD R&E','DoW',null,'OSD','DIU','Mountain View, CA',null,'Y',['Y'],'Defense Innovation Unit');
  await upsert('dot_e','OSD','DoW',null,'OSD','DOT&E','Pentagon, Arlington, VA',null,null,[],'OSD Director, Operational Test and Evaluation');
  await upsert('ousd_p','OSD Policy','DoW',null,'OSD','OUSD(P)','Pentagon, Arlington, VA',null,null,[],'Under Secretary of War for Policy');
  await upsert('osd_is','OSD I&S','DoW',null,'OSD','OUSD(I&S)','Pentagon, Arlington, VA',null,null,[],'Under Secretary of War for Intelligence and Security');
  await upsert('disa','OSD I&S','DoW',null,'OSD','DISA','Fort Meade, MD',null,null,['Y'],'Defense Information Systems Agency');
  await upsert('dia','OSD I&S','DoW',null,'OSD','DIA','Washington, DC',null,null,[],'Defense Intelligence Agency');
  await upsert('dcsa','OSD I&S','DoW',null,'OSD','DCSA','Quantico, VA',null,null,[],'Defense Counterintelligence and Security Agency');
  await upsert('dam','OSD','DoW',null,'OSD','DA&M','Pentagon, Arlington, VA',null,null,[],'Director of Administration and Management');
  await upsert('whs','OSD','DoW',null,'OSD','WHS','Pentagon, Arlington, VA',null,null,[],'Washington Headquarters Services');
  await upsert('army','Army','Army',null,'Army','Army HQ','Pentagon, Arlington, VA',null,null,[],'Department of the Army');
  await upsert('army_hrc','Army','Army',null,'Army HQ','HRC','Fort Knox, KY',null,null,[],'Army Human Resources Command');
  await upsert('army_rccto','Army','Army',null,'Army HQ','RCCTO','Arlington, VA',null,'Y',['Y'],'Army Rapid Capabilities and Critical Technologies Office');
  await upsert('usasmdc','Army','Army',null,'Army HQ','USASMDC','Redstone Arsenal, AL',null,'Y',['Y'],'Army Space and Missile Defense Command');
  await upsert('arcyber','Army','Army',null,'Army HQ','ARCYBER','Fort Eisenhower, GA',null,'Y',['Y'],'Army Cyber Command');
  await upsert('army_ng','Army','Army',null,'Army HQ','ARNG','Arlington, VA',null,null,[],'Army National Guard');
  await upsert('pae_maneuver_ground','Army','Army',null,'Army Acquisition','PAE Maneuver Ground','Detroit Arsenal, MI',null,null,['Y'],'Portfolio Acquisition Executive: Maneuver - Ground');
  await upsert('cpe_maneuver_ground','Army','Army',null,'PAE Maneuver Ground','CPE Maneuver Ground','Detroit Arsenal, MI',null,null,['Y'],'Capability Program Executive: Maneuver - Ground');
  await upsert('pae_maneuver_air','Army','Army',null,'Army Acquisition','PAE Maneuver Air','Redstone Arsenal, AL',null,null,['Y'],'Portfolio Acquisition Executive: Maneuver - Air');
  await upsert('cpe_aviation','Army','Army',null,'PAE Maneuver Air','CPE Aviation','Redstone Arsenal, AL',null,null,['Y'],'Capability Program Executive: Aviation');
  await upsert('cpe_autonomy','Army','Army',null,'PAE Maneuver Air','CPE Autonomy','Fort Belvoir, VA',null,'Y',['Y'],'Capability Program Executive: Autonomy');
  await upsert('pae_fires','Army','Army',null,'Army Acquisition','PAE Fires','Redstone Arsenal, AL',null,null,['Y'],'Portfolio Acquisition Executive: Fires');
  await upsert('cpe_offense','Army','Army',null,'PAE Fires','CPE Offense','Redstone Arsenal, AL',null,null,['Y'],'Capability Program Executive: Offense');
  await upsert('cpe_defensive','Army','Army',null,'PAE Fires','CPE Defensive','Redstone Arsenal, AL',null,null,['Y'],'Capability Program Executive: Defensive');
  await upsert('cpe_integrated_fires','Army','Army',null,'PAE Fires','CPE Integrated Fires','Redstone Arsenal, AL',null,null,['Y'],'Capability Program Executive: Integrated Fires');
  await upsert('pae_c2','Army','Army',null,'Army Acquisition','PAE C2/CC2','Aberdeen Proving Ground, MD',null,null,['Y'],'Portfolio Acquisition Executive: C2/CC2');
  await upsert('cpe_c2in','Army','Army',null,'PAE C2/CC2','CPE C2IN','Aberdeen Proving Ground, MD',null,null,['Y'],'Capability Program Executive: Command, Control, Communications and Network');
  await upsert('cpe_st3','Army','Army',null,'PAE C2/CC2','CPE ST3','Orlando, FL',null,null,['Y'],'Capability Program Executive: Simulation, Training, Test and Threat');
  await upsert('cpe_isw','Army','Army',null,'PAE C2/CC2','CPE ISW','Aberdeen Proving Ground, MD',null,null,['Y'],'Capability Program Executive: Intelligence and Spectrum Warfare');
  await upsert('pae_sustainment','Army','Army',null,'Army Acquisition','PAE Agile Sustainment','Picatinny Arsenal, NJ',null,null,['Y'],'Portfolio Acquisition Executive: Agile Sustainment and Ammunition');
  await upsert('cpe_combat_logistics','Army','Army',null,'PAE Agile Sustainment','CPE Combat Logistics','Picatinny Arsenal, NJ',null,null,['Y'],'Capability Program Executive: Combat Logistics');
  await upsert('cpe_ammo','Army','Army',null,'PAE Agile Sustainment','CPE Ammo','Picatinny Arsenal, NJ',null,null,['Y'],'Capability Program Executive: Ammunition and Energetics');
  await upsert('pae_cbrn','Army','Army',null,'Army Acquisition','PAE CBRN','Aberdeen Proving Ground, MD',null,null,['Y'],'Portfolio Acquisition Executive: Layered Protection and CBRN');
  await upsert('cpe_cbrnd','Army','Army',null,'PAE CBRN','CPE CBRND','Aberdeen Proving Ground, MD',null,null,['Y'],'Capability Program Executive: Joint CBRN Defense');
  await upsert('cpe_es2','Army','Army',null,'PAE CBRN','CPE ES2','Aberdeen Proving Ground, MD',null,null,['Y'],'Capability Program Executive: Enterprise Software and Service');
  await upsert('aal','Army','Army',null,'Army Innovation','AAL','Austin, TX',null,'Y',['Y'],'Army Application Lab');
  await upsert('army_swf','Army','Army',null,'Army Innovation','Army Software Factory','Austin, TX',null,'Y',['Y'],'Army Software Factory');
  await upsert('t2com','Army','Army',null,'Army Training','T2COM','Fort Eustis, VA',null,null,[],'Army Transformation and Training Command');
  await upsert('cac','Army','Army',null,'T2COM','CAC','Fort Leavenworth, KS',null,null,[],'Combined Arms Command');
  await upsert('devcom','Army','Army',null,'T2COM','DEVCOM','Aberdeen Proving Ground, MD',null,'Y',['Y'],'Army Combat Capabilities Development Command');
  await upsert('army_med_rd','Army','Army',null,'T2COM','MRDC','Fort Detrick, MD',null,'Y',['Y'],'Medical Research and Development Command');
  await upsert('army_university','Army','Army',null,'Army Training','Army University','Fort Leavenworth, KS',null,null,[],'Army University');
  await upsert('amc','Army','Army',null,'Army Materiel','AMC','Redstone Arsenal, AL',null,null,[],'Army Material Command');
  await upsert('army_acc','Army','Army',null,'AMC','ACC','Redstone Arsenal, AL',null,null,['Y'],'Army Contracting Command');
  await upsert('amcom','Army','Army',null,'AMC','AMCOM','Redstone Arsenal, AL',null,null,[],'Army Aviation and Missile Command');
  await upsert('cecom','Army','Army',null,'AMC','CECOM','Aberdeen Proving Ground, MD',null,null,[],'Army Communications-Electronics Command');
  await upsert('jmc','Army','Army',null,'AMC','JMC','Rock Island, IL',null,null,[],'U.S. Army Joint Munitions Command');
  await upsert('asc','Army','Army',null,'AMC','ASC','Rock Island, IL',null,null,[],'Army Sustainment Command');
  await upsert('atec','Army','Army',null,'AMC','ATEC','Aberdeen Proving Ground, MD',null,null,[],'Army Test and Evaluation Command');
  await upsert('tacom','Army','Army',null,'AMC','TACOM','Detroit Arsenal, MI',null,null,[],'Tank, Automotive and Armaments Command');
  await upsert('usasac','Army','Army',null,'AMC','USASAC','Redstone Arsenal, AL',null,null,[],'Army Security Assistance Command');
  await upsert('secnav','Navy','Navy',null,'Navy','SECNAV','Pentagon, Arlington, VA',null,null,[],'Secretary of the Navy');
  await upsert('navrco','Navy','Navy',null,'Navy HQ','NAVRCO','Washington, DC',null,'Y',['Y'],'Navy Rapid Capabilities Office');
  await upsert('opnav','Navy','Navy',null,'Navy HQ','OPNAV','Pentagon, Arlington, VA',null,null,[],'Office of the Chief of Naval Operations');
  await upsert('usff','Navy','Navy',null,'Navy','USFF','Norfolk, VA',null,null,[],'U.S. Navy Fleet Forces Command');
  await upsert('uspacflt','Navy','Navy',null,'Navy','USPACFLT','Pearl Harbor, HI',null,null,[],'U.S. Pacific Fleet');
  await upsert('navifor','Navy','Navy',null,'Navy','NAVIFOR','Norfolk, VA',null,null,[],'U.S. Navy Information Forces');
  await upsert('cnaf','Navy','Navy',null,'Navy','CNAF','Norfolk, VA',null,null,[],'Naval Air Forces');
  await upsert('onr','Navy','Navy',null,'Navy R&D','ONR','Arlington, VA',null,'Y',['Y'],'Office of Naval Research');
  await upsert('pae_ras','Navy','Navy',null,'Navy Acquisition','PAE RAS','Washington, DC',null,'Y',['Y'],'Portfolio Acquisition Executive: Robotics and Autonomous Systems');
  await upsert('pae_maritime','Navy','Navy',null,'Navy Acquisition','PAE Maritime','Washington, DC',null,null,['Y'],'Portfolio Acquisition Executive: Maritime');
  await upsert('peo_carriers','Navy','Navy',null,'PAE Maritime','PEO Carriers','Washington, DC',null,null,['Y'],'Program Executive Officer, Aircraft Carriers');
  await upsert('pae_munitions','Navy','Navy',null,'Navy Acquisition','PAE Munitions','Washington, DC',null,null,['Y'],'Portfolio Acquisition Executive: Munitions');
  await upsert('peo_iws','Navy','Navy',null,'Navy Acquisition','PEO IWS','Washington, DC',null,null,['Y'],'PEO Integrated Warfare Systems');
  await upsert('pae_mission_sys','Navy','Navy',null,'Navy Acquisition','PAE Mission Systems','Washington, DC',null,null,['Y'],'Portfolio Acquisition Executive: Mission Systems');
  await upsert('navsea','Navy','Navy',null,'Navy Systems','NAVSEA','Washington, DC',null,null,['Y'],'Naval Sea Systems Command');
  await upsert('peo_ssn','Navy','Navy',null,'NAVSEA','PEO SSN','Washington, DC',null,null,['Y'],'PEO Attack Submarines');
  await upsert('peo_aukus','Navy','Navy',null,'NAVSEA','PEO AUKUS','Washington, DC',null,null,['Y'],'PEO AUKUS Direct Reporting Program Office');
  await upsert('peo_usc','Navy','Navy',null,'NAVSEA','PEO USC','Washington, DC',null,null,['Y'],'PEO Unmanned and Small Combatants');
  await upsert('nnptc','Navy','Navy',null,'NAVSEA','NNPTC','Goose Creek, SC',null,null,[],'Naval Nuclear Power Training Command');
  await upsert('navair','Navy','Navy',null,'Navy Systems','NAVAIR','Patuxent River, MD',null,null,['Y'],'Naval Air Systems Command');
  await upsert('nawcad','Navy','Navy',null,'NAVAIR','NAWCAD','Patuxent River, MD',null,'Y',['Y'],'Naval Air Warfare Center Aircraft Division');
  await upsert('nawcwd','Navy','Navy',null,'NAVAIR','NAWCWD','China Lake, CA',null,'Y',['Y'],'Naval Air Warfare Center Weapons Division');
  await upsert('peo_a','Navy','Navy',null,'NAVAIR','PEO(A)','Patuxent River, MD',null,null,['Y'],'PEO Air Anti-Submarine Warfare, Assault and Special Mission');
  await upsert('peo_t','Navy','Navy',null,'NAVAIR','PEO(T)','Patuxent River, MD',null,null,['Y'],'PEO Tactical Aircraft Programs');
  await upsert('peo_uw','Navy','Navy',null,'NAVAIR','PEO(U&W)','Patuxent River, MD',null,null,['Y'],'PEO Unmanned Aviation and Strike Weapons');
  await upsert('peo_f35','Navy','Navy',null,'NAVAIR','PEO F-35','Arlington, VA',null,null,['Y'],'PEO F-35 Lightning II Joint Program Office');
  await upsert('navwar','Navy','Navy',null,'Navy Systems','NAVWAR','San Diego, CA',null,null,['Y'],'Naval Information Warfare Systems Command');
  await upsert('niwc_atlantic','Navy','Navy',null,'NAVWAR','NIWC Atlantic','North Charleston, SC',null,'Y',['Y'],'Naval Information Warfare Center Atlantic');
  await upsert('niwc_pacific','Navy','Navy',null,'NAVWAR','NIWC Pacific','San Diego, CA',null,'Y',['Y'],'Naval Information Warfare Center Pacific');
  await upsert('peo_c4i','Navy','Navy',null,'NAVWAR','PEO C4I','San Diego, CA',null,null,['Y'],'PEO Command, Control, Communications, Computers and Intelligence');
  await upsert('peo_digital','Navy','Navy',null,'NAVWAR','PEO Digital','San Diego, CA',null,null,['Y'],'PEO Digital and Enterprise Services');
  await upsert('peo_mlb','Navy','Navy',null,'NAVWAR','PEO MLB','San Diego, CA',null,null,['Y'],'PEO Manpower, Logistics and Business Solutions');
  await upsert('navfac','Navy','Navy',null,'Navy Systems','NAVFAC','Washington, DC',null,null,['Y'],'Naval Facilities Engineering Systems Command');
  await upsert('navy_ssp','Navy','Navy',null,'Navy Systems','SSP','Washington, DC',null,null,['Y'],'Navy Strategic Systems Programs');
  await upsert('navy_nnpp','Navy','Navy',null,'Navy Systems','NNPP','Washington, DC',null,null,[],'Naval Nuclear Propulsion Program');
  await upsert('usmc','Marine Corps','Marine Corps',null,'Marine Corps','HQMC','Pentagon, Arlington, VA',null,null,[],'Headquarters Marine Corps');
  await upsert('usmc_aviation','Marine Corps','Marine Corps',null,'Marine Corps','USMC Aviation','Quantico, VA',null,null,[],'Marine Corps Aviation');
  await upsert('usmc_training','Marine Corps','Marine Corps',null,'Marine Corps','Marine Training Cmd','Quantico, VA',null,null,[],'Marine Corps Training Command');
  await upsert('mccdc','Marine Corps','Marine Corps',null,'Marine Corps','MCCDC','Quantico, VA',null,null,[],'Marine Corps Combat Development and Integration');
  await upsert('marcorsyscom','Marine Corps','Marine Corps',null,'Marine Corps','MARCORSYSCOM','Quantico, VA',null,null,['Y'],'Marine Corps Systems Command');
  await upsert('pae_usmc','Marine Corps','Marine Corps',null,'Marine Corps','PAE USMC','Quantico, VA',null,null,['Y'],'Portfolio Acquisition Executive for the Marine Corps');
  await upsert('marforres','Marine Corps','Marine Corps',null,'Marine Corps','MARFORRES','New Orleans, LA',null,null,[],'Marine Forces Reserve');
  await upsert('usmc_edcom','Marine Corps','Marine Corps',null,'Marine Corps','EDCOM','Quantico, VA',null,null,[],'Marine Corps Training and Education Command');
  await upsert('usmc_recruiting','Marine Corps','Marine Corps',null,'Marine Corps','MCRC','Quantico, VA',null,null,[],'Marine Corps Recruiting Command');
  await upsert('af','Air Force','Air Force',null,'Air Force','AF HQ','Pentagon, Arlington, VA',null,null,[],'Department of the Air Force');
  await upsert('af_academy','Air Force','Air Force',null,'Air Force','USAFA','Colorado Springs, CO',null,null,[],'Air Force Academy');
  await upsert('aetc','Air Force','Air Force',null,'Air Force','AETC','Joint Base San Antonio, TX',null,null,[],'Air Education and Training Command');
  await upsert('afmc','Air Force','Air Force',null,'Air Force','AFMC','Wright-Patterson AFB, OH',null,null,[],'Air Force Material Command');
  await upsert('afrco','Air Force','Air Force',null,'Air Force Acquisition','AFRCO','Dahlgren, VA',null,'Y',['Y'],'Air Force PEO Rapid Capabilities Office');
  await upsert('sda','Air Force','Air Force',null,'Air Force','SDA','El Segundo, CA',null,'Y',['Y'],'Space Development Agency');
  await upsert('af_acc','Air Force','Air Force',null,'Air Force','ACC','Langley AFB, VA',null,null,[],'Air Combat Command');
  await upsert('af_sustainment','Air Force','Air Force',null,'AFMC','AF Sustainment Center','Tinker AFB, OK',null,null,[],'Air Force Sustainment Center');
  await upsert('aflcmc','Air Force','Air Force',null,'AFMC','AFLCMC','Wright-Patterson AFB, OH',null,null,['Y'],'Air Force Life Cycle Management Center');
  await upsert('aflcmc_c3bm','Air Force','Air Force',null,'AFLCMC','PEO C3BM','Hanscom AFB, MA',null,null,['Y'],'PEO Command, Control, Communications and Battle Management');
  await upsert('aflcmc_eb','Air Force','Air Force',null,'AFLCMC','PEO Armament','Eglin AFB, FL',null,null,['Y'],'PEO Armament Directorate');
  await upsert('aflcmc_bes','Air Force','Air Force',null,'AFLCMC','PEO BES','Wright-Patterson AFB, OH',null,null,['Y'],'PEO Business and Enterprise Systems');
  await upsert('aflcmc_hb','Air Force','Air Force',null,'AFLCMC','PEO Electronic Systems','Hanscom AFB, MA',null,null,['Y'],'PEO Electronic Systems Directorate');
  await upsert('aflcmc_hn','Air Force','Air Force',null,'AFLCMC','PEO Cyber Networks','Hanscom AFB, MA',null,null,['Y'],'PEO Cyber and Networks Directorate');
  await upsert('aflcmc_pb','Air Force','Air Force',null,'AFLCMC','PEO Propulsion','Wright-Patterson AFB, OH',null,null,['Y'],'PEO Propulsion Directorate');
  await upsert('aflcmc_wa','Air Force','Air Force',null,'AFLCMC','PEO Fighters','Wright-Patterson AFB, OH',null,null,['Y'],'PEO Fighters and Advanced Aircraft Directorate');
  await upsert('aflcmc_wb','Air Force','Air Force',null,'AFLCMC','PEO Bombers','Wright-Patterson AFB, OH',null,null,['Y'],'PEO Bombers Directorate');
  await upsert('aflcmc_wi','Air Force','Air Force',null,'AFLCMC','PEO ISR SOF','Wright-Patterson AFB, OH',null,null,['Y'],'PEO ISR and SOF Directorate');
  await upsert('aflcmc_wl','Air Force','Air Force',null,'AFLCMC','PEO Mobility','Wright-Patterson AFB, OH',null,null,['Y'],'PEO Mobility Directorate');
  await upsert('aflcmc_wn','Air Force','Air Force',null,'AFLCMC','PEO Training','Randolph AFB, TX',null,null,['Y'],'PEO Training Directorate');
  await upsert('aflcmc_jsf','Air Force','Air Force',null,'AFLCMC','PEO JSF','Arlington, VA',null,null,['Y'],'PEO Joint Strike Fighter Directorate');
  await upsert('aflcmc_afsac','Air Force','Air Force',null,'AFLCMC','AFSAC','Wright-Patterson AFB, OH',null,null,['Y'],'Security Assistance and Cooperation Directorate');
  await upsert('afnwc','Air Force','Air Force',null,'Air Force','AFNWC','Kirtland AFB, NM',null,null,['Y'],'Air Force Nuclear Weapons Center');
  await upsert('afnwc_nad','Air Force','Air Force',null,'AFNWC','PEO NAD','Kirtland AFB, NM',null,null,['Y'],'PEO Air-Delivered Capability Directorate');
  await upsert('afnwc_icbm','Air Force','Air Force',null,'AFNWC','PEO ICBM','Hill AFB, UT',null,null,['Y'],'PEO Intercontinental Ballistic Missile Systems');
  await upsert('afnwc_nc3','Air Force','Air Force',null,'AFNWC','PEO NC3','Kirtland AFB, NM',null,null,['Y'],'PEO Nuclear Command, Control and Comms Integration');
  await upsert('afnwc_nti','Air Force','Air Force',null,'AFNWC','Nuclear Tech Integration','Kirtland AFB, NM',null,'Y',[],'Nuclear Technology and Integration Directorate');
  await upsert('afrl','Air Force','Air Force',null,'AFMC','AFRL','Wright-Patterson AFB, OH',null,'Y',['Y'],'Air Force Research Laboratory');
  await upsert('ussf','Space Force','Space Force',null,'Space Force','USSF HQ','Pentagon, Arlington, VA',null,null,[],'United States Space Force');
  await upsert('spoc','Space Force','Space Force',null,'Space Force','spOC','Peterson SFB, CO',null,null,[],'Space Force Combat Forces Command');
  await upsert('ssc','Space Force','Space Force',null,'Space Force','SSC','El Segundo, CA',null,null,['Y'],'Space Systems Command');
  await upsert('starcom','Space Force','Space Force',null,'Space Force','STARCOM','Peterson SFB, CO',null,null,[],'Space Training and Readiness Command');
  await upsert('pae_sensing','Space Force','Space Force',null,'SSC','PAE Sensing','El Segundo, CA',null,null,['Y'],'PAE Space-Based Sensing and Targeting');
  await upsert('pae_aats','Space Force','Space Force',null,'SSC','PAE AATS','El Segundo, CA',null,null,['Y'],'PAE Assured Access to Space');
  await upsert('pae_cp','Space Force','Space Force',null,'SSC','PAE Space Combat Power','El Segundo, CA',null,null,['Y'],'PAE Space Combat Power');
  await upsert('pae_bmc3i','Space Force','Space Force',null,'SSC','PAE BMC3I','El Segundo, CA',null,null,['Y'],'PAE Battle Management Command, Control and Comms');
  await upsert('peo_mcpnt','Space Force','Space Force',null,'SSC','PEO MCPNT','El Segundo, CA',null,null,['Y'],'PEO Military Comms and Positioning, Navigation and Timing');
  await upsert('peo_otti','Space Force','Space Force',null,'SSC','PEO OTTI','El Segundo, CA',null,null,['Y'],'PEO Operational Test and Training Infrastructure');
  await upsert('sf_rco','Space Force','Space Force',null,'Space Force','SF RCO','Kirtland AFB, NM',null,'Y',['Y'],'Space Force PEO Space Rapid Capabilities Office');
  await upsert('socom','SOCOM','SOCOM',null,'Combatant Command','SOCOM','MacDill AFB, FL',null,null,[],'US Special Operations Command');
  await upsert('socom_jsu','SOCOM','SOCOM',null,'SOCOM','JSOU','MacDill AFB, FL',null,null,[],'Joint Special Operations University');
  await upsert('socom_atl','SOCOM','SOCOM',null,'SOCOM','SOF-ATL','MacDill AFB, FL',null,null,['Y'],'Acquisition, Technology and Logistics (SOF-ATL)');
  await upsert('socom_dir_eis','SOCOM','SOCOM',null,'SOCOM','SOF DIR-EIS','MacDill AFB, FL',null,null,[],'Directorate of Enterprise Information Systems');
  await upsert('socom_peo_fw','SOCOM','SOCOM',null,'SOCOM Acquisition','PEO-FW','MacDill AFB, FL',null,null,['Y'],'SOF PEO Fixed Wing');
  await upsert('socom_peo_m','SOCOM','SOCOM',null,'SOCOM Acquisition','PEO-M','MacDill AFB, FL',null,null,['Y'],'SOF PEO Maritime');
  await upsert('socom_peo_rw','SOCOM','SOCOM',null,'SOCOM Acquisition','PEO-RW','MacDill AFB, FL',null,null,['Y'],'SOF PEO Rotary Wing');
  await upsert('socom_peo_sda','SOCOM','SOCOM',null,'SOCOM Acquisition','PEO-SDA','MacDill AFB, FL',null,'Y',['Y'],'SOF PEO Digital Applications');
  await upsert('socom_peo_sofsa','SOCOM','SOCOM',null,'SOCOM Acquisition','PEO-SOFSA','MacDill AFB, FL',null,null,['Y'],'SOF PEO Special Operations Forces Support Activity');
  await upsert('socom_peo_sw','SOCOM','SOCOM',null,'SOCOM Acquisition','PEO-SW','MacDill AFB, FL',null,null,['Y'],'SOF PEO Special Operations Forces Warrior');
  await upsert('socom_peo_tis','SOCOM','SOCOM',null,'SOCOM Acquisition','PEO-TIS','MacDill AFB, FL',null,null,['Y'],'SOF PEO Tactical Information Systems');
  await upsert('jsoc','SOCOM','SOCOM',null,'SOCOM','JSOC','Fort Liberty, NC',null,null,[],'Joint Special Operations Command');
  await upsert('seals','SOCOM','SOCOM',null,'SOCOM','NSW','Coronado, CA',null,null,[],'Naval Special Warfare Command (SEALs)');
  await upsert('arsoc','SOCOM','SOCOM',null,'SOCOM','ARSOC','Fort Liberty, NC',null,null,[],'Army Special Operations Command');
  await upsert('afsoc','SOCOM','SOCOM',null,'SOCOM','AFSOC','Hurlburt Field, FL',null,null,[],'Air Force Special Operations Command');
  await upsert('marsoc','SOCOM','SOCOM',null,'SOCOM','MARSOC','Camp Lejeune, NC',null,null,[],'Marine Corps Special Operations Command');
  await upsert('indopacom','INDOPACOM','Combatant Command',null,'Combatant Command','INDOPACOM','Camp H.M. Smith, HI',null,null,[],'Indo-Pacific Command');
  await upsert('centcom','CENTCOM','Combatant Command',null,'Combatant Command','CENTCOM','MacDill AFB, FL',null,null,[],'US Central Command');
  await upsert('eucom','EUCOM','Combatant Command',null,'Combatant Command','EUCOM','Patch Barracks, Stuttgart, Germany',null,null,[],'European Command');
  await upsert('southcom','SOUTHCOM','Combatant Command',null,'Combatant Command','SOUTHCOM','Miami, FL',null,null,[],'Southern Command');
  await upsert('northcom','NORTHCOM','Combatant Command',null,'Combatant Command','NORTHCOM','Peterson SFB, CO',null,null,[],'Northern Command');
  await upsert('africom','AFRICOM','Combatant Command',null,'Combatant Command','AFRICOM','Kelley Barracks, Stuttgart, Germany',null,null,[],'Africa Command');
  await upsert('stratcom','STRATCOM','Combatant Command',null,'Combatant Command','STRATCOM','Offutt AFB, NE',null,null,[],'Strategic Command');
  await upsert('spacecom','SPACECOM','Combatant Command',null,'Combatant Command','SPACECOM','Schriever SFB, CO',null,null,[],'U.S. Space Command');
  await upsert('transcom','TRANSCOM','Combatant Command',null,'Combatant Command','TRANSCOM','Scott AFB, IL',null,null,[],'Transportation Command');
  await upsert('amc_transcom','TRANSCOM','Combatant Command',null,'TRANSCOM','AMC','Scott AFB, IL',null,null,[],'Air Mobility Command');
  await upsert('cybercom','CYBERCOM','Combatant Command',null,'Combatant Command','CYBERCOM','Fort Meade, MD',null,null,[],'Cyber Command');
  await upsert('osc_vc','OSD','DoW',null,'Government VC','Office of Strategic Capital','Washington, DC',null,'Y',['Y'],'Office of Strategic Capital');
  // ── Migrate contacts from legacy org IDs → new CSV IDs ──────────────────
  const migrations = [
    ['navy-hq',        'opnav'],
    ['army-hq',        'army'],
    ['army-amc',       'amc'],
    ['army-devcom',    'devcom'],
    ['army-aal',       'aal'],
    ['army-arcyber',   'arcyber'],
    ['army-rccto',     'army_rccto'],
    ['af-hq',          'af'],
    ['sf-hq',          'ussf'],
    ['pae-mng',        'pae_maneuver_ground'],
    ['pae-mna',        'pae_maneuver_air'],
    ['pae-fires',      'pae_fires'],
    ['pae-c2',         'pae_c2'],
    ['pae-sustainment','pae_sustainment'],
    ['pae-cbrn',       'pae_cbrn'],
    ['pae-ras',        'pae_ras'],
    ['pae-maritime',   'pae_maritime'],
    ['pae-ms',         'pae_mission_sys'],
    ['pae-usmc',       'pae_usmc'],
  ];

  for (const [oldId, newId] of migrations) {
    try {
      await db.sql`UPDATE contacts SET org_id = ${newId} WHERE org_id = ${oldId}`;
      contactsMigrated++;
    } catch(e) { errs.push('migrate:' + oldId + ':' + e.message.slice(0,60)); }
  }

  return Response.json({ orgsUpserted, contactsMigrated, errors: errs.slice(0,10) });
};

export const config = { path: '/api/seed-orgs-master' };
