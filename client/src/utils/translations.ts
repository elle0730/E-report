export type Language = 'en' | 'tl' | 'il';

export interface Translations {
  [key: string]: {
    en: string;
    tl: string;
    il: string;
  };
}

export const translations: Translations = {
  // Navigation & Core Buttons
  home: {
    en: 'Home',
    tl: 'Tahanan',
    il: 'Pagtaengan'
  },
  back: {
    en: 'Go Back',
    tl: 'Bumalik',
    il: 'Agsubli'
  },
  next: {
    en: 'Next Step',
    tl: 'Kasunod na Hakbang',
    il: 'Sumaruno nga Addang'
  },
  submit: {
    en: 'Submit',
    tl: 'Isumite',
    il: 'Isumite'
  },
  save: {
    en: 'Save Changes',
    tl: 'I-save ang Pagbabago',
    il: 'Idulin ti Sinukatan'
  },
  cancel: {
    en: 'Cancel',
    tl: 'Kanselahin',
    il: 'Ibabawi'
  },
  help: {
    en: 'Need Help?',
    tl: 'Kailangan ng Tulong?',
    il: 'Masapul ti Tulong?'
  },
  needHelp: {
    en: 'Need Help?',
    tl: 'Kailangan ng Tulong?',
    il: 'Masapul ti Tulong?'
  },
  needHelpPrompt: {
    en: 'Need Help? Tap to open guide & hotline',
    tl: 'Kailangan ng Tulong? Pindutin para sa gabay at hotline',
    il: 'Masapul ti Tulong? Pinduten para iti pangiwanwan ken hotline'
  },
  login: {
    en: 'Sign In',
    tl: 'Mag-sign In',
    il: 'Sumrek'
  },
  register: {
    en: 'Register as Resident',
    tl: 'Magpatala bilang Residente',
    il: 'Agparehistro kas Umili'
  },
  logout: {
    en: 'Sign Out',
    tl: 'Mag-sign Out',
    il: 'Rummuar'
  },
  profile: {
    en: 'My Profile',
    tl: 'Aking Profile',
    il: 'Ti Profile-ko'
  },
  notifications: {
    en: 'Notifications',
    tl: 'Mga Abiso',
    il: 'Dagiti Pakaammo'
  },
  print: {
    en: 'Print or Save PDF',
    tl: 'I-print o I-save bilang PDF',
    il: 'I-print wenno Idulin kas PDF'
  },
  copyNumber: {
    en: 'Copy Reference Number',
    tl: 'Kopyahin ang Numero',
    il: 'Kopiaen ti Numero'
  },
  readAloud: {
    en: 'Read Aloud',
    tl: 'Basahin nang Malakas',
    il: 'Basaen a Sipipigsa'
  },
  stopAudio: {
    en: 'Stop Voice',
    tl: 'Ihinto ang Boses',
    il: 'Isardeng ti Boses'
  },
  speakMicrophone: {
    en: 'Voice Input',
    tl: 'Pagsasalita',
    il: 'Panagsao'
  },
  listening: {
    en: 'Listening... Please speak clearly.',
    tl: 'Nakikinig... Mangyaring magsalita.',
    il: 'Dumdumngeg... Agsaoka koma a silalawag.'
  },

  // Accessibility Controls
  textSize: {
    en: 'Text Size',
    tl: 'Laki ng Teksto',
    il: 'Kadakkel ti Teksto'
  },
  highContrast: {
    en: 'High Contrast',
    tl: 'Mataas na Contrast',
    il: 'Nangato a Contrast'
  },
  darkMode: {
    en: 'Dark Mode',
    tl: 'Madilim na Tema',
    il: 'Nasipnget a Tema'
  },
  lightMode: {
    en: 'Light Mode',
    tl: 'Maliwanag na Tema',
    il: 'Nalawag a Tema'
  },

  // Barangay Header & Footer
  barangayTitle: {
    en: 'E-Report Barangay Bensican',
    tl: 'E-Report Barangay Bensican',
    il: 'E-Report Barangay Bensican'
  },
  barangaySubtitle: {
    en: 'San Nicolas, Pangasinan',
    tl: 'San Nicolas, Pangasinan',
    il: 'San Nicolas, Pangasinan'
  },
  barangayAddress: {
    en: 'Barangay Hall, Main Road, Bensican, San Nicolas, Pangasinan',
    tl: 'Barangay Hall, Main Road, Bensican, San Nicolas, Pangasinan',
    il: 'Barangay Hall, Main Road, Bensican, San Nicolas, Pangasinan'
  },
  officeHours: {
    en: 'Monday - Friday: 8:00 AM to 5:00 PM (Emergency Desk 24/7)',
    tl: 'Lunes - Biyernes: 8:00 AM hanggang 5:00 PM (Emergency Desk 24/7)',
    il: 'Lunes - Biernes: 8:00 AM inggana 5:00 PM (Emergency Desk 24/7)'
  },
  callHotline: {
    en: 'Need help? Call Barangay Hall: 0917-555-BENSI',
    tl: 'Kailangan ng tulong? Tawagan ang Barangay Hall: 0917-555-BENSI',
    il: 'Masapul ti tulong? Tawagan ti Barangay Hall: 0917-555-BENSI'
  },
  confidentialityNotice: {
    en: 'Confidentiality Notice: Your report and personal details are confidential and only seen by authorized barangay staff pursuant to the Philippine Data Privacy Act (RA 10173).',
    tl: 'Paunawa sa Pagiging Lihim: Ang inyong ulat at personal na impormasyon ay kumpidensyal at makikita lamang ng mga awtorisadong kawani ng barangay alinsunod sa Data Privacy Act (RA 10173).',
    il: 'Pakaammo iti Kinalimed: Ti report ken personal a detalye ket kumpidensial ken dagiti laeng autorisado nga opisial ti makakita maitunos iti Data Privacy Act (RA 10173).'
  },

  // Resident Dashboard Actions (4 Big Cards)
  residentSendReport: {
    en: 'Send a Report',
    tl: 'Magpadala ng Ulat',
    il: 'Ipadamag ti Pakaseknan'
  },
  residentSendReportDesc: {
    en: 'Tell the barangay about broken lights, noise, disputes, sanitation, or safety issues.',
    tl: 'Ipaalam sa barangay ang sira sa kalsada, pundidong ilaw, alitan, basura, o kaligtasan.',
    il: 'Ibagam iti barangay ti nadadael, ariwawa, riri, basura, wenno kinatalged.'
  },
  residentCheckReports: {
    en: 'Check My Reports',
    tl: 'Tingnan ang Aking mga Ulat',
    il: 'Kitaen Dagiti Report-ko'
  },
  residentCheckReportsDesc: {
    en: 'Track status, see assigned handlers, and read staff replies using your reference number.',
    tl: 'Bantayan ang kalagayan at basahin ang sagot ng opisyal gamit ang reference number.',
    il: 'Bantayan ti kasasaad ken basaen ti sungbat dagiti opisial babaen ti reference number.'
  },
  residentAnnouncements: {
    en: 'Barangay Announcements',
    tl: 'Mga Balita at Anunsyo',
    il: 'Dagiti Pakaammo ti Barangay'
  },
  residentAnnouncementsDesc: {
    en: 'Read important community updates, medical missions, and scheduled power advisories.',
    tl: 'Basahin ang mahalagang anunsyo tulad ng libreng gamot, bakuna, at brownout.',
    il: 'Basaen dagiti napateg a pakaammo a kas ti libre nga agas, bakuna, ken brownout.'
  },
  residentHearings: {
    en: 'My Hearings and Summons',
    tl: 'Aking mga Pagdinig',
    il: 'Dagiti Panagdengngegko'
  },
  residentHearingsDesc: {
    en: 'See your scheduled Lupon conciliation hearings, dates, venues, and official notices.',
    tl: 'Alamin ang araw, oras, at lugar ng pag-uusap sa Lupon Tagapamayapa.',
    il: 'Maammuan ti aldaw, oras, ken disso ti panagdengngeg ti Lupon Tagapamayapa.'
  },

  // Bensi AI Assistant
  bensiChatTitle: {
    en: 'Chat with Bensi Assistant',
    tl: 'Makausap si Bensi',
    il: 'Makisarita ken Bensi'
  },
  bensiChatDesc: {
    en: 'Ask questions about how to report, hearing summons, office hours, and barangay help.',
    tl: 'Magtanong tungkol sa sumbong, patawag ng Lupon, oras ng tanggapan, at tulong.',
    il: 'Agsaludsod maipapan iti report, patawag ti Lupon, oras ti opisina, ken tulong.'
  },
  bensiOfflineNotice: {
    en: 'Barangay staff are currently away from desk. Bensi will assist you automatically.',
    tl: 'Nasa labas ng opisina ang mga opisyal. Si Bensi ang awtomatikong sasagot sa inyo.',
    il: 'Awan dagiti opisial iti lamisaan. Ni Bensi ti awtomatiko a tumulong kadakayo.'
  },
  bensiOnlineNotice: {
    en: 'Barangay staff is ONLINE! An official will take over and assist you directly.',
    tl: 'ONLINE ang opisyal ng barangay! Isang kawani ang direktang kakausap sa inyo.',
    il: 'ONLINE ti opisial ti barangay! Maysa nga opisial ti direkta a makisao kadakayo.'
  },

  // Report Submission Form
  formCategory: {
    en: 'What kind of concern is this?',
    tl: 'Anong uri ng ulat o problema ito?',
    il: 'Ania a kita ti pakaseknan daytoy?'
  },
  formTitle: {
    en: 'Concern Title',
    tl: 'Pamagat ng Ulat',
    il: 'Titulo ti Pakaseknan'
  },
  formTitlePlaceholder: {
    en: 'Example: Broken streetlight on Purok 2 corner',
    tl: 'Halimbawa: Pundidong ilaw sa kanto ng Purok 2',
    il: 'Pangarigan: Nadadael a silaw iti kanto ti Purok 2'
  },
  formDesc: {
    en: 'Tell us more details (or leave empty if sending photos/video)',
    tl: 'Mga detalye ng ulat (o iwanang blangko kung may litrato/video)',
    il: 'Iladawan ti napasamak (wenno ibati a blangko no adda retrato/video)'
  },
  formDescPlaceholder: {
    en: 'Type words here or tap the microphone to speak your report...',
    tl: 'Isulat dito o pindutin ang mikropono upang magsalita...',
    il: 'Isurat ditoy wenno pinduten ti mikropono tapno agsao...'
  },
  formLocation: {
    en: 'Exact Place / Location in Bensican',
    tl: 'Eksaktong Lugar o Purok sa Bensican',
    il: 'Eksakto a Disso ditoy Bensican'
  },
  formLocationPlaceholder: {
    en: 'Example: Near San Roque Chapel, Purok 2, Burgos Street',
    tl: 'Halimbawa: Malapit sa San Roque Chapel, Purok 2',
    il: 'Pangarigan: Asideg iti San Roque Chapel, Purok 2'
  },
  formIncidentDate: {
    en: 'When did this happen?',
    tl: 'Kailan ito nangyari?',
    il: 'Kaano a napasamak daytoy?'
  },
  formAttachments: {
    en: 'Add Photos or Video (Proof)',
    tl: 'Magdagdag ng Litrato o Video (Patunay)',
    il: 'Manginayon ti Retrato wenno Video (Pammaneknek)'
  },
  formHelper: {
    en: 'Did someone help you submit this report? (Helper name)',
    tl: 'May tumulong ba sa inyo mag-ulat? (Pangalan ng tumulong)',
    il: 'Adda kadi timmulong kadakayo nga agipadamag? (Nagan ti timmulong)'
  },
  formHelperPlaceholder: {
    en: 'Example: Maria Santos (Granddaughter / Staff)',
    tl: 'Halimbawa: Maria Santos (Apo / Kawani)',
    il: 'Pangarigan: Maria Santos (Apo / Opisial)'
  },
  formSendButton: {
    en: 'Send My Report to Barangay',
    tl: 'Isumite ang Aking Ulat sa Barangay',
    il: 'Ibaon ti Report-ko iti Barangay'
  },

  // Success Screen
  successTitle: {
    en: 'Your Report Has Been Sent!',
    tl: 'Matagumpay na Naipadala ang Inyong Ulat!',
    il: 'Siballigi a Naibaon ti Report-yo!'
  },
  successSubtitle: {
    en: 'Barangay officials have received your concern and will act on it promptly.',
    tl: 'Natanggap na ng mga opisyal ng barangay ang inyong ulat at ito ay aaksyunan agad.',
    il: 'Naawaten dagiti opisial ti barangay ti pakaseknanyo ket maikkan daytoy iti nasapa nga aksion.'
  },
  yourRefNumber: {
    en: 'Your Official Reference Number is:',
    tl: 'Ang inyong Opisyal na Reference Number ay:',
    il: 'Ti Opisial a Reference Number-yo ket:'
  },
  keepRefNotice: {
    en: 'Please write down or save this number. You will use it to check your progress.',
    tl: 'Pakisulat o i-save ang numerong ito. Gagamitin ito sa pag-follow up.',
    il: 'Ikeddeng a maisurat wenno maidulin daytoy a numero. Usarenyo daytoy a pagbantay.'
  },

  // Statuses
  statusPending: {
    en: 'Pending Review',
    tl: 'Naghihintay ng Pagsusuri',
    il: 'Maur-uray a Repasoen'
  },
  statusInProgress: {
    en: 'In Progress',
    tl: 'Kasalukuyang Inaaksyunan',
    il: 'Maar-aramid ti Aksion'
  },
  statusResolved: {
    en: 'Resolved',
    tl: 'Nalutas na',
    il: 'Naisimpa'
  },
  statusClosed: {
    en: 'Closed',
    tl: 'Isinara na',
    il: 'Nairikep'
  },

  // 4-Step Registration Wizard
  wizardStep1Title: {
    en: 'Step 1 of 4: Who are you?',
    tl: 'Hakbang 1 ng 4: Sino kayo?',
    il: 'Addang 1 iti 4: Siasinokayo?'
  },
  wizardStep1Desc: {
    en: 'Please provide your legal name and contact details.',
    tl: 'Ilagay ang inyong tunay na pangalan at numero ng telepono.',
    il: 'Ikabil ti pudno a nagan ken numero ti telepono.'
  },
  wizardStep2Title: {
    en: 'Step 2 of 4: Where do you live?',
    tl: 'Hakbang 2 ng 4: Saan kayo nakatira?',
    il: 'Addang 2 iti 4: Sadino ti pagnaedanyo?'
  },
  wizardStep2Desc: {
    en: 'Verification is exclusive to residents of Barangay Bensican, San Nicolas, Pangasinan.',
    tl: 'Eksklusibo lamang ito para sa mga naninirahan sa Barangay Bensican, San Nicolas, Pangasinan.',
    il: 'Eksklusibo laeng daytoy kadagiti agnanaed iti Barangay Bensican, San Nicolas, Pangasinan.'
  },
  wizardStep3Title: {
    en: 'Step 3 of 4: Identity Verification',
    tl: 'Hakbang 3 ng 4: Patunayan ang Pagkakakilanlan',
    il: 'Addang 3 iti 4: Paneknekan ti Kinatao'
  },
  wizardStep3Desc: {
    en: 'Take a clear photo of your Senior Citizen ID, Voter ID, or Barangay Certificate, and a selfie photo.',
    tl: 'Kumuha ng malinaw na litrato ng Senior ID, Voter ID, o Barangay Certificate, at litrato ng mukha.',
    il: 'Mangala ti nalawag a retrato ti Senior ID, Voter ID, wenno Sertipikasion, ken retrato ti rupa.'
  },
  wizardStep4Title: {
    en: 'Step 4 of 4: Check and Send',
    tl: 'Hakbang 4 ng 4: Suriin at Ipadala',
    il: 'Addang 4 iti 4: Suksukimat ken Ibaon'
  },
  wizardStep4Desc: {
    en: 'Review all information carefully before sending to the Barangay Hall.',
    tl: 'Pakitingnan ang lahat ng detalye bago tuluyang ipadala sa Barangay Hall.',
    il: 'Kitaen a nalaing amin a detalye sakbay a maiturong iti Barangay Hall.'
  },
  wizardWaitingApproval: {
    en: 'Waiting for Approval: Your account was submitted. A barangay administrator will verify your residency shortly.',
    tl: 'Naghihintay ng Pag-apruba: Naipadala na ang inyong tala. Aasikasuhin ng opisyal ang pag-apruba.',
    il: 'Maur-uray ti Pammalubos: Naibaonen ti pagparehistro. Suksukimatento ti opisial ti panangaprobar.'
  },

  // Helper mode
  bringAHelper: {
    en: 'Bring a Helper: An assistant or family member is helping me fill this out.',
    tl: 'May Kasamang Katulong: Tinutulungan ako ng aking kapamilya sa pagsagot.',
    il: 'Adda Kaddua: Adda tumultulong a kabagian iti panagsungbat.'
  },

  // Admin Side Menus
  adminDashboard: {
    en: 'Admin Dashboard',
    tl: 'Dashboard ng Admin',
    il: 'Dashboard ti Admin'
  },
  superAdminDashboard: {
    en: 'Super Admin Control Center',
    tl: 'Control Center ng Super Admin',
    il: 'Sentro ti Panangaywan ti Super Admin'
  },
  reportManagement: {
    en: 'Reports & Queue',
    tl: 'Talaan ng mga Sumbong',
    il: 'Listaan Dagiti Report'
  },
  hearingScheduler: {
    en: 'Hearing Scheduler',
    tl: 'Iskedyul ng Pagdinig',
    il: 'Iskedyul ti Panagdengngeg'
  },
  subpoenaManagement: {
    en: 'Subpoenas & Summons',
    tl: 'Mga Patawag at Subpoena',
    il: 'Dagiti Patawag ken Subpoena'
  },
  billsTransparency: {
    en: 'Bills & Finance Transparency',
    tl: 'Kabatiran sa Bayarin at Pondo',
    il: 'Palawag iti Bayadan ken Pondo'
  },
  announcementManagement: {
    en: 'Announcements Manager',
    tl: 'Tagapamahala ng Anunsyo',
    il: 'Panangaywan ti Pakaammo'
  },
  payrollHr: {
    en: 'Staff Payroll & HR',
    tl: 'Payroll at Tauhan ng Barangay',
    il: 'Payroll ken Dagiti Kawani'
  },
  accountabilityReport: {
    en: 'Accountability Report',
    tl: 'Ulat sa Pananagutan',
    il: 'Report iti Responsabilidad'
  },
  recordsExplorer: {
    en: 'Barangay Records Explorer',
    tl: 'Tagasaliksik ng Talaan ng Barangay',
    il: 'Explorer Dagiti Dokumento'
  },
  archiveRestore: {
    en: 'Archive & Restore Center',
    tl: 'Sentro ng Arkibo at Pagbawi',
    il: 'Arkibo ken Panangisubli'
  },
  accountApprovals: {
    en: 'Resident Verification Queue',
    tl: 'Pagsusuri ng mga Residente',
    il: 'Panangsukimat Dagiti Umili'
  },
  staffAccounts: {
    en: 'Manage Staff Accounts',
    tl: 'Pamamahala ng mga Opisyal',
    il: 'Panangaywan Kadagiti Opisial'
  },
  landingPageCms: {
    en: 'Landing Page CMS Editor',
    tl: 'Editor ng Website ng Barangay',
    il: 'Editor ti Website ti Barangay'
  },
  masterSettings: {
    en: 'Master System Settings',
    tl: 'Pangunahing Setting ng Sistema',
    il: 'Kangrunaan a Setting ti Sistema'
  },
  securityDashboard: {
    en: 'Security Dashboard & Audit Logs',
    tl: 'Seguridad at Audit Logs',
    il: 'Seguridad ken Audit Logs'
  },

  // General & Accessibility Menu
  settingsPreferences: {
    en: 'Settings & Preferences',
    tl: 'Mga Setting at Kagustuhan',
    il: 'Dagiti Setting ken Pagpilian'
  },
  displayAppearance: {
    en: 'Display & Appearance',
    tl: 'Hitsura at Display',
    il: 'Pabuya ken Langana'
  },
  readingComfort: {
    en: 'Reading Comfort & Audio',
    tl: 'Ginhawa sa Pagbasa at Audio',
    il: 'Kinasamay ti Panagbasa ken Audio'
  },
  language: {
    en: 'Language / Lenggwahe',
    tl: 'Wika / Lengguwahe',
    il: 'Pagsasao / Lenggwahe'
  },
  residentDashboard: {
    en: 'Resident Dashboard',
    tl: 'Dashboard ng Residente',
    il: 'Dashboard ti Umili'
  },
  adminWorkstation: {
    en: 'Admin Workstation',
    tl: 'Istasyon ng Admin',
    il: 'Lamisaan ti Admin'
  },
  dark: {
    en: 'Dark',
    tl: 'Madilim',
    il: 'Nasipnget'
  },
  light: {
    en: 'Light',
    tl: 'Maliwanag',
    il: 'Nalawag'
  },
  contrast: {
    en: 'Contrast',
    tl: 'Contrast',
    il: 'Contrast'
  },
  playing: {
    en: 'Playing',
    tl: 'Tumutugtog',
    il: 'Agay-ay-ayam'
  },
  viewVoucher: {
    en: 'View Voucher',
    tl: 'Tingnan ang Voucher',
    il: 'Kitaen ti Voucher'
  },
  verifiedResident: {
    en: 'Verified Resident',
    tl: 'Beripikadong Residente',
    il: 'Napasingkedan nga Umili'
  },
  pendingVerification: {
    en: 'Pending Verification',
    tl: 'Naghihintay ng Beripikasyon',
    il: 'Maur-uray a Pasingkedan'
  },
  active: {
    en: 'Active',
    tl: 'Aktibo',
    il: 'Aktibo'
  },
  resolved: {
    en: 'Resolved',
    tl: 'Nalutas na',
    il: 'Naisimpa'
  },
  pending: {
    en: 'Pending',
    tl: 'Naghihintay',
    il: 'Maur-uray'
  },
  urgent: {
    en: 'Urgent',
    tl: 'Apurahan',
    il: 'Daranas / Napateg'
  },
  normal: {
    en: 'Normal',
    tl: 'Karaniwan',
    il: 'Normal'
  },
  status: {
    en: 'Status',
    tl: 'Kalagayan / Status',
    il: 'Kasasaad'
  },
  date: {
    en: 'Date',
    tl: 'Petsa',
    il: 'Aldaw / Petsa'
  },
  actions: {
    en: 'Actions',
    tl: 'Mga Aksyon',
    il: 'Dagiti Aksion'
  },
  filter: {
    en: 'Filter',
    tl: 'Salain / Filter',
    il: 'Piliin / Salain'
  },
  search: {
    en: 'Search',
    tl: 'Maghanap',
    il: 'Agsapul'
  },
  all: {
    en: 'All',
    tl: 'Lahat',
    il: 'Amin'
  },
  details: {
    en: 'Details',
    tl: 'Mga Detalye',
    il: 'Dagiti Detalye'
  },
  you: {
    en: 'You',
    tl: 'Kayo',
    il: 'Sikayo'
  },
  typeYourQuestion: {
    en: 'Type your message or tap microphone...',
    tl: 'Isulat ang iyong tanong o pindutin ang mikropono...',
    il: 'Isurat ti saludsod wenno pinduten ti mikropono...'
  },
  chatWithBensi: {
    en: 'Chat with Bensi Assistant',
    tl: 'Kausapin si Bensi Assistant',
    il: 'Makisarita ken Bensi Assistant'
  },
  bensiAssistant: {
    en: 'Bensi Assistant',
    tl: 'Bensi Assistant',
    il: 'Bensi Assistant'
  },
  bensiAiAssistant: {
    en: 'Bensi AI Assistant',
    tl: 'Bensi AI Assistant',
    il: 'Bensi AI Assistant'
  },
  barangaySupport: {
    en: 'Barangay Bensican Support',
    tl: 'Tulong ng Barangay Bensican',
    il: 'Tulong ti Barangay Bensican'
  },
  voiceInput: {
    en: 'Voice Input',
    tl: 'Pagsasalita',
    il: 'Panagsao'
  },

  // Landing Page
  officialBarangayPortal: {
    en: 'Official Barangay Portal • San Nicolas, Pangasinan',
    tl: 'Opisyal na Portal ng Barangay • San Nicolas, Pangasinan',
    il: 'Opisial a Portal ti Barangay • San Nicolas, Pangasinan'
  },
  howItWorks: {
    en: 'How It Works in 3 Simple Steps',
    tl: 'Paano Ito Gumagana sa 3 Madaling Hakbang',
    il: 'No Kasano nga Agtrabaho iti 3 a Nalaka nga Addang'
  },
  howItWorksDesc: {
    en: 'Designed specifically for elderly and non-technical residents. No complicated forms.',
    tl: 'Dinisenyo lalo na para sa mga nakatatanda at simpleng mamamayan. Walang kumplikadong porma.',
    il: 'Naisagana nangruna kadagiti lallakay, baket, ken umili. Awan ti narigat a porma.'
  },
  step1Title: {
    en: '1. Register with Proof',
    tl: '1. Magpatala na may Patunay',
    il: '1. Agparehistro nga adda Pammaneknek'
  },
  step1Desc: {
    en: 'Provide your name, Bensican home address, and a photo of your ID. Friendly barangay staff will confirm your account.',
    tl: 'Ibigay ang inyong pangalan, tirahan sa Bensican, at litrato ng ID. Kukumpirmahin ito ng mga kawani ng barangay.',
    il: 'Ited ti nagan, pagnaedan idiay Bensican, ken retrato ti ID. Pasingkedanto dagiti opisial ti barangay.'
  },
  step1Badge: {
    en: 'Exclusive to Barangay Bensican residents',
    tl: 'Eksklusibo sa mga residente ng Barangay Bensican',
    il: 'Eksklusibo kadagiti agnanaed iti Barangay Bensican'
  },
  step2Title: {
    en: '2. Send Your Concern',
    tl: '2. Ipadala ang Problema',
    il: '2. Ibaon ti Pakaseknan'
  },
  step2Desc: {
    en: 'Write words, speak with your voice microphone, or take photos/videos. No hard words or complicated typing required.',
    tl: 'Magsulat, magsalita gamit ang mikropono, o kumuha ng litrato o video. Hindi kailangan ng mahirap na pag-type.',
    il: 'Agsurat, agsao babaen ti mikropono, wenno mangala ti retrato/video. Saan a masapul ti narigat a panag-type.'
  },
  step3Title: {
    en: '3. Real-Time Tracking & Resolution',
    tl: '3. Pagsubaybay at Paglutas sa Oras',
    il: '3. Panangsubaybay ken Panangisimpa'
  },
  step3Desc: {
    en: 'Receive SMS, notifications, or Lupon hearing schedule alerts. Print official vouchers and records easily.',
    tl: 'Makatanggap ng SMS, mga abiso, o iskedyul ng pagdinig sa Lupon. Mag-print ng opisyal na tala nang madali.',
    il: 'Makaawat ti SMS, pakaammo, wenno iskedyul ti Lupon. Nalaka a maiprint dagiti opisial a dokumento.'
  },
  step3Badge: {
    en: 'Full transparency & audit trail',
    tl: 'Ganap na transparency at talaan',
    il: 'Nalinteg a kinabuksilan ken rekord'
  },
  aboutTitle: {
    en: 'About Barangay Bensican',
    tl: 'Tungkol sa Barangay Bensican',
    il: 'Maipapan iti Barangay Bensican'
  },
  emergencyHotline: {
    en: '24/7 Barangay Emergency Assistance',
    tl: '24/7 Tulong sa Emergency ng Barangay',
    il: '24/7 Tulong iti Emerhensia ti Barangay'
  },
  hotlineDesc: {
    en: 'For urgent medical rescue, public safety, fires, or disputes requiring immediate response.',
    tl: 'Para sa agarang medikal, kaligtasan ng komunidad, sunog, o alitan na nangangailangan ng agarang tugon.',
    il: 'Para iti nasapa a medikal, kinatalged ti umili, uram, wenno riri a masapul a maaksionan a dagus.'
  },
  pinnedAnnouncements: {
    en: 'Official Barangay Announcements',
    tl: 'Mga Opisyal na Anunsyo ng Barangay',
    il: 'Dagiti Opisial a Pakaammo ti Barangay'
  },
  viewAllAnnouncements: {
    en: 'View all announcements →',
    tl: 'Tingnan lahat ng anunsyo →',
    il: 'Kitaen amin a pakaammo →'
  },

  // Login Page Strings
  emailAddress: {
    en: 'Email Address',
    tl: 'Email Address',
    il: 'Email Address'
  },
  password: {
    en: 'Password',
    tl: 'Password',
    il: 'Password'
  },
  enterEmail: {
    en: 'e.g. resident@gmail.com',
    tl: 'hal. resident@gmail.com',
    il: 'kas pangarigan: resident@gmail.com'
  },
  enterPassword: {
    en: 'Enter your password',
    tl: 'Ilagay ang inyong password',
    il: 'Ikabil ti password-yo'
  },
  forgotPassword: {
    en: 'Forgot Password?',
    tl: 'Nakalimutan ang Password?',
    il: 'Nalipatan ti Password?'
  },
  signingIn: {
    en: 'Signing In...',
    tl: 'Pumapasok...',
    il: 'Sumsumrek...'
  },
  orSignInWith: {
    en: 'Or sign in with (Para sa Mabilisang Pagpasok):',
    tl: 'O mag-sign in gamit ang:',
    il: 'Wenno sumrek babaen ti:'
  },
  newResident: {
    en: 'New resident of Bensican?',
    tl: 'Bagong residente ng Bensican?',
    il: 'Baro nga umili ti Bensican?'
  },
  alreadyRegistered: {
    en: 'Already registered? Sign in',
    tl: 'May account na? Mag-sign in',
    il: 'Adda account-mon? Sumrek'
  },
  registerHere: {
    en: 'Register Here (Magpatala Dito)',
    tl: 'Magpatala Dito',
    il: 'Agparehistro Ditoy'
  },
  twoFactorRequired: {
    en: 'Two-Factor Authentication Required',
    tl: 'Kinakailangan ang Two-Factor Authentication',
    il: 'Masapul ti Two-Factor Authentication'
  },
  enter2faCode: {
    en: 'Enter 6-Digit Security Code',
    tl: 'Ilagay ang 6-Digit na Security Code',
    il: 'Ikabil ti 6-Digit a Security Code'
  },
  verifyAndAccess: {
    en: 'Verify and Access System',
    tl: 'Iberipika at Pumasok sa Sistema',
    il: 'Pasingkedan ken Sumrek iti Sistema'
  },
  cancelBack: {
    en: 'Cancel and Back to Email Sign-in',
    tl: 'Kanselahin at Bumalik sa Sign-in',
    il: 'Ibabawi ken Agsubli iti Panagserrek'
  },
  securityCheck: {
    en: 'Security Check (Pagsusuri sa Seguridad):',
    tl: 'Pagsusuri sa Seguridad:',
    il: 'Panangsukimat iti Seguridad:'
  },
  resetYourPassword: {
    en: 'Reset Your Password',
    tl: 'I-reset ang Inyong Password',
    il: 'Sukatan ti Password-yo'
  },
  sendInstructions: {
    en: 'Send Instructions',
    tl: 'Ipadala ang Tagubilin',
    il: 'Ibaon dagiti Instruksion'
  },
  close: {
    en: 'Close',
    tl: 'Isara',
    il: 'Irikep'
  },

  // Resident Dashboard Extra Strings
  welcomeResident: {
    en: 'Welcome, Resident!',
    tl: 'Mabuhay, Residente!',
    il: 'Kablaaw, Umili!'
  },
  activeConcernsNotice: {
    en: 'You have active concern(s) being attended to by our barangay staff.',
    tl: 'Mayroon kayong aktibong sumbong na kasalukuyang inaasikaso ng mga opisyal.',
    il: 'Adda aktibo a pakaseknanyo nga aasikasuen dagiti opisial ti barangay.'
  },
  allConcernsUpToDate: {
    en: 'All your submitted concerns are up to date. You can send a new concern anytime below.',
    tl: 'Lahat ng inyong sumbong ay maayos at napapanahon. Maaari kayong magsumbong anumang oras sa ibaba.',
    il: 'Naisimpa amin a report-yo. Mabalin ti agipadamag iti aniaman nga oras dita baba.'
  },
  sendReportNow: {
    en: 'Send Report',
    tl: 'Magsumbong Ngayon',
    il: 'Ibaon ti Report Ita'
  },
  viewTimelineHandler: {
    en: 'View Timeline & Handler',
    tl: 'Tingnan ang Takbo at Humahawak',
    il: 'Kitaen ti Dalagan ken Agaywan'
  },
  readUpdatesAdvisories: {
    en: 'Read Updates & Advisories',
    tl: 'Basahin ang Balita at Anunsyo',
    il: 'Basaen dagiti Pakaammo'
  },
  viewHearingNotices: {
    en: 'View Hearing Notices',
    tl: 'Tingnan ang mga Pagdinig',
    il: 'Kitaen dagiti Patawag'
  },
  scheduledHearingCount: {
    en: 'Scheduled Hearing(s)',
    tl: 'Nakatakdang Pagdinig',
    il: 'Naituding a Panagdengngeg'
  },
  chatWithBensiAssistant: {
    en: 'Chat with Bensi AI Assistant',
    tl: 'Kausapin si Bensi AI Assistant',
    il: 'Makisarita ken Bensi AI Assistant'
  },
  chatWithBensiSub: {
    en: 'Instant answers in Ilocano, Tagalog, and English.',
    tl: 'Mabilis na sagot sa Ilokano, Tagalog, at Ingles.',
    il: 'Dagus a sungbat iti Ilokano, Tagalog, ken Ingles.'
  },
  billsTransparencyTitle: {
    en: 'Bills & Finance Transparency',
    tl: 'Kabatiran sa Bayarin at Pondo',
    il: 'Palawag iti Bayadan ken Pondo'
  },
  billsTransparencySub: {
    en: 'View official barangay utility bills & expenditures.',
    tl: 'Tingnan ang opisyal na bayarin at gastusin ng barangay.',
    il: 'Kitaen dagiti opisial a bayadan ken gastos ti barangay.'
  },
  verificationPendingTitle: {
    en: 'Account Status: Verification Pending',
    tl: 'Kalagayan ng Account: Naghihintay ng Pagpapatunay',
    il: 'Kasasaad ti Account: Maur-uray a Pasingkedan'
  },
  verificationPendingNotice: {
    en: 'Your resident account registration for Barangay Bensican has been received. Our barangay administrators are currently verifying your proof of residency. You have full access to submit concerns, talk to Bensi, and read public announcements in the meantime.',
    tl: 'Natanggap na ang inyong pagpapatala bilang residente ng Barangay Bensican. Sinusuri na ng mga administrador ang inyong patunay ng paninirahan. Maaari na kayong magsumbong, makipag-usap kay Bensi, at magbasa ng anunsyo.',
    il: 'Naawaten ti panagparehistro kas umili ti Barangay Bensican. Suksukimaten dagiti opisial ti pammaneknek ti pagnaedanyo. Mabalinmon ti agipadamag, makisarita ken Bensi, ken agbasa ti pakaammo.'
  },

  // Admin Dashboard Workstation Strings
  superAdminPortal: {
    en: 'Super Administrator Portal • Full Authority',
    tl: 'Portal ng Super Administrator • Buong Awtoridad',
    il: 'Portal ti Super Administrator • Paset ti Amin nga Awtoridad'
  },
  adminPortal: {
    en: 'Barangay Administrator Portal • Operations',
    tl: 'Portal ng Barangay Administrator • Operasyon',
    il: 'Portal ti Barangay Administrator • Panagtrabaho'
  },
  liveChatDesk: {
    en: 'Live Chat Desk:',
    tl: 'Live Chat Desk:',
    il: 'Live Chat Desk:'
  },
  availableTakeOver: {
    en: 'Available (Take Over Chat)',
    tl: 'Bukas (Direktang Kakausap)',
    il: 'Nakasagana (Makisaon ti Opisial)'
  },
  awayBotActive: {
    en: 'Away (Bensi AI Active)',
    tl: 'Nasa Labas (Aktibo si Bensi)',
    il: 'Awan (Aktibo ni Bensi AI)'
  },
  totalCommunityConcerns: {
    en: 'Total Community Concerns',
    tl: 'Kabuuan ng mga Sumbong',
    il: 'Pakabuklan Dagiti Report'
  },
  activeConcerns: {
    en: 'Active Concerns',
    tl: 'Aktibong Sumbong',
    il: 'Aktibo a Report'
  },
  resolvedConcerns: {
    en: 'Resolved Concerns',
    tl: 'Nalutas na Sumbong',
    il: 'Naisimpa a Report'
  },
  urgentPriority: {
    en: 'Urgent Priority',
    tl: 'Apurahang Sumbong',
    il: 'Napateg a Daranas'
  },
  hearingCalendar: {
    en: 'Hearing Calendar',
    tl: 'Kalendaryo ng Pagdinig',
    il: 'Kalendario ti Panagdengngeg'
  },
  issuedSubpoenas: {
    en: 'Issued Subpoenas',
    tl: 'Naibigay na Patawag',
    il: 'Naited a Patawag'
  },
  residentVerificationQueue: {
    en: 'Resident Verification Queue',
    tl: 'Pila ng Beripikasyon ng Residente',
    il: 'Pila ti Panangpasingked iti Umili'
  },
  activeBarangayStaff: {
    en: 'Active Barangay Staff',
    tl: 'Aktibong Kawani ng Barangay',
    il: 'Aktibo a Kawani ti Barangay'
  },
  attendanceDesk: {
    en: 'Attendance Desk',
    tl: 'Talaan ng Pagdalo',
    il: 'Lamisaan ti Panagatendar'
  },
  barangayOperationalWorkstation: {
    en: 'Barangay Operational Workstation',
    tl: 'Istasyon ng Operasyon ng Barangay',
    il: 'Lamisaan ti Panagtrabaho ti Barangay'
  },
  operationalWorkstationDesc: {
    en: 'Day-to-day community concerns, resident verifications, hearings, transparency, and notices.',
    tl: 'Araw-araw na sumbong ng mamamayan, beripikasyon, pagdinig, transparency, at anunsyo.',
    il: 'Inaldaw a pakaseknan ti umili, panangpasingked, panagdengngeg, palawag ti pondo, ken pakaammo.'
  },
  communityConcernsQueue: {
    en: 'Community Concerns Queue',
    tl: 'Talaan ng mga Sumbong ng Komunidad',
    il: 'Listaan Dagiti Pakaseknan ti Komunidad'
  },
  communityConcernsQueueDesc: {
    en: 'Review, assign handlers, prioritize (Urgent/Normal), update statuses, and chat with residents.',
    tl: 'Suriin, magtalaga ng hahawak, mag-prioritize, mag-update ng katayuan, at makipag-ugnayan.',
    il: 'Repasoen, mangituding ti agasikaso, ipangruna, i-update ti kasasaad, ken makisao iti umili.'
  },
  residentApprovalsTitle: {
    en: 'Resident Approvals (4-Step)',
    tl: 'Pag-apruba sa mga Residente (4-Hakbang)',
    il: 'Panangaprobar iti Umili (4 nga Addang)'
  },
  residentApprovalsDesc: {
    en: 'Verify valid IDs & selfies, confirm Bensican residency, approve or reject with clear reasons.',
    tl: 'Suriin ang ID at selfie, tiyakin ang paninirahan sa Bensican, aprubahan o tanggihan nang may dahilan.',
    il: 'Kitaen ti ID ken retrato, pasingkedan ti panagnaed idiay Bensican, aprobaran wenno ibelleng.'
  },
  luponHearingScheduler: {
    en: 'Lupong Hearing Scheduler',
    tl: 'Iskedyul ng Pagdinig ng Lupon',
    il: 'Iskedyul ti Panagdengngeg ti Lupon'
  },
  luponHearingSchedulerDesc: {
    en: 'Schedule Katarungang Pambarangay hearings with conflict & double-booking prevention.',
    tl: 'Magtakda ng pagdinig sa Katarungang Pambarangay nang walang banggaan sa oras at venue.',
    il: 'Ituding ti panagdengngeg ti Katarungang Pambarangay nga awan ti sabali a masalungasing.'
  },
  kpSubpoenasTitle: {
    en: 'KP Form 9 Subpoenas',
    tl: 'Mga Patawag ng KP Form 9',
    il: 'Dagiti Patawag ti KP Form 9'
  },
  kpSubpoenasDesc: {
    en: 'Generate official summons (BSN-S-YYYY-NNNNN) and download official letterhead PDFs.',
    tl: 'Gumawa ng opisyal na patawag at i-download ang opisyal na PDF na may tatak ng barangay.',
    il: 'Mangaramid ti opisial a patawag ken idownload ti PDF nga addaan tatak ti barangay.'
  },
  publicAnnouncementsTitle: {
    en: 'Public Announcements',
    tl: 'Mga Pampublikong Anunsyo',
    il: 'Dagiti Publiko a Pakaammo'
  },
  publicAnnouncementsDesc: {
    en: 'Publish community news, health advisories, curfew notices, and targeted notifications.',
    tl: 'Maglathala ng balita, paalala sa kalusugan, curfew, at direktang mga abiso sa mamamayan.',
    il: 'Mangipablaak ti damag ti komunidad, pakaammo iti salun-at, curfew, ken abiso.'
  },
  billsTransparencyLedger: {
    en: 'Bills & Transparency Ledger',
    tl: 'Talaan ng Bayarin at Transparency',
    il: 'Libro ti Bayadan ken Kinabuksilan'
  },
  billsTransparencyLedgerDesc: {
    en: 'Add utility bills, streetlighting, and vouchers for the public financial ledger.',
    tl: 'Magdagdag ng bayarin sa kuryente, tubig, ilaw ng daan, at voucher para sa publiko.',
    il: 'Manginayon ti bayadan iti silaw, danum, ken voucher para iti publiko a rekord.'
  },
  recordsExplorerTitle: {
    en: 'Records Explorer',
    tl: 'Tagasaliksik ng Talaan ng Barangay',
    il: 'Explorer Dagiti Dokumento ti Barangay'
  },
  recordsExplorerDesc: {
    en: 'Google Drive-style directory for digitized cases, vouchers, certificates, and folders.',
    tl: 'Direktoryo ng mga na-digitize na kaso, voucher, sertipiko, at mga folder.',
    il: 'Direktorio dagiti na-digitize a kaso, voucher, sertipiko, ken dokumento.'
  },
  accountabilityReportTitle: {
    en: 'Accountability Report',
    tl: 'Ulat sa Pananagutan',
    il: 'Report iti Responsabilidad'
  },
  accountabilityReportDesc: {
    en: 'Resolution rates, average completion times, SDG 16/11/9 metrics, and PDF/Excel export.',
    tl: 'Bilis ng paglutas, average na oras ng serbisyo, datos ng SDG, at pag-export sa PDF/Excel.',
    il: 'Kaparaspas ti panangisimpa, oras ti serbisio, datos ti SDG, ken export iti PDF/Excel.'
  },
  archiveExplorerTitle: {
    en: 'Barangay Archive Explorer',
    tl: 'Tagasaliksik ng Arkibo ng Barangay',
    il: 'Explorer ti Arkibo ti Barangay'
  },
  archiveExplorerDesc: {
    en: 'Inspect soft-archived items and submit restore authorization requests to Super Admin.',
    tl: 'Suriin ang mga naka-arkibong tala at humiling ng pagpapanumbalik sa Super Admin.',
    il: 'Kitaen dagiti naarkibo a rekord ken agkiddaw ti panangisubli iti Super Admin.'
  },
  cmsDraftTitle: {
    en: 'Landing Page CMS Draft',
    tl: 'Draft ng Landing Page CMS',
    il: 'Draft ti Website ti Barangay'
  },
  cmsDraftDesc: {
    en: 'Edit public site headlines and contact details (saved as draft awaiting Super Admin approval).',
    tl: 'I-edit ang impormasyon sa website ng barangay bago aprubahan ng Super Admin.',
    il: 'I-edit ti impormasion ti website ti barangay sakbay nga aprobaran ti Super Admin.'
  },
  punchClockTitle: {
    en: 'Staff Punch Clock & HR',
    tl: 'Punch Clock at HR ng Tauhan',
    il: 'Punch Clock ken HR ti Kawani'
  },
  punchClockDesc: {
    en: 'Daily Time In / Time Out punch clock, leave requests, and attendance history.',
    tl: 'Araw-araw na Time In / Time Out, kahilingan sa leave, at talaan ng pagpasok.',
    il: 'Inaldaw a Time In / Time Out, kiddaw a leave, ken rekord ti panagtrabaho.'
  },
  profileSecurityTitle: {
    en: 'My Profile & Security',
    tl: 'Aking Profile at Seguridad',
    il: 'Ti Profile-ko ken Seguridad'
  },
  profileSecurityDesc: {
    en: 'Personal contact details, password change, and elderly accessibility preferences.',
    tl: 'Personal na impormasyon, pagpapalit ng password, at setting sa accessibility.',
    il: 'Personal a detalye, panangsukat ti password, ken setting ti accessibility.'
  },
  staffUserAccountsTitle: {
    en: 'Staff & User Accounts',
    tl: 'Mga Account ng Tauhan at Residente',
    il: 'Dagiti Account ti Kawani ken Umili'
  },
  staffUserAccountsDesc: {
    en: 'Create & edit Admins, manage roles, suspend accounts, and reset passwords with security confirmation.',
    tl: 'Gumawa ng Admins, pamahalaan ang mga tungkulin, suspindihin ang account, at mag-reset ng password.',
    il: 'Mangaramid ti Admin, urnosen ti paset, mangsuspendi, ken mangsukat ti password.'
  },
  cmsLivePublishTitle: {
    en: 'Landing Page CMS & Live Publish',
    tl: 'Landing Page CMS at Paglathala',
    il: 'CMS ti Website ken Panangipablaak'
  },
  cmsLivePublishDesc: {
    en: 'Review Admin drafts, publish live to bensican.gov.ph with password verification, version history & rollback.',
    tl: 'Suriin ang mga draft, ilathala nang live gamit ang password, kasaysayan ng bersyon at rollback.',
    il: 'Sursurien dagiti draft, ipablaak a sibibiag babaen ti password, ken rollback.'
  },
  masterSettingsTitle: {
    en: 'Master System Settings',
    tl: 'Pangunahing Setting ng Sistema',
    il: 'Kangrunaan a Setting ti Sistema'
  },
  masterSettingsDesc: {
    en: 'Concern categories CRUD, hearing venues, bill types, official barangay directory, and database JSON backup.',
    tl: 'Kategorya ng sumbong, venue ng pagdinig, uri ng bayarin, direktoryo ng opisyal, at backup ng database.',
    il: 'Kategoria ti report, disso ti panagdengngeg, kita ti bayadan, direktorio, ken backup.'
  },
  securityAuditTitle: {
    en: 'Security & Audit Center',
    tl: 'Sentro ng Seguridad at Audit',
    il: 'Sentro ti Seguridad ken Audit'
  },
  securityAuditDesc: {
    en: '100% immutable audit log trail, monitor active user sessions, terminate unauthorized sessions, and intrusion alerts.',
    tl: 'Hindi mababagong audit trail, pagbabantay sa mga aktibong sesyon, at mga alerto sa seguridad.',
    il: 'Saan a mabaliwan nga audit trail, panagbantay kadagiti sesyon, ken alerto ti seguridad.'
  },
  directArchiveRecoveryTitle: {
    en: 'Direct Archive Restoration',
    tl: 'Direktang Pagbawi sa Arkibo',
    il: 'Direkta a Panangisubli manipud Arkibo'
  },
  directArchiveRecoveryDesc: {
    en: 'Directly restore any soft-archived concern, hearing, subpoena, bill, or account with password re-entry.',
    tl: 'Direktang bawiin ang anumang naka-arkibong sumbong, pagdinig, patawag, o tala gamit ang password.',
    il: 'Direkta nga isubli ti naarkibo a sumbong, pagdinig, patawag, wenno rekord babaen ti password.'
  },
  payrollDisbursementTitle: {
    en: 'Payroll & Compensation Ledger',
    tl: 'Payroll at Pasahod ng mga Kawani',
    il: 'Payroll ken Pasueldo ti Kawani'
  },
  payrollDisbursementDesc: {
    en: 'Compute monthly staff salaries and honoraria, process deductions, approve cash advances, and print payslips.',
    tl: 'Kuwentahin ang buwanang sahod at honorarium, kaltas, cash advance, at mag-print ng payslip.',
    il: 'Karkularen ti bulanan a sueldo ken honorarium, bawas, cash advance, ken i-print ti payslip.'
  },

  // First-time Tutorial
  tutorialTitle: {
    en: 'Welcome to E-Report Barangay Bensican!',
    tl: 'Malugod na Pagdating sa E-Report Barangay Bensican!',
    il: 'Naimbag nga Idadanon iti E-Report Barangay Bensican!'
  },
  tutorialStep1: {
    en: '1. Big Buttons: Everything is written in clear, large words so it is easy to tap without glasses.',
    tl: '1. Malalaking Pindutan: Malalaki ang mga letra at buton upang madaling pindutin nang walang salamin.',
    il: '1. Dadakkel a Buton: Dadakkel dagiti letra tapno nalaka a pinduten uray awan antipara.'
  },
  tutorialStep2: {
    en: '2. Voice & Photos: If typing is difficult, you can talk using the microphone or simply take a photo.',
    tl: '2. Boses at Litrato: Kung mahirap mag-type, pindutin ang mikropono o kumuha ng litrato.',
    il: '2. Boses ken Retrato: No narigat ti agsurat, pinduten ti mikropono wenno mangala ti retrato.'
  },
  tutorialStep3: {
    en: '3. Hear It Aloud: Tap "Listen" anytime to hear the computer read the words out loud to you.',
    tl: '3. Pakinggan: Pindutin ang "Pakinggan" upang marinig ang pagbasa nang malakas.',
    il: '3. Denggen: Pinduten ti "Denggen" tapno mabasa a sipipigsa para kadakayo.'
  },
  tutorialStep4: {
    en: '4. Need Help: Call our Barangay Hall hotline anytime at 0917-555-BENSI.',
    tl: '4. Tulong: Tumawag sa Barangay Hall hotline sa 0917-555-BENSI.',
    il: '4. Tulong: Agtawag iti Barangay Hall hotline iti 0917-555-BENSI.'
  },
  gotItStart: {
    en: 'Got It, Let’s Start!',
    tl: 'Naiintindihan Ko, Simulan Na!',
    il: 'Naawatak, Irugin Tantan!'
  },

  // Interactive Tutorial Detailed Keys
  helpGuide: {
    en: 'Need Help & Guides',
    tl: 'Kailangan ng Tulong at Gabay',
    il: 'Masapul ti Tulong ken Pangiwanwan'
  },
  guideTips: {
    en: 'Guide Tips (Interactive Tutorial)',
    tl: 'Mga Tip at Gabay sa Paggamit',
    il: 'Dagiti Pangiwanwan ken Tip'
  },
  skipGuide: {
    en: 'Skip Guide',
    tl: 'Laktawan ang Gabay',
    il: 'Laktawan ti Pangiwanwan'
  },
  listenTip: {
    en: 'Listen to this tip',
    tl: 'Pakinggan ang tip na ito',
    il: 'Denggen daytoy a tip'
  },
  tutorialStep0Title: {
    en: 'Welcome to E-Report Barangay Bensican!',
    tl: 'Malugod na Pagdating sa E-Report Barangay Bensican!',
    il: 'Naimbag nga Idadanon iti E-Report Barangay Bensican!'
  },
  tutorialStep0Desc: {
    en: 'This website is built specifically for Barangay Bensican residents, especially seniors and those who find computers tricky. We made everything big, plain, and easy.',
    tl: 'Ang portal na ito ay ginawa para sa mga residente ng Bensican, lalo na ang mga senior citizen. Malalaki, malilinaw, at madaling gamitin ang lahat ng bahagi.',
    il: 'Daytoy a website ket naisagana para kadagiti umili ti Bensican, nangruna dagiti lallakay ken baket. Pinagbalinmi a dakkel, nalawag, ken nalaka.'
  },
  tutorialStep1Title: {
    en: '1. Text Size & Display Mode',
    tl: '1. Laki ng Letra at Display Mode',
    il: '1. Kadakkel ti Letra ken Display Mode'
  },
  tutorialStep1Desc: {
    en: 'Tap the 3 dots (⋮) menu to switch between Light Mode and Dark Mode, or adjust font magnification (A+ / A−) for easy reading without glasses.',
    tl: 'Pindutin ang 3 dots (⋮) menu upang magpalit sa Light Mode o Dark Mode, o lakihan ang letra (A+ / A−) para mabasa nang walang salamin.',
    il: 'Pinduten ti 3 dots (⋮) menu tapno agpili ti Light Mode wenno Dark Mode, wenno padakkelen dagiti letra (A+ / A−).'
  },
  tutorialStep2Title: {
    en: '2. Voice Dictation & Picture Uploads',
    tl: '2. Magsalita Gamit ang Boses at Mag-upload ng Litrato',
    il: '2. Agsao babaen ti Boses ken Mangikabil ti Retrato'
  },
  tutorialStep2Desc: {
    en: 'No typing needed! You can tap the microphone to speak your reports, and tap "Listen (Read Aloud)" to hear instructions read out loud.',
    tl: 'Hindi kailangang mag-type nang mahaba! Pindutin ang mikropono upang magsalita, at pindutin ang "Pakinggan" upang marinig ang pagbasa.',
    il: 'Saan a masapul ti ag-type! Pinduten ti mikropono tapno agsao, ken pinduten ti "Denggen" tapno maibasa a sipipigsa.'
  },
  tutorialStep3Title: {
    en: '3. Official Reference Number (Save It)',
    tl: '3. Opisyal na Reference Number (Itabi Ito)',
    il: '3. Opisial a Reference Number (Idulin Daytoy)'
  },
  tutorialStep3Desc: {
    en: 'Every concern gets an official reference number like BSN-2026-00042. Keep this number to check your status and view updates.',
    tl: 'Bawat ulat ay may opisyal na numero tulad ng BSN-2026-00042. Itabi ito upang masubaybayan ang pag-usad at aksyon ng barangay.',
    il: 'Kada report ket maikkan ti numero a kas ti BSN-2026-00042. Idulin daytoy tapno masubaybayan ti report-yo.'
  },
  tutorialStep4Title: {
    en: '4. Need Help? Call Us Anytime',
    tl: '4. Kailangan ng Tulong? Tumawag Anumang Oras',
    il: '4. Masapul ti Tulong? Agtawag Uray Kaano'
  },
  tutorialStep4Desc: {
    en: 'You are never alone. Tap the "Need Help?" button or call our Barangay Bensican hotline at 0917-555-BENSI.',
    tl: 'Hindi kayo nag-iisa. Pindutin ang buton na "Kailangan ng Tulong?" o tumawag sa hotline ng Barangay Bensican sa 0917-555-BENSI.',
    il: 'Saan kayo nga agmaymaysa. Pinduten ti buton a "Masapul ti Tulong?" wenno agtawag iti hotline ti Barangay Bensican iti 0917-555-BENSI.'
  },

  // Help Guide Modal
  helpGuideTitle: {
    en: 'Need Help? - How to Use This Website',
    tl: 'Kailangan ng Tulong? - Paano Gamitin ang Website',
    il: 'Masapul ti Tulong? - Kasano ti Panagusar iti Website'
  },
  helpGuideSubtitle: {
    en: 'Simple steps and assistance for our valued residents, senior citizens, and first-time users.',
    tl: 'Mga simpleng hakbang at tulong para sa ating mga residente, nakatatanda, at unang beses na gagamit.',
    il: 'Nalaka nga addang ken tulong para kadagiti umili, lallakay, baket, ken baro nga agar-aramat.'
  },
  helpListenGuide: {
    en: 'Listen to this Guide (Read Aloud)',
    tl: 'Pakinggan ang Gabay (Basahin nang Malakas)',
    il: 'Denggen daytoy a Pangiwanwan'
  },
  helpStep1Title: {
    en: 'Sending a Report or Concern',
    tl: 'Pagpapadala ng Ulat o Sumbong',
    il: 'Panagbaon ti Report wenno Pakaseknan'
  },
  helpStep1Desc: {
    en: 'Tap "Send a Report". You do NOT have to write long paragraphs. You can simply tap the microphone icon to talk, or upload photos/videos of the problem.',
    tl: 'Pindutin ang "Magpadala ng Ulat". Hindi kailangang sumulat nang mahaba. Maaari mong pindutin ang mikropono upang magsalita, o mag-upload ng litrato o video.',
    il: 'Pinduten ti "Ibaon ti Report". Saan a masapul ti atiddog a surat. Pinduten laeng ti mikropono tapno agsao, wenno mangikabil ti retrato/video.'
  },
  helpStep2Title: {
    en: 'Your Reference Number (e.g. BSN-2026-00042)',
    tl: 'Ang Inyong Reference Number (hal. BSN-2026-00042)',
    il: 'Ti Reference Number-yo (kas pangarigan BSN-2026-00042)'
  },
  helpStep2Desc: {
    en: 'Every report gives you a clear number. Write it down or tap "Copy". Use it anytime under "Check My Reports" to see status updates and who is assigned to help you.',
    tl: 'Bawat ulat ay may natatanging numero. Isulat o kopyahin ito. Gamitin ito sa "Tingnan ang Aking mga Ulat" upang malaman ang kalagayan at sino ang nakatalagang opisyal.',
    il: 'Kada report ket addaan nalawag a numero. Isurat wenno kopyaren daytoy. Usaren iti "Kitaen Dagiti Report-ko" tapno maammuan ti kasasaad.'
  },
  helpStep3Title: {
    en: 'Bring a Helper (May Kasama)',
    tl: 'May Kasamang Tumulong (May Kasama)',
    il: 'Adda Kadua a Timmulong (Adda Kadua)'
  },
  helpStep3Desc: {
    en: 'A family member, child, or barangay volunteer can fill out forms for you. There is a field to enter their name so the barangay knows who assisted you.',
    tl: 'Maaaring tulungan kayo ng inyong anak, kapamilya, o kawani ng barangay sa pagsagot ng form. May espasyo para ilagay ang kanilang pangalan upang malaman kung sino ang tumulong sa inyo.',
    il: 'Mabalin a tulongan kayo ti anak, kapamilia, wenno volunteer ti barangay nga agsurat. Adda disso a pangikabilan ti naganda tapno maammuan no asino ti timmulong kadakayo.'
  },
  helpStep4Title: {
    en: 'Direct Hotline Assistance',
    tl: 'Direktang Tulong sa Hotline',
    il: 'Direkta a Tulong iti Hotline'
  },
  helpStep4Desc: {
    en: 'If you cannot use the website or need personal assistance, call the Barangay Bensican hotline at 0917-555-BENSI or visit the Barangay Hall during office hours (Monday to Friday, 8:00 AM – 5:00 PM).',
    tl: 'Kung hindi makagamit ng website o nangangailangan ng personal na tulong, tumawag sa Barangay Bensican hotline sa 0917-555-BENSI o pumunta sa Barangay Hall sa oras ng opisina (Lunes hanggang Biyernes, 8:00 AM – 5:00 PM).',
    il: 'No saan a makausar iti website wenno masapul ti personal a tulong, agtawag iti Barangay Bensican hotline iti 0917-555-BENSI wenno mapan iti Barangay Hall iti oras ti opisina (Lunes aginggana Biernes, 8:00 AM – 5:00 PM).'
  },
  callHotlineButton: {
    en: 'Call Hotline: 0917-555-BENSI',
    tl: 'Tawagan ang Hotline: 0917-555-BENSI',
    il: 'Agtawag iti Hotline: 0917-555-BENSI'
  },
  urgentNoticeTitle: {
    en: 'Urgent Community Notice',
    tl: 'Mabilisang Pabatid sa Komunidad',
    il: 'Pandarag a Pakaammo ti Komunidad'
  },
  listenAnnouncement: {
    en: 'Listen to announcement',
    tl: 'Pakinggan ang anunsyo',
    il: 'Denggen ti pakaammo'
  },
  seniorCitizensGroup: {
    en: 'Senior Citizens',
    tl: 'Mga Nakatatanda (Senior)',
    il: 'Dagiti Lallakay ken Baket'
  },
  allResidentsGroup: {
    en: 'All Residents',
    tl: 'Lahat ng Residente',
    il: 'Amin nga Umili'
  },
  archiveReasonRequired: {
    en: 'Reason is required: Please specify why this item is being archived before confirming.',
    tl: 'Kinakailangan ang dahilan: Mangyaring ipaliwanag kung bakit ito ia-archive bago magpatuloy.',
    il: 'Masapul ti rason: Pangngaasiyo ta ipaliwawag no apay nga i-archive daytoy sakbay nga agtuloy.'
  },
  archiveConfirmTitle: {
    en: 'Confirm Soft-Archive',
    tl: 'Kumpirmahin ang Pag-archive',
    il: 'Pasingkedan ti Panag-archive'
  },
  archiveConfirmDesc: {
    en: 'Note: Hard deletion is blocked. This item will be placed in the Archive center and can be restored by the Super Admin.',
    tl: 'Paalala: Bawal ang permanenteng pagbura. Ilalagay ang talaang ito sa Archive center at maaaring ibalik ng Super Admin.',
    il: 'Pakaammo: Maiparit ti permanente a panangikkat. Maikabil daytoy iti Archive center ken mabalin nga isubli ti Super Admin.'
  },
  archiveReasonLabel: {
    en: 'Reason for Archiving *',
    tl: 'Dahilan ng Pag-archive *',
    il: 'Rason ti Panag-archive *'
  },
  archiveReasonPlaceholder: {
    en: 'Explain why this item is being archived...',
    tl: 'Ipaliwanag kung bakit ia-archive ang talaang ito...',
    il: 'Ipaliwawag no apay nga i-archive daytoy...'
  },
  confirmSoftArchive: {
    en: 'Confirm Soft-Archive',
    tl: 'Kumpirmahin ang Pag-archive',
    il: 'Pasingkedan ti Panag-archive'
  },
  publicTrustStandards: {
    en: 'Public Trust & Standards',
    tl: 'Pagtitiwala ng Publiko at Pamantayan',
    il: 'Pangnamnama ti Publiko ken Pagalagadan'
  },
  barangayHallInfo: {
    en: 'Barangay Hall Information',
    tl: 'Impormasyon ng Barangay Hall',
    il: 'Impormasion ti Barangay Hall'
  },
  dataPrivacyActTitle: {
    en: 'Philippine Data Privacy Act (RA 10173)',
    tl: 'Batas sa Pagiging Lihim ng Datos (RA 10173)',
    il: 'Linteg ti Kinalimed ti Datos (RA 10173)'
  },
  footerCopyright: {
    en: '© 2026 Barangay Bensican, San Nicolas, Pangasinan. Republic of the Philippines. All rights reserved.',
    tl: '© 2026 Barangay Bensican, San Nicolas, Pangasinan. Republika ng Pilipinas. Nakalaan ang lahat ng karapatan.',
    il: '© 2026 Barangay Bensican, San Nicolas, Pangasinan. Republika ti Filipinas. Naipreserba amin a kalintegan.'
  },
  sdg16Title: {
    en: 'Peace & Justice',
    tl: 'Kapayapaan at Katarungan',
    il: 'Kappia ken Hustisia'
  },
  sdg11Title: {
    en: 'Safe Community',
    tl: 'Ligtas na Komunidad',
    il: 'Natalged a Komunidad'
  },
  sdg9Title: {
    en: 'Innovation',
    tl: 'Makabagong Teknolohiya',
    il: 'Mabael a Teknolohia'
  },
  needUrgentHelpRegister: {
    en: 'Need urgent help or want to follow up in person? Call our hotline at 0917-555-BENSI or drop by the Barangay Hall during office hours.',
    tl: 'Kailangan ng agarang tulong o nais mag-follow up nang personal? Tawagan ang aming hotline sa 0917-555-BENSI o pumunta sa Barangay Hall sa oras ng opisina.',
    il: 'Masapul ti nasapa a tulong wenno kayat ti ag-follow up a personal? Agtawag iti hotline iti 0917-555-BENSI wenno mapan iti Barangay Hall iti oras ti opisina.'
  },

  // Masterlist Compilation
  residentMasterlistTitle: {
    en: 'Official Compilation of Registered Residents',
    tl: 'Opisyal na Listahan ng mga Rehistradong Residente',
    il: 'Opisial a Listaan dagiti Rehistrado nga Umili'
  },
  residentMasterlistDesc: {
    en: 'Complete registry of verified resident accounts, addresses, and contacts in Barangay Bensican.',
    tl: 'Kumpletong talaan ng mga rehistradong residente, tirahan, at kontak sa Barangay Bensican.',
    il: 'Nalpas a listaan dagiti rehistrado nga umili, pagnaedan, ken kontak iti Barangay Bensican.'
  },
  printMasterlist: {
    en: 'Print Compilation (PDF)',
    tl: 'I-print ang Listahan (PDF)',
    il: 'I-print ti Listaan (PDF)'
  },
  exportCsv: {
    en: 'Export as CSV / Excel',
    tl: 'I-download bilang CSV / Excel',
    il: 'I-download a kas CSV / Excel'
  }
};

export function t(key: string, lang: Language): string {
  // Normalize common aliases
  let resolvedKey = key;
  const lower = (key || '').toLowerCase().trim();
  if (lower === 'need help' || lower === 'need help?' || lower === 'need_help' || lower === 'help?') {
    resolvedKey = 'help';
  } else if (lower === 'guidetips' || lower === 'guide_tips' || lower === 'guide tips') {
    resolvedKey = 'guideTips';
  } else if (lower === 'helpguide' || lower === 'help_guide') {
    resolvedKey = 'helpGuide';
  }

  if (translations[resolvedKey] && translations[resolvedKey][lang]) {
    return translations[resolvedKey][lang];
  }
  return translations[resolvedKey]?.en || translations[key]?.en || key;
}

export interface AnnouncementData {
  id?: string;
  title: string;
  content: string;
  target_group?: string;
  [key: string]: any;
}

const announcementTranslations: Record<string, { title: Record<Language, string>; content: Record<Language, string>; target_group?: Record<Language, string> }> = {
  'Free Medical Checkup & Flu Vaccination for Senior Citizens': {
    title: {
      en: 'Free Medical Checkup & Flu Vaccination for Senior Citizens',
      tl: 'Libreng Medical Checkup at Bakuna sa Trangkaso para sa mga Senior Citizen',
      il: 'Libre a Medical Checkup ken Bakuna iti Trangkaso para kadagiti Lallakay ken Baket'
    },
    content: {
      en: 'Notice to all Senior Citizens of Barangay Bensican: The San Nicolas Municipal Health Office will conduct a free medical mission, blood pressure screening, and flu vaccination on Saturday, October 17, 2026, starting at 8:00 AM at the Barangay Covered Court. Please bring your Senior Citizen ID.',
      tl: 'Pabatid sa lahat ng Senior Citizen ng Barangay Bensican: Magsasagawa ang Tanggapan ng Pangkalusugan ng San Nicolas ng libreng medical mission, pagsusuri ng presyon ng dugo, at bakuna sa trangkaso sa darating na Sabado, Oktubre 17, 2026, simula 8:00 AM sa Covered Court ng Barangay. Mangyaring dalhin ang inyong Senior Citizen ID.',
      il: 'Pakaammo iti amin a Senior Citizen ti Barangay Bensican: Ti San Nicolas Municipal Health Office ket mangisayangkat ti libre a medical mission, panagrukod ti presion ti dara, ken bakuna iti trangkaso inton Sabado, Oktubre 17, 2026, mangrugi 8:00 AM iti Covered Court ti Barangay. Pangngaasiyo ta ipan ti Senior Citizen ID-yo.'
    },
    target_group: {
      en: 'Senior Citizens',
      tl: 'Mga Nakatatanda (Senior)',
      il: 'Dagiti Lallakay ken Baket'
    }
  },
  'Barangay Bensican Clean-up Drive & Anti-Dengue Operation': {
    title: {
      en: 'Barangay Bensican Clean-up Drive & Anti-Dengue Operation',
      tl: 'Barangay Bensican Clean-up Drive at Kampanya Laban sa Dengue',
      il: 'Barangay Bensican Clean-up Drive ken Kampania Kontra Dengue'
    },
    content: {
      en: 'Everyone is invited to join the Oplan Tapat Ko, Linis Ko anti-dengue drive this Saturday, 6:00 AM across Purok 1 to Purok 4. Clear stagnant water from tires, bottles, and flower pots.',
      tl: 'Inaanyayahan ang lahat na lumahok sa Oplan Tapat Ko, Linis Ko kontra-dengue ngayong Sabado, 6:00 AM mula Purok 1 hanggang Purok 4. Alisin ang mga naipong tubig sa mga gulong, bote, at paso.',
      il: 'Awisen ti amin a makipaset iti Oplan Tapat Ko, Linis Ko kontra-dengue ita a Sabado, 6:00 AM manipud Purok 1 inggana Purok 4. Ikkatem dagiti naurnong a danum iti pilid, bote, ken masetera.'
    },
    target_group: {
      en: 'All Residents',
      tl: 'Lahat ng Residente',
      il: 'Amin nga Umili'
    }
  },
  'Notice of Scheduled Power Interruption - PANELCO I': {
    title: {
      en: 'Notice of Scheduled Power Interruption - PANELCO I',
      tl: 'Pabatid ng Nakaiskedyul na Pagkawala ng Kuryente - PANELCO I',
      il: 'Pakaammo ti Naikeddeng a Panagpukaw ti Kuryente - PANELCO I'
    },
    content: {
      en: 'PANELCO I advisory: Scheduled preventive maintenance along San Nicolas feeder on Thursday, October 15, from 8:00 AM to 1:00 PM. Affected areas include Barangay Bensican and neighboring barangays.',
      tl: 'Advisory mula sa PANELCO I: Nakaiskedyul na pagsasaayos sa San Nicolas feeder sa Huwebes, Oktubre 15, mula 8:00 AM hanggang 1:00 PM. Kabilang sa maapektuhan ang Barangay Bensican at mga kalapit na barangay.',
      il: 'Advisory manipud PANELCO I: Naikeddeng a panangmantener iti San Nicolas feeder inton Huebes, Oktubre 15, manipud 8:00 AM inggana 1:00 PM. Karaman dagiti maapektaran ti Barangay Bensican ken dagiti kaarruba a barangay.'
    },
    target_group: {
      en: 'All Residents',
      tl: 'Lahat ng Residente',
      il: 'Amin nga Umili'
    }
  }
};

export function getLocalizedAnnouncement<T extends AnnouncementData>(announcement: T, lang: Language): T {
  if (lang === 'en') return announcement;

  for (const [key, trans] of Object.entries(announcementTranslations)) {
    if (
      announcement.title === key ||
      (announcement.id === 'ann-001' && key.startsWith('Free Medical')) ||
      (announcement.id === 'ann-002' && key.startsWith('Barangay Bensican Clean-up')) ||
      (announcement.id === 'ann-003' && key.startsWith('Notice of Scheduled Power'))
    ) {
      return {
        ...announcement,
        title: trans.title[lang] || announcement.title,
        content: trans.content[lang] || announcement.content,
        target_group: trans.target_group ? trans.target_group[lang] || announcement.target_group : announcement.target_group
      };
    }
  }

  let localizedGroup = announcement.target_group;
  if (announcement.target_group === 'Senior Citizens') {
    localizedGroup = lang === 'tl' ? 'Mga Nakatatanda (Senior)' : 'Dagiti Lallakay ken Baket';
  } else if (announcement.target_group === 'All Residents') {
    localizedGroup = lang === 'tl' ? 'Lahat ng Residente' : 'Amin nga Umili';
  }

  return {
    ...announcement,
    target_group: localizedGroup
  };
}

