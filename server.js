// Load environment variables
require('dotenv').config({ path: ['.env.development.local', '.env.local', '.env'] });

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting to prevent spam
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many signup attempts, please try again later.'
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your HTML, CSS, JS)
app.use(express.static('.'));

// Database setup
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to PostgreSQL database');
        release();
    }
});

// Create waitlist table if it doesn't exist
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS waitlist (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                facebook TEXT,
                willing_to_pay BOOLEAN DEFAULT false,
                status VARCHAR(50) DEFAULT 'incomplete',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address INET,
                user_agent TEXT
            )
        `);
        
        // Add status column to existing tables if it doesn't exist
        await pool.query(`
            ALTER TABLE waitlist 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'incomplete'
        `);
        
        // Update existing facebook column to allow NULL values
        await pool.query(`
            ALTER TABLE waitlist 
            ALTER COLUMN facebook DROP NOT NULL
        `);
        
        console.log('Database table initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initializeDatabase();

// API Routes

// Submit waitlist entry
app.post('/api/waitlist', limiter, (req, res) => {
    const { email, facebook, willingToPay } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Validation
    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email is required' 
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please enter a valid email address' 
        });
    }

    // Determine status and handle Facebook URL
    let normalizedFacebook = null;
    let status = 'incomplete';
    
    if (facebook && facebook.trim() !== '') {
        if (!isValidFacebookUrl(facebook)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid Facebook profile URL'
            });
        }
        normalizedFacebook = normalizeFacebookUrl(facebook);
        status = 'complete';
    }

    // Insert into database
    const sql = `INSERT INTO waitlist (email, facebook, willing_to_pay, status, ip_address, user_agent) 
                  VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    
    pool.query(sql, [email, normalizedFacebook, willingToPay || false, status, ipAddress, userAgent])
        .then(result => {
            res.json({ 
                success: true, 
                message: status === 'complete' ? 'Successfully joined the waitlist!' : 'Entry recorded, but Facebook profile needed for full access',
                id: result.rows[0].id,
                status: status
            });
        })
        .catch(err => {
            if (err.code === '23505') { // Unique constraint violation
                return res.status(409).json({ 
                    success: false, 
                    message: 'This email is already on the waitlist!' 
                });
            }
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error, please try again' 
            });
        });
});

// Get all waitlist entries (for admin use)
app.get('/api/waitlist', async (req, res) => {
    const sql = `SELECT id, email, facebook, willing_to_pay, status, timestamp, ip_address, user_agent 
                  FROM waitlist 
                  ORDER BY timestamp DESC`;
    
    try {
        const result = await pool.query(sql);
        res.json({ 
            success: true, 
            data: result.rows,
            total: result.rows.length
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get waitlist statistics
app.get('/api/waitlist/stats', async (req, res) => {
    const sql = `SELECT 
                    COUNT(*)::int as total,
                    COUNT(DISTINCT ip_address)::int as unique_ips,
                    DATE(timestamp) as signup_date,
                    COUNT(*)::int as daily_signups
                  FROM waitlist 
                  GROUP BY DATE(timestamp)
                  ORDER BY signup_date DESC
                  LIMIT 30`;
    
    try {
        const result = await pool.query(sql);
        
        // Also get overall stats
        const overallStats = await pool.query(`
            SELECT 
                COUNT(*)::int as total_signups,
                COUNT(DISTINCT ip_address)::int as unique_visitors,
                COUNT(CASE WHEN willing_to_pay = true THEN 1 END)::int as willing_to_pay_count
            FROM waitlist
        `);

        res.json({ 
            success: true, 
            data: {
                daily_stats: result.rows,
                overall: overallStats.rows[0]
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Export waitlist as CSV
app.get('/api/waitlist/export', async (req, res) => {
    const sql = `SELECT email, facebook, willing_to_pay, status, timestamp, ip_address 
                  FROM waitlist 
                  ORDER BY timestamp DESC`;
    
    try {
        const result = await pool.query(sql);
        
        // Convert to CSV
        const csvHeader = 'Email,Facebook Profile,Willing to Pay,Status,Timestamp,IP Address\n';
        const csvRows = result.rows.map(row => 
            `"${row.email}","${row.facebook || ''}","${row.willing_to_pay ? 'Yes' : 'No'}","${row.status}","${row.timestamp}","${row.ip_address}"`
        ).join('\n');
        const csv = csvHeader + csvRows;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="waitlist-export.csv"');
        res.send(csv);
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidFacebookUrl(url) {
    if (!url || url.trim() === '') {
        return false;
    }
    
    // Normalize the URL - add https:// if missing
    let normalizedUrl = url.trim();
    
    // If it starts with facebook.com or fb.com, add https://
    if (normalizedUrl.startsWith('facebook.com/') || normalizedUrl.startsWith('fb.com/')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    // If it starts with www.facebook.com or www.fb.com, add https://
    else if (normalizedUrl.startsWith('www.facebook.com/') || normalizedUrl.startsWith('www.fb.com/')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    // If it doesn't have a protocol, try adding https://
    else if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    
    try {
        const urlObj = new URL(normalizedUrl);
        return urlObj.hostname.includes('facebook.com') || 
               urlObj.hostname.includes('fb.com');
    } catch {
        return false;
    }
}

function normalizeFacebookUrl(url) {
    if (!url || url.trim() === '') {
        return url;
    }
    
    let normalizedUrl = url.trim();
    
    // If it starts with facebook.com or fb.com, add https://
    if (normalizedUrl.startsWith('facebook.com/') || normalizedUrl.startsWith('fb.com/')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    // If it starts with www.facebook.com or www.fb.com, add https://
    else if (normalizedUrl.startsWith('www.facebook.com/') || normalizedUrl.startsWith('www.fb.com/')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    // If it doesn't have a protocol, try adding https://
    else if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin API available at http://localhost:${PORT}/api/waitlist`);
    console.log(`📥 Export available at http://localhost:${PORT}/api/waitlist/export`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await pool.end();
        console.log('Database connection pool closed');
        process.exit(0);
    } catch (err) {
        console.error('Error closing database pool:', err.message);
        process.exit(1);
    }
});
