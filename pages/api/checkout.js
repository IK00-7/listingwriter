export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Placeholder for Stripe integration
  // This will be configured when you add real Stripe keys
  
  res.status(200).json({ 
    message: 'Stripe checkout not yet configured. Add your Stripe keys to enable payments.' 
  })
}