// This script will help push your schema to the production database
// Add your production DATABASE_URL as an environment variable when running this script
// Example: DATABASE_URL=your_production_db_url node push-schema.js

import { exec } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('Pushing schema to production database...');

// Use the DATABASE_URL from environment variables
exec('npm run db:push', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('Schema push completed successfully!');
});