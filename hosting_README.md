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

### Option 2: Vercel + Neon (Recommended - Modern Serverless)

**🎯 Your Rumahs project now uses modern serverless architecture!**

**Why Vercel + Neon is Perfect for Rumahs:**

✅ **Serverless Functions**: Your backend automatically scales from 0 to millions of users
✅ **Neon PostgreSQL**: Cloud database with automatic backups and branching
✅ **Global Performance**: Fast loading worldwide (perfect for digital nomads!)
✅ **Automatic SSL**: Free SSL certificates that auto-renew
✅ **Zero Server Management**: Focus on your app, not infrastructure
✅ **GitHub Integration**: Push code → Automatic deployment
✅ **Built-in Analytics**: Visitor stats and performance monitoring
✅ **Cost Effective**: Pay only for what you use (generous free tiers)

**Perfect for Digital Nomads:**
- Deploy from anywhere in the world
- No servers to maintain while traveling
- Database automatically handles traffic spikes
- Easy updates from any location

### **🚀 Step-by-Step Deployment:**

#### **Step 1: Prepare Your Project**
Your project has been converted to serverless! You now have:
- `api/waitlist.js` - Handles form submissions
- `api/stats.js` - Provides dashboard statistics  
- `api/export.js` - CSV export functionality
- `vercel.json` - Deployment configuration

#### **Step 2: Install Dependencies**
```bash
npm install
```

#### **Step 3: Deploy to Vercel**

**Option A: GitHub Integration (Recommended)**
1. Push your code to GitHub (see GitHub_README.md)
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project" → Import from GitHub
4. Select your repository
5. **Framework Preset**: Select "Other" (not Express)
6. **Root Directory**: Keep as "./"
7. Click "Deploy"

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### **Step 4: Set Up Neon Database**
1. In your Vercel dashboard → Go to your project
2. Click "Storage" tab → "Browse Marketplace"
3. Find "Neon" → Click "Add Integration"
4. **Vercel automatically:**
   - Creates your PostgreSQL database
   - Adds environment variables (`POSTGRES_URL`)
   - Connects everything together

#### **Step 5: Verify Everything Works**
1. Visit your Vercel URL (something like `rumahs-abc123.vercel.app`)
2. Test your waitlist form
3. Check admin dashboard: `your-url/admin.html`
4. Verify CSV export works

#### **Step 6: Connect Your Domain**
1. In Vercel dashboard → Project → Settings → Domains
2. Click "Add Domain" → Enter `yourdomain.com`
3. Vercel will show DNS records to add in GoDaddy:
   
   **Typical Records (your values will be different):**
   - **A Record**: Name: `@`, Value: `76.76.19.61`
   - **CNAME Record**: Name: `www`, Value: `cname.vercel-dns.com`

4. **Add to GoDaddy:**
   - Go to GoDaddy → My Products → Domains → Manage → DNS
   - Delete existing A records (if pointing to parking page)
   - Add the records Vercel provided
   - Wait 24-48 hours for DNS propagation

## 🔧 Production Setup

### Environment Variables

**✅ Automatic Setup with Neon Integration:**
When you add the Neon integration in Vercel, these are automatically configured:
- `POSTGRES_URL` - Your database connection string
- `DATABASE_URL` - Alternative connection string name

**📝 Manual Environment Variables (if needed):**

**For Local Development:**
1. Copy `env.example` to `.env`:
```bash
cp env.example .env
```
2. Get your database URL from Vercel → Project → Settings → Environment Variables
3. Update `.env`:
```
POSTGRES_URL=your_neon_connection_string_from_vercel
NODE_ENV=development
PORT=3000
DOMAIN=yourdomain.com
```

**For Vercel Deployment:**
Environment variables are automatically set when you use the Neon integration. If you need to add custom ones:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add variables like:
   - `NODE_ENV`: `production`
   - `DOMAIN`: `yourdomain.com`

### Database

**✅ Current Setup (Neon PostgreSQL):**
Your project now uses **Neon**, a serverless PostgreSQL platform:

- **What it is**: Cloud PostgreSQL database that scales automatically
- **Location**: Hosted on Neon's cloud infrastructure
- **Pros**: 
  - Serverless (scales to zero when not used)
  - Automatic backups and point-in-time recovery
  - Database branching (like Git for databases)
  - Built-in connection pooling
  - Global availability
- **Cost**: Generous free tier (perfect for getting started)
- **Best for**: Production applications with real users

**🎯 Why Neon is Perfect for Rumahs:**
- **Auto-scaling**: Handles traffic spikes automatically
- **Global Performance**: Fast queries worldwide (great for nomads)
- **Reliability**: 99.95% uptime with automatic failover
- **Developer Friendly**: Easy branching for testing features
- **Cost Effective**: Pay only for storage and compute you use

**🔧 Database Features You Get:**
- **Connection Pooling**: Efficient database connections
- **Read Replicas**: Fast read queries globally
- **Branching**: Create database copies for testing
- **Point-in-time Recovery**: Restore to any moment in time
- **Monitoring**: Built-in performance insights

**🔄 Migration from SQLite (Already Done!):**
Your project has been automatically migrated from SQLite to Neon PostgreSQL:

- **Schema Updated**: Table structure converted to PostgreSQL
- **API Functions**: All routes converted to serverless functions
- **Environment**: Configured for Neon connection
- **Admin Dashboard**: Still works exactly the same!

**📊 Backup & Recovery:**
- **Automatic Backups**: Neon backs up your data continuously
- **Point-in-time Recovery**: Restore to any moment in the last 7 days (free tier)
- **Database Branching**: Create copies for testing
- **Export Options**: Download your data anytime via admin dashboard CSV export

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