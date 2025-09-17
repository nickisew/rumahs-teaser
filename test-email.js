// Quick test script to send yourself a sample email
require('dotenv').config();
const { sendWelcomeEmail } = require('./api/emailService');

async function testEmail() {
    console.log('Testing email send to nicolesewell@outlook.com...');
    
    try {
        const result = await sendWelcomeEmail('nicolesewell@outlook.com', 'Nicole');
        console.log('Email test result:', result);
        
        if (result.success) {
            console.log('✅ Test email sent successfully!');
            console.log('Check your inbox at nicolesewell@outlook.com');
        } else {
            console.log('❌ Email failed to send:', result.message);
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nMake sure you have:');
        console.log('1. Created a .env file with your email credentials');
        console.log('2. Set up Gmail App Password (if using Gmail)');
        console.log('3. All required environment variables configured');
    }
}

testEmail();
