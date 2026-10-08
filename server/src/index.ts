import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import bensiRoutes from './routes/bensi.routes.js';
import hearingsRoutes from './routes/hearings.routes.js';
import subpoenasRoutes from './routes/subpoenas.routes.js';
import billsRoutes from './routes/bills.routes.js';
import announcementsRoutes from './routes/announcements.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import filesRoutes from './routes/files.routes.js';
import cmsRoutes from './routes/cms.routes.js';
import archiveRoutes from './routes/archive.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditRoutes from './routes/audit.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// Initialize DB schema
// Use persistent disk on Render, fallback to local uploads folder
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
process.env.DB_PATH = path.join(dataDir, 'database.sqlite');
initDb();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Headers & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false // Allow inline scripts/styles for development & PWA
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Ensure upload directory exists (use persistent dataDir)
const uploadDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded assets
app.use('/uploads', express.static(uploadDir));

// Serve frontend build in production
const clientBuildPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  
  // SPA fallback - serve index.html for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/bensi', bensiRoutes);
app.use('/api/hearings', hearingsRoutes);
app.use('/api/subpoenas', subpoenasRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'E-Report Barangay Bensican',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'An unexpected internal error occurred.' });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` E-Report Barangay Bensican API Server Running!`);
  console.log(` Port: ${PORT}`);
  console.log(` Time: ${new Date().toLocaleString()}`);
  console.log(`=======================================================`);
});

