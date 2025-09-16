const { Pool } = require('pg');
const { sendWelcomeEmail } = require('./emailService');

// Create a connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map();

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

// Simple rate limiting
function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 5;
    
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, []);
    }
    
    const requests = rateLimitStore.get(ip);
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
        return false;
    }
    
    validRequests.push(now);
    rateLimitStore.set(ip, validRequests);
    return true;
}

// Initialize database table
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
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Initialize database on first run
    await initializeDatabase();

    if (req.method === 'POST') {
        // Submit waitlist entry
        const { email, facebook, willingToPay } = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Rate limiting
        if (!checkRateLimit(ipAddress)) {
            return res.status(429).json({
                success: false,
                message: 'Too many signup attempts, please try again later.'
            });
        }

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

        try {
            // Insert into database
            const result = await pool.query(
                `INSERT INTO waitlist (email, facebook, willing_to_pay, status, ip_address, user_agent) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [email, normalizedFacebook, willingToPay || false, status, ipAddress, userAgent]
            );

            // Send welcome email (don't fail the signup if email fails)
            let emailStatus = null;
            try {
                emailStatus = await sendWelcomeEmail(email);
                console.log('Email send result:', emailStatus);
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                emailStatus = { success: false, message: 'Failed to send welcome email' };
            }

            res.json({
                success: true,
                message: status === 'complete' ? 'Successfully joined the waitlist!' : 'Entry recorded, but Facebook profile needed for full access',
                id: result.rows[0].id,
                status: status,
                emailSent: emailStatus ? emailStatus.success : false
            });
        } catch (error) {
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({
                    success: false,
                    message: 'This email is already on the waitlist!'
                });
            }
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error, please try again'
            });
        }
    } else if (req.method === 'GET') {
        // Get all waitlist entries (for admin use)
        try {
            const result = await pool.query(
                `SELECT id, email, facebook, willing_to_pay, timestamp, ip_address, user_agent 
                 FROM waitlist 
                 ORDER BY timestamp DESC`
            );

            res.json({
                success: true,
                data: result.rows,
                total: result.rows.length
            });
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
