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
        // Get waitlist statistics (daily breakdown)
        const result = await pool.query(`
            SELECT 
                COUNT(*)::int as total,
                COUNT(DISTINCT ip_address)::int as unique_ips,
                DATE(timestamp AT TIME ZONE 'UTC') as signup_date,
                COUNT(*)::int as daily_signups
            FROM waitlist 
            GROUP BY DATE(timestamp AT TIME ZONE 'UTC')
            ORDER BY signup_date DESC
            LIMIT 30
        `);

        // Also get overall stats
        const overallStats = await pool.query(`
            SELECT 
                COUNT(*)::int as total_signups,
                COUNT(DISTINCT ip_address)::int as unique_visitors,
                COUNT(CASE WHEN willing_to_pay = true THEN 1 END)::int as willing_to_pay_count
            FROM waitlist
        `);

        // Get today's stats (using UTC date to match timestamp storage)
        const todayStats = await pool.query(`
            SELECT 
                COUNT(*)::int as today_signups
            FROM waitlist 
            WHERE DATE(timestamp AT TIME ZONE 'UTC') = CURRENT_DATE
        `);

        res.json({
            success: true,
            data: {
                daily_stats: result.rows,
                overall: overallStats.rows[0],
                today: todayStats.rows[0]
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
