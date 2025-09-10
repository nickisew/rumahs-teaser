# Rumahs Backend System

A complete backend solution for your waitlist landing page with database storage, admin dashboard, and API endpoints.

## 🚀 **What's New**

### **Backend Features**
- **SQLite Database**: Persistent storage for all waitlist entries
- **Express Server**: Fast, secure API endpoints
- **Admin Dashboard**: Beautiful interface to view and manage signups
- **CSV Export**: Download your waitlist data anytime
- **Rate Limiting**: Prevents spam and abuse
- **Security**: Helmet.js for security headers

### **Data Storage**
- **Email addresses** and **Facebook profiles**
- **Timestamps** for each signup
- **IP addresses** and **user agents** for analytics
- **Duplicate prevention** (one email per person)

## 📋 **Setup Instructions**

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Start the Server**
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### **Step 3: Access Your System**
- **Landing Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin.html
- **API Endpoints**: http://localhost:3000/api/*

## 🔧 **How It Works**

### **Form Submission Flow**
1. User fills out the waitlist form
2. JavaScript sends data to `/api/waitlist` endpoint
3. Server validates and stores data in SQLite database
4. Success/error message shown to user

### **Admin Access**
1. Visit `/admin.html` to see your dashboard
2. View real-time statistics and signup data
3. Export CSV files for further analysis
4. Monitor unique visitors and daily signups

## 📊 **API Endpoints**

### **POST /api/waitlist**
- **Purpose**: Submit new waitlist entry
- **Body**: `{ "email": "...", "facebook": "..." }`
- **Response**: Success/error message with details

### **GET /api/waitlist**
- **Purpose**: Get all waitlist entries
- **Response**: Array of all signups with metadata

### **GET /api/waitlist/stats**
- **Purpose**: Get signup statistics
- **Response**: Daily counts and unique visitor data

### **GET /api/waitlist/export**
- **Purpose**: Download CSV export
- **Response**: CSV file with all waitlist data

## 🛡️ **Security Features**

### **Rate Limiting**
- Maximum 5 signup attempts per IP address per 15 minutes
- Prevents spam and abuse

### **Input Validation**
- Email format validation
- Facebook URL validation
- SQL injection prevention

### **Security Headers**
- Helmet.js for security headers
- CORS protection
- XSS prevention

## 📁 **File Structure**

```
Rumahs/
├── index.html          # Main landing page
├── about.html          # About page
├── admin.html          # Admin dashboard
├── styles.css          # Styling
├── script.js           # Frontend JavaScript
├── server.js           # Express server
├── package.json        # Dependencies
├── waitlist.db         # SQLite database (created automatically)
└── BACKEND_README.md   # This file
```

## 🚀 **Deployment Options**

### **Local Development**
- Perfect for testing and development
- Run with `npm run dev`

### **Production Hosting**
- **Heroku**: Easy deployment with Git
- **Vercel**: Great for static + API
- **DigitalOcean**: Full control over server
- **AWS**: Scalable cloud solution

### **Environment Variables**
```bash
PORT=3000              # Server port
NODE_ENV=production   # Environment mode
```

## 📈 **Monitoring & Analytics**

### **What You Can Track**
- Total signups
- Daily signup trends
- Unique visitors (by IP)
- Geographic distribution (if you add location tracking)

### **Future Enhancements**
- Email notifications for new signups
- Integration with email marketing tools
- A/B testing capabilities
- Advanced analytics dashboard

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### **Database Errors**
```bash
# Remove and recreate database
rm waitlist.db
npm run init-db
```

#### **Permission Issues**
```bash
# Fix file permissions
chmod 755 server.js
chmod 644 *.html *.css *.js
```

### **Logs & Debugging**
- Check console output for error messages
- Database file: `waitlist.db`
- Server logs appear in terminal

## 🎯 **Next Steps**

### **Immediate**
1. Test the system locally
2. Customize admin dashboard if needed
3. Set up email notifications

### **Short Term**
1. Deploy to production hosting
2. Set up custom domain
3. Add analytics tracking

### **Long Term**
1. Scale database for larger datasets
2. Add user authentication
3. Implement advanced features

## 📞 **Support**

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure port 3000 is available
4. Check file permissions

---

**Your waitlist system is now production-ready!** 🎉

The backend will automatically create the database and handle all form submissions securely. You can access your admin dashboard anytime to see who's joining your waitlist.
