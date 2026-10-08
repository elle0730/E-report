import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'bensican.db');
let dbDir = path.dirname(dbPath);
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (dirErr) {
  // If custom DB_PATH / DATA_DIR directory isn't writable, fallback to local data dir
  console.warn('[DB] Could not create directory for DB_PATH, falling back to ./data');
  dbPath = path.join(process.cwd(), 'data', 'bensican.db');
  dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

export const db = new Database(dbPath);

// Enable WAL mode for high concurrency and performance, and enforce foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
export function initDb() {
  const possiblePaths = [
    path.join(__dirname, 'schema.sql'),
    path.join(__dirname, '../../src/db/schema.sql'),
    path.join(process.cwd(), 'src/db/schema.sql'),
    path.join(process.cwd(), 'server/src/db/schema.sql'),
    path.join(__dirname, '../src/db/schema.sql')
  ];
  const schemaPath = possiblePaths.find(p => fs.existsSync(p));
  if (!schemaPath) {
    throw new Error(`Could not find schema.sql in: ${possiblePaths.join(', ')}`);
  }
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

// Atomic Reference Number Generator
// BSN-YYYY-NNNNN for reports, BSN-H-YYYY-NNNNN for hearings, BSN-S-YYYY-NNNNN for subpoenas
export function generateReferenceNumber(prefix: 'BSN' | 'BSN-H' | 'BSN-S', customYear?: number): string {
  const year = customYear || new Date().getFullYear();
  
  const getSeq = db.prepare('SELECT current_val FROM sequences WHERE prefix = ? AND year = ?');
  const upsertSeq = db.prepare(`
    INSERT INTO sequences (prefix, year, current_val)
    VALUES (?, ?, 1)
    ON CONFLICT(prefix, year) DO UPDATE SET current_val = current_val + 1
    RETURNING current_val
  `);

  const result = upsertSeq.get(prefix, year) as { current_val: number };
  const padded = String(result.current_val).padStart(5, '0');
  return `${prefix}-${year}-${padded}`;
}

export default db;

