import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'

export default function History() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMarketplace, setFilterMarketplace] = useState('all')
  const [selectedListing, setSelectedListing] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchListings()
    }
  }, [session])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/get-listings')
      const data = await res.json()
      
      if (data.listings) {
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      // Mock data for demo
      setListings([
        {
          id: 1,
          product_name: 'RFID Blocking Leather Wallet',
          marketplace: 'amazon',
          title: 'RFID Blocking Wallet - Genuine Leather Slim Design',
          bullets: [
            { hook: 'RFID PROTECTION', detail: 'Advanced blocking technology keeps your cards safe from electronic theft' },
            { hook: 'GENUINE LEATHER', detail: 'Premium Italian leather ages beautifully and lasts for years' },
            { hook: 'ULTRA-SLIM', detail: 'Only 8mm thick - fits perfectly in your front pocket' }
          ],
          description: 'Protect your identity and carry in style with our RFID blocking wallet. Made from genuine Italian leather.',
          seo_score: 94,
          conversion_score: 91,
          readability_score: 93,
          error_score: 97,
          created_at: '2024-02-18T10:30:00Z'
        },
        {
          id: 2,
          product_name: 'Premium Yoga Mat',
          marketplace: 'shopify',
          title: 'Eco-Friendly Yoga Mat - Extra Thick 6mm',
          bullets: [
            { hook: 'ECO-FRIENDLY', detail: 'Made from sustainable TPE material that\'s kind to the planet' },
            { hook: 'EXTRA CUSHION', detail: '6mm thick provides superior joint protection during practice' },
            { hook: 'NON-SLIP', detail: 'Textured surface grips perfectly even during sweaty sessions' }
          ],
          description: 'Elevate your practice with our premium eco-friendly yoga mat. Perfect grip, superior cushioning.',
          seo_score: 89,
          conversion_score: 87,
          readability_score: 91,
          error_score: 95,
          created_at: '2024-02-17T14:20:00Z'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const isPro = session?.user?.tier === 'pro' || session?.user?.tier === 'business'

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

  if (!isPro) {
    return (
      <>
        <Head>
          <title>Listing History - ListingWriter</title>
        </Head>
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
          <Header />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Pro Feature
              </h1>
              <p style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '2rem', lineHeight: 1.6 }}>
                Listing history is available on Pro and Business plans. Upgrade to access your complete listing archive with search and filtering.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="btn-primary"
                style={{ padding: '1rem 2rem', fontSize: '1rem' }}
              >
                ⬆️ Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMarketplace = filterMarketplace === 'all' || listing.marketplace === filterMarketplace
    return matchesSearch && matchesMarketplace
  })

  const marketplaceEmojis = {
    amazon: '📦',
    shopify: '🛍️',
    ebay: '🏷️'
  }

  const getScoreColor = (score) => {
    if (score >= 95) return '#10b981'
    if (score >= 90) return '#34d399'
    if (score >= 85) return '#fbbf24'
    if (score >= 80) return '#f59e0b'
    return '#ef4444'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const viewListingDetails = (listing) => {
    setSelectedListing(listing)
    setShowModal(true)
  }

  return (
    <>
      <Head>
        <title>Listing History - ListingWriter</title>
      </Head>

      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
        <Header />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              📚 Listing History
            </h1>
            <p style={{ color: '#9ca3af' }}>
              View and manage all your generated listings
            </p>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <input
                  type="text"
                  placeholder="🔍 Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0a0e1a',
                    border: '2px solid #1f2937',
                    borderRadius: '0.5rem',
                    color: '#f3f4f6',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'amazon', 'shopify', 'ebay'].map((marketplace) => (
                  <button
                    key={marketplace}
                    onClick={() => setFilterMarketplace(marketplace)}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      fontSize: '0.875rem',
                      background: filterMarketplace === marketplace ? '#10b981' : '#0a0e1a',
                      color: filterMarketplace === marketplace ? '#0a0e1a' : '#9ca3af',
                      border: filterMarketplace === marketplace ? 'none' : '1px solid #1f2937',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {marketplace === 'all' ? 'All' : marketplaceEmojis[marketplace]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              Showing {filteredListings.length} of {listings.length} listings
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <p>Loading your listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}>📝</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {searchQuery || filterMarketplace !== 'all' ? 'No listings found' : 'No listings yet'}
              </h2>
              <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                {searchQuery || filterMarketplace !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first AI-powered listing to get started!'}
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary"
                style={{ padding: '1rem 2rem' }}
              >
                Create New Listing
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    gap: '1.5rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => viewListingDetails(listing)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '2rem' }}>
                        {marketplaceEmojis[listing.marketplace]}
                      </span>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          {listing.product_name}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>
                          {listing.marketplace} • {formatDate(listing.created_at)}
                        </div>
                      </div>
                    </div>

                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#9ca3af', 
                      marginBottom: '1rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {listing.title}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {[
                        { label: 'SEO', score: listing.seo_score },
                        { label: 'Convert', score: listing.conversion_score },
                        { label: 'Read', score: listing.readability_score },
                        { label: 'Quality', score: listing.error_score }
                      ].map((metric) => (
                        <div key={metric.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{metric.label}:</span>
                          <span style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 600, 
                            color: getScoreColor(metric.score) 
                          }}>
                            {metric.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      viewListingDetails(listing)
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '0.375rem',
                      color: '#10b981',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && selectedListing && (
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
            padding: '2rem',
            overflowY: 'auto'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {marketplaceEmojis[selectedListing.marketplace]} {selectedListing.product_name}
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>📝 Title</h3>
                  <button
                    onClick={() => copyToClipboard(selectedListing.title)}
                    style={{
                      background: 'none',
                      border: '1px solid #1f2937',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <div style={{ background: '#0a0e1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  {selectedListing.title}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>🎯 Bullets</h3>
                  <button
                    onClick={() => copyToClipboard(selectedListing.bullets.map(b => `${b.hook}: ${b.detail}`).join('\n'))}
                    style={{
                      background: 'none',
                      border: '1px solid #1f2937',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <div style={{ background: '#0a0e1a', padding: '1rem', borderRadius: '0.5rem' }}>
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem', lineHeight: 1.8 }}>
                    {selectedListing.bullets.map((bullet, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{bullet.hook}:</span> {bullet.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>📖 Description</h3>
                  <button
                    onClick={() => copyToClipboard(selectedListing.description)}
                    style={{
                      background: 'none',
                      border: '1px solid #1f2937',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <div style={{ background: '#0a0e1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {selectedListing.description}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'SEO', score: selectedListing.seo_score },
                  { label: 'Convert', score: selectedListing.conversion_score },
                  { label: 'Readable', score: selectedListing.readability_score },
                  { label: 'Quality', score: selectedListing.error_score }
                ].map((metric) => (
                  <div key={metric.label} style={{ textAlign: 'center', background: '#0a0e1a', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getScoreColor(metric.score), marginBottom: '0.25rem' }}>
                      {metric.score}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
