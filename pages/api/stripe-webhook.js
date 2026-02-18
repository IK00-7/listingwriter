import { buffer } from 'micro'
import Stripe from 'stripe'
const { sql } = require('@vercel/postgres')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log('🔔 Webhook received:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerEmail = session.customer_email
        const tier = session.metadata.tier
        
        console.log('💳 Processing checkout for:', customerEmail, '→', tier)
        
        const listingsLimit = tier === 'pro' ? 50 : tier === 'business' ? 999999 : 5

        const result = await sql`
          UPDATE users 
          SET tier = ${tier}, 
              listings_limit = ${listingsLimit},
              stripe_customer_id = ${session.customer},
              stripe_subscription_id = ${session.subscription}
          WHERE email = ${customerEmail}
          RETURNING email, tier, listings_limit
        `

        if (result.rows.length > 0) {
          console.log('✅ User upgraded successfully:', result.rows[0])
        } else {
          console.error('❌ No user found with email:', customerEmail)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const customer = await stripe.customers.retrieve(customerId)
        const customerEmail = customer.email

        if (subscription.status === 'active') {
          console.log('✅ Subscription active:', customerEmail)
        } else {
          console.log('⚠️ Subscription status changed:', customerEmail, '→', subscription.status)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const customer = await stripe.customers.retrieve(customerId)
        const customerEmail = customer.email

        const result = await sql`
          UPDATE users 
          SET tier = 'free', 
              listings_limit = 5,
              stripe_subscription_id = NULL
          WHERE email = ${customerEmail}
          RETURNING email, tier
        `

        if (result.rows.length > 0) {
          console.log('❌ Subscription canceled:', result.rows[0])
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer

        const customer = await stripe.customers.retrieve(customerId)
        const customerEmail = customer.email

        console.log('💳 Payment failed:', customerEmail)
        break
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed', details: error.message })
  }
}
