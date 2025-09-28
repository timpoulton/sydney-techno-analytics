#!/bin/bash

echo "🚀 Sydney Techno Analytics - Database Setup"
echo "==========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL environment variable not set!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Create a free database at https://supabase.com or https://neon.tech"
    echo "2. Add DATABASE_URL to Vercel Environment Variables"
    echo "3. Run: vercel env pull .env.local"
    echo "4. Run this script again"
    echo ""
    echo "See DATABASE_SETUP.md for detailed instructions"
    exit 1
fi

echo "✓ DATABASE_URL found"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "🔄 Pushing schema to database..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with initial data..."
npx prisma db seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Commit and push changes to GitHub"
echo "2. Your Vercel deployment will auto-update"
echo "3. Test CSV upload at your Vercel URL"