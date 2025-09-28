# Database Setup for Sydney Techno Analytics

## Option 1: Supabase (Recommended - Free Tier)

1. **Create a Supabase Account**
   - Go to https://supabase.com
   - Sign up for free (no credit card required)
   - Create a new project

2. **Get Your Database URL**
   - In your Supabase dashboard, go to Settings → Database
   - Copy the "Connection string" → "URI"
   - It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

3. **Add to Vercel**
   - Go to your Vercel project: https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add a new variable:
     - Name: `DATABASE_URL`
     - Value: Your Supabase connection string
     - Environment: Production, Preview, Development

## Option 2: Neon (Alternative - Free Tier)

1. **Create a Neon Account**
   - Go to https://neon.tech
   - Sign up for free
   - Create a new project

2. **Get Your Database URL**
   - Copy the connection string from your Neon dashboard
   - It will look like: `postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require`

3. **Add to Vercel** (same as above)

## After Adding Database URL to Vercel

1. **Run Database Migrations**
   ```bash
   # In your local project
   npx prisma generate
   npx prisma db push
   ```

2. **Seed Initial Data (Optional)**
   ```bash
   npx prisma db seed
   ```

3. **Redeploy on Vercel**
   - Your app will automatically redeploy when you add the environment variable
   - Or trigger manually: `vercel --prod`

## Verify Setup

1. Go to your Vercel deployment
2. Try uploading a CSV file
3. Check the Vercel Function Logs for any errors:
   - Vercel Dashboard → Functions → View Logs

## Troubleshooting

If you still get errors after setup:

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Functions → api/uploads → View Logs
   - Look for specific database connection errors

2. **Verify Environment Variable**
   ```bash
   vercel env pull .env.local
   ```
   This will download your Vercel env vars to check they're set correctly

3. **Test Database Connection Locally**
   ```bash
   # Create .env.local with your DATABASE_URL
   echo "DATABASE_URL=your-connection-string-here" > .env.local

   # Test the connection
   npx prisma db push
   ```

4. **Common Issues**
   - Wrong connection string format
   - Database not accepting connections from Vercel IPs
   - Missing SSL mode in connection string (add `?sslmode=require`)

## Quick Setup Script

Run this after setting DATABASE_URL in Vercel:

```bash
#!/bin/bash
# setup-database.sh

# Pull environment variables from Vercel
vercel env pull .env.local

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Create initial organization and user
npx prisma db seed

echo "Database setup complete!"
```