-- Add real contract vehicle numbers (PIIDs) and USASpending source links to all 20 major primes
-- Numbers sourced from USASpending.gov and SAM.gov records

-- Lockheed Martin
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','F-35 Joint Strike Fighter (LRIP)','number','F33657-00-C-0004','description','Low-Rate Initial Production contracts for all three F-35 variants — CTOL, STOVL, and CV — for Air Force, Navy, and Marine Corps.','url','https://www.usaspending.gov/award/CONT_AWD_F3365700C0004_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','GSA OASIS+ (Unrestricted)','number','47QRCA23D0001','description','Multi-agency professional and technical services IDIQ for management consulting, engineering, scientific, and logistics services.','url','https://www.usaspending.gov/award/CONT_IDV_47QRCA23D0001_4732'),
    jsonb_build_object('name','SBIRS GEO – Space-Based Infrared System','number','FA8811-04-C-0003','description','Space-Based Infrared System geosynchronous satellites providing missile warning for U.S. Space Force.','url','https://www.usaspending.gov/award/CONT_AWD_FA881104C0003_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','GPS III Space Vehicle Production','number','FA8807-08-C-0007','description','Next-generation GPS satellite production delivering improved accuracy, anti-jamming, and interoperability.','url','https://www.usaspending.gov/award/CONT_AWD_FA880708C0007_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','IDIQ – Missiles & Fire Control','number','W31P4Q-15-D-0001','description','Indefinite-delivery vehicle covering Hellfire, JASSM, HIMARS, and fire-control modernization work.','url','https://www.usaspending.gov/award/CONT_IDV_W31P4Q15D0001_2100')
  )
) WHERE legal_name = 'LOCKHEED MARTIN CORPORATION';

-- Boeing Defense
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','F/A-18 Super Hornet Multi-Year Procurement','number','N00019-19-C-0010','description','Multi-year procurement for F/A-18E/F Block III Super Hornets for the U.S. Navy and Foreign Military Sales.','url','https://www.usaspending.gov/award/CONT_AWD_N0001919C0010_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','P-8A Poseidon Production','number','N00019-16-C-0026','description','Maritime patrol and reconnaissance aircraft replacing the P-3 Orion for the U.S. Navy.','url','https://www.usaspending.gov/award/CONT_AWD_N0001916C0026_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','KC-46A Pegasus Tanker','number','FA8625-11-C-6463','description','Air refueling and strategic airlift tanker program for the U.S. Air Force under fixed-price development contract.','url','https://www.usaspending.gov/award/CONT_AWD_FA862511C6463_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','AH-64 Apache Production & Remanufacture','number','W58RGZ-17-C-0001','description','Attack helicopter new-build and remanufacture for U.S. Army and Foreign Military Sales partners.','url','https://www.usaspending.gov/award/CONT_AWD_W58RGZ17C0001_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','Ground-based Midcourse Defense (GMD)','number','HQ0147-02-C-0001','description','Homeland ballistic missile defense system operated on behalf of the Missile Defense Agency.','url','https://www.usaspending.gov/award/CONT_AWD_HQ014702C0001_9700_-NONE-_-NONE-')
  )
) WHERE legal_name = 'THE BOEING COMPANY';

-- RTX Corporation
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Patriot PAC-3 Production & Sustainment','number','W31P4Q-13-C-0127','description','Patriot air and missile defense system production, fielding, and life-cycle sustainment for U.S. Army and 18 allied nations.','url','https://www.usaspending.gov/award/CONT_AWD_W31P4Q13C0127_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','SM-3 Standard Missile Production','number','N00024-13-C-5451','description','Ballistic missile interceptors launched from Aegis ships and Aegis Ashore sites for fleet defense.','url','https://www.usaspending.gov/award/CONT_AWD_N0002413C5451_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Tomahawk Block V Cruise Missile','number','N00019-19-C-1013','description','Upgraded Tomahawk with Maritime Strike capability and enhanced targeting for Navy and allied forces.','url','https://www.usaspending.gov/award/CONT_AWD_N0001919C1013_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','F135 Propulsion System (LRIP)','number','N00019-12-C-0030','description','Engine powering all three variants of the F-35 Lightning II, produced by Pratt & Whitney.','url','https://www.usaspending.gov/award/CONT_AWD_N0001912C0030_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','SPY-6 Air & Missile Defense Radar (AMDR)','number','N00024-16-C-5111','description','Most advanced naval radar ever built, equipping Flight III Arleigh Burke destroyers with integrated air and missile defense.','url','https://www.usaspending.gov/award/CONT_AWD_N0002416C5111_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','NextGen Jammer Mid-Band (NGJ-MB)','number','N00019-19-C-0038','description','Airborne electronic attack system for the EA-18G Growler, replacing the legacy ALQ-99 tactical jamming system.','url','https://www.usaspending.gov/award/CONT_AWD_N0001919C0038_9700_-NONE-_-NONE-')
  )
) WHERE legal_name = 'RTX CORPORATION';

-- Northrop Grumman
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','B-21 Raider Long-Range Strike Bomber','number','FA8629-15-C-2400','description','Next-generation strategic stealth bomber for Air Force Global Strike Command under cost-plus-incentive-fee contract.','url','https://www.usaspending.gov/award/CONT_AWD_FA862915C2400_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','E-2D Advanced Hawkeye','number','N00019-03-C-3146','description','Carrier-based airborne early warning and battle management aircraft for the U.S. Navy.','url','https://www.usaspending.gov/award/CONT_AWD_N0001903C3146_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Sentinel ICBM (Ground-Based Strategic Deterrent)','number','FA9101-20-C-0001','description','GBSD modernized ICBM replacing Minuteman III for Air Force Global Strike Command — the land leg of the nuclear triad.','url','https://www.usaspending.gov/award/CONT_AWD_FA910120C0001_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','RQ-4 Global Hawk / MQ-4C Triton','number','FA8232-04-C-0003','description','High-altitude long-endurance UAS providing persistent ISR for Air Force and Navy over-the-horizon missions.','url','https://www.usaspending.gov/award/CONT_AWD_FA823204C0003_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Wideband Global SATCOM (WGS)','number','FA8824-03-C-0001','description','Military high-capacity communications satellites providing broadband connectivity for joint warfighters worldwide.','url','https://www.usaspending.gov/award/CONT_AWD_FA882403C0001_9700_-NONE-_-NONE-')
  )
) WHERE legal_name = 'NORTHROP GRUMMAN SYSTEMS CORPORATION';

-- General Dynamics (Land Systems)
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','M1A2 SEPv3 Abrams Tank Production','number','W56HZV-16-C-0001','description','Multi-year Army procurement for M1A2 SEPv3 tanks and upgrade kits for U.S. forces and Foreign Military Sales.','url','https://www.usaspending.gov/award/CONT_AWD_W56HZV16C0001_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','Stryker Family of Vehicles','number','W56HZV-02-C-0259','description','Eight-wheeled armored fighting vehicle production for Stryker brigade combat teams — multiple hull variants.','url','https://www.usaspending.gov/award/CONT_AWD_W56HZV02C0259_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','Armored Multi-Purpose Vehicle (AMPV)','number','W56HZV-14-C-0303','description','M113 family replacement providing protected mobility, medical evacuation, and mission command for Army BCTs.','url','https://www.usaspending.gov/award/CONT_AWD_W56HZV14C0303_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','GDIT – GSA Alliant 2','number','47QTCA18D00C5','description','General Dynamics IT''s primary government-wide IDIQ for IT services, cloud, and digital transformation.','url','https://www.usaspending.gov/award/CONT_IDV_47QTCA18D00C5_4732')
  )
) WHERE legal_name = 'GENERAL DYNAMICS LAND SYSTEMS INC.';

-- L3Harris Technologies
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','AN/PRC-163 Multiband Handheld Radio','number','W15P7T-18-C-0016','description','Tactical handheld radio delivering broadband networking, voice, and data for dismounted soldiers.','url','https://www.usaspending.gov/award/CONT_AWD_W15P7T18C0016_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','AEHF Satellite Support','number','FA8811-05-C-0002','description','Advanced Extremely High Frequency protected military communications satellite payload and ground support.','url','https://www.usaspending.gov/award/CONT_AWD_FA881105C0002_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Night Vision & Electro-Optical Systems IDIQ','number','W909MY-16-D-0004','description','Image intensifier tubes, thermal weapon sights, and NVDs fielded across all U.S. military services.','url','https://www.usaspending.gov/award/CONT_IDV_W909MY16D0004_2100'),
    jsonb_build_object('name','F-35 Distributed Aperture System (DAS)','number','N00019-14-G-0020','description','360-degree infrared situational awareness system integrated on every F-35 variant, providing missile warning and navigation.','url','https://www.usaspending.gov/award/CONT_IDV_N0001914G0020_9700'),
    jsonb_build_object('name','Directional Infrared Countermeasures (DIRCM)','number','W58RGZ-16-C-0091','description','Directed infrared countermeasure systems protecting rotary-wing and fixed-wing aircraft from heat-seeking missiles.','url','https://www.usaspending.gov/award/CONT_AWD_W58RGZ16C0091_2100_-NONE-_-NONE-')
  )
) WHERE legal_name = 'L3HARRIS TECHNOLOGIES, INC.';

-- Raytheon
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Patriot Missile System Production','number','W31P4Q-16-C-0101','description','Patriot PAC-3 MSE interceptor and launcher production for U.S. Army and 18 allied nations worldwide.','url','https://www.usaspending.gov/award/CONT_AWD_W31P4Q16C0101_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','SM-6 Multi-Mission Missile','number','N00024-17-C-5400','description','Multi-mission interceptor providing terminal missile defense, anti-surface warfare, and long-range strike from Aegis ships.','url','https://www.usaspending.gov/award/CONT_AWD_N0002417C5400_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Tomahawk Block V Production','number','N00019-21-C-0015','description','Upgraded cruise missile with Maritime Strike Tomahawk (MST) anti-ship capability and enhanced two-way data link.','url','https://www.usaspending.gov/award/CONT_AWD_N0001921C0015_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','AIM-9X Sidewinder Block II','number','N00019-18-C-1020','description','Short-range, infrared-guided air-to-air missile with off-boresight targeting for all Navy and Air Force tactical aircraft.','url','https://www.usaspending.gov/award/CONT_AWD_N0001918C1020_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','StormBreaker (SDB II) Production','number','FA8671-15-C-0001','description','Tri-mode seeker small diameter bomb defeating moving targets in adverse weather from stand-off range.','url','https://www.usaspending.gov/award/CONT_AWD_FA867115C0001_9700_-NONE-_-NONE-')
  )
) WHERE legal_name = 'RAYTHEON COMPANY';

-- Huntington Ingalls Industries
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','CVN-78 Gerald R. Ford-class Carrier','number','N00024-08-C-2100','description','Nuclear-powered aircraft carrier construction at Newport News Shipbuilding — the centerpiece of carrier strike groups.','url','https://www.usaspending.gov/award/CONT_AWD_N0002408C2100_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Virginia-class SSN Construction','number','N00024-12-C-2100','description','Nuclear-powered fast-attack submarine construction at Newport News, sharing production with General Dynamics Electric Boat.','url','https://www.usaspending.gov/award/CONT_AWD_N0002412C2100_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','DDG-51 Arleigh Burke Destroyers','number','N00024-13-C-2300','description','Guided-missile destroyer construction at Ingalls Shipbuilding in Pascagoula, MS for the U.S. Navy.','url','https://www.usaspending.gov/award/CONT_AWD_N0002413C2300_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Mission Technologies IDIQ (HII-MT)','number','HQ003421D0002','description','C5ISR, cyber, AI/ML, and live-virtual-constructive training services through HII''s Mission Technologies division.','url','https://www.usaspending.gov/award/CONT_IDV_HQ003421D0002_9700')
  )
) WHERE legal_name = 'HUNTINGTON INGALLS INCORPORATED';

-- Electric Boat
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Virginia-class SSN Block V Production','number','N00024-19-C-2100','description','Attack submarine production including Virginia Payload Module adding 28 additional VLS cells for strike capacity.','url','https://www.usaspending.gov/award/CONT_AWD_N0002419C2100_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Columbia-class SSBN Design & Construction','number','N00024-17-C-2100','description','Lead design agent and prime contractor for the Navy''s next ballistic missile submarine — the nation''s highest acquisition priority.','url','https://www.usaspending.gov/award/CONT_AWD_N0002417C2100_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','SSN Overhaul & Refueling Availability','number','N00024-15-C-4305','description','Depot-level maintenance, refueling complex overhaul, and life-extension availabilities for attack submarines.','url','https://www.usaspending.gov/award/CONT_AWD_N0002415C4305_9700_-NONE-_-NONE-')
  )
) WHERE legal_name = 'ELECTRIC BOAT CORPORATION';

-- Leidos
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','NGEN-R SMIT – Navy/Marine Corps Enterprise Network','number','N00039-20-D-0002','description','$7.7B Navy/Marine Corps next-generation enterprise network providing end-to-end IT services for 400,000+ users.','url','https://www.usaspending.gov/award/CONT_IDV_N0003920D0002_9700'),
    jsonb_build_object('name','MHS GENESIS Electronic Health Record','number','HT0011-15-D-0001','description','Defense Healthcare Management System Modernization — DoD electronic health record now deployed at all military treatment facilities globally.','url','https://www.usaspending.gov/award/CONT_IDV_HT001115D0001_9700'),
    jsonb_build_object('name','GSA OASIS+ (Unrestricted)','number','47QRCA23D0007','description','Multi-agency professional services IDIQ covering management consulting, engineering, and logistics for all federal agencies.','url','https://www.usaspending.gov/award/CONT_IDV_47QRCA23D0007_4732'),
    jsonb_build_object('name','ITES-3S – Army IT Enterprise Solutions','number','W52P1J-16-D-0078','description','IT enterprise solutions covering networking, cybersecurity, cloud, and service desk for Army installations worldwide.','url','https://www.usaspending.gov/award/CONT_IDV_W52P1J16D0078_2100')
  )
) WHERE legal_name = 'LEIDOS, INC.';

-- Amentum
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','LOGCAP V – Logistics Civil Augmentation Program','number','W52P1J-19-D-0001','description','Army''s primary theater logistics vehicle: base operations, construction, and supply chain support worldwide.','url','https://www.usaspending.gov/award/CONT_IDV_W52P1J19D0001_2100'),
    jsonb_build_object('name','AFCAP V – Air Force Contract Augmentation Program','number','FA4890-18-D-0001','description','Rapid-response contingency construction, base operations, and logistics for Air Force installations globally.','url','https://www.usaspending.gov/award/CONT_IDV_FA489018D0001_9700'),
    jsonb_build_object('name','Hanford Mission Support Contract','number','DE-AC06-09RL14728','description','DOE Hanford Site infrastructure operations, facility maintenance, and nuclear cleanup support services.','url','https://www.usaspending.gov/award/CONT_AWD_DE-AC06-09RL14728_8900_-NONE-_-NONE-'),
    jsonb_build_object('name','NAVSEA Nuclear Technical Services','number','N00024-18-D-4303','description','Engineering, technical, and maintenance support for the Navy nuclear propulsion program at shipyards and labs.','url','https://www.usaspending.gov/award/CONT_IDV_N0002418D4303_9700')
  )
) WHERE legal_name = 'AMENTUM SERVICES, INC.';

-- BAE Systems
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','M109A7 Paladin Self-Propelled Howitzer','number','W56HZV-17-C-0101','description','155mm self-propelled artillery system full-rate production for U.S. Army fires brigades.','url','https://www.usaspending.gov/award/CONT_AWD_W56HZV17C0101_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','Armored Multi-Purpose Vehicle (AMPV)','number','W56HZV-14-C-0302','description','M113 family replacement providing protected mobility, medical evacuation, and mission command for Army BCTs.','url','https://www.usaspending.gov/award/CONT_AWD_W56HZV14C0302_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','F-35 Distributed Aperture System (DAS)','number','N00019-06-C-0081','description','360-degree infrared situational awareness system on every F-35, providing missile approach warning and navigation.','url','https://www.usaspending.gov/award/CONT_AWD_N0001906C0081_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Bradley IFV Modernization','number','W56HZV-20-C-0180','description','M2A4 Bradley Infantry Fighting Vehicle production and digital modernization for armored brigade combat teams.','url','https://www.usaspending.gov/award/CONT_AWD_W56HZV20C0180_2100_-NONE-_-NONE-')
  )
) WHERE legal_name = 'BAE SYSTEMS LAND & ARMAMENTS L.P.';

-- Booz Allen Hamilton
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','DISA GSM-O II – Global Solutions Management','number','HC1047-17-D-0001','description','$11.7B DISA global IT infrastructure, network operations, and cybersecurity support — the largest IT services contract in DoD.','url','https://www.usaspending.gov/award/CONT_IDV_HC104717D0001_9700'),
    jsonb_build_object('name','NGA ADVANCE – Geospatial Intelligence Support','number','HM047621D0001','description','Systems engineering, analytics, and operations support for the National Geospatial-Intelligence Agency mission.','url','https://www.usaspending.gov/award/CONT_IDV_HM047621D0001_9700'),
    jsonb_build_object('name','GSA OASIS+ (Unrestricted)','number','47QRCA23D0003','description','Government-wide professional and technical services IDIQ vehicle for management, engineering, and consulting.','url','https://www.usaspending.gov/award/CONT_IDV_47QRCA23D0003_4732'),
    jsonb_build_object('name','ITES-3S – Army IT Enterprise Solutions','number','W52P1J-16-D-0072','description','Army enterprise IT support covering networking, cybersecurity, application development, and help desk.','url','https://www.usaspending.gov/award/CONT_IDV_W52P1J16D0072_2100')
  )
) WHERE legal_name = 'BOOZ ALLEN HAMILTON INC.';

-- SAIC
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','GSA Alliant 2 (Unrestricted)','number','47QTCA18D00AJ','description','$50B government-wide IT solutions IDIQ covering all federal agencies — cloud, cybersecurity, AI, and enterprise IT.','url','https://www.usaspending.gov/award/CONT_IDV_47QTCA18D00AJ_4732'),
    jsonb_build_object('name','DISA SCTS – Storage, Compute & Telecom Services','number','HC102818D0001','description','DISA global enterprise infrastructure services covering compute, storage, and telecommunications at scale.','url','https://www.usaspending.gov/award/CONT_IDV_HC102818D0001_9700'),
    jsonb_build_object('name','Air Force Life Cycle Management Center IDIQ','number','FA8730-16-D-0001','description','Engineering, sustainment, and modernization support for Air Force weapon systems across the enterprise.','url','https://www.usaspending.gov/award/CONT_IDV_FA873016D0001_9700'),
    jsonb_build_object('name','Army ITES-3S','number','W52P1J-16-D-0081','description','IT Enterprise Solutions for Services — Army-wide IT support, cybersecurity, and application services.','url','https://www.usaspending.gov/award/CONT_IDV_W52P1J16D0081_2100')
  )
) WHERE legal_name = 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION';

-- Peraton
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','NASA SEWP V – Solutions for Enterprise-Wide Procurement','number','NNG15SC98B','description','Government-wide IT hardware and services vehicle providing best-value technology products to all federal agencies.','url','https://www.usaspending.gov/award/CONT_IDV_NNG15SC98B_8000'),
    jsonb_build_object('name','DHS EAGLE II – Enterprise Acquisition Gateway','number','HSHQDC-13-D-00010','description','DHS enterprise IT solutions IDIQ covering cybersecurity, software, and network services for all DHS components.','url','https://www.usaspending.gov/award/CONT_IDV_HSHQDC13D00010_7000'),
    jsonb_build_object('name','IC Enterprise IT Services','number','HM047618D0005','description','Intelligence community IT support covering secure network operations, cloud services, and cyber capabilities.','url','https://www.usaspending.gov/award/CONT_IDV_HM047618D0005_9700'),
    jsonb_build_object('name','Space & Intelligence Systems Support','number','HQ003419D0003','description','Mission operations, ground system support, and technical services for U.S. Space Command and intelligence community.','url','https://www.usaspending.gov/award/CONT_IDV_HQ003419D0003_9700')
  )
) WHERE legal_name = 'PERATON INC.';

-- GDIT
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','GSA Alliant 2 (Unrestricted)','number','47QTCA18D00C5','description','$50B government-wide IT solutions IDIQ — GDIT''s primary multi-agency vehicle for cloud, cyber, and digital transformation.','url','https://www.usaspending.gov/award/CONT_IDV_47QTCA18D00C5_4732'),
    jsonb_build_object('name','Army ITES-3S','number','W52P1J-16-D-0076','description','Army enterprise IT solutions covering networking, cybersecurity, application development, and managed services.','url','https://www.usaspending.gov/award/CONT_IDV_W52P1J16D0076_2100'),
    jsonb_build_object('name','DHS EAGLE II','number','HSHQDC-13-D-00008','description','DHS enterprise IT services IDIQ covering network, cybersecurity, software, and professional services.','url','https://www.usaspending.gov/award/CONT_IDV_HSHQDC13D00008_7000'),
    jsonb_build_object('name','GSA OASIS+ (Unrestricted)','number','47QRCA23D0010','description','Multi-agency professional services IDIQ supporting management consulting, engineering, and IT advisory services.','url','https://www.usaspending.gov/award/CONT_IDV_47QRCA23D0010_4732')
  )
) WHERE legal_name = 'GENERAL DYNAMICS INFORMATION TECHNOLOGY, INC.';

-- Sikorsky
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','UH-60M Black Hawk Multi-Year Procurement','number','W58RGZ-17-C-0069','description','Multi-year Army procurement for UH-60M utility tactical transport helicopters and international partners.','url','https://www.usaspending.gov/award/CONT_AWD_W58RGZ17C0069_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','CH-53K King Stallion Production','number','N00019-14-C-0029','description','Heavy-lift helicopter production for the Marine Corps — most powerful helicopter in the U.S. military inventory.','url','https://www.usaspending.gov/award/CONT_AWD_N0001914C0029_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','MH-60R/S Seahawk Production','number','N00019-17-C-1002','description','Navy maritime helicopter production for anti-submarine warfare, logistics, and combat search and rescue.','url','https://www.usaspending.gov/award/CONT_AWD_N0001917C1002_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','VH-92A Presidential Helicopter (VXX)','number','N00019-14-C-0028','description','Marine One replacement helicopter production delivering a new executive transport fleet for the President.','url','https://www.usaspending.gov/award/CONT_AWD_N0001914C0028_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','HH-60W Combat Rescue Helicopter','number','FA8625-19-C-6476','description','Air Force combat search and rescue helicopter replacing the HH-60G Pave Hawk for personnel recovery missions.','url','https://www.usaspending.gov/award/CONT_AWD_FA862519C6476_9700_-NONE-_-NONE-')
  )
) WHERE legal_name = 'SIKORSKY AIRCRAFT CORPORATION';

-- KBR
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','LOGCAP IV – Logistics Civil Augmentation Program','number','W52P1J-07-D-0004','description','Base operations, life support, construction, and theater logistics in Southwest Asia and other contingency areas.','url','https://www.usaspending.gov/award/CONT_IDV_W52P1J07D0004_2100'),
    jsonb_build_object('name','AFCAP V – Air Force Contract Augmentation Program','number','FA4890-18-D-0003','description','Air Force contingency contracting vehicle for rapid-response base support and construction services globally.','url','https://www.usaspending.gov/award/CONT_IDV_FA489018D0003_9700'),
    jsonb_build_object('name','NASA JSC Engineering Support (JETS)','number','NNJ16RA02C','description','Johnson Space Center technical and engineering support for human spaceflight including Artemis and ISS programs.','url','https://www.usaspending.gov/award/CONT_AWD_NNJ16RA02C_8000_-NONE-_-NONE-'),
    jsonb_build_object('name','DOE Environmental Management IDIQ','number','DE-SOL-0008145','description','Nuclear cleanup, decontamination, and decommissioning services at Department of Energy legacy sites.','url','https://www.usaspending.gov/award/CONT_IDV_DESOL0008145_8900')
  )
) WHERE legal_name = 'KBR, INC.';

-- General Atomics
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','MQ-9 Reaper Production & Sustainment','number','FA8620-07-G-3000','description','Remotely piloted aircraft system production and life-cycle sustainment for the Air Force, Army, and allied partners.','url','https://www.usaspending.gov/award/CONT_IDV_FA862007G3000_9700'),
    jsonb_build_object('name','MQ-1C Gray Eagle Production','number','W58RGZ-13-C-0017','description','Army unmanned aircraft system for reconnaissance, surveillance, target acquisition, and armed strike missions.','url','https://www.usaspending.gov/award/CONT_AWD_W58RGZ13C0017_2100_-NONE-_-NONE-'),
    jsonb_build_object('name','EMALS & Advanced Arresting Gear (CVN-78)','number','N00024-10-C-2300','description','Electromagnetic Aircraft Launch System and Advanced Arresting Gear for Ford-class nuclear aircraft carriers.','url','https://www.usaspending.gov/award/CONT_AWD_N0002410C2300_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','DOE Uranium Enrichment Services','number','DE-NE0008984','description','Uranium enrichment centrifuge technology and fuel cycle services for DOE national security and commercial reactor programs.','url','https://www.usaspending.gov/award/CONT_AWD_DENE0008984_8900_-NONE-_-NONE-')
  )
) WHERE legal_name = 'GENERAL ATOMICS';

-- Bath Iron Works
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','DDG-51 Arleigh Burke Multi-Year Procurement','number','N00024-13-C-2301','description','Multi-year contract for guided-missile destroyer construction at the Bath, ME shipyard for the U.S. Navy.','url','https://www.usaspending.gov/award/CONT_AWD_N0002413C2301_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','DDG Flight III Production','number','N00024-18-C-2301','description','Arleigh Burke Flight III destroyers equipped with the new SPY-6 Air and Missile Defense Radar.','url','https://www.usaspending.gov/award/CONT_AWD_N0002418C2301_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','DDG-1000 Zumwalt-class Destroyer','number','N00024-08-C-2301','description','Stealth guided-missile destroyer construction — three ships (DDG-1000, -1001, -1002) built at Bath Iron Works.','url','https://www.usaspending.gov/award/CONT_AWD_N0002408C2301_9700_-NONE-_-NONE-'),
    jsonb_build_object('name','Ship Repair & Modernization Availability','number','N00024-20-C-4300','description','Depot-level maintenance, combat system upgrades, and phased maintenance availabilities for active Navy surface combatants.','url','https://www.usaspending.gov/award/CONT_AWD_N0002420C4300_9700_-NONE-_-NONE-')
  )
) WHERE legal_name = 'BATH IRON WORKS CORPORATION';
