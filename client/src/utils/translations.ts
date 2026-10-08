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
    il: 'Pakaammo iti Kinasilpo: Ti report ken personal a detalye ket kumpidensial ken dagiti laeng autorisado nga opisial ti makakita maitunos iti Data Privacy Act (RA 10173).'
  },

  // Resident Dashboard Actions (4 Big Cards)
  residentSendReport: {
    en: 'Send a Report',
    tl: 'Isumbong ang Problema',
    il: 'Ipadamag ti Pakaseknan'
  },
  residentSendReportDesc: {
    en: 'Tell the barangay about broken lights, noise, disputes, sanitation, or safety issues.',
    tl: 'Sabihin sa barangay ang sira, ingay, alitan, basura, o kaligtasan.',
    il: 'Ibagam iti barangay ti nadadael, ariwawa, riri, basura, wenno kinatalged.'
  },
  residentCheckReports: {
    en: 'Check My Reports',
    tl: 'Tingnan ang Aking mga Sumbong',
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
    tl: 'Anong uri ng problema ito?',
    il: 'Ania a kita ti pakaseknan daytoy?'
  },
  formTitle: {
    en: 'Concern Title',
    tl: 'Pamagat ng Problema',
    il: 'Titulo ti Pakaseknan'
  },
  formTitlePlaceholder: {
    en: 'Example: Broken streetlight on Purok 2 corner',
    tl: 'Halimbawa: Pundidong ilaw sa kanto ng Purok 2',
    il: 'Pangarigan: Nadadael a silaw iti kanto ti Purok 2'
  },
  formDesc: {
    en: 'Tell us more details (or leave empty if sending photos/video)',
    tl: 'Ilarawan ang nangyari (o iwanang blangko kung may litrato/video)',
    il: 'Iladawan ti napasamak (wenno ibati a blangko no adda retrato/video)'
  },
  formDescPlaceholder: {
    en: 'Type words here or tap the microphone to speak your report...',
    tl: 'Isulat dito o pindutin ang mikropono upang magsalita...',
    il: 'Isurat ditoy wenno pinduten ti mikropono tapno agsao...'
  },
  formLocation: {
    en: 'Exact Place / Location in Bensican',
    tl: 'Eksaktong Lugar sa Bensican',
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
    tl: 'May tumulong ba sa inyo magsumbong? (Pangalan ng tumulong)',
    il: 'Adda kadi timmulong kadakayo nga agipadamag? (Nagan ti timmulong)'
  },
  formHelperPlaceholder: {
    en: 'Example: Maria Santos (Granddaughter / Staff)',
    tl: 'Halimbawa: Maria Santos (Apo / Kawani)',
    il: 'Pangarigan: Maria Santos (Apo / Opisial)'
  },
  formSendButton: {
    en: 'Send My Report to Barangay',
    tl: 'Ipadala ang Aking Sumbong sa Barangay',
    il: 'Ibaon ti Report-ko iti Barangay'
  },

  // Success Screen
  successTitle: {
    en: 'Your Report Has Been Sent!',
    tl: 'Matagumpay na Naipadala ang Inyong Sumbong!',
    il: 'Siballigi a Naibaon ti Report-yo!'
  },
  successSubtitle: {
    en: 'Barangay officials have received your concern and will act on it promptly.',
    tl: 'Natanggap na ng mga opisyal ng barangay ang inyong sumbong at ito ay aaksyunan agad.',
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
  }
};

export function t(key: string, lang: Language): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return translations[key]?.en || key;
}

