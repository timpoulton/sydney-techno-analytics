# Vercel Deployment Guide for Events Dashboard

## Prerequisites
✅ Project builds successfully (confirmed)
✅ Vercel CLI installed globally (confirmed)
✅ `.vercelignore` file created (confirmed)

## Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```
Enter your email and follow the authentication flow.

### 2. Deploy to Vercel
```bash
vercel
```

When prompted:
- Set up and deploy: Yes
- Which scope: Select your account
- Link to existing project?: No (for first deployment)
- Project name: `events-dashboard` (or your preferred name)
- Directory: `./` (current directory)
- Override settings?: No

### 3. Configure Environment Variables

After initial deployment, set up the database URL in Vercel:

```bash
vercel env add DATABASE_URL
```

For production, you'll need a hosted database. Options:

#### Option A: Use Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Create a new Postgres database
5. It will automatically add DATABASE_URL to your environment

#### Option B: Use PlanetScale (MySQL)
1. Create account at planetscale.com
2. Create new database
3. Get connection string
4. Update schema.prisma provider to "mysql"
5. Add connection string to Vercel

#### Option C: Use Supabase (PostgreSQL)
1. Create account at supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Add to Vercel environment variables

### 4. Update Prisma for Production

Create a `prisma/schema.prisma` production config:

```prisma
datasource db {
  provider = "postgresql" // or "mysql" for PlanetScale
  url      = env("DATABASE_URL")
  relationMode = "prisma" // Add this for PlanetScale
}
```

### 5. Add Build Command

Update `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### 6. Deploy to Production

```bash
vercel --prod
```

## Environment Variables Summary

Required for production:
- `DATABASE_URL` - Your production database connection string

Optional:
- `NEXTAUTH_URL` - If adding authentication later
- `NEXTAUTH_SECRET` - If adding authentication later

## Post-Deployment Steps

1. **Run Database Migrations**
```bash
npx prisma db push
```

2. **Seed Initial Data** (Optional)
```bash
npx prisma db seed
```

3. **Verify Deployment**
- Visit your Vercel URL
- Test file upload functionality
- Check dashboard loads correctly

## Custom Domain (Optional)

1. Go to Vercel Dashboard > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

## Monitoring

- View logs: `vercel logs`
- View environment variables: `vercel env ls`
- Redeploy: `vercel --prod`

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is set in Vercel environment
- Check if database allows connections from Vercel IPs
- For Supabase: Enable "Allow direct connections"

### Build Failures
- Check `vercel logs`
- Ensure all dependencies are in package.json
- Verify TypeScript types compile: `npm run build`

### Performance
- Enable Vercel Analytics (free tier available)
- Consider using Vercel Edge Functions for API routes
- Implement caching strategies

## Project URLs

After deployment, you'll have:
- Production: `https://[your-project].vercel.app`
- Preview: `https://[your-project]-[branch]-[username].vercel.app`

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel