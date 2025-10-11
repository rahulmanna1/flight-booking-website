# 🚀 Deploy Your Flight Booking Website NOW!

## Quick 5-Minute Deployment

Your code is ready! Follow these simple steps to go live:

---

## ⚡ Option 1: Automated Script (Easiest)

```bash
./deploy.sh
```

The script will:
1. ✅ Ask for your GitHub username
2. ✅ Ask for repository name  
3. ✅ Push code to GitHub
4. ✅ Show you next steps for Vercel

---

## 🛠️ Option 2: Manual Steps

### Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `flight-booking-website`
3. Description: "Modern flight booking platform with Amadeus API"
4. Select **Private** (recommended)
5. **DO NOT** check any boxes (README, .gitignore, license)
6. Click **"Create repository"**

### Step 2: Push to GitHub

```bash
# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/flight-booking-website.git

# Push code
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy to Vercel

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your `flight-booking-website` repository
4. Click **"Import"**

### Step 4: Add Environment Variables

In Vercel deployment settings, add these:

```bash
AMADEUS_CLIENT_ID=your-amadeus-api-key
AMADEUS_CLIENT_SECRET=your-amadeus-api-secret
AMADEUS_ENVIRONMENT=test
NEXTAUTH_SECRET=your-random-32-char-secret
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=your-neon-postgres-connection-string
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 5: Deploy

Click **"Deploy"** and wait 2-3 minutes!

---

## 🔑 Getting Your Credentials

### Amadeus API
1. Go to https://developers.amadeus.com/register
2. Create free account
3. Create new app (Self-Service)
4. Copy API Key → `AMADEUS_CLIENT_ID`
5. Copy API Secret → `AMADEUS_CLIENT_SECRET`

### Neon PostgreSQL (Database)
1. Go to https://neon.tech/
2. Create free account
3. Create new project
4. Copy connection string → `DATABASE_URL`

---

## ✅ Deployment Checklist

After deployment:

- [ ] Visit your Vercel URL
- [ ] Test homepage loads
- [ ] Search for airports (try "New York")
- [ ] Search for flights (JFK to LAX)
- [ ] Check all features work
- [ ] Test on mobile device
- [ ] Share with friends! 🎉

---

## 🆘 Common Issues

### "Authentication failed" when pushing to GitHub

**Solution:** Set up GitHub authentication

```bash
# Option 1: Using GitHub CLI
gh auth login

# Option 2: Using SSH keys (if you have them)
git remote set-url origin git@github.com:YOUR_USERNAME/flight-booking-website.git
```

### Vercel build fails

**Solution:** Check environment variables

1. Make sure all required variables are set
2. Verify Amadeus credentials are correct
3. Test locally: `npm run build`

### "Amadeus API not working" in production

**Solution:** Check your credentials

1. Run test script: `node scripts/test-amadeus.js`
2. Make sure using valid credentials
3. Check you're not using placeholder values

---

## 📊 After Going Live

### Monitor Your Site
- Vercel Dashboard: https://vercel.com/dashboard
- Check analytics and performance
- Monitor API usage at Amadeus dashboard

### Share Your Site
Your site will be at: `https://your-project.vercel.app`

You can add a custom domain in Vercel settings!

---

## 🎯 Current Status

✅ **Code:** All 5 Amadeus features implemented  
✅ **Git:** Repository initialized and committed  
✅ **Ready:** Just needs to be pushed to GitHub!

---

## 📚 Full Documentation

For detailed instructions:
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Feature Documentation:** `IMPLEMENTATION_COMPLETE.md`
- **API Setup:** `AMADEUS_SETUP.md`
- **Troubleshooting:** `AMADEUS_FIX_SUMMARY.md`

---

## 🚀 Let's Deploy!

**Quick command:**
```bash
./deploy.sh
```

**Or manual:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/flight-booking-website.git
git push -u origin main
```

Then go to **https://vercel.com/new** and import your repo!

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions.

**🎊 You're just minutes away from going live!**
