const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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
const db = new sqlite3.Database('./waitlist.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create waitlist table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    facebook TEXT NOT NULL,
    willing_to_pay BOOLEAN DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
)`);

// API Routes

// Submit waitlist entry
app.post('/api/waitlist', limiter, (req, res) => {
    const { email, facebook, willingToPay } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Validation
    if (!email || !facebook) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email and Facebook profile are required' 
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please enter a valid email address' 
        });
    }

    if (!isValidFacebookUrl(facebook)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please enter a valid Facebook profile URL' 
        });
    }

    // Insert into database
    const sql = `INSERT INTO waitlist (email, facebook, willing_to_pay, ip_address, user_agent) 
                  VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [email, facebook, willingToPay ? 1 : 0, ipAddress, userAgent], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
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
        }

        res.json({ 
            success: true, 
            message: 'Successfully joined the waitlist!',
            id: this.lastID
        });
    });
});

// Get all waitlist entries (for admin use)
app.get('/api/waitlist', (req, res) => {
    const sql = `SELECT id, email, facebook, willing_to_pay, timestamp, ip_address, user_agent 
                  FROM waitlist 
                  ORDER BY timestamp DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }
        
        res.json({ 
            success: true, 
            data: rows,
            total: rows.length
        });
    });
});

// Get waitlist statistics
app.get('/api/waitlist/stats', (req, res) => {
    const sql = `SELECT 
                    COUNT(*) as total,
                    COUNT(DISTINCT ip_address) as unique_ips,
                    DATE(timestamp) as signup_date
                  FROM waitlist 
                  GROUP BY DATE(timestamp)
                  ORDER BY signup_date DESC
                  LIMIT 30`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }
        
        res.json({ 
            success: true, 
            data: rows
        });
    });
});

// Export waitlist as CSV
app.get('/api/waitlist/export', (req, res) => {
    const sql = `SELECT email, facebook, willing_to_pay, timestamp, ip_address 
                  FROM waitlist 
                  ORDER BY timestamp DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }
        
        // Convert to CSV
        const csvHeader = 'Email,Facebook Profile,Willing to Pay,Timestamp,IP Address\n';
        const csvRows = rows.map(row => 
            `"${row.email}","${row.facebook}","${row.willing_to_pay ? 'Yes' : 'No'}","${row.timestamp}","${row.ip_address}"`
        ).join('\n');
        const csv = csvHeader + csvRows;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="waitlist-export.csv"');
        res.send(csv);
    });
});

// Helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidFacebookUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('facebook.com') || 
               urlObj.hostname.includes('fb.com');
    } catch {
        return false;
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin API available at http://localhost:${PORT}/api/waitlist`);
    console.log(`📥 Export available at http://localhost:${PORT}/api/waitlist/export`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
