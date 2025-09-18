// Script to clear entries from LIVE Vercel site
// Use this to manage waitlist entries on your production site

const readline = require('readline');

const LIVE_SITE_URL = 'https://rumahs-teaser-h63exc6n7-nickisews-projects.vercel.app';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to ask user questions
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Function to make API requests to live site
async function apiRequest(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${LIVE_SITE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API Error: ${error.message}`);
        return null;
    }
}

async function clearLiveEntries() {
    console.log('🧹 Live Site Waitlist Cleaner');
    console.log(`Managing entries on: ${LIVE_SITE_URL}\n`);

    try {
        // First, get current entries
        console.log('📡 Fetching current waitlist entries from live site...');
        const response = await apiRequest('/api/waitlist');
        
        if (!response || !response.success) {
            console.error('❌ Failed to fetch waitlist entries from live site.');
            rl.close();
            return;
        }

        const entries = response.data;
        
        if (entries.length === 0) {
            console.log('✅ No entries found in live waitlist. Nothing to clear!');
            rl.close();
            return;
        }

        console.log(`📊 Found ${entries.length} entries on live site:`);
        entries.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.email} - ${entry.status} (${new Date(entry.timestamp).toLocaleString()})`);
        });

        // Show deletion options
        console.log('\n🎯 Deletion Options for LIVE SITE:');
        console.log('1. Delete test email entries (recommended)');
        console.log('2. Delete entries from today only');
        console.log('3. Cancel operation');

        const choice = await askQuestion('\nChoose an option (1-3): ');

        let pattern;
        switch (choice) {
            case '1':
                pattern = 'test_emails';
                break;
            case '2':
                pattern = 'today_only';
                break;
            case '3':
                console.log('Operation cancelled.');
                rl.close();
                return;
            default:
                console.log('Invalid choice. Operation cancelled.');
                rl.close();
                return;
        }

        // Confirm deletion
        const confirm = await askQuestion(`\n⚠️  This will delete entries from your LIVE SITE. Are you sure? (yes/no): `);
        if (confirm.toLowerCase() !== 'yes') {
            console.log('Operation cancelled.');
            rl.close();
            return;
        }

        // Make deletion request
        console.log('🗑️  Deleting entries from live site...');
        const deleteResponse = await apiRequest('/api/waitlist/clear-test', 'DELETE', {
            confirmationCode: 'CLEAR_TEST_ENTRIES_2025',
            pattern: pattern
        });

        if (deleteResponse && deleteResponse.success) {
            console.log(`✅ Successfully deleted ${deleteResponse.count} entries from live site:`);
            deleteResponse.deletedEntries.forEach((entry, index) => {
                console.log(`${index + 1}. ${entry.email} (${new Date(entry.timestamp).toLocaleString()})`);
            });
        } else {
            console.log('❌ Failed to delete entries:', deleteResponse?.message || 'Unknown error');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

// Run the script
clearLiveEntries();
