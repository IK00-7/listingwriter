import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [marketplace, setMarketplace] = useState('amazon')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    productName: '',
    primaryKeyword: '',
    category: 'Accessories',
    features: '',
    targetCustomer: '',
    painPoint: '',
    pricePoint: 'mid',
    tone: 'professional',
  })

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

  if (status === 'unauthenticated') {
    router.push('/')
    return null
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, marketplace }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate listing')
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <>
      <Head>
        <title>Dashboard - ListingWriter</title>
      </Head>

      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
        <Header />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Generate New Listing</h1>
              <p style={{ color: '#9ca3af' }}>Create marketplace-optimized product listings</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#141824', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  {session.user.listingsUsed || 0} / {session.user.listingsLimit || 5}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', textTransform: 'capitalize' }}>
                  {session.user.tier || 'free'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <span style={{ color: '#ef4444', fontSize: '1.25rem' }}>⚠️</span>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>Generation Failed</h3>
                  <p style={{ fontSize: '0.875rem', color: '#fca5a5' }}>{error}</p>
                  {error.includes('Limit reached') && (
                    <button
                      onClick={() => router.push('/#pricing')}
                      className="btn-primary"
                      style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {/* Input Panel */}
            <div className="card">
              <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Marketplace Tabs */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Marketplace</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['amazon', 'shopify', 'ebay'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMarketplace(m)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                          transition: 'all 0.2s',
                          background: marketplace === m ? '#10b981' : '#0a0e1a',
                          color: marketplace === m ? '#0a0e1a' : '#9ca3af',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="RFID Blocking Slim Leather Wallet"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '1px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Primary Keyword *</label>
                  <input
                    type="text"
                    required
                    value={formData.primaryKeyword}
                    onChange={(e) => setFormData({ ...formData, primaryKeyword: e.target.value })}
                    placeholder="slim wallet men"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '1px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '1px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
                  >
                    <option>Accessories</option>
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home</option>
                    <option>Beauty</option>
                    <option>Sports</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Key Features (one per line)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="RFID blocking technology&#10;Genuine Italian leather&#10;Ultra-slim 8mm design"
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '1px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Target Customer</label>
                  <input
                    type="text"
                    value={formData.targetCustomer}
                    onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                    placeholder="Minimalist professionals, travelers"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '1px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Customer Pain Point</label>
                  <input
                    type="text"
                    value={formData.painPoint}
                    onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                    placeholder="Bulky wallets ruin suit pockets"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '1px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Price Point</label>
                    <select
                      value={formData.pricePoint}
                      onChange={(e) => setFormData({ ...formData, pricePoint: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '1px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
                    >
                      <option value="budget">Budget ($10-30)</option>
                      <option value="mid">Mid-Range ($30-100)</option>
                      <option value="premium">Premium ($100+)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Brand Tone</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '1px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
                    >
                      <option value="professional">Professional</option>
                      <option value="luxury">Luxury</option>
                      <option value="friendly">Friendly</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ padding: '1rem', opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? '⚡ Generating...' : 'Generate Listing'}
                </button>
              </form>
            </div>

            {/* Output Panel */}
            <div className="card">
              {result ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Quality Scores */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                      { label: 'SEO', value: result.seoScore },
                      { label: 'Conversion', value: result.conversionScore },
                      { label: 'Readability', value: result.readabilityScore },
                      { label: 'Errors', value: result.errorScore },
                    ].map((score) => (
                      <div key={score.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.25rem' }}>{score.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{score.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Title */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600 }}>SEO Title</h3>
                      <button
                        onClick={() => copyToClipboard(result.title)}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.875rem' }}>{result.title}</div>
                  </div>

                  {/* Bullets */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600 }}>Conversion Bullets</h3>
                      <button
                        onClick={() => copyToClipboard(result.bullets.map(b => `${b.hook} ${b.detail}`).join('\n'))}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem' }}>
                      <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem' }}>
                        {result.bullets.map((bullet, i) => (
                          <li key={i} style={{ marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 600, color: '#10b981' }}>{bullet.hook}</span>{' '}
                            {bullet.detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600 }}>Product Description</h3>
                      <button
                        onClick={() => copyToClipboard(result.description)}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.875rem' }}>{result.description}</div>
                  </div>

                  {/* HTML */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600 }}>HTML Output</h3>
                      <button
                        onClick={() => copyToClipboard(result.htmlOutput)}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem' }}>
                      <pre style={{ fontSize: '0.75rem', color: '#9ca3af', overflowX: 'auto', margin: 0 }}>{result.htmlOutput}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '5rem 1.25rem', color: '#9ca3af' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>⚡</div>
                  <p>Fill in the form and generate your listing</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Your output will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}