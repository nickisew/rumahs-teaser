// Simple script to clear test entries using the safe admin API
// Run this with: node clear-test.js

async function clearTestEntries() {
    console.log('🧹 Clearing test entries from waitlist...\n');
    
    try {
        const response = await fetch('http://localhost:3000/api/waitlist/clear-test', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                confirmationCode: 'CLEAR_TEST_ENTRIES_2025',
                pattern: 'test_emails'  // This will delete test emails (but avoid @example.com which are blocked by email servers)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Successfully deleted ${result.count} test entries:`);
            result.deletedEntries.forEach((entry, index) => {
                console.log(`${index + 1}. ${entry.email} (${new Date(entry.timestamp).toLocaleString()})`);
            });
        } else {
            console.log(`❌ Error: ${result.message}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to connect to server:', error.message);
        console.log('\n💡 Make sure your server is running:');
        console.log('   node server.js');
    }
}

// Check if server is running first
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000/api/waitlist');
        if (response.ok) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

// Main execution
async function main() {
    console.log('Checking if server is running...');
    
    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('❌ Server is not running on localhost:3000');
        console.log('Please start your server first:');
        console.log('   node server.js');
        return;
    }
    
    console.log('✅ Server is running\n');
    await clearTestEntries();
}

main();
