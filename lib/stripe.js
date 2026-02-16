import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
})

export const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    listings: 5,
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    listings: 50,
  },
  business: {
    name: 'Business',
    price: 79,
    priceId: process.env.STRIPE_PRICE_ID_BUSINESS,
    listings: 999999,
  },
}