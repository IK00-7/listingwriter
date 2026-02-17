import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { priceId, tier } = req.body

  if (!priceId || !tier) {
    return res.status(400).json({ error: 'Missing priceId or tier' })
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.email,
        tier: tier,
      },
    })

    res.status(200).json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
