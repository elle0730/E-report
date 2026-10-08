import bcrypt from 'bcryptjs';
import { db, initDb, generateReferenceNumber } from './index.js';

export function seed() {
  console.log('--- Initializing database tables ---');
  initDb();

  console.log('--- Seeding default data for Barangay Bensican ---');
  const now = new Date().toISOString();

  // Clear existing data in correct order
  const tables = [
    'archive_restore_requests', 'chat_messages', 'notifications', 'file_tree',
    'payroll_requests', 'payroll_records', 'payroll_attendance', 'announcements',
    'bills', 'subpoenas', 'subpoena_templates', 'hearing_history', 'hearings',
    'report_followups', 'report_attachments', 'reports', 'categories',
    'staff_presence', 'sessions', 'audit_logs', 'landing_page_cms',
    'system_settings', 'users', 'sequences'
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }

  // 1. System Settings
  const defaultSettings = [
    {
      key: 'barangay_info',
      value: {
        name: 'Barangay Bensican',
        municipality: 'San Nicolas',
        province: 'Pangasinan',
        region: 'Region I - Ilocos Region',
        hall_address: 'Barangay Hall, Main Road, Bensican, San Nicolas, Pangasinan 2447',
        phone: '+63 (075) 572-2345 / 0917-555-BENSI',
        email: 'info@bensican.gov.ph',
        office_hours: 'Monday to Friday: 8:00 AM – 5:00 PM (Emergency Desk 24/7)',
        punong_barangay: 'Office of the Punong Barangay',
        barangay_secretary: 'Office of the Barangay Secretary',
        barangay_treasurer: 'Office of the Barangay Treasurer'
      }
    },
    {
      key: 'venues',
      value: [
        'Barangay Hall - Session Hall',
        'Lupong Tagapamayapa Mediation Room',
        'Barangay Bensican Multi-Purpose Covered Court',
        'Office of the Punong Barangay'
      ]
    },
    {
      key: 'bill_types',
      value: [
        'Electricity (Pangasinan Electric Cooperative)',
        'Water Utility (San Nicolas Water District)',
        'Office Supplies & Paperwork',
        'Streetlight Maintenance & Bulbs',
        'Community Health Center Supplies',
        'Barangay Peacekeeping & Tanod Gear',
        'Waste Management & Fuel'
      ]
    },
    {
      key: 'announcement_groups',
      value: ['All Residents', 'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Senior Citizens', 'Youth Council (SK)']
    },
    {
      key: 'staff_positions',
      value: [
        'Punong Barangay',
        'Barangay Kagawad - Peace and Order',
        'Barangay Kagawad - Health & Sanitation',
        'Barangay Kagawad - Public Works & Infrastructure',
        'Barangay Secretary',
        'Barangay Treasurer',
        'Barangay Administrator',
        'Chief Barangay Tanod'
      ]
    },
    {
      key: 'bensi_config',
      value: {
        enabled: true,
        bot_name: 'Bensi',
        greetings: {
          en: 'Mabuhay! I am Bensi, your automated Barangay Bensican digital assistant. How may I assist you today?',
          tl: 'Mabuhay! Ako si Bensi, ang inyong automated digital assistant ng Barangay Bensican. Paano kita matutulungan ngayon?',
          il: 'Kablaaw! Siak ni Bensi, ti automated digital assistant ti Barangay Bensican. Kasanoka a matulongan ita nga aldaw?'
        },
        allowed_topics: [
          'Filing a community report / concern',
          'Checking report status and timeline',
          'Barangay hearings and subpoenas',
          'Barangay hall office hours and hotline',
          'Transparency bills and barangay announcements'
        ]
      }
    }
  ];

  const insertSetting = db.prepare('INSERT INTO system_settings (key, value_json, updated_at) VALUES (?, ?, ?)');
  for (const s of defaultSettings) {
    insertSetting.run(s.key, JSON.stringify(s.value), now);
  }

  // 2. Users (Super Admin, Admin, Verified Resident, Pending Resident)
  const passwordSalt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('BensicanAdmin2026!', passwordSalt);
  const residentPasswordHash = bcrypt.hashSync('Resident2026!', passwordSalt);

  const superAdminId = 'user-super-admin-01';
  const adminId = 'user-admin-01';
  const residentId = 'user-resident-01';
  const pendingResidentId = 'user-resident-pending-02';

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, email, password_hash, role, status, full_name, birthday,
      contact_number, house_number, street, barangay, residency_length,
      valid_id_url, selfie_url, helper_name, position, photo_url,
      two_factor_enabled, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  // Super Admin
  insertUser.run(
    superAdminId,
    'superadmin@bensican.gov.ph',
    adminPasswordHash,
    'super_admin',
    'active',
    'Super Administrator',
    null,
    null,
    '01',
    'Rizal Street',
    'Bensican',
    'Barangay Bensican Hall',
    null,
    null,
    null,
    'Punong Barangay',
    null,
    1,
    now,
    now
  );

  // Admin
  insertUser.run(
    adminId,
    'admin@bensican.gov.ph',
    adminPasswordHash,
    'admin',
    'active',
    'Barangay Administrator',
    null,
    null,
    '15',
    'Mabini Street',
    'Bensican',
    'Barangay Bensican Hall',
    null,
    null,
    null,
    'Barangay Administrator',
    null,
    1,
    now,
    now
  );

  // Verified Resident
  insertUser.run(
    residentId,
    'resident@bensican.gov.ph',
    residentPasswordHash,
    'resident',
    'active',
    'Resident User',
    null,
    null,
    '42',
    'Purok 2, Burgos Street',
    'Bensican',
    'Resident',
    null,
    null,
    null,
    null,
    null,
    0,
    now,
    now
  );

  // Pending Resident
  insertUser.run(
    pendingResidentId,
    'pending@bensican.gov.ph',
    residentPasswordHash,
    'resident',
    'pending_verification',
    'Pending Resident',
    null,
    null,
    '108',
    'Purok 4, Luna Street',
    'Bensican',
    'Applicant',
    null,
    null,
    null,
    null,
    null,
    0,
    now,
    now
  );

  // Staff Presence
  const insertPresence = db.prepare(`
    INSERT INTO staff_presence (user_id, is_online, is_available, last_heartbeat)
    VALUES (?, ?, ?, ?)
  `);
  insertPresence.run(superAdminId, 1, 1, now);
  insertPresence.run(adminId, 1, 1, now);

  // 3. Categories
  const categories = [
    { id: 'cat-peace', name: 'Peace and Order', icon: 'ShieldAlert', desc: 'Disputes, disturbances, public safety, and curfew concerns', sort: 1, handler: adminId },
    { id: 'cat-sanitation', name: 'Sanitation & Cleanliness', icon: 'Trash2', desc: 'Uncollected garbage, drainage clogs, and improper waste disposal', sort: 2, handler: adminId },
    { id: 'cat-infra', name: 'Infrastructure & Roads', icon: 'Hammer', desc: 'Potholes, broken streetlights, broken canals, fallen tree branches', sort: 3, handler: adminId },
    { id: 'cat-noise', name: 'Noise Disturbance', icon: 'Volume2', desc: 'Late-night videoke, loud mufflers, barking dogs, construction noise', sort: 4, handler: adminId },
    { id: 'cat-dispute', name: 'Neighborhood & Boundary Dispute', icon: 'Users', desc: 'Property borders, fence disagreements, right of way disputes', sort: 5, handler: superAdminId },
    { id: 'cat-health', name: 'Health & Environment', icon: 'HeartPulse', desc: 'Dengue breeding sites, stagnant water, stray animal health risks', sort: 6, handler: adminId },
    { id: 'cat-other', name: 'Other Barangay Concerns', icon: 'HelpCircle', desc: 'General community inquiries, certifications, lost items', sort: 7, handler: adminId }
  ];

  const insertCat = db.prepare(`
    INSERT INTO categories (id, name, icon, description, default_handler_id, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of categories) {
    insertCat.run(c.id, c.name, c.icon, c.desc, c.handler, c.sort, now);
  }

  // 4. Subpoena Templates
  const defaultSubpoenaTemplate = {
    id: 'tmpl-subpoena-01',
    name: 'Standard Barangay Summons / Subpoena (KP Form No. 9)',
    bodyTemplate: `REPUBLIC OF THE PHILIPPINES\nPROVINCE OF PANGASINAN\nMUNICIPALITY OF SAN NICOLAS\nBARANGAY BENSICAN\n\nOFFICE OF THE LUPONG TAGAPAMAYAPA\n\nBARANGAY CASE NO.: {{caseNumber}}\nFOR: {{reason}}\n\nCOMPLAINANT: {{complainant}}\nAGAINST\nRESPONDENT: {{respondent}}\n\nSUBPOENA / SUMMONS (PATAWAG)\n\nTO: {{respondent}}\nAddress: Barangay Bensican, San Nicolas, Pangasinan\n\nYou are hereby summoned to appear before the Punong Barangay / Lupong Tagapamayapa at {{venue}} on {{hearingDate}} at {{hearingTime}}, to answer to a complaint made before me, a copy of which is attached hereto.\n\nFAILURE TO APPEAR may result in appropriate legal remedies and forfeiture of defenses in court pursuant to Republic Act No. 7160 (Local Government Code of 1991).\n\nIssued this {{issuedDate}} at Barangay Bensican, San Nicolas, Pangasinan.\n\n_______________________________\n{{signatory}}\n{{signatoryTitle}}`,
    createdAt: now,
    isArchived: 0
  };

  db.prepare(`
    INSERT INTO subpoena_templates (id, name, body_template, created_at, is_archived)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    defaultSubpoenaTemplate.id,
    defaultSubpoenaTemplate.name,
    defaultSubpoenaTemplate.bodyTemplate,
    defaultSubpoenaTemplate.createdAt,
    defaultSubpoenaTemplate.isArchived
  );

  // 5. Reports with Reference Numbers
  const ref1 = generateReferenceNumber('BSN', 2026); // e.g. BSN-2026-00001
  const ref2 = generateReferenceNumber('BSN', 2026); // e.g. BSN-2026-00002
  const ref3 = generateReferenceNumber('BSN', 2026); // e.g. BSN-2026-00003

  const insertReport = db.prepare(`
    INSERT INTO reports (
      id, ref_number, resident_id, category_id, title, description,
      location_details, incident_date, status, priority, filed_with_assistance,
      helper_name, assigned_admin_id, outcome, resolution_date, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  const reportId1 = 'rep-001';
  const reportId2 = 'rep-002';
  const reportId3 = 'rep-003';

  // Report 1: Streetlight Broken (In Progress)
  insertReport.run(
    reportId1,
    ref1,
    residentId,
    'cat-infra',
    'Broken Streetlight near Purok 2 Chapel',
    'The streetlight has been flickering and completely turned off for three nights. It is very dark for seniors walking home from church.',
    'Corner of Purok 2, near San Roque Chapel',
    '2026-10-04 19:30',
    'In Progress',
    'Normal',
    0,
    null,
    adminId,
    null,
    null,
    '2026-10-05T08:30:00Z',
    '2026-10-05T10:00:00Z'
  );

  // Report 2: Loud Late-night Videoke (Resolved)
  insertReport.run(
    reportId2,
    ref2,
    residentId,
    'cat-noise',
    'Excessive Loud Videoke Past Midnight',
    'Neighbor had a loud sound system running until 2:00 AM on Sunday night. Could not sleep.',
    'House #38, Burgos Street, Purok 2',
    '2026-10-02 01:15',
    'Resolved',
    'Normal',
    0,
    null,
    adminId,
    'Barangay Tanod visited the household and issued a verbal warning under Barangay Noise Ordinance. The neighbor complied and apologized.',
    '2026-10-03T09:00:00Z',
    '2026-10-02T06:00:00Z',
    '2026-10-03T09:00:00Z'
  );

  // Report 3: Boundary dispute (Scheduled for Hearing)
  insertReport.run(
    reportId3,
    ref3,
    residentId,
    'cat-dispute',
    'Fence Encroachment along Garden Pathway',
    'The neighboring lot placed concrete blocks overlapping 1 meter onto our ancestral garden lot.',
    'Lot 14-B, Rizal Extension, Purok 1',
    '2026-10-01 10:00',
    'In Progress',
    'Urgent',
    0,
    null,
    superAdminId,
    null,
    null,
    '2026-10-01T11:00:00Z',
    '2026-10-06T14:00:00Z'
  );

  // Attachments
  const insertAttachment = db.prepare(`
    INSERT INTO report_attachments (id, report_id, file_path, file_name, file_size, mime_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertAttachment.run('att-001', reportId1, '/uploads/sample-streetlight.jpg', 'broken-post.jpg', 245000, 'image/jpeg', now);

  // Follow-ups
  const insertFollowup = db.prepare(`
    INSERT INTO report_followups (id, report_id, sender_id, message, is_admin_request, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertFollowup.run('fol-001', reportId1, adminId, 'Good day. The Barangay maintenance team has verified the post. Replacement LED bulb was requisitioned and will be installed on Thursday.', 0, '2026-10-05T10:00:00Z');
  insertFollowup.run('fol-002', reportId1, residentId, 'Thank you very much. We appreciate the quick update.', 0, '2026-10-05T11:15:00Z');

  // 6. Hearings & Subpoenas
  const hearingRef = generateReferenceNumber('BSN-H', 2026); // e.g. BSN-H-2026-00001
  const hearingId = 'hrg-001';

  db.prepare(`
    INSERT INTO hearings (
      id, ref_number, report_id, hearing_date, hearing_time, venue,
      parties_involved, assigned_admin_ids, purpose, status, minutes,
      outcome, attendance_json, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `).run(
    hearingId,
    hearingRef,
    reportId3,
    '2026-10-12',
    '09:30 AM',
    'Lupong Tagapamayapa Mediation Room',
    'Complainant Party vs. Respondent Party',
    JSON.stringify([superAdminId, adminId]),
    'First Conciliation / Mediation Hearing on Boundary Encroachment',
    'Scheduled',
    null,
    null,
    JSON.stringify(['Complainant Party', 'Respondent Party', 'Barangay Officer']),
    now,
    now
  );

  // Subpoena
  const subpoenaRef = generateReferenceNumber('BSN-S', 2026); // e.g. BSN-S-2026-00001
  db.prepare(`
    INSERT INTO subpoenas (
      id, ref_number, report_id, hearing_id, case_number,
      respondent, complainant, hearing_date, hearing_time,
      venue, reason, signatory, signatory_title, status,
      template_id, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `).run(
    'sub-001',
    subpoenaRef,
    reportId3,
    hearingId,
    'BSN-KP-2026-012',
    'Respondent Party',
    'Complainant Party',
    '2026-10-12',
    '09:30 AM',
    'Lupong Tagapamayapa Mediation Room, Barangay Hall',
    'Lot boundary dispute and alleged concrete barrier encroachment',
    'Office of the Punong Barangay',
    'Punong Barangay',
    'Served',
    'tmpl-subpoena-01',
    now,
    now
  );

  // 7. Bills & Finance
  const insertBill = db.prepare(`
    INSERT INTO bills (
      id, title, amount, due_date, payee, status, bill_type, attachment_url, created_by, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  insertBill.run(
    'bill-001',
    'PANELCO I - Barangay Hall & Streetlights Power (September 2026)',
    14850.75,
    '2026-10-15',
    'Pangasinan I Electric Cooperative (PANELCO I)',
    'Unpaid',
    'Electricity (Pangasinan Electric Cooperative)',
    '/uploads/bills/panelco-sep2026.pdf',
    adminId,
    now,
    now
  );

  insertBill.run(
    'bill-002',
    'San Nicolas Water District - Barangay Center Connection',
    2150.00,
    '2026-10-10',
    'San Nicolas Water District',
    'Paid',
    'Water Utility (San Nicolas Water District)',
    '/uploads/bills/water-sep2026.pdf',
    superAdminId,
    now,
    now
  );

  insertBill.run(
    'bill-003',
    'Office Supplies & Ink Cartridges for Lupon Forms',
    3420.00,
    '2026-09-25',
    'Tayug Educational Supply & Trading',
    'Paid',
    'Office Supplies & Paperwork',
    '/uploads/bills/supplies-sep2026.pdf',
    adminId,
    now,
    now
  );

  insertBill.run(
    'bill-004',
    'Streetlight LED Replacement Bulbs & Brackets (Batch 4)',
    6500.00,
    '2026-10-02',
    'Pangasinan Hardware & Electrical Supplies',
    'Overdue',
    'Streetlight Maintenance & Bulbs',
    '/uploads/bills/hardware-oct2026.pdf',
    adminId,
    now,
    now
  );

  // 8. Announcements
  const insertAnn = db.prepare(`
    INSERT INTO announcements (
      id, title, content, target_group, is_pinned, scheduled_at, created_by, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  insertAnn.run(
    'ann-001',
    'Free Medical Checkup & Flu Vaccination for Senior Citizens',
    'Notice to all Senior Citizens of Barangay Bensican: The San Nicolas Municipal Health Office will conduct a free medical mission, blood pressure screening, and flu vaccination on Saturday, October 17, 2026, starting at 8:00 AM at the Barangay Covered Court. Please bring your Senior Citizen ID.',
    'Senior Citizens',
    1,
    '2026-10-06T08:00:00Z',
    superAdminId,
    now,
    now
  );

  insertAnn.run(
    'ann-002',
    'Barangay Bensican Clean-up Drive & Anti-Dengue Operation',
    'Everyone is invited to join the Oplan Tapat Ko, Linis Ko anti-dengue drive this Saturday, 6:00 AM across Purok 1 to Purok 4. Clear stagnant water from tires, bottles, and flower pots.',
    'All Residents',
    0,
    '2026-10-05T08:00:00Z',
    adminId,
    now,
    now
  );

  insertAnn.run(
    'ann-003',
    'Notice of Scheduled Power Interruption - PANELCO I',
    'PANELCO I advisory: Scheduled preventive maintenance along San Nicolas feeder on Thursday, October 15, from 8:00 AM to 1:00 PM. Affected areas include Barangay Bensican and neighboring barangays.',
    'All Residents',
    0,
    '2026-10-04T08:00:00Z',
    adminId,
    now,
    now
  );

  // 9. Payroll / HR
  const insertAttendance = db.prepare(`
    INSERT INTO payroll_attendance (id, user_id, date, time_in, time_out, total_hours, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAttendance.run('att-rec-01', adminId, '2026-10-05', '07:55 AM', '05:05 PM', 8.0, 'Present', now);
  insertAttendance.run('att-rec-02', adminId, '2026-10-06', '08:00 AM', '05:00 PM', 8.0, 'Present', now);
  insertAttendance.run('att-rec-03', adminId, '2026-10-07', '07:50 AM', null, 4.0, 'Present', now);

  const insertPayroll = db.prepare(`
    INSERT INTO payroll_records (id, user_id, period_start, period_end, basic_pay, overtime_pay, deductions, net_pay, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPayroll.run('pay-001', adminId, '2026-09-16', '2026-09-30', 12500.00, 1200.00, 850.00, 12850.00, 'Paid', now);
  insertPayroll.run('pay-002', superAdminId, '2026-09-16', '2026-09-30', 18000.00, 0.00, 1200.00, 16800.00, 'Paid', now);

  const insertPayrollReq = db.prepare(`
    INSERT INTO payroll_requests (id, user_id, type, amount_or_days, reason, status, reviewed_by, review_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPayrollReq.run(
    'prq-001',
    adminId,
    'leave',
    2,
    'Family matter and medical consultation in Dagupan City',
    'Approved',
    superAdminId,
    'Approved. Ensure Kagawad Ramos covers peace and order desk.',
    '2026-09-28T09:00:00Z',
    '2026-09-29T10:00:00Z'
  );

  // 10. Landing Page CMS (Version 1 Published)
  const defaultLandingContent = {
    hero: {
      title_en: 'Welcome to Barangay Bensican Online Services',
      title_tl: 'Malugod na Pagdating sa Online Services ng Barangay Bensican',
      title_il: 'Naimbag nga Idadanon iti Online Services ti Barangay Bensican',
      subtitle_en: 'Fast, transparent, and senior-friendly community reporting and official public service in San Nicolas, Pangasinan.',
      subtitle_tl: 'Mabilis, tapat, at madaling gamitin para sa mga lolo at lola. Magsumbong ng alalahanin sa komunidad anumang oras.',
      subtitle_il: 'Nalaka, nalitnaw, ken nasayaat para kadagiti lolo ken lola. Agipadamag kadagiti pakaseknan ti komunidad.',
      badge_en: 'Official Barangay Portal • San Nicolas, Pangasinan',
      badge_tl: 'Opisyal na Portal ng Barangay • San Nicolas, Pangasinan',
      badge_il: 'Opisial a Portal ti Barangay • San Nicolas, Pangasinan'
    },
    about: {
      text_en: 'Barangay Bensican is a peaceful, agrarian and united community located in the municipality of San Nicolas, Province of Pangasinan. With E-Report Barangay, we provide our residents—especially the elderly and those who cannot easily walk to the barangay hall—direct digital access to community services, hearing summons, transparent finances, and prompt barangay resolution.',
      text_tl: 'Ang Barangay Bensican ay isang payapa, masipag, at nagkakaisang komunidad sa San Nicolas, Pangasinan. Sa pamamagitan ng E-Report Barangay, binibigyan natin ang ating mga residente—lalo na ang mga nakatatanda—ng madaling paraan upang mag-ulat, makatanggap ng tulong, at makita ang maayos na serbisyo ng barangay nang hindi na kailangang maglakad nang malayo.',
      text_il: 'Ti Barangay Bensican ket maysa a natalna, naragsak, ken agtutunos a komunidad iti ili ti San Nicolas, Pangasinan. Babaen iti E-Report Barangay, maipaayan dagiti umili—nangruna dagiti natataengan—iti nalaka a wagas tapno agipadamag ken umawat iti tulong nga awan ti riribuk.'
    },
    steps: [
      {
        num: 1,
        title_en: '1. Register with Proof',
        title_tl: '1. Magpatala at Magpakita ng ID',
        title_il: '1. Agparehistro ken Mangipakita ti ID',
        desc_en: 'Provide your name, Bensican home address, and a photo of your ID. Friendly barangay staff will confirm your account.',
        desc_tl: 'Ilagay ang pangalan, tirahan sa Bensican, at litrato ng ID. Aasikasuhin ito ng ating mga opisyal.',
        desc_il: 'Ikabil ti nagan, pagnaedan ditoy Bensican, ken retrato ti ID. Suksukianto daytoy dagiti opisial.'
      },
      {
        num: 2,
        title_en: '2. Send Your Concern',
        title_tl: '2. Isumbong ang Problema',
        title_il: '2. Ipadamag ti Pakaseknan',
        desc_en: 'Write words, speak with your voice, or take photos/videos. No hard words or complicated forms needed.',
        desc_tl: 'Maaaring sumulat, magsalita sa mikropono, o kumuha lang ng litrato o video.',
        desc_il: 'Mabalin ti agsurat, agsao iti mikropono, wenno mangala laeng ti retrato wenno video.'
      },
      {
        num: 3,
        title_en: '3. Track with Number',
        title_tl: '3. Bantayan Gamit ang Numero',
        title_il: '3. Bantayan Babaen ti Numero',
        desc_en: 'Receive your unique reference number (e.g. BSN-2026-00001). Check status updates, assigned handlers, or Lupon hearings.',
        desc_tl: 'Tumanggap ng malinaw na reference number. Makita kung sinong opisyal ang may hawak at kung kailan maaayos.',
        desc_il: 'Umawat iti reference number. Makita no asino nga opisial ti mangas-asikaso ken no kaano a maikkan solusion.'
      }
    ],
    sdg_alignment: [
      { goal: 'SDG 16', title: 'Peace, Justice & Strong Institutions', desc: 'Promoting peaceful resolution, clear mediation hearings, subpoenas, and transparent public accountability.' },
      { goal: 'SDG 11', title: 'Sustainable Cities & Communities', desc: 'Making Barangay Bensican safe, resilient, inclusive, and responsive for seniors and vulnerable residents.' },
      { goal: 'SDG 9', title: 'Industry, Innovation & Infrastructure', desc: 'Centralized digital recordkeeping replacing vulnerable paper slips with secure modern cloud technology.' }
    ]
  };

  db.prepare(`
    INSERT INTO landing_page_cms (
      id, version, is_published, content_json, draft_saved_by, approved_by, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    'cms-ver-01',
    1,
    1,
    JSON.stringify(defaultLandingContent),
    superAdminId,
    superAdminId,
    now,
    now
  );

  // 11. Google Drive Style File Tree Records
  const insertFile = db.prepare(`
    INSERT INTO file_tree (
      id, parent_id, owner_id, type, name, path, file_url, size, mime_type, metadata_json, permissions, version, is_starred, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  // Root Folders
  insertFile.run('folder-rep', null, superAdminId, 'folder', 'Reports & Concerns', '/Reports & Concerns', null, 0, null, '{}', 'admin_super_admin', 1, 1, now, now);
  insertFile.run('folder-rep-2026', 'folder-rep', superAdminId, 'folder', '2026 Concerns', '/Reports & Concerns/2026 Concerns', null, 0, null, '{}', 'admin_super_admin', 1, 0, now, now);

  insertFile.run('folder-hrg', null, superAdminId, 'folder', 'Hearings & Lupon Cases', '/Hearings & Lupon Cases', null, 0, null, '{}', 'admin_super_admin', 1, 0, now, now);
  insertFile.run('folder-sub', null, superAdminId, 'folder', 'Subpoenas & Summons', '/Subpoenas & Summons', null, 0, null, '{}', 'admin_super_admin', 1, 0, now, now);

  insertFile.run('folder-bills', null, superAdminId, 'folder', 'Barangay Bills & Financial Transparency', '/Barangay Bills & Financial Transparency', null, 0, null, '{}', 'resident_view', 1, 1, now, now);
  insertFile.run('folder-payroll', null, superAdminId, 'folder', 'Staff HR & Payroll Records', '/Staff HR & Payroll Records', null, 0, null, '{}', 'super_admin_only', 1, 0, now, now);

  // Sample files inside
  insertFile.run('file-001', 'folder-rep-2026', adminId, 'file', 'BSN-2026-00001_Case_File.pdf', '/Reports & Concerns/2026 Concerns/BSN-2026-00001_Case_File.pdf', '/uploads/sample-case.pdf', 342000, 'application/pdf', JSON.stringify({ ref: ref1, title: 'Streetlight Concern' }), 'admin_super_admin', 1, 1, now, now);
  insertFile.run('file-002', 'folder-sub', superAdminId, 'file', 'BSN-S-2026-00001_Hearing_Summons.pdf', '/Subpoenas & Summons/BSN-S-2026-00001_Hearing_Summons.pdf', '/uploads/sample-subpoena.pdf', 215000, 'application/pdf', JSON.stringify({ ref: subpoenaRef }), 'admin_super_admin', 1, 0, now, now);
  insertFile.run('file-003', 'folder-bills', adminId, 'file', 'PANELCO_Power_Bill_Sep2026.pdf', '/Barangay Bills & Financial Transparency/PANELCO_Power_Bill_Sep2026.pdf', '/uploads/bills/panelco-sep2026.pdf', 540000, 'application/pdf', JSON.stringify({ amount: 14850.75, status: 'Unpaid' }), 'resident_view', 1, 0, now, now);

  // 12. Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity, entity_id, details, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('aud-001', superAdminId, 'Super Administrator', 'super_admin', 'SYSTEM_INITIALIZE', 'System', 'system', 'Barangay Bensican E-Report system initialized with clean default records.', '127.0.0.1', now);
  insertAudit.run('aud-002', superAdminId, 'Super Administrator', 'super_admin', 'VERIFY_RESIDENT', 'User', residentId, 'Approved resident verification for Resident User.', '127.0.0.1', now);
  insertAudit.run('aud-003', adminId, 'Barangay Administrator', 'admin', 'ASSIGN_REPORT', 'Report', reportId1, `Assigned handler to ${ref1}.`, '127.0.0.1', now);
  insertAudit.run('aud-004', superAdminId, 'Super Administrator', 'super_admin', 'SCHEDULE_HEARING', 'Hearing', hearingId, `Scheduled Lupon conciliation hearing ${hearingRef}.`, '127.0.0.1', now);

  // 13. Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertNotif.run('not-001', residentId, 'Report Status Updated', `Your report ${ref1} is now In Progress. The barangay administrative team is handling your case.`, `/track/${ref1}`, 0, now);
  insertNotif.run('not-002', residentId, 'Notice of Barangay Hearing', `A Lupon conciliation hearing has been scheduled on October 12, 2026 at 09:30 AM regarding ${ref3}.`, `/track/${ref3}`, 0, now);
  insertNotif.run('not-003', adminId, 'New Report Received', `A resident submitted new concern ${ref1}.`, `/admin/reports`, 0, now);

  console.log('--- Seed complete successfully! ---');
  console.log('Sample Accounts:');
  console.log('1. Super Admin: superadmin@bensican.gov.ph / BensicanAdmin2026!');
  console.log('2. Admin:       admin@bensican.gov.ph / BensicanAdmin2026!');
  console.log('3. Resident:    resident@bensican.gov.ph / Resident2026!');
  console.log('4. Pending:     pending@bensican.gov.ph / Resident2026!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seed();
}

