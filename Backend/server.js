console.log('>>> DEBUG: Starting Server Process...');
try {
    console.log('>>> DEBUG: Directory:', __dirname);
    console.log('>>> DEBUG: CWD:', process.cwd());
    const fs = require('fs');
    console.log('>>> DEBUG: Root Files:', fs.readdirSync(process.cwd()));
} catch (e) { console.error(e); }

const express = require('express');
console.log('>>> DEBUG: Express loaded');
const cors = require('cors');
const dotenv = require('dotenv');
console.log('>>> DEBUG: Loading Database Config...');
const db = require('./config/database');
console.log('>>> DEBUG: Database Config Loaded');
const path = require('path');
console.log('>>> DEBUG: Loading Seed Script...');
const seed = require('./seed');
console.log('>>> DEBUG: All Imports Complete');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Global Error Handlers for debugging crashes
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR (Uncaught Exception):', err);
    // Keep internal logging alive briefly if possible, but 137 might kill it anyway
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR (Unhandled Rejection):', reason);
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Disable ETags to prevent 304 responses (Force 200 OK)
app.set('etag', false);
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/game', require('./routes/gameRoutes'));

// Public Overview Endpoint (e.g. for overview.html)
app.get('/api/public/overview', async (req, res) => {
    try {
        // Return dummy data or fetch from DB
        // For now returning empty array as placeholder
        res.json([]);
    } catch (e) {
        res.status(500).json({ error: 'Error' });
    }
});

// Serve static files from root directory (where HTML files are)
// Serve static files - REMOVED because Frontend is on GitHub Pages
// app.use(express.static(path.join(__dirname, '../')));

// Test route
app.get('/api/test', (req, res) => {
    res.send('Virus Control Backend is running.');
});

// Unified Startup Function
const startServer = async () => {
    try {
        // 1. Connect to Database
        await db.authenticate();
        console.log('>>> DEBUG: Database connected...');

        // 2. Sync Database (Alert: true updates the schema if columns are missing)
        console.log('>>> DEBUG: Syncing Database...');
        await db.sync({ alter: true });
        console.log('>>> DEBUG: Database synced (Schema updated)');

        // 3. Auto-Seed
        if (process.env.AUTO_SEED === 'true') {
            console.log('>>> DEBUG: Auto-seeding database...');
            const email = process.env.SEED_EMAIL || 'admin@example.com';
            const pass = process.env.SEED_PASSWORD || 'password123';
            await seed(email, pass);
            console.log('>>> DEBUG: Seeding complete');
        }

        // 4. Start Server
        app.listen(PORT, () => {
            console.log(`>>> SERVER STARTED on port ${PORT}`);
        });

    } catch (err) {
        console.error('>>> CRITICAL STARTUP ERROR:', err);
    }
};

startServer();
