// Script to directly create tables in the Render PostgreSQL database
// This creates the tables directly using SQL queries

import 'dotenv/config';
import pg from 'pg';

async function main() {
  console.log('Connecting to the production database...');
  
  const { DATABASE_URL } = process.env;
  
  if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set in .env file!');
    process.exit(1);
  }
  
  console.log('Database URL found in environment variables.');
  
  // Connect to the database
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  
  try {
    // Check connection
    await pool.query('SELECT NOW()');
    console.log('Successfully connected to the database.');
    
    // We'll create tables directly with SQL
    
    // Create tables manually
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Creating books table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        year_read INTEGER,
        rating INTEGER,
        notes TEXT,
        cover_url TEXT,
        cover_data TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        isbn VARCHAR(20),
        publisher VARCHAR(255),
        published_date VARCHAR(50),
        description TEXT
      )
    `);
    
    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    // Close the connection
    await pool.end();
    console.log('Database connection closed.');
  }
}

main().catch(console.error);