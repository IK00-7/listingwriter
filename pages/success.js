import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'

export default function Success() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/customer-portal', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to open subscription portal')
        setPortalLoading(false)
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open subscription portal')
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Processing Payment - ListingWriter</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        </Head>
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
          <Header />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Processing your payment...</h1>
              <p style={{ color: '#9ca3af' }}>Please wait a moment</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Get the user's tier (defaults to 'pro' if not set yet)
  const userTier = session?.user?.tier || 'pro'
  const tierName = userTier === 'business' ? 'Business' : 'Pro'
  const tierEmoji = userTier === 'business' ? '💼' : '🚀'
  const tierColor = userTier === 'business' ? '#8b5cf6' : '#10b981'

  // Features based on tier
  const features = userTier === 'business' ? [
    'Unlimited AI-generated listings',
    'Unlimited score improvements',
    'Unlimited CSV bulk uploads',
    'Full listing history & analytics',
    'API access',
    '24/7 Priority support'
  ] : [
    '50 AI-generated listings per month',
    'Score improvement regeneration',
    'CSV bulk upload (up to 50 products)',
    'Listing history & management',
    'Priority support'
  ]

  return (
    <>
      <Head>
        <title>Welcome to {tierName}! - ListingWriter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>
      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '2rem' }}>
          <div className="card" style={{ maxWidth: '600px', textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>{tierEmoji}</div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: tierColor }}>
              Welcome to {tierName}!
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginBottom: '2rem', lineHeight: 1.6 }}>
              Your payment was successful! You now have access to all {tierName} features.
            </p>
            
            <div style={{ 
              background: `${tierColor}15`, 
              border: `1px solid ${tierColor}40`, 
              borderRadius: '0.5rem', 
              padding: '1.5rem', 
              marginBottom: '2rem' 
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: tierColor, marginBottom: '1rem' }}>
                What's unlocked:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', fontSize: '0.875rem', lineHeight: 2, color: '#d1d5db' }}>
                {features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard">
                <a className="btn-primary" style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '1rem', 
                  textDecoration: 'none', 
                  display: 'inline-block',
                  background: tierColor,
                  color: '#fff'
                }}>
                  🚀 Start Creating Listings
                </a>
              </Link>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '1rem', 
                  background: `${tierColor}15`, 
                  border: `1px solid ${tierColor}40`, 
                  borderRadius: '0.5rem', 
                  color: tierColor, 
                  cursor: portalLoading ? 'not-allowed' : 'pointer',
                  opacity: portalLoading ? 0.5 : 1
                }}
              >
                {portalLoading ? '⏳ Loading...' : '📊 Manage Subscription'}
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2rem' }}>
              A confirmation email has been sent to {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
