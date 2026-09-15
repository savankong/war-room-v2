INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('department', 'Department', 'civilian', 1, 'Cabinet-level departments (DoD)')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('military_department', 'Military Department', 'civilian', 2, 'Dept of Army / Navy / Air Force with own Secretary')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('usd_office', 'Under Secretary Office', 'civilian', 3, 'USD-level policy offices (OUSD A&S, R&E, P, I&S, P&R)')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('asd_office', 'Assistant Secretary Office', 'civilian', 4, 'ASD-level offices')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('osd_office', 'OSD Staff Office', 'civilian', 5, 'OSD direct-report offices (CAPE, SCO, CIO, etc.)')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('joint_staff', 'Joint Staff', 'military', 3, 'Joint Chiefs of Staff and J-directorates')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('service_hq', 'Service Headquarters', 'military', 4, 'ARSTAF, OPNAV, HAF, USSF HQ, HQMC')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('major_command', 'Major Command', 'military', 5, 'TRADOC, AMC, AFMC, MARFORPAC, etc.')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('field_command', 'Field Command', 'military', 6, 'Corps, divisions, wings, numbered armies')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('component_command', 'Service Component Command', 'military', 6, 'ARCENT, NAVCENT, USAFE, etc.')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('unified_command', 'Unified Combatant Command', 'operational', 3, 'Geographic and functional CCMDs')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('sub_unified_command', 'Sub-Unified Command', 'operational', 4, 'SOCEUR, JIATF, etc.')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('fleet_command', 'Fleet / Force Command', 'operational', 5, 'PACFLT, USFF, numbered fleets')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('special_ops_command', 'Special Operations Command', 'operational', 5, 'JSOC, ARSOC, AFSOC, NSW, MARSOC')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('defense_agency', 'Defense Agency', 'intelligence', 3, 'DIA, DISA, DCSA, MDA, DLA, DFAS')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('defense_field_activity', 'Defense Field Activity', 'intelligence', 4, 'WHS, TMA, PFPA')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('intelligence_office', 'Intelligence Office', 'intelligence', 4, 'OSI&A, OUSD(I&S) components')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('systems_command', 'Systems Command', 'acquisition', 4, 'NAVSEA, NAVAIR, NAVWAR, MARCORSYSCOM, AMC')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('portfolio_acq_exec', 'Portfolio Acquisition Executive', 'acquisition', 5, 'PAE — DoW portfolio-level acquisition authority')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('capability_prog_exec', 'Capability Program Executive', 'acquisition', 6, 'CPE — programs within a PAE')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('program_exec_office', 'Program Executive Office', 'acquisition', 5, 'Traditional PEO')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('program_office', 'Program Office', 'acquisition', 6, 'PM-level offices and directorates within PEO/CPE')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('contracting_command', 'Contracting Command', 'acquisition', 5, 'ACC, DCMA, contracting centers')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('research_lab', 'Research Laboratory / Agency', 'research', 4, 'DARPA, ONR, AFRL, DEVCOM, NNSA')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('innovation_unit', 'Innovation Unit', 'research', 5, 'DIU, AFWERX, AAL, Army Software Factory')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('rapid_capabilities', 'Rapid Capabilities Office', 'research', 5, 'RCO / RCCTO offices')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('contracting_org', 'Contracting Organization', 'support', 5, 'Contracting offices and centers')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('training_command', 'Training & Education Command', 'support', 5, 'TRADOC components, AETC, STARCOM')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('office', 'Office', 'support', 9, 'Generic staff office')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_types (id, name, category, sort_order, description)
              VALUES ('directorate', 'Directorate', 'support', 9, 'Staff directorate')
              ON CONFLICT (id) DO UPDATE SET
                name=EXCLUDED.name, category=EXCLUDED.category,
                sort_order=EXCLUDED.sort_order, description=EXCLUDED.description;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('cocom', 'cocom', 'command', 'Combatant Command Authority (COCOM)', TRUE, 'has COCOM of', 'COCOM held by')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('opcon', 'opcon', 'command', 'Operational Control (OPCON)', TRUE, 'has OPCON of', 'OPCON held by')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('tacon', 'tacon', 'command', 'Tactical Control (TACON)', TRUE, 'has TACON of', 'TACON held by')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('adcon', 'adcon', 'command', 'Administrative Control (ADCON)', TRUE, 'has ADCON of', 'ADCON held by')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('policy_oversight', 'policy_oversight', 'oversight', 'Policy / Programmatic Oversight', TRUE, 'has policy oversight of', 'is overseen by')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('functional_authority', 'functional_authority', 'oversight', 'Functional Authority (CIO, CAO, etc.)', TRUE, 'has functional authority over', 'functional authority from')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('budget_authority', 'budget_authority', 'oversight', 'Budget / Resource Sponsor Authority', TRUE, 'is resource sponsor for', 'resource sponsor is')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('acq_authority', 'acq_authority', 'acquisition', 'Acquisition Authority', TRUE, 'has acquisition authority over', 'acquisition authority from')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('milestone_authority', 'milestone_authority', 'acquisition', 'Milestone Decision Authority (MDA)', TRUE, 'is MDA for', 'MDA is')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('reporting', 'reporting', 'reporting', 'Reporting Relationship', TRUE, 'receives reports from', 'reports to')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('supporting', 'supporting', 'support', 'Supporting / Supported Relationship', FALSE, 'supports', 'is supported by')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
              VALUES ('coordination', 'coordination', 'support', 'Coordination / Liaison Relationship', FALSE, 'coordinates with', 'coordinates with')
              ON CONFLICT (id) DO UPDATE SET
                category=EXCLUDED.category, description=EXCLUDED.description,
                is_directional=EXCLUDED.is_directional,
                label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to;
UPDATE orgs
              SET org_type_id = 'joint_staff', parent_id = 'osw'
              WHERE id = 'jcs';
UPDATE orgs
              SET org_type_id = 'department', parent_id = NULL
              WHERE id = 'osw';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'osw'
              WHERE id = 'sapco';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'osw'
              WHERE id = 'cape';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'osw'
              WHERE id = 'dow_cio';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'osw'
              WHERE id = 'sco';
UPDATE orgs
              SET org_type_id = 'usd_office', parent_id = 'osw'
              WHERE id = 'ousd_as';
UPDATE orgs
              SET org_type_id = 'asd_office', parent_id = 'ousd_as'
              WHERE id = 'asd_a';
UPDATE orgs
              SET org_type_id = 'asd_office', parent_id = 'ousd_as'
              WHERE id = 'asd_s';
UPDATE orgs
              SET org_type_id = 'asd_office', parent_id = 'ousd_as'
              WHERE id = 'asd_eie';
UPDATE orgs
              SET org_type_id = 'asd_office', parent_id = 'ousd_as'
              WHERE id = 'asd_nd_cbd';
UPDATE orgs
              SET org_type_id = 'asd_office', parent_id = 'ousd_as'
              WHERE id = 'asd_ibp';
UPDATE orgs
              SET org_type_id = 'usd_office', parent_id = 'osw'
              WHERE id = 'ousd_pr';
UPDATE orgs
              SET org_type_id = 'usd_office', parent_id = 'osw'
              WHERE id = 'ousd_re';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'ousd_re'
              WHERE id = 'cdao';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'ousd_re'
              WHERE id = 'darpa';
UPDATE orgs
              SET org_type_id = 'defense_agency', parent_id = 'ousd_as'
              WHERE id = 'mda';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'ousd_re'
              WHERE id = 'osc';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'ousd_as'
              WHERE id = 'edu';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'osw'
              WHERE id = 'exim';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'osw'
              WHERE id = 'dfc';
UPDATE orgs
              SET org_type_id = 'innovation_unit', parent_id = 'ousd_re'
              WHERE id = 'diu';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'osw'
              WHERE id = 'dot_e';
UPDATE orgs
              SET org_type_id = 'usd_office', parent_id = 'osw'
              WHERE id = 'ousd_p';
UPDATE orgs
              SET org_type_id = 'usd_office', parent_id = 'osw'
              WHERE id = 'osd_is';
UPDATE orgs
              SET org_type_id = 'defense_agency', parent_id = 'osd_is'
              WHERE id = 'disa';
UPDATE orgs
              SET org_type_id = 'defense_agency', parent_id = 'osd_is'
              WHERE id = 'dia';
UPDATE orgs
              SET org_type_id = 'defense_agency', parent_id = 'ousd_as'
              WHERE id = 'dcsa';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'osw'
              WHERE id = 'dam';
UPDATE orgs
              SET org_type_id = 'defense_field_activity', parent_id = 'dam'
              WHERE id = 'whs';
UPDATE orgs
              SET org_type_id = 'osd_office', parent_id = 'ousd_re'
              WHERE id = 'osc_vc';
UPDATE orgs
              SET org_type_id = 'military_department', parent_id = 'osw'
              WHERE id = 'army';
UPDATE orgs
              SET org_type_id = 'office', parent_id = 'army'
              WHERE id = 'army_hrc';
UPDATE orgs
              SET org_type_id = 'rapid_capabilities', parent_id = 'army'
              WHERE id = 'army_rccto';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'army'
              WHERE id = 'usasmdc';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'army'
              WHERE id = 'arcyber';
UPDATE orgs
              SET org_type_id = 'office', parent_id = 'army'
              WHERE id = 'army_ng';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'army'
              WHERE id = 'pae_maneuver_ground';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_maneuver_ground'
              WHERE id = 'cpe_maneuver_ground';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'army'
              WHERE id = 'pae_maneuver_air';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_maneuver_air'
              WHERE id = 'cpe_aviation';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_maneuver_air'
              WHERE id = 'cpe_autonomy';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'army'
              WHERE id = 'pae_fires';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_fires'
              WHERE id = 'cpe_offense';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_fires'
              WHERE id = 'cpe_defensive';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_fires'
              WHERE id = 'cpe_integrated_fires';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'army'
              WHERE id = 'pae_c2';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_c2'
              WHERE id = 'cpe_c2in';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_c2'
              WHERE id = 'cpe_st3';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_c2'
              WHERE id = 'cpe_isw';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'army'
              WHERE id = 'pae_sustainment';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_sustainment'
              WHERE id = 'cpe_combat_logistics';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_sustainment'
              WHERE id = 'cpe_ammo';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'army'
              WHERE id = 'pae_cbrn';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_cbrn'
              WHERE id = 'cpe_cbrnd';
UPDATE orgs
              SET org_type_id = 'capability_prog_exec', parent_id = 'pae_cbrn'
              WHERE id = 'cpe_es2';
UPDATE orgs
              SET org_type_id = 'innovation_unit', parent_id = 'army'
              WHERE id = 'aal';
UPDATE orgs
              SET org_type_id = 'innovation_unit', parent_id = 'army'
              WHERE id = 'army_swf';
UPDATE orgs
              SET org_type_id = 'training_command', parent_id = 'army'
              WHERE id = 't2com';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 't2com'
              WHERE id = 'cac';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 't2com'
              WHERE id = 'devcom';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 't2com'
              WHERE id = 'army_med_rd';
UPDATE orgs
              SET org_type_id = 'training_command', parent_id = 'army'
              WHERE id = 'army_university';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'army'
              WHERE id = 'amc';
UPDATE orgs
              SET org_type_id = 'contracting_command', parent_id = 'amc'
              WHERE id = 'army_acc';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'amc'
              WHERE id = 'amcom';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'amc'
              WHERE id = 'cecom';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'amc'
              WHERE id = 'jmc';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'amc'
              WHERE id = 'asc';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'amc'
              WHERE id = 'atec';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'amc'
              WHERE id = 'tacom';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'amc'
              WHERE id = 'usasac';
UPDATE orgs
              SET org_type_id = 'military_department', parent_id = 'osw'
              WHERE id = 'secnav';
UPDATE orgs
              SET org_type_id = 'rapid_capabilities', parent_id = 'secnav'
              WHERE id = 'navrco';
UPDATE orgs
              SET org_type_id = 'service_hq', parent_id = 'secnav'
              WHERE id = 'opnav';
UPDATE orgs
              SET org_type_id = 'fleet_command', parent_id = 'secnav'
              WHERE id = 'usff';
UPDATE orgs
              SET org_type_id = 'fleet_command', parent_id = 'secnav'
              WHERE id = 'uspacflt';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'opnav'
              WHERE id = 'navifor';
UPDATE orgs
              SET org_type_id = 'fleet_command', parent_id = 'opnav'
              WHERE id = 'cnaf';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'secnav'
              WHERE id = 'onr';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'secnav'
              WHERE id = 'pae_ras';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'secnav'
              WHERE id = 'pae_maritime';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'pae_maritime'
              WHERE id = 'peo_carriers';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'secnav'
              WHERE id = 'pae_munitions';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'secnav'
              WHERE id = 'peo_iws';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'secnav'
              WHERE id = 'pae_mission_sys';
UPDATE orgs
              SET org_type_id = 'systems_command', parent_id = 'secnav'
              WHERE id = 'navsea';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navsea'
              WHERE id = 'peo_ssn';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navsea'
              WHERE id = 'peo_aukus';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navsea'
              WHERE id = 'peo_usc';
UPDATE orgs
              SET org_type_id = 'training_command', parent_id = 'navsea'
              WHERE id = 'nnptc';
UPDATE orgs
              SET org_type_id = 'systems_command', parent_id = 'secnav'
              WHERE id = 'navair';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'navair'
              WHERE id = 'nawcad';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'navair'
              WHERE id = 'nawcwd';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navair'
              WHERE id = 'peo_a';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navair'
              WHERE id = 'peo_t';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navair'
              WHERE id = 'peo_uw';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navair'
              WHERE id = 'peo_f35';
UPDATE orgs
              SET org_type_id = 'systems_command', parent_id = 'secnav'
              WHERE id = 'navwar';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'navwar'
              WHERE id = 'niwc_atlantic';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'navwar'
              WHERE id = 'niwc_pacific';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navwar'
              WHERE id = 'peo_c4i';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navwar'
              WHERE id = 'peo_digital';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'navwar'
              WHERE id = 'peo_mlb';
UPDATE orgs
              SET org_type_id = 'systems_command', parent_id = 'secnav'
              WHERE id = 'navfac';
UPDATE orgs
              SET org_type_id = 'office', parent_id = 'secnav'
              WHERE id = 'navy_ssp';
UPDATE orgs
              SET org_type_id = 'office', parent_id = 'secnav'
              WHERE id = 'navy_nnpp';
UPDATE orgs
              SET org_type_id = 'military_department', parent_id = 'secnav'
              WHERE id = 'usmc';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'usmc'
              WHERE id = 'usmc_aviation';
UPDATE orgs
              SET org_type_id = 'training_command', parent_id = 'usmc'
              WHERE id = 'usmc_training';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'usmc'
              WHERE id = 'mccdc';
UPDATE orgs
              SET org_type_id = 'systems_command', parent_id = 'usmc'
              WHERE id = 'marcorsyscom';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'usmc'
              WHERE id = 'pae_usmc';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'usmc'
              WHERE id = 'marforres';
UPDATE orgs
              SET org_type_id = 'training_command', parent_id = 'usmc'
              WHERE id = 'usmc_edcom';
UPDATE orgs
              SET org_type_id = 'office', parent_id = 'usmc'
              WHERE id = 'usmc_recruiting';
UPDATE orgs
              SET org_type_id = 'military_department', parent_id = 'osw'
              WHERE id = 'af';
UPDATE orgs
              SET org_type_id = 'training_command', parent_id = 'af'
              WHERE id = 'af_academy';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'af'
              WHERE id = 'aetc';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'af'
              WHERE id = 'afmc';
UPDATE orgs
              SET org_type_id = 'rapid_capabilities', parent_id = 'af'
              WHERE id = 'afrco';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'ousd_re'
              WHERE id = 'sda';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'af'
              WHERE id = 'af_acc';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'afmc'
              WHERE id = 'af_sustainment';
UPDATE orgs
              SET org_type_id = 'systems_command', parent_id = 'afmc'
              WHERE id = 'aflcmc';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_c3bm';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_eb';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_bes';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_hb';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_hn';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_pb';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_wa';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_wb';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_wi';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_wl';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_wn';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_jsf';
UPDATE orgs
              SET org_type_id = 'office', parent_id = 'aflcmc'
              WHERE id = 'aflcmc_afsac';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'afmc'
              WHERE id = 'afnwc';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'afnwc'
              WHERE id = 'afnwc_nad';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'afnwc'
              WHERE id = 'afnwc_icbm';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'afnwc'
              WHERE id = 'afnwc_nc3';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'afnwc'
              WHERE id = 'afnwc_nti';
UPDATE orgs
              SET org_type_id = 'research_lab', parent_id = 'afmc'
              WHERE id = 'afrl';
UPDATE orgs
              SET org_type_id = 'military_department', parent_id = 'af'
              WHERE id = 'ussf';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'ussf'
              WHERE id = 'spoc';
UPDATE orgs
              SET org_type_id = 'systems_command', parent_id = 'ussf'
              WHERE id = 'ssc';
UPDATE orgs
              SET org_type_id = 'training_command', parent_id = 'ussf'
              WHERE id = 'starcom';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'ssc'
              WHERE id = 'pae_sensing';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'ssc'
              WHERE id = 'pae_aats';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'ssc'
              WHERE id = 'pae_cp';
UPDATE orgs
              SET org_type_id = 'portfolio_acq_exec', parent_id = 'ssc'
              WHERE id = 'pae_bmc3i';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'ssc'
              WHERE id = 'peo_mcpnt';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'ssc'
              WHERE id = 'peo_otti';
UPDATE orgs
              SET org_type_id = 'rapid_capabilities', parent_id = 'ussf'
              WHERE id = 'sf_rco';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'socom';
UPDATE orgs
              SET org_type_id = 'training_command', parent_id = 'socom'
              WHERE id = 'socom_jsu';
UPDATE orgs
              SET org_type_id = 'office', parent_id = 'socom'
              WHERE id = 'socom_atl';
UPDATE orgs
              SET org_type_id = 'office', parent_id = 'socom'
              WHERE id = 'socom_dir_eis';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'socom'
              WHERE id = 'socom_peo_fw';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'socom'
              WHERE id = 'socom_peo_m';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'socom'
              WHERE id = 'socom_peo_rw';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'socom'
              WHERE id = 'socom_peo_sda';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'socom'
              WHERE id = 'socom_peo_sofsa';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'socom'
              WHERE id = 'socom_peo_sw';
UPDATE orgs
              SET org_type_id = 'program_exec_office', parent_id = 'socom'
              WHERE id = 'socom_peo_tis';
UPDATE orgs
              SET org_type_id = 'sub_unified_command', parent_id = 'socom'
              WHERE id = 'jsoc';
UPDATE orgs
              SET org_type_id = 'special_ops_command', parent_id = 'socom'
              WHERE id = 'seals';
UPDATE orgs
              SET org_type_id = 'special_ops_command', parent_id = 'socom'
              WHERE id = 'arsoc';
UPDATE orgs
              SET org_type_id = 'special_ops_command', parent_id = 'socom'
              WHERE id = 'afsoc';
UPDATE orgs
              SET org_type_id = 'special_ops_command', parent_id = 'socom'
              WHERE id = 'marsoc';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'indopacom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'centcom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'eucom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'southcom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'northcom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'africom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'stratcom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'spacecom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'transcom';
UPDATE orgs
              SET org_type_id = 'major_command', parent_id = 'transcom'
              WHERE id = 'amc_transcom';
UPDATE orgs
              SET org_type_id = 'unified_command', parent_id = 'osw'
              WHERE id = 'cybercom';
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('osd_is', 'dia', 'policy_oversight', NULL, 'OUSD(I&S) oversees DIA per DoD Directive 5143.01')
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('osd_is', 'disa', 'policy_oversight', NULL, 'OUSD(I&S) oversees DISA cybersecurity policy')
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('osd_is', 'dcsa', 'policy_oversight', NULL, 'OUSD(I&S) oversees DCSA counterintelligence')
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_maneuver_ground', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_maneuver_air', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_fires', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_c2', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_sustainment', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_cbrn', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_ras', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_maritime', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'pae_mission_sys', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'socom_peo_fw', 'acq_authority', 'SAE', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('cdao', 'dia', 'functional_authority', NULL, 'CDAO data standards authority')
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('cdao', 'disa', 'functional_authority', NULL, 'CDAO data/AI standards authority')
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('indopacom', 'uspacflt', 'opcon', NULL, 'PACFLT is naval component of INDOPACOM')
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('centcom', 'navcent', 'opcon', NULL, NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('transcom', 'amc_transcom', 'opcon', NULL, NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'peo_f35', 'milestone_authority', 'MDA', 'OUSD(A&S) is MDA for F-35')
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('ousd_as', 'aflcmc_jsf', 'acq_authority', 'PEO', NULL)
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
              VALUES ('cybercom', 'afcyber', 'opcon', NULL, '16 AF is AFCYBER service component')
              ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
                authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes;
