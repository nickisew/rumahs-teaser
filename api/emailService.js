const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
function createTransporter() {
    return nodemailer.createTransport({
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
        subject: 'Welcome to Rumahs - Waitlist Confirmation',
        replyTo: fromAddress,
        headers: {
            'X-Mailer': 'Rumahs Waitlist System',
            'X-Priority': '3',
            'List-Unsubscribe': `<mailto:${fromAddress}?subject=Unsubscribe>`,
        },
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
                <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 30px;">Want to see the world with friends you haven't met yet?</p>
            </div>
            
            <div style="padding: 30px 0;">
                <h2 style="color: #1e40af; font-size: 1.3rem; margin-bottom: 20px;">Hey ${displayName}!</h2>
                
                <p style="font-size: 1.1rem; margin-bottom: 20px;">
                    Thanks for joining our waitlist! We're excited that you're interested in what we're building.
                </p>
                
                <p style="font-size: 1.1rem; margin-bottom: 20px;">
                    We know the feeling of traveling solo and wanting to stay somewhere cozier with people you get along with. Staying in hostels and co-working apartments can get old. It's easy to meet people online, but the logistics of actually splitting costs and finding rentals together is the tricky part we're solving. That's why we're building Rumahs.
                </p>
                
                <h3 style="color: #1e40af; font-size: 1.3rem; margin-bottom: 15px;">What happens next?</h3>
                <p style="font-size: 1.1rem; margin-bottom: 15px;">We're working to build something you'll actually want to use (not just another app that sounds good in theory). Here's what you can expect:</p>
                <ul style="text-align: left; padding-left: 20px; font-size: 1.1rem; margin-bottom: 20px;">
                    <li style="margin-bottom: 10px;">Updates on our progress - the real stuff, not just marketing fluff</li>
                    <li style="margin-bottom: 10px;">Early access when we're ready to launch</li>
                    <li style="margin-bottom: 10px;">Maybe an invite to meet other nomads who signed up if we do any events</li>
                </ul>
                
                
                <p style="font-size: 1.1rem; margin-bottom: 20px;">
                    Before we build this, we want to make sure real people would actually use it. If you like the idea but have any concerns about what might deter you, just reply to this email - we genuinely want to build the best version possible.
                </p>
                
                <p style="font-size: 1.1rem; margin-bottom: 20px;">
                    Hope to see you sharing villas and making new friends from all over the world soon :)
                </p>
                
                <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                    <p style="color: #64748b; font-size: 0.9rem;">
                        Talk soon,<br>
                        <strong style="color: #1e40af;">The Rumahs Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `,
        text: `
Hey ${displayName}!

Thanks for joining our waitlist! We're excited that you're interested in what we're building.

We know the feeling of traveling solo and wanting to stay somewhere cozier with people you get along with. Staying in hostels and co-working apartments can get old. It's easy to meet people online, but the logistics of actually splitting costs and finding rentals together is the tricky part we're solving. That's why we're building Rumahs.

What happens next?
We're working to build something you'll actually want to use (not just another app that sounds good in theory). Here's what you can expect:

• Updates on our progress - the real stuff, not just marketing fluff
• Early access when we're ready to launch
• Maybe an invite to meet other nomads who signed up if we do any events

Before we build this, we want to make sure real people would actually use it. If you like the idea but have any concerns about what might deter you, just reply to this email - we genuinely want to build the best version possible.

Hope to see you sharing villas and making new friends from all over the world soon :)

Talk soon,
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
