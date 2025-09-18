# Rumahs Waitlist & Email System

A complete waitlist landing page with email confirmation system for Rumahs - connecting digital nomads to share beautiful homes and plan remote adventures together.

## 🚀 Features

- **Beautiful Landing Page** - Clean, responsive design with Rumahs branding
- **Waitlist Signup** - Email + Facebook profile collection with validation
- **Email Confirmation** - Automatic welcome emails sent via Microsoft 365
- **Admin Dashboard** - View, export, and manage waitlist entries
- **Safe Entry Management** - Tools to safely delete test entries without affecting real signups
- **Popup Success Messages** - Clean white popup with blue text for better visibility
- **Email Deliverability** - Proper headers and settings to avoid spam folders

## 📁 Project Structure

```
Rumahs-teaser/
├── index.html              # Main landing page
├── about.html              # About page with mission and details
├── styles.css              # All styling for the site
├── script.js               # Frontend JavaScript for form handling
├── server.js               # Express server with all API endpoints
├── api/
│   ├── emailService.js     # Email sending functionality
│   ├── waitlist.js         # Waitlist API endpoints (legacy)
│   ├── auth.js            # Authentication for admin
│   └── stats.js           # Statistics endpoints
├── clear-test.js          # Quick script to clear test entries
├── env.example            # Environment variables template
└── README.md              # This file
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the environment template and configure your settings:
```bash
cp env.example .env
```

Edit `.env` with your actual values:
```env
# Database (get from your hosting provider)
POSTGRES_URL=postgresql://username:password@host:5432/database

# Email Settings (Microsoft 365)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=25
EMAIL_USER=info@rumahs.com
EMAIL_PASS=your-email-password
EMAIL_FROM_NAME=Rumahs Team
EMAIL_FROM_ADDRESS=info@rumahs.com

# Admin Settings
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your-generated-hash
```

### 3. Start the Server
```bash
node server.js
```

The server will run on `http://localhost:3000`

## 📧 Email System

### Email Configuration (Microsoft 365)
The system is configured to work with Microsoft 365 through GoDaddy hosting:

- **SMTP Server**: `smtp.office365.com`
- **Port**: `25` (or `587` as alternative)
- **Authentication**: Regular email password (not app password)

### Email Features
- **Welcome emails** sent automatically after successful waitlist signup
- **Professional formatting** with Rumahs branding
- **Spam prevention** with proper headers and deliverability settings
- **Both HTML and plain text** versions for compatibility

### Improving Email Deliverability
To prevent emails from going to spam, add these DNS records to your domain:

**SPF Record:**
- Type: `TXT`
- Name: `@` (or leave blank)
- Value: `v=spf1 include:spf.protection.outlook.com ~all`

**DMARC Record:**
- Type: `TXT`
- Name: `_dmarc`
- Value: `v=DMARC1; p=quarantine; rua=mailto:info@rumahs.com`

## 🗄️ Database Schema

The waitlist uses a PostgreSQL database with this structure:

```sql
CREATE TABLE waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    facebook TEXT,
    willing_to_pay BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'incomplete',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);
```

## 🔧 API Endpoints

### Public Endpoints
- `POST /api/waitlist` - Submit waitlist entry
- `GET /api/waitlist` - Get all entries (admin use)
- `GET /api/waitlist/stats` - Get signup statistics
- `GET /api/waitlist/export` - Export entries as CSV

### Admin Endpoints
- `DELETE /api/waitlist/clear-test` - Safely delete test entries (requires confirmation)

## 🧹 Managing Test Entries

### Quick Method (Recommended)
```bash
node clear-test.js
```

This will safely delete obvious test entries like:
- `nicolesewell@outlook.com`
- Emails containing `test@`, `@test`, or `example@`

### Advanced Method (API Calls)
You can also make direct API calls for more control:

**Delete test emails:**
```bash
curl -X DELETE http://localhost:3000/api/waitlist/clear-test \
  -H "Content-Type: application/json" \
  -d '{"confirmationCode": "CLEAR_TEST_ENTRIES_2025", "pattern": "test_emails"}'
```

**Delete today's entries only:**
```bash
curl -X DELETE http://localhost:3000/api/waitlist/clear-test \
  -H "Content-Type: application/json" \
  -d '{"confirmationCode": "CLEAR_TEST_ENTRIES_2025", "pattern": "today_only"}'
```

### Safety Features
- **Confirmation code required** - prevents accidental deletion
- **Entry limit protection** - won't delete more than 20 entries at once
- **Audit logging** - all deletions are logged to console
- **Returns deleted entries** - so you can verify what was removed

## 🎨 Styling & Design

### Color Scheme
- **Primary Blue**: `#1e40af`
- **Light Blue**: `#f0f9ff`
- **Secondary Blue**: `#e0f2fe`
- **Text Gray**: `#4a5568`
- **Light Gray**: `#64748b`

### Typography
- **Headers**: Space Grotesk font family
- **Body Text**: Outfit font family
- **Consistent sizing** throughout for better visual hierarchy

### Responsive Design
- **Mobile-first approach** with responsive breakpoints
- **Clean, minimal design** focusing on the core message
- **Accessible** with proper contrast and font sizes

## 🔒 Security Features

### Rate Limiting
- **5 requests per 15 minutes** per IP address to prevent spam
- **Automatic IP blocking** for excessive requests

### Data Validation
- **Email format validation** on both frontend and backend
- **Facebook URL validation** with automatic normalization
- **SQL injection protection** using parameterized queries

### Admin Protection
- **Confirmation codes** required for dangerous operations
- **Entry limits** to prevent accidental mass deletion
- **Audit logging** for all admin actions

## 📊 Analytics & Monitoring

### Built-in Statistics
- **Total signups** and unique visitors
- **Daily signup tracking** with date breakdowns
- **Conversion metrics** (willing to pay percentage)
- **Geographic data** via IP address logging

### Export Capabilities
- **CSV export** of all waitlist data
- **Timestamp tracking** for signup analysis
- **User agent logging** for device/browser insights

## 🚀 Deployment

### Environment Variables
Make sure these are set in production:
- `NODE_ENV=production`
- `POSTGRES_URL` - Your production database URL
- All email settings with real credentials

### Security Considerations
- **Never commit `.env` files** (already in .gitignore)
- **Use strong admin passwords** and hash them properly
- **Enable HTTPS** in production
- **Set up proper DNS records** for email deliverability

## 🐛 Troubleshooting

### Email Issues
**Emails going to spam:**
1. Add SPF and DMARC DNS records (see Email System section)
2. Check that Microsoft 365 SMTP authentication is enabled
3. Verify email credentials are correct

**SMTP Authentication Errors:**
1. Ensure SMTP authentication is enabled in Microsoft 365 admin center
2. Try alternative ports (587 instead of 25)
3. Check with GoDaddy support for Microsoft 365 settings

### Database Issues
**Connection errors:**
1. Verify `POSTGRES_URL` is correct in `.env`
2. Check database server is running and accessible
3. Ensure SSL settings match your database requirements

### Server Issues
**Port conflicts:**
1. Check if port 3000 is already in use
2. Set `PORT` environment variable to use different port
3. Kill existing Node.js processes if needed

## 📝 Development Notes

### Code Style
- **ES6+ JavaScript** with async/await patterns
- **Modular design** with separate files for different concerns
- **Comprehensive error handling** with user-friendly messages
- **Detailed logging** for debugging and monitoring

### Testing
- **Manual testing scripts** included for email functionality
- **Safe test data cleanup** tools to avoid affecting real data
- **Preview functionality** to see emails before sending

## 🤝 Contributing

When making changes:
1. **Test thoroughly** with the preview and test scripts
2. **Update documentation** if adding new features
3. **Follow existing code style** and patterns
4. **Test email functionality** with real email addresses

## 📞 Support

For issues with:
- **Email delivery**: Contact GoDaddy support for Microsoft 365 settings
- **Database**: Check with your hosting provider
- **DNS records**: Use your domain registrar's DNS management

---

**Built with ❤️ for the digital nomad community**

*Last updated: September 2025*
