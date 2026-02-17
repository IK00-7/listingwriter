require('dotenv').config({ path: '.env.local' })
const { sql } = require('@vercel/postgres')

async function setupDatabase() {
  try {
    console.log('🗄️  Creating database schema...')
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        image TEXT,
        tier VARCHAR(50) DEFAULT 'free',
        listings_used INTEGER DEFAULT 0,
        listings_limit INTEGER DEFAULT 5,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month')
      )
    `
    console.log('✅ Users table created')
    
    // Create listings table
    await sql`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_name VARCHAR(500) NOT NULL,
        marketplace VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        bullets JSONB NOT NULL,
        description TEXT NOT NULL,
        meta_data JSONB,
        html_output TEXT,
        seo_score INTEGER,
        conversion_score INTEGER,
        readability_score INTEGER,
        error_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Listings table created')
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at)`
    console.log('✅ Indexes created')
    
    console.log('🎉 Database setup complete!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase()