# PostgreSQL Database Setup Guide

## 🗄️ Step 1: Create Neon PostgreSQL Database

### Why Neon?
- **Free tier**: 500MB storage, 1 database
- **Serverless**: Perfect for Vercel deployment
- **Fast**: No cold starts like other providers
- **Modern**: Built for web applications

### Create Your Database:

1. **Visit:** https://neon.tech
2. **Sign Up** with GitHub (recommended)
3. **Create New Project:**
   - Project Name: `flight-booking-db`
   - Database Name: `flightbooking`
   - Region: Choose closest to your users (US East recommended)

4. **Copy Connection String** - It will look like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/flightbooking?sslmode=require
   ```

## 🔧 Step 2: Update Local Environment

After getting your connection string, update your local `.env` file:

```bash
# Replace with your actual Neon connection string
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/flightbooking?sslmode=require"

# Your existing JWT secret (generate a secure one if you don't have it)
JWT_SECRET="your-super-secure-jwt-secret-here"
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 Step 3: Setup Database Schema

Run these commands in your project directory:

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Push schema to your Neon database
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## ✅ Step 4: Test Locally

Start your development server:
```bash
npm run dev
```

Test authentication:
- Go to http://localhost:3000/register
- Create a new account
- Try logging in at http://localhost:3000/login
- Check that user data persists in your Neon dashboard

## 🌐 Step 5: Deploy to Vercel

### Set Environment Variables on Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
DATABASE_URL = postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/flightbooking?sslmode=require
JWT_SECRET = your-super-secure-jwt-secret-here
```

### Deploy:
```bash
git add .
git commit -m "Setup PostgreSQL database with Neon"
git push origin main
```

Vercel will automatically deploy with your database connected!

## 🧪 Step 6: Test Live Site

After deployment:
1. Visit your live site
2. Test user registration
3. Test login/logout
4. Verify users persist (check Neon dashboard)
5. Test protected routes

## 📊 Database Management

### Neon Dashboard Features:
- **Tables**: View and edit data directly
- **Queries**: Run SQL queries
- **Metrics**: Monitor database usage
- **Branches**: Database branching for development

### Useful Commands:
```bash
# View database in browser
npx prisma studio

# Reset database (careful!)
npx prisma db push --force-reset

# Generate new Prisma client after schema changes
npx prisma generate

# View database connection info
npx prisma db pull
```

## 🔒 Security Best Practices

1. **Environment Variables:**
   - Never commit DATABASE_URL to git
   - Use strong JWT_SECRET (32+ random characters)
   - Different secrets for dev/production

2. **Database Security:**
   - Neon uses SSL by default (`sslmode=require`)
   - Database credentials are auto-generated and secure
   - Enable IP restrictions in Neon if needed

3. **Application Security:**
   - All passwords are bcrypt hashed
   - JWT tokens expire in 7 days
   - User input is validated and sanitized

## 🐛 Troubleshooting

### Common Issues:

**1. "Can't reach database server"**
- Check your DATABASE_URL is correct
- Ensure your internet connection is stable
- Verify Neon database is active

**2. "Prisma Client not found"**
- Run `npx prisma generate`
- Restart your development server

**3. "Table doesn't exist"**
- Run `npx prisma db push`
- Check your schema.prisma file

**4. "Environment variable not found"**
- Check .env file exists and has DATABASE_URL
- Restart development server after changing .env

### Getting Help:
- Neon Discord: https://discord.gg/neon
- Prisma Discord: https://discord.gg/prisma
- Check Neon dashboard for database status

## 🎉 Success!

Your flight booking website now has:
- ✅ Real PostgreSQL database
- ✅ Secure user authentication
- ✅ Persistent user data
- ✅ Production-ready deployment
- ✅ Scalable architecture

Users can now sign up, log in, and their data will be safely stored in your PostgreSQL database!