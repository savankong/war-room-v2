import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { getDb } from '../db';

// Level, Name, Parent, LeaderName, LeaderTitle, Branch, Location, Description
const ROWS: Array<[number, string, string, string, string, string, string, string]> = [
  [1,'Department of War','Executive Branch','Pete Hegseth','Secretary of War','All','Pentagon Arlington VA','Cabinet-level department responsible for national defense renamed from Department of Defense in 2025'],
  [1,'Office of the Secretary of War','Department of War','Pete Hegseth','Secretary of War','All','Pentagon','Top civilian leadership overseeing all DoW operations'],
  [1,'Office of Inspector General','OSW','Platte Moring','Inspector General','All','Pentagon','Independent oversight of DoW programs and operations'],
  [1,'Office of Legislative Affairs','OSW','Macon Dane Hughes','Assistant Secretary for Legislative Affairs','All','Pentagon','Manages DoW relations with Congress'],
  [1,'Washington Headquarters Services','OSW','Regina F. Meiners','Director','All','Alexandria VA','Provides administrative support to OSW'],
  [1,'Joint Chiefs of Staff','OSW','GEN Dan Caine','Chairman','All','Pentagon','Principal military advisors to President SecWar and NSC'],
  [2,'Under Secretary for Acquisition and Sustainment','OSW','Michael Duffey','Under Secretary','All','Pentagon','Oversees all DoW acquisition and sustainment activities'],
  [2,'Under Secretary for Research and Engineering','OSW','Emil Michael','Under Secretary and DoW CTO','All','Pentagon','Oversees DoW research development and engineering'],
  [2,'Under Secretary for Policy','OSW','Elbridge Colby','Under Secretary','All','Pentagon','Oversees DoW policy formulation'],
  [2,'Under Secretary for Intelligence and Security','OSW','Bradley Hansell','Under Secretary','All','Pentagon','Oversees defense intelligence and security enterprise'],
  [2,'Under Secretary for Personnel and Readiness','OSW','Anthony Tata','Under Secretary','All','Pentagon','Manages DoW human resources and readiness'],
  [2,'Under Secretary Comptroller CFO','OSW','Jules W. Hurst III','Under Secretary and CFO','All','Pentagon','Oversees DoW budget and financial management'],
  [2,'Cost Assessment and Program Evaluation CAPE','OSW','Michael Payne','Acting Director','All','Pentagon','Provides cost analysis and program evaluation'],
  [2,'DoW Chief Information Officer','OSW','Kirsten Davies','DoW CIO','All','Pentagon','Chief information officer for entire DoW'],
  [2,'Joint Staff J1 Manpower','Joint Chiefs','MG Paige M. Jennings','Director','All','Pentagon','Manpower and personnel for joint operations'],
  [2,'Joint Staff J2 Intelligence','Joint Chiefs','VADM Thomas M. Henderschedt','Director','All','Pentagon','Intelligence for joint operations'],
  [2,'Joint Staff J3 Operations','Joint Chiefs','LTG David L. Odom','Director','All','Pentagon','Joint operations directorate'],
  [2,'Joint Staff J4 Logistics','Joint Chiefs','LTG Keith D. Reventlow','Director','All','Pentagon','Joint logistics directorate'],
  [2,'Joint Staff J5 Strategy Plans Policy','Joint Chiefs','LTG Brett G. Sylvia','Director','All','Pentagon','Strategic plans and policy'],
  [2,'Joint Staff J6 C4 Cyber','Joint Chiefs','LTG David T. Isaacson','Director and CIO','All','Pentagon','Command control communications computers and cyber'],
  [2,'Joint Staff J7 Joint Force Development','Joint Chiefs','LTG Stephen E. Liszewski','Director','All','Pentagon','Joint force training and development'],
  [2,'Joint Staff J8 Force Structure','Joint Chiefs','LTG Steven Whitney','Director','All','Pentagon','Force structure and resource assessment'],
  [3,'JIATF-401 Counter-UAS','Direct Reporting to DepSecWar','BG Matt Ross','Director','DoW','Fort Liberty NC','Lead organization for counter-small UAS development'],
  [3,'Golden Dome Missile Defense','Direct Reporting to DepSecWar','GEN Michael A. Guetlein','Director DRPM','DoW','Peterson SFB CO','Space-based missile defense shield'],
  [3,'Submarine DRPM','Direct Reporting to DepSecWar','VADM Robert M. Gaucher','Director DRPM','DoW','Washington Navy Yard DC','Oversees Virginia and Columbia-class submarine construction'],
  [3,'Critical Major Weapon Systems DRPM','Direct Reporting to DepSecWar','GEN Dale R. White','Director DRPM','DoW','Multiple Locations','Oversees B-21 F-47 Sentinel VC-25B Minuteman III'],
  [3,'Special Access Programs Central Office SAPCO','Direct Reporting to DepSecWar','MG David W. Abba','Director','DoW','Pentagon','Manages DoW special access programs'],
  [3,'Economic Defense Unit','OUSD R&E','George K. Kollitides II','Head','DoW','Pentagon','Leads economic competition and national security'],
  [3,'Office of Strategic Capital','OUSD R&E','David Lorch','Director','DoW','Pentagon','Provides debt investment and equipment financing'],
  [3,'Defense Innovation Unit DIU','OUSD R&E','Owen West','Director','DoW','Mountain View CA','Field commercial technology to military at commercial speeds'],
  [3,'DARPA','OUSD R&E','Stephen Winchell','Director','DoW','Arlington VA','Creates and prevents strategic surprise through technology'],
  [3,'Strategic Capabilities Office SCO','OUSD R&E','Jay Dryer','Director','DoW','Pentagon','Identifies disruptive applications of existing systems'],
  [3,'Missile Defense Agency MDA','OUSD R&E','LTG Heath Collins','Director','DoW','Fort Belvoir VA','Develops and fields missile defense systems'],
  [4,'Department of the Army','OSW','Daniel P. Driscoll','Secretary of the Army','Army','Pentagon','Military department responsible for land warfare'],
  [4,'Department of the Navy','OSW','Hung Cao','Acting Secretary','DoN','Pentagon','Military department for Navy and Marine Corps'],
  [4,'Department of the Air Force','OSW','Dr. Troy E. Meink','Secretary of the Air Force','Air Force/Space Force','Pentagon','Military department for Air Force and Space Force'],
  [4,'United States Coast Guard','Department of Homeland Security','ADM Kevin Lunday','Commandant','Coast Guard','Washington DC','Part of DHS not DoW but works closely with DoW'],
  [4,'Combatant Commands','OSW','','','All','Worldwide','11 commands that conduct military operations'],
  [6,'Army Chief of Staff','Department of the Army','','Chief of Staff','Army','Pentagon','Highest ranking Army officer'],
  [6,'Army Vice Chief of Staff','Department of the Army','LTG Christopher C. LaNeve','Vice Chief of Staff','Army','Pentagon','Second highest ranking Army officer'],
  [6,'Office of the Secretary of the Army','Department of the Army','Daniel P. Driscoll','Secretary','Army','Pentagon','Civilian leadership of Army'],
  [6,'ASA Financial Management and Comptroller','Office of the Secretary of the Army','Marc E. Andersen','Assistant Secretary','Army','Pentagon','Manages Army budget'],
  [6,'ASA Installations Energy and Environment','Office of the Secretary of the Army','William Jordan Gillis','Assistant Secretary','Army','Pentagon','Manages Army installations and environment'],
  [6,'ASA Civil Works','Office of the Secretary of the Army','Adam Telle','Assistant Secretary','Army','Pentagon','Manages Army civil works projects'],
  [6,'ASA Manpower and Reserve Affairs','Office of the Secretary of the Army','Derrick M. Anderson','Senior Official Performing Duties','Army','Pentagon','Manages Army personnel'],
  [6,'ASA Acquisition Logistics and Technology ASA ALT','Office of the Secretary of the Army','Brent Ingraham','Assistant Secretary','Army','Pentagon','Top Army acquisition executive'],
  [6,'Army General Counsel','Office of the Secretary of the Army','Charles Young III','General Counsel','Army','Pentagon','Chief legal officer of Army'],
  [6,'Army Staff G-1 Personnel','Department of the Army','LTG Brian S. Eifler','Deputy Chief of Staff','Army','Pentagon','Army personnel directorate'],
  [6,'Army Staff G-2 Intelligence','Department of the Army','LTG Michelle A. Schmidt','Deputy Chief of Staff','Army','Pentagon','Army intelligence directorate'],
  [6,'Army Staff G-3/5/7 Operations','Department of the Army','MG Stephanie R. Ahern','Deputy Chief of Staff','Army','Pentagon','Operations plans and training'],
  [6,'Army Staff G-4 Logistics','Department of the Army','LTG Michelle K. Donahue','Deputy Chief of Staff','Army','Pentagon','Army logistics directorate'],
  [6,'Army Staff G-6 Network','Department of the Army','LTG Jeth B. Rey','Deputy Chief of Staff','Army','Pentagon','Army network and communications'],
  [6,'Army Staff G-8 Programs','Department of the Army','LTG Peter N. Bechoff','Deputy Chief of Staff','Army','Pentagon','Army programs and budget'],
  [6,'Army INSCOM','Department of the Army','MG Timothy D. Brown','Commanding General','Army','Fort Belvoir VA','Army Intelligence and Security Command'],
  [6,'U.S. Army Pacific USARPAC','Department of the Army','GEN Ronald Clark','Commander','Army','Fort Shafter HI','Army component command for Indo-Pacific'],
  [6,'U.S. Army Europe and Africa','Department of the Army','GEN Christopher Donahue','Commanding General','Army','Wiesbaden Germany','Army component for Europe and Africa'],
  [6,'U.S. Army Western Hemisphere Command','Department of the Army','GEN Joseph Ryan','Commander','Army','San Antonio TX','Merged FORSCOM Army North and Army South'],
  [6,'Army Cyber Command ARCYBER','Department of the Army','LTG Christopher Eubank','Commanding General','Army','Fort Eisenhower GA','Army cyber operations'],
  [6,'Army Special Operations Command','Department of the Army','LTG Lawrence Gil Ferguson','Commanding General','Army','Fort Bragg NC','Army special operations'],
  [6,'Army National Guard','Department of the Army','LTG Jonathan M. Stubbs','Director','Army','Arlington VA','National Guard Bureau Army'],
  [6,'Army Materiel Command AMC','Department of the Army','LTG Chris Mohan','Commanding General','Army','Redstone Arsenal AL','Army logistics and materiel'],
  [6,'Army Transformation and Training Command T2COM','Department of the Army','LTG Edmond Miles Brown','Acting Commanding General','Army','Fort Eustis VA','Merged TRADOC and Army Futures Command'],
  [6,'Army Contracting Command ACC','Army Materiel Command AMC','MG Douglas S. Lowrey','Commanding General','Army','Redstone Arsenal AL','Army contracting'],
  [6,'Army Aviation and Missile Command AMCOM','Army Materiel Command AMC','MG Lori L. Robinson','Commanding General','Army','Redstone Arsenal AL','Aviation and missile logistics'],
  [6,'Army Communications-Electronics Command CECOM','Army Materiel Command AMC','MG James D. Turinetti IV','Commanding General','Army','Aberdeen Proving Ground MD','Communications and electronics'],
  [6,'Army Test and Evaluation Command ATEC','Army Materiel Command AMC','MG Patrick L. Gaydon','Commanding General','Army','Aberdeen Proving Ground MD','Army testing and evaluation'],
  [6,'Army Sustainment Command ASC','Army Materiel Command AMC','MG Eric P. Shirley','Commanding General','Army','Rock Island Arsenal IL','Army sustainment'],
  [6,'Tank-Automotive and Armaments Command TACOM','Army Materiel Command AMC','BG Beth A. Behn','Commanding General','Army','Warren MI','Tank and automotive systems'],
  [6,'Army Security Assistance Command USASAC','Army Materiel Command AMC','BG Allen J. Pepper','Commanding General','Army','Warren MI','Foreign military sales'],
  [6,'Joint Munitions Command JMC','Army Materiel Command AMC','BG Daniel J. Duncan','Commander','Army','Rock Island Arsenal IL','Joint munitions management'],
  [6,'DEVCOM Combat Capabilities Development Command','Army Transformation and Training Command T2COM','BG Robert G. Born','Commanding General','Army','Aberdeen Proving Ground MD','Army research and development'],
  [6,'Army Research Laboratory ARL','DEVCOM Combat Capabilities Development Command','Dr. Eric L. Moore','Acting Director','Army','Aberdeen Proving Ground MD','Army basic and applied research'],
  [6,'DEVCOM C5ISR Center','DEVCOM Combat Capabilities Development Command','Elizabeth Beth Ferry SES','Director','Army','Aberdeen Proving Ground MD','Command control communications intelligence'],
  [6,'DEVCOM Armaments Center','DEVCOM Combat Capabilities Development Command','Chris J. Grassano','Director','Army','Picatinny Arsenal NJ','Armaments research'],
  [6,'DEVCOM Aviation and Missile Center','DEVCOM Combat Capabilities Development Command','Dr. James Kirsch SES','Director','Army','Redstone Arsenal AL','Aviation and missile research'],
  [6,'DEVCOM Chemical Biological Center','DEVCOM Combat Capabilities Development Command','Mr. Michael Bailey','Director','Army','Aberdeen Proving Ground MD','Chemical biological defense'],
  [6,'DEVCOM Ground Vehicle Systems Center GVSC','DEVCOM Combat Capabilities Development Command','Mr. Michael Cadieux','Director','Army','Warren MI','Ground vehicle systems'],
  [6,'DEVCOM Soldier Center','DEVCOM Combat Capabilities Development Command','Mr. Douglas A. Tamilio','Director','Army','Natick MA','Soldier performance and protection'],
  [6,'DEVCOM Analysis Center','DEVCOM Combat Capabilities Development Command','Mr. Larry Larimer','Director','Army','Aberdeen Proving Ground MD','Army analysis'],
  [6,'Army Medical Research and Development Command','Army Transformation and Training Command T2COM','MG Paula C. Lodi','Commanding General','Army','Fort Detrick MD','Medical research'],
  [6,'Army Software Factory','Army Transformation and Training Command T2COM','COL Vito Errico','Director','Army','Austin TX','Software development for soldiers'],
  [6,'Army War College','Department of the Army','MG Trevor J. Bredenkamp','Commandant','Army','Fort Leavenworth KS','Senior professional military education'],
  [6,'101st Airborne Division','Department of the Army','MG David W. Gardner','Commanding General','Army','Fort Campbell KY','Air assault division'],
  [6,'82nd Airborne Division','Department of the Army','MG Brandon Tegtmeier','Commanding General','Army','Fort Liberty NC','Parachute infantry division'],
  [6,'3rd Infantry Division','Department of the Army','MG John W. Lubas','Commander','Army','Fort Stewart GA','Heavy mechanized division'],
  [6,'10th Mountain Division','Department of the Army','MG Scott M. Naumann','Commander','Army','Fort Drum NY','Light infantry mountain division'],
  [6,'25th Infantry Division','Department of the Army','MG James Bartholomees','Commanding General','Army','Schofield Barracks HI','Tropical light infantry'],
  [6,'1st Cavalry Division','Department of the Army','MG Thomas Feltey','Commander','Army','Fort Cavazos TX','Heavy armored division'],
  [6,'PAE Maneuver Ground','ASA Acquisition Logistics and Technology ASA ALT','MG Colin P. Tuley','Portfolio Acquisition Executive','Army','Fort Benning GA','Tanks IFVs and soldier systems'],
  [6,'PAE Maneuver Air','ASA Acquisition Logistics and Technology ASA ALT','MG Clair A. Gill','Portfolio Acquisition Executive','Army','Fort Rucker AL','Helicopters UAS and autonomy'],
  [6,'PAE Fires','ASA Acquisition Logistics and Technology ASA ALT','MG Frank J. Lozano','Portfolio Acquisition Executive','Army','Redstone Arsenal AL','Missiles artillery and long-range precision'],
  [5,'Office of the Secretary of the Air Force','Department of the Air Force','Dr. Troy E. Meink','Secretary','Air Force/Space Force','Pentagon','Civilian leadership'],
  [5,'Air Force Chief of Staff','Department of the Air Force','GEN Kenneth S. Wilsbach','Chief of Staff','Air Force/Space Force','Pentagon','Highest ranking Air Force officer'],
  [5,'Air Force Materiel Command AFMC','Department of the Air Force','LTG Linda S. Hurry','Commander','Air Force/Space Force','Dayton OH','Air Force materiel'],
  [5,'Air Combat Command ACC','Department of the Air Force','GEN Adrian L. Spain','Commander','Air Force/Space Force','Langley AFB VA','Air combat'],
  [5,'Air Education and Training Command AETC','Department of the Air Force','LTG Clark J. Quinn','Commander','Air Force/Space Force','San Antonio TX','Air Force training'],
  [5,'Air Force Global Strike Command AFGSC','Department of the Air Force','GEN Stephen L. Davis','Commander','Air Force/Space Force','Barksdale AFB LA','Strategic nuclear deterrence'],
  [5,'Pacific Air Forces PACAF','Department of the Air Force','GEN Kevin B. Schneider','Commander','Air Force/Space Force','Hickam AFB HI','Pacific air'],
  [5,'Air Force Special Operations Command AFSOC','Department of the Air Force','LTG Michael E. Conley','Commander','Air Force/Space Force','Hurlburt Field FL','Air Force special operations'],
  [5,'Air Force Life Cycle Management Center AFLCMC','Air Force Materiel Command AFMC','LTG Donna D. Shipton','Commander','Air Force/Space Force','Dayton OH','Life cycle management'],
  [5,'Air Force Research Laboratory AFRL','Air Force Materiel Command AFMC','BG Jason E. Bartolomei','Commander','Air Force/Space Force','Dayton OH','Research and development'],
  [5,'AFWERX','Air Force Research Laboratory AFRL','COL Nathan C. Stuckey','Director','Air Force/Space Force','Dayton OH','Air Force innovation arm'],
  [5,'Air Force Rapid Capabilities Office AFRCO','Department of the Air Force','William D. Bailey SES','Program Executive Officer','Air Force/Space Force','Dayton OH','Rapid capabilities'],
  [5,'AFLCMC PEO Joint Strike Fighter','Air Force Life Cycle Management Center AFLCMC','LTG Gregory L. Masiello','Program Executive Officer','Air Force/Space Force','Arlington VA','F-35 program'],
  [4,'United States Space Force','Department of the Air Force','GEN B. Chance Saltzman','Chief of Space Operations','Space Force','Pentagon','Independent military service for space'],
  [5,'Space Systems Command SSC','United States Space Force','LTG Philip A. Garrant','Commander','Space Force','Los Angeles AFB CA','Space acquisition'],
  [5,'Combat Forces Command SpOC','United States Space Force','LTG Greg Gagnon','Commander','Space Force','Peterson SFB CO','Space operations'],
  [5,'Space Training and Readiness Command STARCOM','United States Space Force','MG James E. Smith','Commander','Space Force','Peterson SFB CO','Space training'],
  [5,'Space Development Agency SDA','Space Systems Command SSC','Dr. Gurpartap GP Sandhoo','Director','Space Force','Chantilly VA','Space development'],
  [5,'Space Delta 2 Space Domain Awareness','Combat Forces Command SpOC','COL Barry A. Croker','Commander','Space Force','Peterson SFB CO','Space domain awareness'],
  [5,'Space Delta 6 Cyberspace Warfare','Combat Forces Command SpOC','COL Travis R. Prater','Commander','Space Force','Schriever SFB CO','Cyberspace'],
  [5,'Space Delta 9 Orbital Warfare','Combat Forces Command SpOC','COL Ramsey M. Horn','Commander','Space Force','Schriever SFB CO','Orbital warfare'],
  [5,'Coast Guard Force Readiness Command FORCECOM','United States Coast Guard','RADM Jeffrey K. Randall','Commander','Coast Guard','Norfolk VA','CG readiness'],
  [5,'Coast Guard Atlantic Area','United States Coast Guard','VADM Nathan A. Moore','Commander','Coast Guard','Portsmouth VA','CG Atlantic'],
  [5,'Coast Guard Pacific Area','United States Coast Guard','VADM Joseph R. Buzzella','Commander','Coast Guard','Alameda CA','CG Pacific'],
  [5,'Coast Guard Research and Development Center RDC','United States Coast Guard','CAPT Michael Chien','Commanding Officer','Coast Guard','New London CT','CG R&D'],
  [4,'U.S. Central Command CENTCOM','Combatant Commands','ADM Brad Cooper','Commander','DoW','MacDill AFB FL','Central Command Middle East'],
  [4,'U.S. Africa Command AFRICOM','Combatant Commands','GEN Dagvin R.M. Anderson','Commander','DoW','Stuttgart Germany','Africa Command'],
  [4,'U.S. European Command EUCOM','Combatant Commands','GEN Alexus G. Grynkewich','Commander','DoW','Stuttgart Germany','European Command'],
  [4,'U.S. Indo-Pacific Command INDOPACOM','Combatant Commands','ADM Samuel Paparo','Commander','DoW','Camp H.M. Smith HI','Indo-Pacific Command'],
  [4,'U.S. Northern Command NORTHCOM','Combatant Commands','GEN Gregory M. Guillot','Commander','DoW','Peterson AFB CO','Northern Command'],
  [4,'U.S. Southern Command SOUTHCOM','Combatant Commands','LTG Frank Donovan','Commander','DoW','Miami FL','Southern Command'],
  [4,'U.S. Space Command SPACECOM','Combatant Commands','GEN Stephen N. Whiting','Commander','DoW','Schriever SFB CO','Space Command'],
  [4,'U.S. Special Operations Command SOCOM','Combatant Commands','ADM Frank Mitch M. Bradley','Commander','DoW','MacDill AFB FL','Special Operations Command'],
  [4,'U.S. Transportation Command TRANSCOM','Combatant Commands','GEN Randall Reed','Commander','DoW','Scott AFB IL','Transportation Command'],
  [4,'U.S. Strategic Command STRATCOM','Combatant Commands','ADM Richard Correll','Commander','DoW','Offutt AFB NE','Strategic Command'],
  [4,'U.S. Cyber Command CYBERCOM','Combatant Commands','LTG Joshua M. Rudd','Commander','DoW','Fort Meade MD','Cyber Command'],
  [5,'Naval Forces Central Command NAVCENT','U.S. Central Command CENTCOM','VADM Curt A. Renshaw','Commander','DoN','Manama Bahrain','5th Fleet'],
  [5,'Special Operations Command Central SOCCENT','U.S. Central Command CENTCOM','MG Jasper Jeffers','Commander','DoW','MacDill AFB FL','SOF Central'],
  [5,'Special Operations Command Africa','U.S. Africa Command AFRICOM','MG Claude K. Tudor Jr.','Commander','DoW','Stuttgart Germany','SOF Africa'],
  [5,'U.S. Naval Forces Europe-Africa NAVEUR-NAVAF','U.S. European Command EUCOM','ADM George M. Wikoff','Commander','DoN','Stuttgart Germany','Naval Europe-Africa'],
  [5,'Special Operations Command Europe SOCEUR','U.S. European Command EUCOM','LTG Richard E. Angle','Deputy Commander','DoW','Stuttgart Germany','SOF Europe'],
  [5,'U.S. Pacific Fleet PACFLT','U.S. Indo-Pacific Command INDOPACOM','ADM Stephen Web Koehler','Commander','DoN','Pearl Harbor HI','Pacific Fleet'],
  [5,'U.S. Forces Japan USFJ','U.S. Indo-Pacific Command INDOPACOM','LTG Stephen F. Jost','Commander','DoW','Yokota AB Japan','US Forces Japan'],
  [5,'U.S. Forces Korea USFK','U.S. Indo-Pacific Command INDOPACOM','GEN Xavier T. Brunson','Commander','DoW','Yongsan Korea','US Forces Korea'],
  [5,'Special Operations Command Pacific SOCPAC','U.S. Indo-Pacific Command INDOPACOM','MG Jeffrey A. VanAntwerp','Commander','DoW','Camp H.M. Smith HI','SOF Pacific'],
  [5,'U.S. Naval Forces Southern Command','U.S. Southern Command SOUTHCOM','RADM Carlos Sardiello','Commander','DoN','Mayport FL','4th Fleet'],
  [5,'Special Operations Command South SOCSOUTH','U.S. Southern Command SOUTHCOM','RADM Mark A. Schafer','Commander','DoW','Miami FL','SOF South'],
  [5,'U.S. Space Forces Space S4S','U.S. Space Command SPACECOM','LTG Dennis Bythewood','Commander','Space Force','Schriever SFB CO','Space Forces Space'],
  [5,'Joint Special Operations Command JSOC','U.S. Special Operations Command SOCOM','LTG Jonathan P. Braga','Commander','DoW','Fort Bragg NC','JSOC'],
  [5,'Naval Special Warfare Command SEALs','U.S. Special Operations Command SOCOM','RADM Walter H. Allman III','Commander','DoN','Coronado CA','Naval special warfare'],
  [5,'Marine Special Operations Command MARSOC','U.S. Special Operations Command SOCOM','MG Peter D. Huntley','Commander','DoN','Camp Lejeune NC','MARSOC'],
  [5,'SOFWERX','U.S. Special Operations Command SOCOM','Leslie Babich','Director','DoW','Tampa FL','SOF innovation hub'],
  [5,'Joint Enabling Capabilities Command','U.S. Transportation Command TRANSCOM','MG Michael E. McWilliams','Commander','DoW','Norfolk VA','Joint enabling capabilities'],
  [5,'DoD Cyber Defense Command DCDC','U.S. Cyber Command CYBERCOM','LTG Paul T. Stanton','Commander','DoW','Fort Meade MD','Cyber defense'],
  [5,'Fleet Cyber Command 10th Fleet','U.S. Cyber Command CYBERCOM','VADM Heidi K. Berg','Commander','DoN','Fort Meade MD','Fleet cyber'],
  [5,'Army Cyber Command ARCYBER','U.S. Cyber Command CYBERCOM','LTG Christopher Eubank','Commander','Army','Fort Eisenhower GA','Army cyber'],
  [5,'Marine Forces Cyberspace Command MARFORCYBER','U.S. Cyber Command CYBERCOM','MG Joseph A. Matos III','Commanding General','DoN','Fort Meade MD','Marine cyber'],
  [3,'Defense Logistics Agency DLA','Department of War','LTG Mark Simerly','Director','DoD','Fort Belvoir VA','Global logistics'],
  [3,'Defense Information Systems Agency DISA','Department of War','LTG Paul T. Stanton','Director','DoD','Fort Meade MD','IT and communications'],
  [3,'Defense Intelligence Agency DIA','Department of War','LTG James H. Adams','Director','DoD','Joint Base Anacostia-Bolling','Military intelligence'],
  [3,'Defense Counterintelligence and Security Agency DCSA','Department of War','Joseph Tonon','Director','DoD','Boyers PA','Counterintelligence and security'],
  [3,'Defense Threat Reduction Agency DTRA','Department of War','MG Lyle K. Drew','Acting Director','DoD','Fort Belvoir VA','Threat reduction'],
  [3,'Defense Health Agency DHA','Department of War','VADM Darin K. Via','Director','DoD','Falls Church VA','Military health'],
  [3,'Defense Contract Management Agency DCMA','Department of War','VADM Stephen Tedford','Director','DoD','Fort Lee VA','Contract management'],
  [3,'Defense Finance and Accounting Service DFAS','Department of War','Mr. Jonathan Witter','Director','DoD','Indianapolis IN','Finance and accounting'],
  [3,'Defense Contract Audit Agency DCAA','Department of War','Ms. Jennifer L. Desautel','Director','DoD','Fort Belvoir VA','Contract audit'],
  [2,'Office of Science and Technology Policy OSTP','Department of War','Michael Kratsios','Director and U.S. CTO','Federal','Washington DC','White House science office'],
  [2,'Office of the National Cyber Director NCD','Department of War','Sean Cairncross','National Cyber Director','Federal','Washington DC','Cyber director'],
  [2,'White House Office of Management and Budget OMB','Department of War','Russell Vought','Director','Federal','Washington DC','Federal budget office'],
  [2,'Department of Energy DOE','Department of War','Chris Wright','Secretary of Energy','Federal','Washington DC','Energy department'],
  [2,'Department of Commerce DOC','Department of War','Howard Lutnick','Secretary of Commerce','Federal','Washington DC','Commerce department'],
  [2,'Department of State','Department of War','Marco Rubio','Secretary of State','Federal','Washington DC','State department'],
  [2,'General Services Administration GSA','Department of War','Edward Forst','Administrator','Federal','Washington DC','Federal property management'],
  [2,'National Aeronautics and Space Administration NASA','Department of War','Bill Nelson','Administrator','Federal','Washington DC','Space agency'],
  [3,'National Nuclear Security Administration NNSA','Department of Energy DOE','Brandon M. Williams','Under Secretary','Federal','Washington DC','Nuclear security'],
  [3,'ARPA-E','Department of Energy DOE','Conner Prochaska','Director','Federal','Washington DC','Energy research'],
  [3,'Bureau of Industry and Security BIS','Department of Commerce DOC','Jeffrey Kessler','Under Secretary','Federal','Washington DC','Export controls'],
  [3,'National Institute of Standards and Technology NIST','Department of Commerce DOC','Arvind Raman','Under Secretary and Director','Federal','Gaithersburg MD','Standards and tech'],
  [3,'Office of Space Commerce','Department of Commerce DOC','Taylor Jordan','Assistant Secretary','Federal','Washington DC','Space commerce'],
  [3,'FedRAMP','General Services Administration GSA','Pete Waterman','Director','Federal','Washington DC','Cloud security authorization'],
  [6,'Office of the Secretary of the Navy','Department of the Navy','Hung Cao','Acting Secretary','DoN','Pentagon','Navy civilian leadership'],
  [6,'Chief of Naval Operations CNO','Department of the Navy','ADM Daryl Caudle','CNO','DoN','Pentagon','Highest ranking Navy officer'],
  [6,'ASN Research Development and Acquisition ASN RDA','Department of the Navy','William Mahan','Performing Duties','DoN','Pentagon','Navy acquisition'],
  [6,'Office of Naval Research ONR','ASN Research Development and Acquisition ASN RDA','Dr Rachel Riley','Chief of Naval Research','DoN','Arlington VA','Navy research'],
  [6,'Naval Air Systems Command NAVAIR','ASN Research Development and Acquisition ASN RDA','VADM John Dougherty IV','Commander','DoN','Patuxent River MD','Naval aviation acquisition'],
  [6,'Naval Sea Systems Command NAVSEA','ASN Research Development and Acquisition ASN RDA','VADM James P. Downey','Commander','DoN','Washington Navy Yard DC','Naval sea systems'],
  [6,'Naval Information Warfare Systems Command NAVWAR','ASN Research Development and Acquisition ASN RDA','RADM Kurt J. Rothenhaus','Commander','DoN','San Diego CA','Naval information warfare'],
  [6,'Strategic Systems Programs SSP','ASN Research Development and Acquisition ASN RDA','RADM Douglas Williams','Director','DoN','Washington Navy Yard DC','Strategic weapons systems'],
  [6,'Naval Nuclear Propulsion Program','Department of the Navy','ADM William Houston','Director','DoN','Washington Navy Yard DC','Naval nuclear propulsion'],
  [6,'Naval Rapid Capabilities Office NAVRCO','Department of the Navy','VADM Seiko Okano','Director','DoN','Washington DC','Navy rapid capabilities'],
  [6,'Marine Corps Headquarters','Department of the Navy','GEN Eric M. Smith','Commandant','DoN','Pentagon','Top Marine Corps leadership'],
  [6,'Marine Corps Combat Development and Integration MCCDC','Marine Corps Headquarters','LTG Eric Austin','Commanding General','DoN','Quantico VA','Combat development'],
  [6,'Marine Corps Systems Command MARCORSYSCOM','Marine Corps Combat Development and Integration MCCDC','BG Tamara Campbell','Commander','DoN','Quantico VA','Marine systems acquisition'],
  [6,'Marine Forces Pacific MARFORPAC','Marine Corps Headquarters','LTG James Glynn','Commander','DoN','Camp H.M. Smith HI','Marine Pacific'],
  [6,'Marine Forces Central MARFORCENT','Marine Corps Headquarters','LTG Joseph Clearfield','Commander','DoN','MacDill AFB FL','Marine Central'],
  [6,'Marine Special Operations Command MARSOC','Marine Corps Headquarters','MG Peter D. Huntley','Commander','DoN','Camp Lejeune NC','Marine special operations'],
  [6,'I Marine Expeditionary Force','Marine Corps Headquarters','LTG Christian F. Wortman','Commanding General','DoN','Camp Pendleton CA','I MEF'],
  [6,'III Marine Expeditionary Force','Marine Corps Headquarters','LTG Benjamin T. Watson','Commanding General','DoN','Camp Hansen Okinawa','III MEF'],
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

type Badge = { text: string; color: string };
function badge(branch: string): Badge | null {
  const m: Record<string, Badge> = {
    'Army':                 { text: 'ARMY',        color: '#4a7c29' },
    'DoN':                  { text: 'NAVY/MC',      color: '#1a3a6b' },
    'Air Force':            { text: 'AIR FORCE',    color: '#1e5fa5' },
    'Air Force/Space Force':{ text: 'AF/SF',        color: '#1e5fa5' },
    'Space Force':          { text: 'SPACE FORCE',  color: '#1c2951' },
    'Coast Guard':          { text: 'COAST GUARD',  color: '#c8502d' },
    'DoW':                  { text: 'DoW',           color: '#283a6b' },
    'DoD':                  { text: 'DoD',           color: '#283a6b' },
    'All':                  { text: 'JOINT',         color: '#283a6b' },
    'Federal':              { text: 'FEDERAL',       color: '#6b5228' },
  };
  return m[branch] ?? null;
}

function avatarColor(branch: string): string {
  const m: Record<string, string> = {
    'Army': '#4a7c29', 'DoN': '#1a3a6b', 'Air Force': '#1e5fa5',
    'Air Force/Space Force': '#1e5fa5', 'Space Force': '#1c2951',
    'Coast Guard': '#c8502d', 'DoW': '#283a6b', 'DoD': '#283a6b',
    'All': '#283a6b', 'Federal': '#6b5228',
  };
  return m[branch] ?? '#283a6b';
}

function sector(branch: string) { return branch === 'Federal' ? 'Civilian' : 'Defense'; }

async function seed() {
  const db = getDb();

  console.log('Clearing tables…');
  await db`DELETE FROM office_members`;
  await db`DELETE FROM team_members`;
  await db`DELETE FROM offices`;
  await db`DELETE FROM teams`;
  await db`DELETE FROM followers`;
  await db`DELETE FROM contracts`;
  await db`DELETE FROM people`;
  await db`DELETE FROM related_organizations`;
  await db`DELETE FROM organization_settings`;
  await db`DELETE FROM organizations`;

  // Deduplicate by name, keep first occurrence
  const seen = new Map<string, typeof ROWS[0]>();
  for (const row of ROWS) {
    if (!seen.has(row[1])) seen.set(row[1], row);
  }

  // Assign slugs
  const slugCount = new Map<string, number>();
  const nameToSlug = new Map<string, string>();
  for (const [name] of seen) {
    const s = slugify(name);
    const n = (slugCount.get(s) ?? 0) + 1;
    slugCount.set(s, n);
    nameToSlug.set(name, n > 1 ? `${s}-${n}` : s);
  }

  // Insert orgs (without parent_org_id first — set it after all rows exist)
  console.log(`Inserting ${seen.size} organizations…`);
  const slugToId = new Map<string, string>();
  let i = 0;
  for (const [name, row] of seen) {
    const slug = nameToSlug.get(name)!;
    const b = badge(row[5]);
    const [r] = await db`
      INSERT INTO organizations (name, slug, badge_text, badge_color, description, sector, hq_address, level)
      VALUES (${name}, ${slug}, ${b?.text ?? null}, ${b?.color ?? null},
              ${row[7] || null}, ${sector(row[5])}, ${row[6] || null}, ${row[0]})
      RETURNING id
    `;
    slugToId.set(slug, r.id);
    if (++i % 20 === 0) process.stdout.write(`  ${i}/${seen.size}\r`);
  }
  console.log(`\nOrgs inserted: ${seen.size}`);

  // Set parent_org_id now that all orgs exist
  let parentCount = 0;
  for (const [name, row] of seen) {
    const parentName = row[2];
    if (!parentName || !seen.has(parentName)) continue;
    const childSlug = nameToSlug.get(name)!;
    const parentSlug = nameToSlug.get(parentName)!;
    const childId = slugToId.get(childSlug)!;
    const parentId = slugToId.get(parentSlug)!;
    if (childId === parentId) continue;
    await db`UPDATE organizations SET parent_org_id = ${parentId}::uuid WHERE id = ${childId}::uuid`;
    parentCount++;
  }
  console.log(`Parent links set: ${parentCount}`);

  // Insert people and track org -> person id for manager wiring
  // orgLeader maps org slug -> inserted person id
  const orgLeader = new Map<string, string>();
  const skipNames = new Set(['', 'Various', 'Varies', 'Vacant']);
  let personCount = 0;

  for (const row of ROWS) {
    const leaderName = row[3];
    if (!leaderName || skipNames.has(leaderName)) continue;
    const slug = nameToSlug.get(row[1]);
    if (!slug) continue;
    const orgId = slugToId.get(slug);
    if (!orgId) continue;
    // Skip duplicate (same person+org)
    if (orgLeader.has(slug)) continue;
    const [p] = await db`
      INSERT INTO people (org_id, full_name, role_title, avatar_color, location)
      VALUES (${orgId}::uuid, ${leaderName}, ${row[4] || null}, ${avatarColor(row[5])}, ${row[6] || null})
      RETURNING id
    `;
    orgLeader.set(slug, p.id);
    personCount++;
  }
  console.log(`People inserted: ${personCount}`);

  // Wire manager_id: each person's manager is the leader of their org's parent
  let managerCount = 0;
  for (const [slug, personId] of orgLeader) {
    const row = seen.get([...seen.keys()].find(k => nameToSlug.get(k) === slug)!)!;
    if (!row) continue;
    const parentName = row[2];
    if (!parentName || !seen.has(parentName)) continue;
    const parentSlug = nameToSlug.get(parentName)!;
    const managerId = orgLeader.get(parentSlug);
    if (!managerId || managerId === personId) continue;
    await db`UPDATE people SET manager_id = ${managerId}::uuid WHERE id = ${personId}::uuid`;
    managerCount++;
  }
  console.log(`Manager links set: ${managerCount}`);

  console.log('\n✓ Seed complete.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
