import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

export default function Pricing() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (priceId, tier) => {
    if (!session) {
      signIn('google', { callbackUrl: '/dashboard' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['5 listings/month', 'All 3 marketplaces', 'Basic templates', 'SEO scoring'],
      cta: 'Get Started Free',
      tier: 'free',
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      features: ['50 listings/month', 'Advanced templates', 'Listing history', 'Priority support', 'Bulk export'],
      cta: 'Start Pro Trial',
      tier: 'pro',
      popular: true,
    },
    {
      name: 'Business',
      price: '$79',
      period: '/month',
      features: ['Unlimited listings', 'Bulk generation', 'Team features', 'Export options', 'API access', 'Dedicated support'],
      cta: 'Contact Sales',
      tier: 'business',
    },
  ]

  return (
    <section id="pricing" style={{ padding: '6rem 2rem', background: '#141824' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: '1.25rem', color: '#9ca3af' }}>Start free. Upgrade when you need more.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="card"
              style={{ 
                position: 'relative',
                border: plan.popular ? '2px solid #10b981' : '1px solid #1f2937',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-1rem', left: '50%', transform: 'translateX(-50%)', padding: '0.25rem 1rem', background: '#10b981', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, color: '#0a0e1a' }}>
                  Most Popular
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{plan.price}</span>
                  <span style={{ color: '#9ca3af' }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                    <span style={{ color: '#d1d5db' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (plan.tier === 'free') {
                    signIn('google', { callbackUrl: '/dashboard' })
                  } else {
                    handleUpgrade(plan.priceId, plan.tier)
                  }
                }}
                disabled={loading}
                className={plan.popular ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {loading ? 'Loading...' : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}