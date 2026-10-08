import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// Knowledge base for Bensi in 3 languages (Ilocano, Tagalog, English)
const KNOWLEDGE_BASE = {
  hours: {
    en: 'The Barangay Bensican Hall is open Monday to Friday, from 8:00 AM to 5:00 PM. Our emergency desk operates 24/7. Call us at 0917-555-BENSI.',
    tl: 'Ang Barangay Bensican Hall ay bukas Lunes hanggang Biyernes, 8:00 AM hanggang 5:00 PM. Bukas 24/7 ang ating emergency desk. Tawagan kami sa 0917-555-BENSI.',
    il: 'Silulukat ti Barangay Bensican Hall manipud Lunes inggana Biernes, 8:00 AM inggana 5:00 PM. Silulukat 24/7 ti emergency desk. Tawagandakami iti 0917-555-BENSI.'
  },
  statuses: {
    en: 'Here is what the report statuses mean:\n• Pending: Your report is received and queued for review by barangay staff.\n• In Progress: An assigned official is inspecting the issue, scheduling mediation, or taking action.\n• Resolved: The issue has been fixed or both parties have come to an agreement.\n• Closed: Final action complete with recorded outcome.',
    tl: 'Narito ang kahulugan ng mga status:\n• Pending: Natanggap na ang sumbong at naghihintay ng pagsusuri ng opisyal.\n• In Progress: Kasalukuyang inaaksyunan, iniinspeksyon, o may nakatakdang pagdinig.\n• Resolved: Naayos na ang problema o nagkaayos na ang magkabilang panig.\n• Closed: Natapos na ang opisyal na proseso at nakatala ang ulat.',
    il: 'Doytoy ti kayat a sawen dagiti status:\n• Pending: Naawat ti report ket maur-uray ti panangrepaso dagiti opisial.\n• In Progress: Maar-aramid ti aksion, maipaspasa iti Lupon wenno maipatpatungpal.\n• Resolved: Naisimpa wenno nagtutunos ti dua a partido.\n• Closed: Nalpas ti amin nga addang ken nailanad ti nagbanagan.'
  },
  hearings: {
    en: 'Barangay conciliation hearings are conducted under the Katarungang Pambarangay (KP) rules at the Lupong Tagapamayapa Mediation Room. If a subpoena (BSN-S-YYYY-NNNNN) is issued to you, your appearance is required by law.',
    tl: 'Ang pagdinig ng Lupon ay isinasagawa alinsunod sa Katarungang Pambarangay sa Lupong Tagapamayapa Mediation Room. Kung may natanggap kayong subpoena (BSN-S-YYYY-NNNNN), kinakailangang humarap sa itinakdang oras.',
    il: 'Ti panagdengngeg ti Lupon ket maipatungpal babaen iti Katarungang Pambarangay iti Mediation Room. No nakaawatkayo iti pammagbaga wenno subpoena (BSN-S-YYYY-NNNNN), masapul ti panagturong iti ituding nga aldaw.'
  },
  reporting: {
    en: 'To file a report, tap "Send a Report" from your home screen. You can type words, use your voice microphone, or simply take photos/videos. Every report gets a unique reference number like BSN-2026-00042.',
    tl: 'Upang magsumbong, pindutin ang "Isumbong ang Problema" sa screen. Maaari kang mag-type, magsalita sa mikropono, o kumuha ng litrato o video. Makakatanggap ka ng numerong tulad ng BSN-2026-00042.',
    il: 'Tapno agipadamag, pinduten ti "Ipadamag ti Pakaseknan". Mabalin ti agsurat, agsao iti mikropono, wenno mangala ti retrato wenno video. Umawatkayo iti numero a kas ti BSN-2026-00042.'
  }
};

// Check staff presence status
router.get('/presence', requireAuth, (req: AuthRequest, res: Response) => {
  // Query active staff
  const activeStaff = db.prepare(`
    SELECT u.id, u.full_name, u.role, u.position, sp.is_online, sp.is_available, sp.last_heartbeat
    FROM users u
    JOIN staff_presence sp ON u.id = sp.user_id
    WHERE u.role IN ('admin', 'super_admin') AND u.status = 'active'
  `).all() as any[];

  const availableStaff = activeStaff.filter(s => s.is_online === 1 && s.is_available === 1);
  const isStaffActive = availableStaff.length > 0;

  res.json({
    isStaffActive,
    availableStaffCount: availableStaff.length,
    staff: activeStaff
  });
});

// Staff toggle own availability
router.post('/presence/toggle', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { isAvailable } = req.body;
  const user = req.user!;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO staff_presence (user_id, is_online, is_available, last_heartbeat)
    VALUES (?, 1, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET is_available = ?, is_online = 1, last_heartbeat = excluded.last_heartbeat
  `).run(user.id, isAvailable ? 1 : 0, now, isAvailable ? 1 : 0);

  logAudit(user.id, user.full_name, user.role, 'TOGGLE_PRESENCE', 'StaffPresence', user.id, `Set availability to ${isAvailable ? 'Available' : 'Busy/Away'}.`, req);

  res.json({ message: `Availability status set to ${isAvailable ? 'Available' : 'Busy/Away'}.` });
});

// Chat message endpoint
router.post('/chat', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { message, lang = 'en', reportId } = req.body;
    const user = req.user!;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    const now = new Date().toISOString();
    const userMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Save resident's message
    db.prepare(`
      INSERT INTO chat_messages (id, user_id, report_id, sender_role, sender_name, message, created_at)
      VALUES (?, ?, ?, 'resident', ?, ?, ?)
    `).run(userMsgId, user.id, reportId || null, user.full_name, message.trim(), now);

    // Check if Bensi is enabled in settings
    const bensiConfigRow = db.prepare("SELECT value_json FROM system_settings WHERE key = 'bensi_config'").get() as { value_json: string } | undefined;
    const bensiConfig = bensiConfigRow ? JSON.parse(bensiConfigRow.value_json) : { enabled: true };

    // Check staff availability
    const availableStaff = db.prepare(`
      SELECT u.id, u.full_name, u.role, u.position
      FROM users u
      JOIN staff_presence sp ON u.id = sp.user_id
      WHERE u.role IN ('admin', 'super_admin') AND u.status = 'active' AND sp.is_online = 1 AND sp.is_available = 1
    `).all() as any[];

    const isStaffActive = availableStaff.length > 0;

    // Case 1: Staff IS Active -> Bensi STOPS replying, Handover to active staff!
    if (isStaffActive) {
      // Notify active staff immediately
      const notifStmt = db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
        VALUES (?, ?, 'Urgent: Resident Chat Waiting', ?, '/admin/chat', 0, ?)
      `);
      const msgSnippet = `Resident ${user.full_name} sent a message: "${message.trim().substring(0, 70)}..."`;
      for (const s of availableStaff) {
        notifStmt.run(`not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${s.id}`, s.id, msgSnippet, now);
      }

      res.json({
        handledBy: 'staff',
        message: 'A barangay official is currently online and available! Bensi has stepped aside and notified the active staff to respond to you directly.',
        activeStaff: availableStaff.map(s => ({ name: s.full_name, position: s.position }))
      });
      return;
    }

    // Case 2: NO Staff Active -> Bensi responds automatically
    if (!bensiConfig.enabled) {
      res.json({
        handledBy: 'offline',
        message: 'Barangay officials are currently away. Automated assistant is temporarily resting. Please leave your message or call 0917-555-BENSI.'
      });
      return;
    }

    // Generate intelligent contextual response
    const cleanMsg = message.toLowerCase();
    const l: keyof typeof KNOWLEDGE_BASE.hours = (lang === 'il' || lang === 'tl') ? lang : 'en';
    let replyText = '';

    if (cleanMsg.includes('hour') || cleanMsg.includes('oras') || cleanMsg.includes('bukas') || cleanMsg.includes('time') || cleanMsg.includes('lukat')) {
      replyText = KNOWLEDGE_BASE.hours[l];
    } else if (cleanMsg.includes('status') || cleanMsg.includes('pending') || cleanMsg.includes('progress') || cleanMsg.includes('resolved') || cleanMsg.includes('ano ibig sabihin')) {
      replyText = KNOWLEDGE_BASE.statuses[l];
    } else if (cleanMsg.includes('hearing') || cleanMsg.includes('subpoena') || cleanMsg.includes('patawag') || cleanMsg.includes('lupon') || cleanMsg.includes('summons') || cleanMsg.includes('dengngeg')) {
      replyText = KNOWLEDGE_BASE.hearings[l];
    } else if (cleanMsg.includes('report') || cleanMsg.includes('sumbong') || cleanMsg.includes('ipadamag') || cleanMsg.includes('reklamo') || cleanMsg.includes('file')) {
      replyText = KNOWLEDGE_BASE.reporting[l];
    } else {
      // General greeting / helpful response
      if (l === 'il') {
        replyText = `Naimbag nga aldaw apo ${user.full_name}! Siak ni Bensi, ti automated digital assistant ti Barangay Bensican. Awan ti opisial nga online ita, ngem addaak ditoy a tumultulong kadakayo. Mabalinmo ti agsaludsod maipapan iti panangisumite ti report, status, wenno oras ti opisina.`;
      } else if (l === 'tl') {
        replyText = `Magandang araw po Ginoo/Ginang ${user.full_name}! Ako si Bensi, ang inyong automated digital assistant ng Barangay Bensican. Kasalukuyang offline ang ating mga opisyal, ngunit narito ako upang tumulong. Maaari kayong magtanong ukol sa pagpapadala ng sumbong, pag-track ng status, o oras ng barangay hall.`;
      } else {
        replyText = `Good day ${user.full_name}! I am Bensi, your automated Barangay Bensican digital assistant. All barangay officials are currently off-desk, but I am here to guide you. You can ask me how to file concerns, what statuses mean, hearing guidelines, or office contact details.`;
      }
    }

    // Save Bensi's reply
    const bensiMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO chat_messages (id, user_id, report_id, sender_role, sender_name, message, created_at)
      VALUES (?, ?, ?, 'bensi', 'Bensi AI Assistant', ?, ?)
    `).run(bensiMsgId, user.id, reportId || null, replyText, now);

    res.json({
      handledBy: 'bensi',
      message: replyText,
      isAutomated: true,
      botName: bensiConfig.bot_name || 'Bensi'
    });
  } catch (err: any) {
    console.error('Bensi chat error:', err);
    res.status(500).json({ error: 'Chat failed. Please try again.' });
  }
});

// Admin sends message in conversation (Takeover reply)
router.post('/admin-reply', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { targetUserId, reportId, message } = req.body;
  const user = req.user!;

  if (!targetUserId || !message || !message.trim()) {
    res.status(400).json({ error: 'Target resident and message content are required.' });
    return;
  }

  const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO chat_messages (id, user_id, report_id, sender_role, sender_name, message, created_at)
    VALUES (?, ?, ?, 'admin', ?, ?, ?)
  `).run(msgId, targetUserId, reportId || null, `${user.full_name} (${user.position || user.role})`, message.trim(), now);

  // Notify resident
  const notifId = `not-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(notifId, targetUserId, 'Barangay Official Replied', `${user.full_name}: "${message.trim().substring(0, 70)}..."`, '/resident/chat', now);

  res.json({ message: 'Reply sent directly to resident.', msgId });
});

// Get chat history for user
router.get('/history', requireAuth, (req: AuthRequest, res: Response) => {
  const { targetUserId } = req.query;
  const user = req.user!;

  let effectiveUserId = user.id;
  if ((user.role === 'admin' || user.role === 'super_admin') && targetUserId) {
    effectiveUserId = targetUserId as string;
  }

  const messages = db.prepare(`
    SELECT * FROM chat_messages
    WHERE user_id = ?
    ORDER BY created_at ASC
  `).all(effectiveUserId);

  res.json({ messages });
});

// Super Admin: Update Bensi Configuration
router.put('/config', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { config } = req.body;
  const user = req.user!;

  if (!config) {
    res.status(400).json({ error: 'Configuration object required.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO system_settings (key, value_json, updated_at)
    VALUES ('bensi_config', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).run(JSON.stringify(config), now);

  logAudit(user.id, user.full_name, user.role, 'UPDATE_BENSI_CONFIG', 'SystemSettings', 'bensi_config', 'Updated Bensi AI assistant configuration and greetings.', req);

  res.json({ message: 'Bensi configuration updated successfully.' });
});

export default router;

