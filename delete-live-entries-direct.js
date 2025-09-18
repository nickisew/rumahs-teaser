// Delete entries from PRODUCTION database (same one Vercel uses)
require('dotenv').config({ path: ['.env.development.local', '.env.local', '.env'] });
const { Pool } = require('pg');

// Use the same connection string that Vercel would use
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Force SSL for production database
});

async function deleteLiveEntries() {
    try {
        console.log('🗑️  Deleting ALL entries from LIVE database...');
        
        // First, show what we're about to delete
        const currentEntries = await pool.query('SELECT email, timestamp FROM waitlist ORDER BY timestamp DESC');
        
        if (currentEntries.rows.length === 0) {
            console.log('✅ Database is already empty!');
            return;
        }
        
        console.log(`📋 Found ${currentEntries.rows.length} entries to delete:`);
        currentEntries.rows.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.email} (${new Date(entry.timestamp).toLocaleString()})`);
        });
        
        // Delete all entries
        const result = await pool.query('DELETE FROM waitlist RETURNING email, timestamp');
        
        console.log(`\n✅ Successfully deleted ${result.rows.length} entries:`);
        result.rows.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.email} (${new Date(entry.timestamp).toLocaleString()})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nThis might mean:');
        console.log('1. Database connection issue');
        console.log('2. Different database being used locally vs production');
        console.log('3. SSL/connection configuration mismatch');
    } finally {
        await pool.end();
    }
}

deleteLiveEntries();
