const crypto = require('crypto');

// Simple in-memory session store (for production, use Redis or database)
const sessions = new Map();

// Generate secure session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Hash password securely
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Admin credentials (in production, store hashed in database)
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    // Default password: 'admin123' - CHANGE THIS!
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '3b134b2c3fb13e86d0ad85ef521fac558477a9f33c39609681756fab8e9a896370c317971d1ef3f7ad30a06b2dcf611922cba51d27b7a23eddc0069fcc44da0f',
    salt: process.env.ADMIN_PASSWORD_SALT || 'rumahs-admin-salt-2025'
};

// Rate limiting for login attempts
const loginAttempts = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;
    
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, []);
    }
    
    const attempts = loginAttempts.get(ip);
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
        return false;
    }
    
    validAttempts.push(now);
    loginAttempts.set(ip, validAttempts);
    return true;
}

function isValidSession(sessionToken) {
    if (!sessionToken) return false;
    
    const session = sessions.get(sessionToken);
    if (!session) return false;
    
    // Check if session expired (24 hours)
    const now = Date.now();
    if (now > session.expiresAt) {
        sessions.delete(sessionToken);
        return false;
    }
    
    // Extend session
    session.expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours
    return true;
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (req.method === 'POST') {
        // Login endpoint
        const { username, password, action } = req.body;

        if (action === 'login') {
            // Rate limiting
            if (!checkRateLimit(ipAddress)) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many login attempts. Please try again later.'
                });
            }

            // Validate credentials
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }

            // Check credentials
            const inputPasswordHash = hashPassword(password, ADMIN_CREDENTIALS.salt);
            
            if (username !== ADMIN_CREDENTIALS.username || inputPasswordHash !== ADMIN_CREDENTIALS.passwordHash) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            // Create session
            const sessionToken = generateSessionToken();
            const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
            
            sessions.set(sessionToken, {
                username: username,
                createdAt: Date.now(),
                expiresAt: expiresAt,
                ipAddress: ipAddress
            });

            // Set secure cookie
            res.setHeader('Set-Cookie', [
                `admin_session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`,
            ]);

            return res.json({
                success: true,
                message: 'Login successful',
                sessionToken: sessionToken // Also return for localStorage backup
            });
        }

        if (action === 'logout') {
            // Logout endpoint
            const sessionToken = req.cookies?.admin_session || req.headers.authorization?.replace('Bearer ', '');
            
            if (sessionToken) {
                sessions.delete(sessionToken);
            }

            // Clear cookie
            res.setHeader('Set-Cookie', [
                'admin_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
            ]);

            return res.json({
                success: true,
                message: 'Logout successful'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid action'
        });
    }

    if (req.method === 'GET') {
        // Check session validity
        const sessionToken = req.cookies?.admin_session || req.headers.authorization?.replace('Bearer ', '');
        
        if (isValidSession(sessionToken)) {
            const session = sessions.get(sessionToken);
            return res.json({
                success: true,
                authenticated: true,
                username: session.username
            });
        }

        return res.json({
            success: true,
            authenticated: false
        });
    }

    res.status(405).json({ message: 'Method not allowed' });
}
