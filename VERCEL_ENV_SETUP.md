# Vercel Environment Variables Setup

## Quick Setup

Add these environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
- Navigate to your project: `test-spec-kit-project`
- Click on **Settings** tab
- Click on **Environment Variables** in the left sidebar

### 2. Add Database URL
Add the following environment variable:

**Variable Name:** `DATABASE_URL`
**Value:**
```
postgresql://neondb_owner:npg_Or5q0LHdgsFj@ep-wandering-dawn-adwq3tpf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Environment:** Select all (Production, Preview, Development)

### 3. Click "Save"

### 4. Redeploy
After adding the environment variable, you need to redeploy:
- Go to the **Deployments** tab
- Click on the three dots next to the latest deployment
- Select **Redeploy**
- Or push a new commit to trigger automatic deployment

## What This Enables

Once configured, you'll be able to:
- ✅ Upload CSV files from Resident Advisor, Humanitix, and Moshtix
- ✅ View events and ticket sales data
- ✅ Track revenue and attendee metrics
- ✅ Generate analytics reports

## Testing

After deployment, test the setup:
1. Go to your deployed app: `https://test-spec-kit-project.vercel.app`
2. Navigate to `/upload`
3. Try uploading your Resident Advisor CSV file
4. Check the Events page to see imported data

## Troubleshooting

If uploads still fail:
1. Check the browser console for errors
2. Verify the DATABASE_URL is correctly added in Vercel
3. Make sure to redeploy after adding environment variables
4. Check Vercel Function logs for detailed error messages

## Security Note

Your database credentials are safely stored in Vercel's environment variables and are never exposed to the client-side code.