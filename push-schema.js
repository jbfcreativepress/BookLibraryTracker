// This script will push the database schema to the production database
// It reads the DATABASE_URL from the .env file

import { exec } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log('Pushing schema to production database...');
console.log(`Using database connection: ${process.env.DATABASE_URL ? 'Connection string loaded from .env' : 'No connection string found!'}`);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set in .env file!');
  process.exit(1);
}

// Use the DATABASE_URL from environment variables
exec('npm run db:push', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing db:push: ${error.message}`);
    return;
  }
  
  console.log('--- Command Output ---');
  
  if (stdout) {
    console.log(`${stdout}`);
  }
  
  if (stderr) {
    console.log(`${stderr}`);
  }
  
  console.log('--- End Output ---');
  console.log('Schema push completed!');
  console.log('Your database tables should now be set up on Render.');
});