import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'

export default function Pricing() {
  const { data: session } = useSession()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [showContactForm, setShowContactForm] = useState(false)
  const [loading, setLoading] = useState(null)
  // ADD THIS useEffect - Force session refresh
  useEffect(() => {
    if (session) {
      update()  // This refreshes session from database
    }
  }, [])  // Run once when page loads
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for trying out ListingWriter',
      features: [
        '5 AI-generated listings per month',
        'All marketplaces (Amazon, Shopify, eBay)',
        'Quality scoring',
        'Basic templates',
        'Copy to clipboard',
      ],
      limitations: [
        'No score improvements',
        'No bulk CSV upload',
        'No listing history',
        'Standard support'
      ],
      cta: 'Current Plan',
      popular: false
    },
    pro: {
      name: 'Pro',
      price: { monthly: 29, annual: 290 },
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID,
      description: 'For serious sellers scaling their business',
      features: [
        '50 AI-generated listings per month',
        'All marketplaces (Amazon, Shopify, eBay)',
        'Advanced quality scoring',
        'Score improvement regeneration',
        'Bulk CSV upload (up to 50 products)',
        'Listing history & management',
        'Priority support',
        'Export to multiple formats',
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
      popular: true
    },
    business: {
      name: 'Business',
      price: { monthly: 79, annual: 790 },
      priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || process.env.STRIPE_BUSINESS_PRICE_ID,
      description: 'For agencies and high-volume sellers',
      features: [
        'Unlimited AI-generated listings',
        'All marketplaces (Amazon, Shopify, eBay)',
        'Advanced quality scoring',
        'Unlimited score improvements',
        'Unlimited bulk CSV uploads',
        'Full listing history',
        'API access',
        'Direct marketplace integrations',
        'Analytics & reporting',
        'Dedicated account manager',
        'Priority support (24/7)',
        'Custom integrations available',
      ],
      limitations: [],
      cta: 'Upgrade to Business',
      popular: false
    }
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    console.log('Contact form:', contactForm)
    setContactSubmitted(true)
    setTimeout(() => {
      setShowContactForm(false)
      setContactSubmitted(false)
      setContactForm({ name: '', email: '', company: '', message: '' })
    }, 2000)
  }

  const handlePlanSelect = async (planKey) => {
    if (planKey === 'free') {
      router.push('/dashboard')
      return
    }
    
    if (planKey === 'business') {
  if (!session) {
    router.push('/')
    return
  }

  setLoading('business')

  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
        tier: 'business'
      }),
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (error) {
    console.error('Checkout error:', error)
    alert('Failed to start checkout. Please try again.')
    setLoading(null)
  }
  return
}
    
    if (planKey === 'pro') {
      if (!session) {
        router.push('/')
        return
      }

      setLoading('pro')

      try {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
            tier: 'pro'
          }),
        })

        const data = await res.json()

        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      } catch (error) {
        console.error('Checkout error:', error)
        alert('Failed to start checkout. Please try again.')
        setLoading(null)
      }
    }
  }

  return (
    <>
      <Head>
        <title>Pricing - ListingWriter</title>
        <meta name="description" content="Choose the perfect plan for your e-commerce listing needs. From free to unlimited." />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
        <Header />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem' }}>
          
          {router.query.canceled && (
            <div className="card" style={{ background: 'rgba(239, 184, 16, 0.1)', border: '1px solid rgba(239, 184, 16, 0.3)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#fbbf24', textAlign: 'center' }}>
                ⚠️ Payment canceled. No charges were made. Feel free to try again!
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Simple, Transparent Pricing
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '2rem' }}>
              Choose the plan that fits your business. No hidden fees.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: '#141824', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: billingCycle === 'monthly' ? '#10b981' : 'transparent',
                  color: billingCycle === 'monthly' ? '#0a0e1a' : '#9ca3af',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: billingCycle === 'annual' ? '#10b981' : 'transparent',
                  color: billingCycle === 'annual' ? '#0a0e1a' : '#9ca3af',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                Annual
                <span style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '-8px', 
                  background: '#ef4444', 
                  color: 'white', 
                  fontSize: '0.65rem', 
                  padding: '0.15rem 0.4rem', 
                  borderRadius: '0.25rem',
                  fontWeight: 700
                }}>
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className="card"
                style={{
                  position: 'relative',
                  border: plan.popular ? '2px solid #10b981' : '1px solid #1f2937',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#10b981',
                    color: '#0a0e1a',
                    padding: '0.35rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    {plan.description}
                  </p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981' }}>
                      ${plan.price[billingCycle]}
                    </span>
                    <span style={{ fontSize: '1rem', color: '#9ca3af' }}>
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && plan.price.annual > 0 && (
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      ${(plan.price.annual / 12).toFixed(0)}/month billed annually
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handlePlanSelect(key)}
                  disabled={session?.user?.tier === key || loading === key}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    marginBottom: '2rem',
                    background: plan.popular ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                    color: plan.popular ? '#0a0e1a' : '#10b981',
                    border: plan.popular ? 'none' : '1px solid rgba(16, 185, 129, 0.3)',
                    opacity: (session?.user?.tier === key || loading === key) ? 0.5 : 1,
                    cursor: (session?.user?.tier === key || loading === key) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading === key ? '⏳ Loading...' : session?.user?.tier === key ? '✓ Current Plan' : plan.cta}
                </button>

                <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                    What's Included:
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem', lineHeight: 2 }}>
                    {plan.features.map((feature, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                        <span style={{ color: '#10b981', fontSize: '1rem' }}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', color: '#6b7280' }}>
                        <span style={{ color: '#6b7280', fontSize: '1rem' }}>—</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
              Compare Plans
            </h2>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #1f2937' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Feature</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Free</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#10b981' }}>Pro</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Business</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Monthly Listings', free: '5', pro: '50', business: 'Unlimited' },
                    { feature: 'Marketplaces', free: 'All', pro: 'All', business: 'All' },
                    { feature: 'Quality Scoring', free: '✓', pro: '✓', business: '✓' },
                    { feature: 'Score Improvements', free: '—', pro: '✓', business: 'Unlimited' },
                    { feature: 'CSV Bulk Upload', free: '—', pro: 'Up to 50', business: 'Unlimited' },
                    { feature: 'Listing History', free: '—', pro: '✓', business: '✓' },
                    { feature: 'API Access', free: '—', pro: '—', business: '✓' },
                    { feature: 'Analytics', free: '—', pro: 'Basic', business: 'Advanced' },
                    { feature: 'Support', free: 'Standard', pro: 'Priority', business: '24/7 Dedicated' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{row.feature}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>{row.free}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>{row.pro}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>{row.business}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                {
                  q: 'Can I change plans later?',
                  a: 'Absolutely! You can upgrade or downgrade at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.'
                },
                {
                  q: 'What happens when I reach my listing limit?',
                  a: 'You won\'t be able to generate new listings until next month, or you can upgrade your plan for more credits immediately.'
                },
                {
                  q: 'Do unused listings roll over?',
                  a: 'No, unused listings reset at the start of each billing cycle. However, Business tier has unlimited listings.'
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes! You can cancel your subscription at any time. You\'ll retain access until the end of your billing period.'
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'We offer a 7-day money-back guarantee. If you\'re not satisfied, contact us for a full refund within 7 days of purchase.'
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards (Visa, Mastercard, Amex) and payment methods through Stripe.'
                }
              ].map((faq, i) => (
                <div key={i} className="card">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#10b981' }}>
                    {faq.q}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Still have questions?
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
              Our team is here to help you choose the right plan for your business.
            </p>
            <button
              onClick={() => setShowContactForm(true)}
              className="btn-primary"
              style={{ padding: '1rem 2rem', fontSize: '1rem' }}
            >
              📧 Contact Sales
            </button>
          </div>
        </div>
      </div>

      {showContactForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => !contactSubmitted && setShowContactForm(false)}
        >
          <div 
            className="card"
            style={{ maxWidth: '500px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {contactSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Message Sent!
                </h2>
                <p style={{ color: '#9ca3af' }}>
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Contact Sales</h2>
                  <button
                    onClick={() => setShowContactForm(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0a0e1a',
                        border: '1px solid #1f2937',
                        borderRadius: '0.5rem',
                        color: '#f3f4f6',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0a0e1a',
                        border: '1px solid #1f2937',
                        borderRadius: '0.5rem',
                        color: '#f3f4f6',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Company
                    </label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0a0e1a',
                        border: '1px solid #1f2937',
                        borderRadius: '0.5rem',
                        color: '#f3f4f6',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Message *
                    </label>
                    <textarea
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0a0e1a',
                        border: '1px solid #1f2937',
                        borderRadius: '0.5rem',
                        color: '#f3f4f6',
                        fontSize: '0.875rem',
                        resize: 'vertical'
                      }}
                      placeholder="Tell us about your needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '1rem', fontSize: '1rem' }}
                  >
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
