-- Database schema for E-Report Barangay Bensican

PRAGMA foreign_keys = ON;

-- Sequence generator table for reference numbers
CREATE TABLE IF NOT EXISTS sequences (
  prefix TEXT NOT NULL,
  year INTEGER NOT NULL,
  current_val INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (prefix, year)
);

-- Users table (Resident, Admin, Super Admin)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('resident', 'admin', 'super_admin')),
  status TEXT NOT NULL CHECK(status IN ('pending_verification', 'active', 'rejected', 'suspended', 'archived')),
  full_name TEXT NOT NULL,
  birthday TEXT,
  contact_number TEXT,
  house_number TEXT,
  street TEXT,
  barangay TEXT DEFAULT 'Bensican',
  residency_length TEXT,
  valid_id_url TEXT,
  selfie_url TEXT,
  rejection_reason TEXT,
  helper_name TEXT,
  position TEXT,
  photo_url TEXT,
  two_factor_enabled INTEGER DEFAULT 0,
  two_factor_secret TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  lockout_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  archived_by TEXT
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active INTEGER DEFAULT 1,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Staff Presence table
CREATE TABLE IF NOT EXISTS staff_presence (
  user_id TEXT PRIMARY KEY,
  is_online INTEGER DEFAULT 0,
  is_available INTEGER DEFAULT 1,
  last_heartbeat TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  default_handler_id TEXT,
  sort_order INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (default_handler_id) REFERENCES users(id)
);

-- Reports / Concerns table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  ref_number TEXT UNIQUE NOT NULL, -- e.g. BSN-2026-00001
  resident_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_details TEXT NOT NULL,
  incident_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Pending', 'In Progress', 'Resolved', 'Closed')),
  priority TEXT NOT NULL DEFAULT 'Normal' CHECK(priority IN ('Low', 'Normal', 'Urgent')),
  filed_with_assistance INTEGER DEFAULT 0,
  helper_name TEXT,
  assigned_admin_id TEXT,
  outcome TEXT,
  resolution_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  archived_by TEXT,
  archive_reason TEXT,
  FOREIGN KEY (resident_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (assigned_admin_id) REFERENCES users(id)
);

-- Report Attachments
CREATE TABLE IF NOT EXISTS report_attachments (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (report_id) REFERENCES reports(id)
);

-- Report Follow-ups
CREATE TABLE IF NOT EXISTS report_followups (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_admin_request INTEGER DEFAULT 0,
  attachments_json TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY (report_id) REFERENCES reports(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Hearings table
CREATE TABLE IF NOT EXISTS hearings (
  id TEXT PRIMARY KEY,
  ref_number TEXT UNIQUE NOT NULL, -- e.g. BSN-H-2026-00001
  report_id TEXT NOT NULL,
  hearing_date TEXT NOT NULL,
  hearing_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  parties_involved TEXT NOT NULL,
  assigned_admin_ids TEXT NOT NULL, -- JSON array of admin user ids
  purpose TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
  minutes TEXT,
  outcome TEXT,
  attendance_json TEXT DEFAULT '[]',
  attachments_json TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  archived_by TEXT,
  archive_reason TEXT,
  FOREIGN KEY (report_id) REFERENCES reports(id)
);

-- Hearing History (Rescheduling, notes)
CREATE TABLE IF NOT EXISTS hearing_history (
  id TEXT PRIMARY KEY,
  hearing_id TEXT NOT NULL,
  action TEXT NOT NULL,
  notes TEXT,
  changed_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (hearing_id) REFERENCES hearings(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Subpoenas table
CREATE TABLE IF NOT EXISTS subpoenas (
  id TEXT PRIMARY KEY,
  ref_number TEXT UNIQUE NOT NULL, -- e.g. BSN-S-2026-00001
  report_id TEXT NOT NULL,
  hearing_id TEXT,
  case_number TEXT NOT NULL,
  respondent TEXT NOT NULL,
  complainant TEXT NOT NULL,
  hearing_date TEXT NOT NULL,
  hearing_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  reason TEXT NOT NULL,
  signatory TEXT NOT NULL,
  signatory_title TEXT NOT NULL DEFAULT 'Punong Barangay',
  status TEXT NOT NULL CHECK(status IN ('Draft', 'Issued', 'Served', 'Attended', 'Missed')),
  template_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  archived_by TEXT,
  archive_reason TEXT,
  FOREIGN KEY (report_id) REFERENCES reports(id),
  FOREIGN KEY (hearing_id) REFERENCES hearings(id)
);

-- Subpoena Templates
CREATE TABLE IF NOT EXISTS subpoena_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  body_template TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_archived INTEGER DEFAULT 0
);

-- Bills & Finance table
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT NOT NULL,
  payee TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Unpaid', 'Paid', 'Overdue')),
  bill_type TEXT NOT NULL,
  attachment_url TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  archived_by TEXT,
  archive_reason TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_group TEXT NOT NULL DEFAULT 'All Residents',
  is_pinned INTEGER DEFAULT 0,
  scheduled_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  archived_by TEXT,
  archive_reason TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Payroll Attendance table
CREATE TABLE IF NOT EXISTS payroll_attendance (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time_in TEXT NOT NULL,
  time_out TEXT,
  total_hours REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Present',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payroll Records table
CREATE TABLE IF NOT EXISTS payroll_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  basic_pay REAL NOT NULL,
  overtime_pay REAL DEFAULT 0,
  deductions REAL DEFAULT 0,
  net_pay REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Generated',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payroll Requests table (Leave / Cash Advance)
CREATE TABLE IF NOT EXISTS payroll_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('leave', 'cash_advance')),
  amount_or_days REAL NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Pending', 'Approved', 'Rejected')),
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Google Drive Style File Explorer
CREATE TABLE IF NOT EXISTS file_tree (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  owner_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('folder', 'file')),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  file_url TEXT,
  size INTEGER DEFAULT 0,
  mime_type TEXT,
  metadata_json TEXT DEFAULT '{}',
  permissions TEXT DEFAULT 'admin_super_admin',
  version INTEGER DEFAULT 1,
  is_starred INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  archived_by TEXT,
  archive_reason TEXT,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Audit Logs table (Strictly append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL
);

-- Landing Page CMS table
CREATE TABLE IF NOT EXISTS landing_page_cms (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  is_published INTEGER DEFAULT 0,
  content_json TEXT NOT NULL,
  draft_saved_by TEXT NOT NULL,
  approved_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (draft_saved_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Bensi / Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  report_id TEXT,
  sender_role TEXT NOT NULL CHECK(sender_role IN ('resident', 'admin', 'bensi')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  audio_url TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Archive Requests (Admins requesting Super Admin to restore)
CREATE TABLE IF NOT EXISTS archive_restore_requests (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
  reviewed_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (requested_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

