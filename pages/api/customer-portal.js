import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getUserByEmail } from '../../lib/db'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await getUserByEmail(session.user.email)
    
    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: 'No active subscription found' })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    })

    res.status(200).json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal session error:', error)
    res.status(500).json({ error: 'Failed to create portal session' })
  }
}
