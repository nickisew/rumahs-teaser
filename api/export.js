const { Pool } = require('pg');

// Create a connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Export waitlist as CSV
        const result = await pool.query(`
            SELECT email, facebook, willing_to_pay, timestamp, ip_address 
            FROM waitlist 
            ORDER BY timestamp DESC
        `);

        // Convert to CSV
        const csvHeader = 'Email,Facebook Profile,Willing to Pay,Timestamp,IP Address\n';
        const csvRows = result.rows.map(row => 
            `"${row.email}","${row.facebook}","${row.willing_to_pay ? 'Yes' : 'No'}","${row.timestamp}","${row.ip_address}"`
        ).join('\n');
        const csv = csvHeader + csvRows;

        // Set CSV headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="waitlist-export.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
