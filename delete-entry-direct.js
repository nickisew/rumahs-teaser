// Direct database script to delete specific entry
require('dotenv').config({ path: ['.env.development.local', '.env.local', '.env'] });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function deleteEntry() {
    try {
        console.log('🗑️  Deleting nicolesewell@outlook.com from waitlist...');
        
        // Delete the specific entry
        const result = await pool.query(
            'DELETE FROM waitlist WHERE email = $1 RETURNING email, timestamp',
            ['nicolesewell@outlook.com']
        );
        
        if (result.rows.length > 0) {
            console.log(`✅ Successfully deleted: ${result.rows[0].email}`);
            console.log(`   Timestamp: ${new Date(result.rows[0].timestamp).toLocaleString()}`);
        } else {
            console.log('❌ No entry found with that email address');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

deleteEntry();
