import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '../components/Header'

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Client-side mounting check
  const [mounted, setMounted] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [recentListings, setRecentListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)

  // Set mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/')
    }
  }, [mounted, status, router])

  // Fetch listings only after mounted and authenticated
  useEffect(() => {
    if (mounted && session?.user?.email) {
      fetchRecentListings()
    }
  }, [mounted, session])

  const fetchRecentListings = async () => {
    setLoadingListings(true)
    try {
      const res = await fetch('/api/get-listings')
      
      if (!res.ok) {
        console.error('API error:', res.status)
        setRecentListings([])
        return
      }
      
      const data = await res.json()
      
      if (data.listings && Array.isArray(data.listings)) {
        setRecentListings(data.listings.slice(0, 10))
      } else {
        setRecentListings([])
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      setRecentListings([])
    } finally {
      setLoadingListings(false)
    }
  }

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
        alert('Unable to open subscription portal. Please try again.')
        setPortalLoading(false)
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Unable to open subscription portal. Please try again.')
      setPortalLoading(false)
    }
  }

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <p style={{ color: '#9ca3af' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const tierInfo = {
    free: { name: 'Free', color: '#6b7280', emoji: '🆓', price: '$0/month' },
    pro: { name: 'Pro', color: '#10b981', emoji: '🚀', price: '$29/month' },
    business: { name: 'Business', color: '#8b5cf6', emoji: '💼', price: '$79/month' }
  }

  const userTier = session?.user?.tier || 'free'
  const currentTier = tierInfo[userTier]
  const usagePercent = ((session?.user?.listingsUsed || 0) / (session?.user?.listingsLimit || 5)) * 100

  const getResetDate = () => {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const marketplaceEmojis = {
    amazon: '📦',
    shopify: '🛍️',
    ebay: '🏷️'
  }

  return (
    <>
      <Head>
        <title>Profile - ListingWriter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
        <Header />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Account</h1>
            <p style={{ color: '#9ca3af' }}>Manage your profile and subscription</p>
          </div>

          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <img 
                  src={session?.user?.image || '/default-avatar.png'} 
                  alt="Profile" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #10b981' }}
                />
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {session?.user?.name || 'User'}
                  </h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{session?.user?.email}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Account Type</span>
                  <span style={{ fontSize: '1.25rem' }}>{currentTier.emoji}</span>
                </div>
                <div style={{ 
                  padding: '1rem', 
                  background: `${currentTier.color}15`, 
                  border: `2px solid ${currentTier.color}40`,
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentTier.color }}>
                    {currentTier.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    {currentTier.price}
                  </div>
                </div>

                {userTier !== 'free' ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="btn-primary"
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem',
                      opacity: portalLoading ? 0.5 : 1,
                      cursor: portalLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {portalLoading ? '⏳ Loading...' : '⚙️ Manage Subscription'}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                  >
                    ⬆️ Upgrade Plan
                  </button>
                )}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                📊 Usage Statistics
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Listings this month</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981' }}>
                    {session?.user?.listingsUsed || 0} / {session?.user?.listingsLimit || 5}
                  </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#1f2937', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(usagePercent, 100)}%`, 
                    height: '100%', 
                    background: usagePercent >= 100 ? '#ef4444' : usagePercent >= 80 ? '#f59e0b' : '#10b981',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>

              <div style={{ 
                padding: '1rem', 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.3)', 
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Usage resets on
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#60a5fa' }}>
                  {getResetDate()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: '#141824', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {recentListings.filter(l => l.marketplace?.toLowerCase() === 'amazon').length}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.25rem' }}>Amazon</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: '#141824', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {recentListings.filter(l => l.marketplace?.toLowerCase() === 'shopify').length}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.25rem' }}>Shopify</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: '#141824', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {recentListings.filter(l => l.marketplace?.toLowerCase() === 'ebay').length}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.25rem' }}>eBay</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📝 Recent Listings</h3>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#10b981',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                + Create New
              </button>
            </div>

            {loadingListings ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <p>Loading listings...</p>
              </div>
            ) : recentListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>📝</div>
                <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No listings yet</p>
                <p style={{ fontSize: '0.875rem' }}>Create your first AI-powered listing!</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary"
                  style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentListings.map((listing, index) => (
                  <div 
                    key={listing.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#141824',
                      border: '1px solid #1f2937',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>
                        {marketplaceEmojis[listing.marketplace?.toLowerCase()] || '📦'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {listing.product_name || 'Untitled'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>
                          {listing.marketplace || 'unknown'} • {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', color: '#10b981' }}>✓</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              ⚙️ Account Settings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
