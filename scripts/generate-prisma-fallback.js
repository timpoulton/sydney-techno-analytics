// This script generates a fallback Prisma client for build time when DATABASE_URL is not available
const fs = require('fs');
const path = require('path');

const fallbackDatabaseUrl = 'postgresql://user:pass@localhost:5432/db?schema=public';

// Only set DATABASE_URL if it's not already set
if (!process.env.DATABASE_URL) {
  console.log('No DATABASE_URL found, using fallback for Prisma generation...');
  process.env.DATABASE_URL = fallbackDatabaseUrl;
}

// Run prisma generate
const { execSync } = require('child_process');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully');
} catch (error) {
  console.error('Failed to generate Prisma client:', error.message);
  process.exit(1);
}