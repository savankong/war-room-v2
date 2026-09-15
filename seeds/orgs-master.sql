INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('jcs','JCS','DoW',NULL,'Joint Chiefs of Staff','JCS','Pentagon, Arlington, VA',NULL,NULL,'{}','Joint Chiefs of Staff')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('osw','OSW','DoW',NULL,'OSD','OSW','Pentagon, Arlington, VA',NULL,NULL,'{}','Office of the Secretary of War')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('sapco','OSW','DoW',NULL,'OSD','SAPCO','Pentagon, Arlington, VA',NULL,NULL,'{}','Special Access Programs Central Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cape','OSW','DoW',NULL,'OSD','CAPE','Pentagon, Arlington, VA',NULL,NULL,'{}','Office of Cost Assessment and Program Evaluation')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('dow_cio','OSW','DoW',NULL,'OSD','CIO','Pentagon, Arlington, VA',NULL,NULL,'{}','DoW Chief Information Officer')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('sco','OSW','DoW',NULL,'OSD','SCO','Pentagon, Arlington, VA',NULL,NULL,'{}','Strategic Capabilities Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('ousd_as','OSD','DoW',NULL,'OSD','OUSD(A&S)','Pentagon, Arlington, VA',NULL,NULL,'{}','Office of the Under Secretary of War for Acquisition and Sustainment')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('asd_a','OSD','DoW',NULL,'OSD','ASD(A)','Pentagon, Arlington, VA',NULL,NULL,'{}','Assistant Secretary of War for Acquisition')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('asd_s','OSD','DoW',NULL,'OSD','ASD(S)','Pentagon, Arlington, VA',NULL,NULL,'{}','Assistant Secretary of War for Sustainment')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('asd_eie','OSD','DoW',NULL,'OSD','ASD(EI&E)','Pentagon, Arlington, VA',NULL,NULL,'{}','Assistant Secretary of War for Energy, Installations, and Environment')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('asd_nd_cbd','OSD','DoW',NULL,'OSD','ASD(ND-CBD)','Pentagon, Arlington, VA',NULL,NULL,'{}','Assistant Secretary of War for Nuclear Deterrence, Chemical, and Biological Defense')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('asd_ibp','OSD','DoW',NULL,'OSD','ASD(IBP)','Pentagon, Arlington, VA',NULL,NULL,'{}','Assistant Secretary of War for Industrial Base Policy')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('ousd_pr','OSD','DoW',NULL,'OSD','OUSD(P&R)','Pentagon, Arlington, VA',NULL,NULL,'{}','Office of the Under Secretary of Defense for Personnel and Readiness')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('ousd_re','OSD R&E','DoW',NULL,'OSD','OUSD(R&E)','Pentagon, Arlington, VA',NULL,NULL,'{}','Office of the Under Secretary of War for Research and Engineering')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cdao','OSD R&E','DoW',NULL,'OSD','CDAO','Pentagon, Arlington, VA',NULL,'Y','{}','Chief Digital and Artificial Intelligence Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('darpa','OSD R&E','DoW',NULL,'OSD','DARPA','Arlington, VA',NULL,'Y',ARRAY['Y'],'Defense Advanced Research Projects Agency')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('mda','OSD R&E','DoW',NULL,'OSD','MDA','Huntsville, AL',NULL,'Y',ARRAY['Y'],'Missile Defense Agency')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('osc','OSD R&E','DoW',NULL,'OSD','OSC','Pentagon, Arlington, VA',NULL,NULL,'{}','Office of Strategic Capital')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('edu','OSD','DoW',NULL,'OSD','EDU','Washington, DC',NULL,NULL,'{}','Economic Defense Unit')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('exim','OSD','DoW',NULL,'OSD','EXIM','Washington, DC',NULL,NULL,'{}','Export Import Bank')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('dfc','OSD','DoW',NULL,'OSD','DFC','Washington, DC',NULL,NULL,'{}','U.S. International Development Finance Corporation')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('diu','OSD R&E','DoW',NULL,'OSD','DIU','Mountain View, CA',NULL,'Y',ARRAY['Y'],'Defense Innovation Unit')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('dot_e','OSD','DoW',NULL,'OSD','DOT&E','Pentagon, Arlington, VA',NULL,NULL,'{}','OSD Director, Operational Test and Evaluation')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('ousd_p','OSD Policy','DoW',NULL,'OSD','OUSD(P)','Pentagon, Arlington, VA',NULL,NULL,'{}','Under Secretary of War for Policy')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('osd_is','OSD I&S','DoW',NULL,'OSD','OUSD(I&S)','Pentagon, Arlington, VA',NULL,NULL,'{}','Under Secretary of War for Intelligence and Security')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('disa','OSD I&S','DoW',NULL,'OSD','DISA','Fort Meade, MD',NULL,NULL,ARRAY['Y'],'Defense Information Systems Agency')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('dia','OSD I&S','DoW',NULL,'OSD','DIA','Washington, DC',NULL,NULL,'{}','Defense Intelligence Agency')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('dcsa','OSD I&S','DoW',NULL,'OSD','DCSA','Quantico, VA',NULL,NULL,'{}','Defense Counterintelligence and Security Agency')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('dam','OSD','DoW',NULL,'OSD','DA&M','Pentagon, Arlington, VA',NULL,NULL,'{}','Director of Administration and Management')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('whs','OSD','DoW',NULL,'OSD','WHS','Pentagon, Arlington, VA',NULL,NULL,'{}','Washington Headquarters Services')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('army','Army','Army',NULL,'Army','Army HQ','Pentagon, Arlington, VA',NULL,NULL,'{}','Department of the Army')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('army_hrc','Army','Army',NULL,'Army HQ','HRC','Fort Knox, KY',NULL,NULL,'{}','Army Human Resources Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('army_rccto','Army','Army',NULL,'Army HQ','RCCTO','Arlington, VA',NULL,'Y',ARRAY['Y'],'Army Rapid Capabilities and Critical Technologies Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('usasmdc','Army','Army',NULL,'Army HQ','USASMDC','Redstone Arsenal, AL',NULL,'Y',ARRAY['Y'],'Army Space and Missile Defense Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('arcyber','Army','Army',NULL,'Army HQ','ARCYBER','Fort Eisenhower, GA',NULL,'Y',ARRAY['Y'],'Army Cyber Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('army_ng','Army','Army',NULL,'Army HQ','ARNG','Arlington, VA',NULL,NULL,'{}','Army National Guard')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_maneuver_ground','Army','Army',NULL,'Army Acquisition','PAE Maneuver Ground','Detroit Arsenal, MI',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: Maneuver - Ground')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_maneuver_ground','Army','Army',NULL,'PAE Maneuver Ground','CPE Maneuver Ground','Detroit Arsenal, MI',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Maneuver - Ground')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_maneuver_air','Army','Army',NULL,'Army Acquisition','PAE Maneuver Air','Redstone Arsenal, AL',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: Maneuver - Air')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_aviation','Army','Army',NULL,'PAE Maneuver Air','CPE Aviation','Redstone Arsenal, AL',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Aviation')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_autonomy','Army','Army',NULL,'PAE Maneuver Air','CPE Autonomy','Fort Belvoir, VA',NULL,'Y',ARRAY['Y'],'Capability Program Executive: Autonomy')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_fires','Army','Army',NULL,'Army Acquisition','PAE Fires','Redstone Arsenal, AL',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: Fires')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_offense','Army','Army',NULL,'PAE Fires','CPE Offense','Redstone Arsenal, AL',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Offense')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_defensive','Army','Army',NULL,'PAE Fires','CPE Defensive','Redstone Arsenal, AL',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Defensive')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_integrated_fires','Army','Army',NULL,'PAE Fires','CPE Integrated Fires','Redstone Arsenal, AL',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Integrated Fires')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_c2','Army','Army',NULL,'Army Acquisition','PAE C2/CC2','Aberdeen Proving Ground, MD',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: C2/CC2')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_c2in','Army','Army',NULL,'PAE C2/CC2','CPE C2IN','Aberdeen Proving Ground, MD',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Command, Control, Communications and Network')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_st3','Army','Army',NULL,'PAE C2/CC2','CPE ST3','Orlando, FL',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Simulation, Training, Test and Threat')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_isw','Army','Army',NULL,'PAE C2/CC2','CPE ISW','Aberdeen Proving Ground, MD',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Intelligence and Spectrum Warfare')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_sustainment','Army','Army',NULL,'Army Acquisition','PAE Agile Sustainment','Picatinny Arsenal, NJ',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: Agile Sustainment and Ammunition')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_combat_logistics','Army','Army',NULL,'PAE Agile Sustainment','CPE Combat Logistics','Picatinny Arsenal, NJ',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Combat Logistics')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_ammo','Army','Army',NULL,'PAE Agile Sustainment','CPE Ammo','Picatinny Arsenal, NJ',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Ammunition and Energetics')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_cbrn','Army','Army',NULL,'Army Acquisition','PAE CBRN','Aberdeen Proving Ground, MD',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: Layered Protection and CBRN')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_cbrnd','Army','Army',NULL,'PAE CBRN','CPE CBRND','Aberdeen Proving Ground, MD',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Joint CBRN Defense')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cpe_es2','Army','Army',NULL,'PAE CBRN','CPE ES2','Aberdeen Proving Ground, MD',NULL,NULL,ARRAY['Y'],'Capability Program Executive: Enterprise Software and Service')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aal','Army','Army',NULL,'Army Innovation','AAL','Austin, TX',NULL,'Y',ARRAY['Y'],'Army Application Lab')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('army_swf','Army','Army',NULL,'Army Innovation','Army Software Factory','Austin, TX',NULL,'Y',ARRAY['Y'],'Army Software Factory')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('t2com','Army','Army',NULL,'Army Training','T2COM','Fort Eustis, VA',NULL,NULL,'{}','Army Transformation and Training Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cac','Army','Army',NULL,'T2COM','CAC','Fort Leavenworth, KS',NULL,NULL,'{}','Combined Arms Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('devcom','Army','Army',NULL,'T2COM','DEVCOM','Aberdeen Proving Ground, MD',NULL,'Y',ARRAY['Y'],'Army Combat Capabilities Development Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('army_med_rd','Army','Army',NULL,'T2COM','MRDC','Fort Detrick, MD',NULL,'Y',ARRAY['Y'],'Medical Research and Development Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('army_university','Army','Army',NULL,'Army Training','Army University','Fort Leavenworth, KS',NULL,NULL,'{}','Army University')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('amc','Army','Army',NULL,'Army Materiel','AMC','Redstone Arsenal, AL',NULL,NULL,'{}','Army Material Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('army_acc','Army','Army',NULL,'AMC','ACC','Redstone Arsenal, AL',NULL,NULL,ARRAY['Y'],'Army Contracting Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('amcom','Army','Army',NULL,'AMC','AMCOM','Redstone Arsenal, AL',NULL,NULL,'{}','Army Aviation and Missile Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cecom','Army','Army',NULL,'AMC','CECOM','Aberdeen Proving Ground, MD',NULL,NULL,'{}','Army Communications-Electronics Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('jmc','Army','Army',NULL,'AMC','JMC','Rock Island, IL',NULL,NULL,'{}','U.S. Army Joint Munitions Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('asc','Army','Army',NULL,'AMC','ASC','Rock Island, IL',NULL,NULL,'{}','Army Sustainment Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('atec','Army','Army',NULL,'AMC','ATEC','Aberdeen Proving Ground, MD',NULL,NULL,'{}','Army Test and Evaluation Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('tacom','Army','Army',NULL,'AMC','TACOM','Detroit Arsenal, MI',NULL,NULL,'{}','Tank, Automotive and Armaments Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('usasac','Army','Army',NULL,'AMC','USASAC','Redstone Arsenal, AL',NULL,NULL,'{}','Army Security Assistance Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('secnav','Navy','Navy',NULL,'Navy','SECNAV','Pentagon, Arlington, VA',NULL,NULL,'{}','Secretary of the Navy')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('navrco','Navy','Navy',NULL,'Navy HQ','NAVRCO','Washington, DC',NULL,'Y',ARRAY['Y'],'Navy Rapid Capabilities Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('opnav','Navy','Navy',NULL,'Navy HQ','OPNAV','Pentagon, Arlington, VA',NULL,NULL,'{}','Office of the Chief of Naval Operations')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('usff','Navy','Navy',NULL,'Navy','USFF','Norfolk, VA',NULL,NULL,'{}','U.S. Navy Fleet Forces Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('uspacflt','Navy','Navy',NULL,'Navy','USPACFLT','Pearl Harbor, HI',NULL,NULL,'{}','U.S. Pacific Fleet')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('navifor','Navy','Navy',NULL,'Navy','NAVIFOR','Norfolk, VA',NULL,NULL,'{}','U.S. Navy Information Forces')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cnaf','Navy','Navy',NULL,'Navy','CNAF','Norfolk, VA',NULL,NULL,'{}','Naval Air Forces')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('onr','Navy','Navy',NULL,'Navy R&D','ONR','Arlington, VA',NULL,'Y',ARRAY['Y'],'Office of Naval Research')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_ras','Navy','Navy',NULL,'Navy Acquisition','PAE RAS','Washington, DC',NULL,'Y',ARRAY['Y'],'Portfolio Acquisition Executive: Robotics and Autonomous Systems')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_maritime','Navy','Navy',NULL,'Navy Acquisition','PAE Maritime','Washington, DC',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: Maritime')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_carriers','Navy','Navy',NULL,'PAE Maritime','PEO Carriers','Washington, DC',NULL,NULL,ARRAY['Y'],'Program Executive Officer, Aircraft Carriers')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_munitions','Navy','Navy',NULL,'Navy Acquisition','PAE Munitions','Washington, DC',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: Munitions')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_iws','Navy','Navy',NULL,'Navy Acquisition','PEO IWS','Washington, DC',NULL,NULL,ARRAY['Y'],'PEO Integrated Warfare Systems')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_mission_sys','Navy','Navy',NULL,'Navy Acquisition','PAE Mission Systems','Washington, DC',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive: Mission Systems')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('navsea','Navy','Navy',NULL,'Navy Systems','NAVSEA','Washington, DC',NULL,NULL,ARRAY['Y'],'Naval Sea Systems Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_ssn','Navy','Navy',NULL,'NAVSEA','PEO SSN','Washington, DC',NULL,NULL,ARRAY['Y'],'PEO Attack Submarines')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_aukus','Navy','Navy',NULL,'NAVSEA','PEO AUKUS','Washington, DC',NULL,NULL,ARRAY['Y'],'PEO AUKUS Direct Reporting Program Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_usc','Navy','Navy',NULL,'NAVSEA','PEO USC','Washington, DC',NULL,NULL,ARRAY['Y'],'PEO Unmanned and Small Combatants')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('nnptc','Navy','Navy',NULL,'NAVSEA','NNPTC','Goose Creek, SC',NULL,NULL,'{}','Naval Nuclear Power Training Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('navair','Navy','Navy',NULL,'Navy Systems','NAVAIR','Patuxent River, MD',NULL,NULL,ARRAY['Y'],'Naval Air Systems Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('nawcad','Navy','Navy',NULL,'NAVAIR','NAWCAD','Patuxent River, MD',NULL,'Y',ARRAY['Y'],'Naval Air Warfare Center Aircraft Division')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('nawcwd','Navy','Navy',NULL,'NAVAIR','NAWCWD','China Lake, CA',NULL,'Y',ARRAY['Y'],'Naval Air Warfare Center Weapons Division')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_a','Navy','Navy',NULL,'NAVAIR','PEO(A)','Patuxent River, MD',NULL,NULL,ARRAY['Y'],'PEO Air Anti-Submarine Warfare, Assault and Special Mission')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_t','Navy','Navy',NULL,'NAVAIR','PEO(T)','Patuxent River, MD',NULL,NULL,ARRAY['Y'],'PEO Tactical Aircraft Programs')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_uw','Navy','Navy',NULL,'NAVAIR','PEO(U&W)','Patuxent River, MD',NULL,NULL,ARRAY['Y'],'PEO Unmanned Aviation and Strike Weapons')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_f35','Navy','Navy',NULL,'NAVAIR','PEO F-35','Arlington, VA',NULL,NULL,ARRAY['Y'],'PEO F-35 Lightning II Joint Program Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('navwar','Navy','Navy',NULL,'Navy Systems','NAVWAR','San Diego, CA',NULL,NULL,ARRAY['Y'],'Naval Information Warfare Systems Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('niwc_atlantic','Navy','Navy',NULL,'NAVWAR','NIWC Atlantic','North Charleston, SC',NULL,'Y',ARRAY['Y'],'Naval Information Warfare Center Atlantic')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('niwc_pacific','Navy','Navy',NULL,'NAVWAR','NIWC Pacific','San Diego, CA',NULL,'Y',ARRAY['Y'],'Naval Information Warfare Center Pacific')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_c4i','Navy','Navy',NULL,'NAVWAR','PEO C4I','San Diego, CA',NULL,NULL,ARRAY['Y'],'PEO Command, Control, Communications, Computers and Intelligence')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_digital','Navy','Navy',NULL,'NAVWAR','PEO Digital','San Diego, CA',NULL,NULL,ARRAY['Y'],'PEO Digital and Enterprise Services')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_mlb','Navy','Navy',NULL,'NAVWAR','PEO MLB','San Diego, CA',NULL,NULL,ARRAY['Y'],'PEO Manpower, Logistics and Business Solutions')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('navfac','Navy','Navy',NULL,'Navy Systems','NAVFAC','Washington, DC',NULL,NULL,ARRAY['Y'],'Naval Facilities Engineering Systems Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('navy_ssp','Navy','Navy',NULL,'Navy Systems','SSP','Washington, DC',NULL,NULL,ARRAY['Y'],'Navy Strategic Systems Programs')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('navy_nnpp','Navy','Navy',NULL,'Navy Systems','NNPP','Washington, DC',NULL,NULL,'{}','Naval Nuclear Propulsion Program')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('usmc','Marine Corps','Marine Corps',NULL,'Marine Corps','HQMC','Pentagon, Arlington, VA',NULL,NULL,'{}','Headquarters Marine Corps')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('usmc_aviation','Marine Corps','Marine Corps',NULL,'Marine Corps','USMC Aviation','Quantico, VA',NULL,NULL,'{}','Marine Corps Aviation')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('usmc_training','Marine Corps','Marine Corps',NULL,'Marine Corps','Marine Training Cmd','Quantico, VA',NULL,NULL,'{}','Marine Corps Training Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('mccdc','Marine Corps','Marine Corps',NULL,'Marine Corps','MCCDC','Quantico, VA',NULL,NULL,'{}','Marine Corps Combat Development and Integration')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('marcorsyscom','Marine Corps','Marine Corps',NULL,'Marine Corps','MARCORSYSCOM','Quantico, VA',NULL,NULL,ARRAY['Y'],'Marine Corps Systems Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_usmc','Marine Corps','Marine Corps',NULL,'Marine Corps','PAE USMC','Quantico, VA',NULL,NULL,ARRAY['Y'],'Portfolio Acquisition Executive for the Marine Corps')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('marforres','Marine Corps','Marine Corps',NULL,'Marine Corps','MARFORRES','New Orleans, LA',NULL,NULL,'{}','Marine Forces Reserve')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('usmc_edcom','Marine Corps','Marine Corps',NULL,'Marine Corps','EDCOM','Quantico, VA',NULL,NULL,'{}','Marine Corps Training and Education Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('usmc_recruiting','Marine Corps','Marine Corps',NULL,'Marine Corps','MCRC','Quantico, VA',NULL,NULL,'{}','Marine Corps Recruiting Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('af','Air Force','Air Force',NULL,'Air Force','AF HQ','Pentagon, Arlington, VA',NULL,NULL,'{}','Department of the Air Force')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('af_academy','Air Force','Air Force',NULL,'Air Force','USAFA','Colorado Springs, CO',NULL,NULL,'{}','Air Force Academy')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aetc','Air Force','Air Force',NULL,'Air Force','AETC','Joint Base San Antonio, TX',NULL,NULL,'{}','Air Education and Training Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afmc','Air Force','Air Force',NULL,'Air Force','AFMC','Wright-Patterson AFB, OH',NULL,NULL,'{}','Air Force Material Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afrco','Air Force','Air Force',NULL,'Air Force Acquisition','AFRCO','Dahlgren, VA',NULL,'Y',ARRAY['Y'],'Air Force PEO Rapid Capabilities Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('sda','Air Force','Air Force',NULL,'Air Force','SDA','El Segundo, CA',NULL,'Y',ARRAY['Y'],'Space Development Agency')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('af_acc','Air Force','Air Force',NULL,'Air Force','ACC','Langley AFB, VA',NULL,NULL,'{}','Air Combat Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('af_sustainment','Air Force','Air Force',NULL,'AFMC','AF Sustainment Center','Tinker AFB, OK',NULL,NULL,'{}','Air Force Sustainment Center')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc','Air Force','Air Force',NULL,'AFMC','AFLCMC','Wright-Patterson AFB, OH',NULL,NULL,ARRAY['Y'],'Air Force Life Cycle Management Center')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_c3bm','Air Force','Air Force',NULL,'AFLCMC','PEO C3BM','Hanscom AFB, MA',NULL,NULL,ARRAY['Y'],'PEO Command, Control, Communications and Battle Management')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_eb','Air Force','Air Force',NULL,'AFLCMC','PEO Armament','Eglin AFB, FL',NULL,NULL,ARRAY['Y'],'PEO Armament Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_bes','Air Force','Air Force',NULL,'AFLCMC','PEO BES','Wright-Patterson AFB, OH',NULL,NULL,ARRAY['Y'],'PEO Business and Enterprise Systems')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_hb','Air Force','Air Force',NULL,'AFLCMC','PEO Electronic Systems','Hanscom AFB, MA',NULL,NULL,ARRAY['Y'],'PEO Electronic Systems Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_hn','Air Force','Air Force',NULL,'AFLCMC','PEO Cyber Networks','Hanscom AFB, MA',NULL,NULL,ARRAY['Y'],'PEO Cyber and Networks Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_pb','Air Force','Air Force',NULL,'AFLCMC','PEO Propulsion','Wright-Patterson AFB, OH',NULL,NULL,ARRAY['Y'],'PEO Propulsion Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_wa','Air Force','Air Force',NULL,'AFLCMC','PEO Fighters','Wright-Patterson AFB, OH',NULL,NULL,ARRAY['Y'],'PEO Fighters and Advanced Aircraft Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_wb','Air Force','Air Force',NULL,'AFLCMC','PEO Bombers','Wright-Patterson AFB, OH',NULL,NULL,ARRAY['Y'],'PEO Bombers Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_wi','Air Force','Air Force',NULL,'AFLCMC','PEO ISR SOF','Wright-Patterson AFB, OH',NULL,NULL,ARRAY['Y'],'PEO ISR and SOF Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_wl','Air Force','Air Force',NULL,'AFLCMC','PEO Mobility','Wright-Patterson AFB, OH',NULL,NULL,ARRAY['Y'],'PEO Mobility Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_wn','Air Force','Air Force',NULL,'AFLCMC','PEO Training','Randolph AFB, TX',NULL,NULL,ARRAY['Y'],'PEO Training Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_jsf','Air Force','Air Force',NULL,'AFLCMC','PEO JSF','Arlington, VA',NULL,NULL,ARRAY['Y'],'PEO Joint Strike Fighter Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('aflcmc_afsac','Air Force','Air Force',NULL,'AFLCMC','AFSAC','Wright-Patterson AFB, OH',NULL,NULL,ARRAY['Y'],'Security Assistance and Cooperation Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afnwc','Air Force','Air Force',NULL,'Air Force','AFNWC','Kirtland AFB, NM',NULL,NULL,ARRAY['Y'],'Air Force Nuclear Weapons Center')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afnwc_nad','Air Force','Air Force',NULL,'AFNWC','PEO NAD','Kirtland AFB, NM',NULL,NULL,ARRAY['Y'],'PEO Air-Delivered Capability Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afnwc_icbm','Air Force','Air Force',NULL,'AFNWC','PEO ICBM','Hill AFB, UT',NULL,NULL,ARRAY['Y'],'PEO Intercontinental Ballistic Missile Systems')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afnwc_nc3','Air Force','Air Force',NULL,'AFNWC','PEO NC3','Kirtland AFB, NM',NULL,NULL,ARRAY['Y'],'PEO Nuclear Command, Control and Comms Integration')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afnwc_nti','Air Force','Air Force',NULL,'AFNWC','Nuclear Tech Integration','Kirtland AFB, NM',NULL,'Y','{}','Nuclear Technology and Integration Directorate')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afrl','Air Force','Air Force',NULL,'AFMC','AFRL','Wright-Patterson AFB, OH',NULL,'Y',ARRAY['Y'],'Air Force Research Laboratory')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('ussf','Space Force','Space Force',NULL,'Space Force','USSF HQ','Pentagon, Arlington, VA',NULL,NULL,'{}','United States Space Force')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('spoc','Space Force','Space Force',NULL,'Space Force','spOC','Peterson SFB, CO',NULL,NULL,'{}','Space Force Combat Forces Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('ssc','Space Force','Space Force',NULL,'Space Force','SSC','El Segundo, CA',NULL,NULL,ARRAY['Y'],'Space Systems Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('starcom','Space Force','Space Force',NULL,'Space Force','STARCOM','Peterson SFB, CO',NULL,NULL,'{}','Space Training and Readiness Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_sensing','Space Force','Space Force',NULL,'SSC','PAE Sensing','El Segundo, CA',NULL,NULL,ARRAY['Y'],'PAE Space-Based Sensing and Targeting')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_aats','Space Force','Space Force',NULL,'SSC','PAE AATS','El Segundo, CA',NULL,NULL,ARRAY['Y'],'PAE Assured Access to Space')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_cp','Space Force','Space Force',NULL,'SSC','PAE Space Combat Power','El Segundo, CA',NULL,NULL,ARRAY['Y'],'PAE Space Combat Power')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('pae_bmc3i','Space Force','Space Force',NULL,'SSC','PAE BMC3I','El Segundo, CA',NULL,NULL,ARRAY['Y'],'PAE Battle Management Command, Control and Comms')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_mcpnt','Space Force','Space Force',NULL,'SSC','PEO MCPNT','El Segundo, CA',NULL,NULL,ARRAY['Y'],'PEO Military Comms and Positioning, Navigation and Timing')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('peo_otti','Space Force','Space Force',NULL,'SSC','PEO OTTI','El Segundo, CA',NULL,NULL,ARRAY['Y'],'PEO Operational Test and Training Infrastructure')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('sf_rco','Space Force','Space Force',NULL,'Space Force','SF RCO','Kirtland AFB, NM',NULL,'Y',ARRAY['Y'],'Space Force PEO Space Rapid Capabilities Office')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom','SOCOM','SOCOM',NULL,'Combatant Command','SOCOM','MacDill AFB, FL',NULL,NULL,'{}','US Special Operations Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_jsu','SOCOM','SOCOM',NULL,'SOCOM','JSOU','MacDill AFB, FL',NULL,NULL,'{}','Joint Special Operations University')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_atl','SOCOM','SOCOM',NULL,'SOCOM','SOF-ATL','MacDill AFB, FL',NULL,NULL,ARRAY['Y'],'Acquisition, Technology and Logistics (SOF-ATL)')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_dir_eis','SOCOM','SOCOM',NULL,'SOCOM','SOF DIR-EIS','MacDill AFB, FL',NULL,NULL,'{}','Directorate of Enterprise Information Systems')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_peo_fw','SOCOM','SOCOM',NULL,'SOCOM Acquisition','PEO-FW','MacDill AFB, FL',NULL,NULL,ARRAY['Y'],'SOF PEO Fixed Wing')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_peo_m','SOCOM','SOCOM',NULL,'SOCOM Acquisition','PEO-M','MacDill AFB, FL',NULL,NULL,ARRAY['Y'],'SOF PEO Maritime')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_peo_rw','SOCOM','SOCOM',NULL,'SOCOM Acquisition','PEO-RW','MacDill AFB, FL',NULL,NULL,ARRAY['Y'],'SOF PEO Rotary Wing')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_peo_sda','SOCOM','SOCOM',NULL,'SOCOM Acquisition','PEO-SDA','MacDill AFB, FL',NULL,'Y',ARRAY['Y'],'SOF PEO Digital Applications')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_peo_sofsa','SOCOM','SOCOM',NULL,'SOCOM Acquisition','PEO-SOFSA','MacDill AFB, FL',NULL,NULL,ARRAY['Y'],'SOF PEO Special Operations Forces Support Activity')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_peo_sw','SOCOM','SOCOM',NULL,'SOCOM Acquisition','PEO-SW','MacDill AFB, FL',NULL,NULL,ARRAY['Y'],'SOF PEO Special Operations Forces Warrior')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('socom_peo_tis','SOCOM','SOCOM',NULL,'SOCOM Acquisition','PEO-TIS','MacDill AFB, FL',NULL,NULL,ARRAY['Y'],'SOF PEO Tactical Information Systems')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('jsoc','SOCOM','SOCOM',NULL,'SOCOM','JSOC','Fort Liberty, NC',NULL,NULL,'{}','Joint Special Operations Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('seals','SOCOM','SOCOM',NULL,'SOCOM','NSW','Coronado, CA',NULL,NULL,'{}','Naval Special Warfare Command (SEALs)')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('arsoc','SOCOM','SOCOM',NULL,'SOCOM','ARSOC','Fort Liberty, NC',NULL,NULL,'{}','Army Special Operations Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('afsoc','SOCOM','SOCOM',NULL,'SOCOM','AFSOC','Hurlburt Field, FL',NULL,NULL,'{}','Air Force Special Operations Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('marsoc','SOCOM','SOCOM',NULL,'SOCOM','MARSOC','Camp Lejeune, NC',NULL,NULL,'{}','Marine Corps Special Operations Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('indopacom','INDOPACOM','Combatant Command',NULL,'Combatant Command','INDOPACOM','Camp H.M. Smith, HI',NULL,NULL,'{}','Indo-Pacific Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('centcom','CENTCOM','Combatant Command',NULL,'Combatant Command','CENTCOM','MacDill AFB, FL',NULL,NULL,'{}','US Central Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('eucom','EUCOM','Combatant Command',NULL,'Combatant Command','EUCOM','Patch Barracks, Stuttgart, Germany',NULL,NULL,'{}','European Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('southcom','SOUTHCOM','Combatant Command',NULL,'Combatant Command','SOUTHCOM','Miami, FL',NULL,NULL,'{}','Southern Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('northcom','NORTHCOM','Combatant Command',NULL,'Combatant Command','NORTHCOM','Peterson SFB, CO',NULL,NULL,'{}','Northern Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('africom','AFRICOM','Combatant Command',NULL,'Combatant Command','AFRICOM','Kelley Barracks, Stuttgart, Germany',NULL,NULL,'{}','Africa Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('stratcom','STRATCOM','Combatant Command',NULL,'Combatant Command','STRATCOM','Offutt AFB, NE',NULL,NULL,'{}','Strategic Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('spacecom','SPACECOM','Combatant Command',NULL,'Combatant Command','SPACECOM','Schriever SFB, CO',NULL,NULL,'{}','U.S. Space Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('transcom','TRANSCOM','Combatant Command',NULL,'Combatant Command','TRANSCOM','Scott AFB, IL',NULL,NULL,'{}','Transportation Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('amc_transcom','TRANSCOM','Combatant Command',NULL,'TRANSCOM','AMC','Scott AFB, IL',NULL,NULL,'{}','Air Mobility Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('cybercom','CYBERCOM','Combatant Command',NULL,'Combatant Command','CYBERCOM','Fort Meade, MD',NULL,NULL,'{}','Cyber Command')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
INSERT INTO orgs (id,sub,branch,budget,major,subtier,loc,budget_detail,r_and_d,contract_vehicles,description)
              VALUES ('osc_vc','OSD','DoW',NULL,'Government VC','Office of Strategic Capital','Washington, DC',NULL,'Y',ARRAY['Y'],'Office of Strategic Capital')
              ON CONFLICT (id) DO UPDATE SET
                sub=EXCLUDED.sub, branch=EXCLUDED.branch, budget=EXCLUDED.budget,
                major=EXCLUDED.major, subtier=EXCLUDED.subtier, loc=EXCLUDED.loc,
                budget_detail=EXCLUDED.budget_detail, r_and_d=EXCLUDED.r_and_d,
                contract_vehicles=EXCLUDED.contract_vehicles, description=EXCLUDED.description;
UPDATE contacts SET org_id = 'opnav' WHERE org_id = 'navy-hq';
UPDATE contacts SET org_id = 'army' WHERE org_id = 'army-hq';
UPDATE contacts SET org_id = 'amc' WHERE org_id = 'army-amc';
UPDATE contacts SET org_id = 'devcom' WHERE org_id = 'army-devcom';
UPDATE contacts SET org_id = 'aal' WHERE org_id = 'army-aal';
UPDATE contacts SET org_id = 'arcyber' WHERE org_id = 'army-arcyber';
UPDATE contacts SET org_id = 'army_rccto' WHERE org_id = 'army-rccto';
UPDATE contacts SET org_id = 'af' WHERE org_id = 'af-hq';
UPDATE contacts SET org_id = 'ussf' WHERE org_id = 'sf-hq';
UPDATE contacts SET org_id = 'pae_maneuver_ground' WHERE org_id = 'pae-mng';
UPDATE contacts SET org_id = 'pae_maneuver_air' WHERE org_id = 'pae-mna';
UPDATE contacts SET org_id = 'pae_fires' WHERE org_id = 'pae-fires';
UPDATE contacts SET org_id = 'pae_c2' WHERE org_id = 'pae-c2';
UPDATE contacts SET org_id = 'pae_sustainment' WHERE org_id = 'pae-sustainment';
UPDATE contacts SET org_id = 'pae_cbrn' WHERE org_id = 'pae-cbrn';
UPDATE contacts SET org_id = 'pae_ras' WHERE org_id = 'pae-ras';
UPDATE contacts SET org_id = 'pae_maritime' WHERE org_id = 'pae-maritime';
UPDATE contacts SET org_id = 'pae_mission_sys' WHERE org_id = 'pae-ms';
UPDATE contacts SET org_id = 'pae_usmc' WHERE org_id = 'pae-usmc';
