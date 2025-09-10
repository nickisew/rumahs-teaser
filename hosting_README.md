# Rumahs - Digital Nomad Community Platform

A beautiful, mystical landing page for connecting digital nomads worldwide.

## 🌟 What is Rumahs?

Rumahs connects digital nomads who want to share beautiful homes and find their next remote adventure together. It's where wanderers find their tribe.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access your site
# Landing Page: http://localhost:3000
# Admin Dashboard: http://localhost:3000/admin.html
```

## 🌐 Deploying to Your GoDaddy Domain

### Option 1: GoDaddy Web Hosting (Easiest)

1. **Prepare Files**:
   - Copy all files to a folder
   - Include: index.html, about.html, admin.html, styles.css, script.js, server.js, package.json, GrupoTeaser_1.jpg

2. **Upload to GoDaddy**:
   - Log into GoDaddy → My Products → Web Hosting
   - Click "Manage" → "cPanel" → "File Manager"
   - Upload files to `public_html` folder

3. **Configure Domain**:
   
   **Step 3a: Get Your Hosting IP Address**
   - In GoDaddy cPanel, look for "Server Information" or "Account Details"
   - Find your "Shared IP Address" (looks like: 192.168.1.100)
   - Write this down - you'll need it for DNS setup
   
   **Step 3b: Update DNS Records**
   - Go to GoDaddy → "My Products" → "Domains"
   - Click "Manage" next to your domain name
   - Click "DNS" tab
   
   **Why you need to edit the A record:**
   - When you first buy a domain, GoDaddy points it to their "parking page" (a placeholder)
   - This A record currently points to GoDaddy's servers (not your website)
   - You need to change it to point to YOUR hosting server instead
   - This tells the internet "when someone visits yourdomain.com, send them to MY server"
   
   **Edit the existing A record:**
   - Look for an A record with **Name**: @ (this controls yourdomain.com)
   - Click "Edit" on that record
   - Change the **Value** from GoDaddy's IP to your hosting IP (from Step 3a)
   - Keep everything else the same
   - Click "Save"
   
   **If no A record exists:**
   - Click "Add" and create a new A record:
     - **Type**: A
     - **Name**: @ (this means your main domain)
     - **Value**: Your hosting IP address (from Step 3a)
     - **TTL**: 600 (or leave default)
   - Also create a CNAME record:
     - **Type**: CNAME  
     - **Name**: www
     - **Value**: yourdomain.com (your actual domain)
     - **TTL**: 600
   
   **Step 3c: Wait for DNS Propagation**
   - DNS changes take 24-48 hours to fully propagate worldwide
   - You can check status at: whatsmydns.net
   - Enter your domain and select "A" record to see global status
   - Some areas may see changes in minutes, others take hours
   
   **Step 3d: Test Your Domain**
   - Once DNS propagates, visit yourdomain.com
   - You should see your Rumahs landing page
   - If you see a GoDaddy parking page, DNS isn't ready yet

### Option 2: Vercel (Recommended)

**Why Vercel is Recommended for Rumahs:**

✅ **Perfect for Node.js Apps**: Vercel is built specifically for modern web applications like yours
✅ **Automatic SSL**: Free SSL certificates that auto-renew (no manual setup needed)
   - SSL = Secure Sockets Layer - it's the "s" in "https://"
   - Makes your site secure and trusted by browsers
   - Required for forms, payments, and professional websites
   - Without SSL: browsers show "Not Secure" warnings
   - With SSL: browsers show a lock icon and "Secure"
✅ **Global CDN**: Your site loads fast worldwide (important for digital nomads!)
✅ **Easy Domain Connection**: Simple DNS setup with clear instructions
✅ **Automatic Deployments**: Push code to GitHub → site updates automatically
   - Connect your code to GitHub (free code storage)
   - Every time you push changes to GitHub, Vercel automatically updates your live site
   - No need to manually upload files or restart servers
   - Perfect for digital nomads: update your site from anywhere in the world
   - Example workflow: Edit code → Push to GitHub → Site updates in 2-3 minutes
✅ **Free Tier**: Generous free plan (perfect for getting started)
✅ **Built-in Analytics**: See visitor stats without extra setup
✅ **Environment Variables**: Easy to manage API keys and settings
✅ **No Server Management**: Focus on your app, not server maintenance
✅ **Instant Rollbacks**: If something breaks, revert to previous version instantly

**Perfect for Digital Nomads:**
- Deploy from anywhere in the world
- No need to manage servers while traveling
- Global performance means fast loading everywhere
- Easy to update your site from any location

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel
# Follow prompts to connect your GoDaddy domain
```

3. **Connect Domain**:
   - In Vercel dashboard, go to your project → Settings → Domains
   - Click "Add Domain" and enter yourdomain.com
   - Vercel will show you specific DNS records to add in GoDaddy
   - **Important**: The exact values will be different for your domain
   - Vercel will give you something like:
     - **CNAME Record**: 
       - Name: www
       - Value: cname.vercel-dns.com (this is the actual value)
     - **A Record**:
       - Name: @ (this means your main domain)
       - Value: 76.76.19.61 (this is Vercel's actual IP)
   - **Note**: "www" and "@" are the standard names, but the values are what Vercel provides
   - Go to GoDaddy → My Products → Domains → Manage → DNS
   - Add these exact records (delete any existing A records first)
   - Wait 24-48 hours for DNS propagation

## 🔧 Production Setup

### Environment Variables
Create `.env` file:

**For Local Development (in Cursor):**
1. **In Cursor terminal** or **file explorer**:
   - Create a new file called `.env` (with the dot at the beginning)
   - Add these lines:
```
NODE_ENV=production
PORT=3000
DOMAIN=yourdomain.com
```
**For Vercel Deployment:**
1. **In Vercel dashboard**:
   - Go to your project → Settings → Environment Variables
   - Add each variable:
     - Name: `NODE_ENV`, Value: `production`
     - Name: `PORT`, Value: `3000`
     - Name: `DOMAIN`, Value: `yourdomain.com`

**For GoDaddy Hosting:**
1. **In cPanel**:
   - Look for "Environment Variables" or "PHP Variables"
   - Add the same variables as above

### Database

**Current Setup (SQLite):**
- **What it is**: A simple file-based database (like an Excel file)
- **Location**: `waitlist.db` file in your project folder
- **Pros**: Easy to set up, no server needed, perfect for testing
- **Cons**: Not suitable for production, can't handle many users
- **Best for**: Development and small-scale testing

**Production Database Options:**

**Option 1: Vercel Postgres (Recommended for Vercel)**
- **Cost**: Free tier available, then $20/month
- **Setup**: Built into Vercel, easy to connect
- **Pros**: Automatic backups, scaling, secure
- **How to set up**:
  1. In Vercel dashboard → Storage → Create Database
  2. Choose "Postgres"
  3. Get connection string
  4. Update your `server.js` to use Postgres instead of SQLite

**Option 2: PlanetScale (MySQL)**
- **Cost**: Free tier available
- **Setup**: Create account, get connection string
- **Pros**: Serverless MySQL, easy scaling
- **Good for**: If you prefer MySQL over Postgres

**Option 3: Supabase (PostgreSQL)**
- **Cost**: Free tier available
- **Setup**: Create project, get connection string
- **Pros**: Full database with admin interface
- **Good for**: If you want a database dashboard

**Database Migration (Moving from SQLite to Production):**
1. **Export your data** from SQLite:
   ```bash
   # This creates a backup of your current data
   cp waitlist.db waitlist_backup.db
   ```

2. **Update server.js** to use production database:
   ```javascript
   // Replace SQLite with your chosen database
   const { Pool } = require('pg'); // For PostgreSQL
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });
   ```

3. **Import your data** to the new database (if needed)

**Backup Strategy:**
- **Daily**: Automated backups (most hosting providers do this)
- **Weekly**: Export your data manually
- **Before updates**: Always backup before making changes
- **Multiple locations**: Keep backups in different places (cloud + local)

**Why Upgrade from SQLite:**
- **Scalability**: Handle thousands of users
- **Reliability**: Won't lose data if server crashes
- **Performance**: Faster queries with many users
- **Security**: Better data protection
- **Backups**: Automatic, reliable backups

### SSL Certificate
- GoDaddy: Usually included with hosting
- Vercel: Automatic SSL
- Let's Encrypt: Free option

## 📊 Analytics Setup

### Google Analytics
Add to index.html:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 📧 Email Notifications

### SendGrid Setup
1. Create SendGrid account
2. Get API key
3. Add to server.js:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

## 🎯 SEO Optimization

Add meta tags to index.html:
```html
<meta name="description" content="Connect with digital nomads worldwide. Find beautiful homes and your next remote adventure together.">
<meta property="og:title" content="Rumahs - Where Wanderers Find Their Tribe">
<meta property="og:image" content="https://yourdomain.com/GrupoTeaser_1.jpg">
```

## 🔒 Security

Your site includes:
- Rate limiting (5 attempts per 15 minutes)
- Input validation
- Security headers
- CORS protection

## 📱 Mobile Ready

- Responsive design
- Touch-friendly buttons
- Mobile-optimized forms
- Fast loading

## 🆘 Troubleshooting

### Common Issues:
1. **Domain not loading**: Check DNS propagation (24-48 hours)
2. **Forms not working**: Check server.js is running
3. **Database errors**: Verify file permissions

### Support:
- GoDaddy: 24/7 phone support
- Vercel: Comprehensive docs
- This README and BACKEND_README.md

## 🎉 Launch Checklist

- [ ] Domain pointing correctly
- [ ] SSL certificate active
- [ ] Forms working
- [ ] Admin dashboard accessible
- [ ] Analytics tracking
- [ ] Email notifications
- [ ] Mobile tested
- [ ] Backup configured

## 📞 Getting Help

- Check this README
- Review BACKEND_README.md
- Contact hosting provider
- Digital nomad communities

---

**Your Rumahs platform is ready to connect wanderers worldwide! 🌍✨**