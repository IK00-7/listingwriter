const { sql } = require('@vercel/postgres')

export async function getOrCreateUser(email, name, image) {
  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`
    
    if (result.rows.length > 0) {
      const user = result.rows[0]
      const now = new Date()
      const resetDate = new Date(user.reset_date)
      
      if (now > resetDate) {
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        
        await sql`UPDATE users SET listings_used = 0, reset_date = ${nextMonth} WHERE id = ${user.id}`
        
        return { ...user, listings_used: 0, reset_date: nextMonth }
      }
      
      return user
    }
    
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const newUser = await sql`
      INSERT INTO users (email, name, image, tier, listings_used, listings_limit, reset_date)
      VALUES (${email}, ${name}, ${image}, 'free', 0, 5, ${nextMonth})
      RETURNING *
    `
    
    return newUser.rows[0]
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    throw error
  }
}

export async function getUserByEmail(email) {
  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`
    return result.rows[0] || null
  } catch (error) {
    console.error('Error in getUserByEmail:', error)
    throw error
  }
}

export async function incrementListingsUsed(userId) {
  try {
    await sql`UPDATE users SET listings_used = listings_used + 1 WHERE id = ${userId}`
  } catch (error) {
    console.error('Error in incrementListingsUsed:', error)
    throw error
  }
}

export async function saveListing(userId, listingData) {
  try {
    const result = await sql`
      INSERT INTO listings (
        user_id, product_name, marketplace, title, bullets, description, 
        meta_data, html_output, seo_score, conversion_score, readability_score, error_score
      )
      VALUES (
        ${userId}, ${listingData.productName}, ${listingData.marketplace}, ${listingData.title},
        ${JSON.stringify(listingData.bullets)}, ${listingData.description},
        ${JSON.stringify(listingData.metaData)}, ${listingData.htmlOutput},
        ${listingData.seoScore}, ${listingData.conversionScore},
        ${listingData.readabilityScore}, ${listingData.errorScore}
      )
      RETURNING *
    `
    
    return result.rows[0]
  } catch (error) {
    console.error('Error in saveListing:', error)
    throw error
  }
}

export async function getUserListings(userId, limit = 50) {
  try {
    const result = await sql`
      SELECT * FROM listings WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT ${limit}
    `
    return result.rows
  } catch (error) {
    console.error('Error in getUserListings:', error)
    throw error
  }
}

export async function updateUserTier(userId, tier, listingsLimit, stripeCustomerId, stripeSubscriptionId) {
  try {
    await sql`
      UPDATE users SET tier = ${tier}, listings_limit = ${listingsLimit},
      stripe_customer_id = ${stripeCustomerId}, stripe_subscription_id = ${stripeSubscriptionId}
      WHERE id = ${userId}
    `
  } catch (error) {
    console.error('Error in updateUserTier:', error)
    throw error
  }
}
