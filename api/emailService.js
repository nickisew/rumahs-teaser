const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
function createTransporter() {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Send welcome email to new waitlist member
async function sendWelcomeEmail(userEmail, userName = '') {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email service not configured - skipping email send');
        return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const displayName = userName || userEmail.split('@')[0];
    const fromName = process.env.EMAIL_FROM_NAME || 'Rumahs Team';
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
    
    const mailOptions = {
        from: `"${fromName}" <${fromAddress}>`,
        to: userEmail,
        subject: 'Welcome to the Rumahs Waitlist!',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Rumahs!</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #e0f2fe 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h1 style="color: #1e40af; font-size: 2.5rem; margin-bottom: 10px; font-weight: 300;">Rumahs</h1>
                <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 30px;">Want to see the world with cool people you don't know yet?</p>
            </div>
            
            <div style="padding: 30px 0;">
                <h2 style="color: #1e40af; font-size: 1.8rem; margin-bottom: 20px;">Welcome to the adventure, ${displayName}! 🎉</h2>
                
                <p style="font-size: 1.1rem; margin-bottom: 20px;">
                    Thank you for joining the Rumahs waitlist! We're excited to have you on board as we prepare to launch something special.
                </p>
                
                <div style="background: #f0f9ff; border: 2px solid #1e40af; padding: 25px; margin: 25px 0; border-radius: 5px;">
                    <h3 style="color: #1e40af; margin-bottom: 15px;">What's Next?</h3>
                    <ul style="text-align: left; padding-left: 20px;">
                        <li style="margin-bottom: 10px;">We'll keep you updated on our progress</li>
                        <li style="margin-bottom: 10px;">You'll be among the first to know when we launch</li>
                        <li style="margin-bottom: 10px;">Early access to exclusive features and destinations</li>
                    </ul>
                </div>
                
                <p style="font-size: 1.1rem; margin-bottom: 20px;">
                    We're building a community where digital nomads can discover amazing homes and connect with like-minded travelers. Your journey to finding the perfect remote work destinations starts here!
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #64748b; font-style: italic;">
                        "Meet nomads who want to share beautiful homes and plan your next remote adventure together."
                    </p>
                </div>
                
                <p style="font-size: 1rem; color: #64748b;">
                    Stay tuned for updates, and thank you for being part of the Rumahs community!
                </p>
                
                <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                    <p style="color: #64748b; font-size: 0.9rem;">
                        Best regards,<br>
                        <strong style="color: #1e40af;">The Rumahs Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `,
        text: `
Welcome to Rumahs, ${displayName}!

Thank you for joining our waitlist! We're excited to have you on board as we prepare to launch something special.

What's Next?
• We'll keep you updated on our progress
• You'll be among the first to know when we launch  
• Early access to exclusive features and destinations

We're building a community where digital nomads can discover amazing homes and connect with like-minded travelers. Your journey to finding the perfect remote work destinations starts here!

"Meet nomads who want to share beautiful homes and plan your next remote adventure together."

Stay tuned for updates, and thank you for being part of the Rumahs community!

Best regards,
The Rumahs Team
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully:', info.messageId);
        return { 
            success: true, 
            messageId: info.messageId,
            message: 'Welcome email sent successfully'
        };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { 
            success: false, 
            error: error.message,
            message: 'Failed to send welcome email'
        };
    }
}

// Test email configuration
async function testEmailConfig() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return { success: false, message: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    try {
        await transporter.verify();
        return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
        console.error('Email configuration test failed:', error);
        return { success: false, message: 'Email configuration is invalid', error: error.message };
    }
}

module.exports = {
    sendWelcomeEmail,
    testEmailConfig
};
