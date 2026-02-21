import { useState, useEffect } from 'react'
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
  const [hoveredScore, setHoveredScore] = useState(null)
  const [improving, setImproving] = useState(null)
  
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [csvProcessing, setCsvProcessing] = useState(false)
  const [csvResults, setCsvResults] = useState([])
  const [csvProgress, setCsvProgress] = useState(0)
  const [usageUpdated, setUsageUpdated] = useState(false)
  const [animatedScores, setAnimatedScores] = useState({
    seo: 0,
    conversion: 0,
    readability: 0,
    errors: 0
  })

  const [titleLength, setTitleLength] = useState(0)

  const [formData, setFormData] = useState({
    productName: '',
    features: '',
    pricePoint: 'mid',
  })

  const LIMITS = {
    amazon: { title: 200, features: 1000 },
    shopify: { title: 70, features: 1000 },
    ebay: { title: 80, features: 1000 }
  }

  const scoreExplanations = {
    seo: "How well your listing will rank in search results. Higher scores mean better keyword placement and discoverability.",
    conversion: "How persuasive your copy is. Higher scores mean more customers will click 'Buy Now'.",
    readability: "How easy your listing is to understand. Higher scores mean customers can quickly grasp the value.",
    quality: "Overall polish and professionalism. Higher scores mean error-free, marketplace-compliant listings."
  }

  const getScoreColor = (score) => {
    if (score >= 95) return '#10b981'
    if (score >= 90) return '#34d399'
    if (score >= 85) return '#fbbf24'
    if (score >= 80) return '#f59e0b'
    return '#ef4444'
  }

  const isPro = session?.user?.tier === 'pro' || session?.user?.tier === 'business'

  useEffect(() => {
    setTitleLength(formData.productName.length)
  }, [formData])

  useEffect(() => {
    if (result) {
      setAnimatedScores({ seo: 0, conversion: 0, readability: 0, errors: 0 })
      const duration = 1500
      const fps = 60
      const frames = duration / (1000 / fps)
      let frame = 0
      const interval = setInterval(() => {
        frame++
        const progress = frame / frames
        setAnimatedScores({
          seo: Math.floor(result.seoScore * progress),
          conversion: Math.floor(result.conversionScore * progress),
          readability: Math.floor(result.readabilityScore * progress),
          errors: Math.floor(result.errorScore * progress)
        })
        if (frame >= frames) {
          setAnimatedScores({
            seo: result.seoScore,
            conversion: result.conversionScore,
            readability: result.readabilityScore,
            errors: result.errorScore
          })
          clearInterval(interval)
        }
      }, 1000 / fps)
      return () => clearInterval(interval)
    }
  }, [result])

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
    setResult(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, marketplace }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to generate listing')
      setResult(data)

// ADD THESE LINES ↓
if (session?.user) {
  session.user.listingsUsed = (session.user.listingsUsed || 0) + 1
  setUsageUpdated(true)
  setTimeout(() => setUsageUpdated(false), 1500)
}
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

const handleImproveScore = async (scoreType) => {
  if (!isPro) {
    router.push('/pricing')
    return
  }

  setImproving(scoreType)
  setError(null)

  try {
    // Simple improvement messages - not as object inside function
    let improvementMessage = ''
    
    if (scoreType === 'seo') {
      improvementMessage = 'CRITICAL SEO TASK: Use the main product keyword 4 times. Add 5 related search terms. Put keyword in first 10 words of title. Add long-tail keywords. TARGET: Increase SEO score by 10-15 points while keeping other scores high.'
    } else if (scoreType === 'conversion') {
      improvementMessage = 'CRITICAL CONVERSION TASK: Add 3 specific numbers with benefits. Add social proof element. Add money-back guarantee. Use 2 power words (Guaranteed, Proven, Premium). TARGET: Increase conversion score by 10-15 points while keeping other scores high.'
    } else if (scoreType === 'readability') {
      improvementMessage = 'CRITICAL READABILITY TASK: Shorten ALL sentences to under 12 words. Use simple 5th grade words. Remove all jargon. Use active voice only. TARGET: Increase readability score by 10-15 points while keeping other scores high.'
    } else if (scoreType === 'quality') {
      improvementMessage = 'CRITICAL QUALITY TASK: Fix all grammar and spelling errors. Remove vague words. Add specific measurements and numbers. Perfect formatting. TARGET: Increase quality score by 10-15 points while keeping other scores high.'
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        productName: formData.productName,
        features: formData.features,
        pricePoint: formData.pricePoint,
        marketplace: marketplace,
        improvementFocus: improvementMessage
      }),
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to improve listing')
    }
    
    setResult(data)
    
    // Update usage counter
    if (session?.user) {
      session.user.listingsUsed = (session.user.listingsUsed || 0) + 1
      setUsageUpdated(true)
      setTimeout(() => setUsageUpdated(false), 1500)
    }
    
  } catch (err) {
    console.error('Improve error:', err)
    setError(err.message || 'Failed to improve listing')
  } finally {
    // ALWAYS reset improving state
    setImproving(null)
  }
}

  
  const handleCsvUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }
    setCsvFile(file)
  }

  const processCsvFile = async () => {
    if (!csvFile) return
    if (!isPro) {
      router.push('/pricing')
      return
    }
    setCsvProcessing(true)
    setCsvProgress(0)
    setCsvResults([])
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const dataLines = lines.slice(1)
      const results = []
      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i]
        const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''))
        if (columns.length < 2) continue
        const productName = columns[0]
        const features = columns[1]
        const pricePoint = columns[2] || 'mid'
        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName, features, pricePoint, marketplace }),
          })
          const data = await res.json()
          if (res.ok) {
            results.push({ productName, success: true, data })
          } else {
            results.push({ productName, success: false, error: data.message || 'Generation failed' })
          }
        } catch (err) {
          results.push({ productName, success: false, error: err.message })
        }
        setCsvProgress(Math.round(((i + 1) / dataLines.length) * 100))
      }
      setCsvResults(results)
    } catch (err) {
      alert('Failed to process CSV: ' + err.message)
    } finally {
      setCsvProcessing(false)
    }
  }

  const downloadCsvResults = () => {
    let csvContent = 'Product Name,Title,Description,Bullets,SEO Score,Conversion Score\n'
    csvResults.forEach(result => {
      if (result.success) {
        const bullets = result.data.bullets.map(b => `${b.hook}: ${b.detail}`).join(' | ')
        const row = [
          result.productName,
          result.data.title,
          result.data.description,
          bullets,
          result.data.seoScore,
          result.data.conversionScore
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        csvContent += row + '\n'
      }
    })
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'listingwriter-results.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getCharCountColor = (length, limit) => {
    if (length === 0) return '#6b7280'
    if (length > limit) return '#ef4444'
    if (length > limit * 0.9) return '#f59e0b'
    return '#10b981'
  }

  return (
    <>
      <Head>
  <title>Dashboard - ListingWriter</title>
  <style>{`
    @keyframes fadeInOut {
      0% {
        opacity: 0;
        transform: scale(0.5) translateY(10px);
      }
      50% {
        opacity: 1;
        transform: scale(1.1) translateY(0);
      }
      100% {
        opacity: 0;
        transform: scale(0.8) translateY(-10px);
      }
    }
  `}</style>
</Head>
      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
        <Header />
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Generate New Listing</h1>
              <p style={{ color: '#9ca3af' }}>Just 3 simple fields - we'll handle the rest!</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => isPro ? setShowCsvModal(true) : router.push('/pricing')} style={{ padding: '0.75rem 1.25rem', background: isPro ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)', border: isPro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(107, 114, 128, 0.3)', borderRadius: '0.5rem', color: isPro ? '#10b981' : '#6b7280', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                {isPro ? '📂 Bulk CSV Upload' : '🔒 CSV Upload (Pro)'}
              </button>
              <div style={{ 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  padding: '0.5rem 1rem', 
  borderRadius: '0.5rem', 
  background: '#141824', 
  border: '1px solid #1f2937',
  position: 'relative',
  transition: 'all 0.3s ease',
  transform: usageUpdated ? 'scale(1.05)' : 'scale(1)',
  boxShadow: usageUpdated ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
}}>
  {usageUpdated && (
    <div style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: '#10b981',
      color: '#0a0e1a',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      animation: 'fadeInOut 1.5s ease-out'
    }}>
      +1
    </div>
  )}
  <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
    {session.user.listingsUsed || 0} / {session.user.listingsLimit || 5}
  </span>
  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', textTransform: 'capitalize' }}>
    {session.user.tier || 'free'}
  </span>
</div>
            </div>
          </div>
          {error && (
            <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <span style={{ color: '#ef4444', fontSize: '1.25rem' }}>⚠️</span>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>Generation Failed</h3>
                  <p style={{ fontSize: '0.875rem', color: '#fca5a5' }}>{error}</p>
                  {error.includes('Limit reached') && <button onClick={() => router.push('/pricing')} className="btn-primary" style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Upgrade Plan</button>}
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
            <div className="card">
              <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#10b981', lineHeight: 1.6 }}>💡 <strong>Pro tip:</strong> Just give us the basics! Our AI engine will create marketplace-optimized listings with professional copy and perfect structure.</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>📍 Marketplace</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['amazon', 'shopify', 'ebay'].map((m) => (
                      <button key={m} type="button" onClick={() => setMarketplace(m)} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 600, textTransform: 'capitalize', fontSize: '0.875rem', background: marketplace === m ? '#10b981' : '#0a0e1a', color: marketplace === m ? '#0a0e1a' : '#9ca3af', border: marketplace === m ? 'none' : '1px solid #1f2937', cursor: 'pointer' }}>{m}</button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Title limit: {LIMITS[marketplace].title} characters</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>📦 Product Name *</label>
                  <input type="text" required value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })} placeholder="e.g., RFID Blocking Slim Leather Wallet" style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: `2px solid ${titleLength > LIMITS[marketplace].title ? '#ef4444' : '#1f2937'}`, borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>What is it? Keep it simple and clear.</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: getCharCountColor(titleLength, LIMITS[marketplace].title) }}>{titleLength} / {LIMITS[marketplace].title}</p>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>⭐ Key Features</label>
                  <textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="List your product's main features (one per line):&#10;&#10;RFID blocking technology&#10;Genuine Italian leather&#10;Ultra-slim 8mm design&#10;Holds 8-12 cards&#10;Quick-access slot" rows={6} style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '2px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem', resize: 'vertical', lineHeight: 1.6 }} />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>One feature per line. AI will transform these into compelling benefits!</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>💰 Price Range</label>
                  <select value={formData.pricePoint} onChange={(e) => setFormData({ ...formData, pricePoint: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', background: '#0a0e1a', border: '2px solid #1f2937', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <option value="budget">Budget ($10-30) - Value-focused messaging</option>
                    <option value="mid">Mid-Range ($30-100) - Quality + Value balance</option>
                    <option value="premium">Premium ($100+) - Luxury positioning</option>
                  </select>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Helps us match the tone to your price point</p>
                </div>
                <button type="submit" disabled={loading || !formData.productName || titleLength > LIMITS[marketplace].title} className="btn-primary" style={{ padding: '1rem', fontSize: '1rem', opacity: (loading || !formData.productName || titleLength > LIMITS[marketplace].title) ? 0.5 : 1, cursor: (loading || !formData.productName || titleLength > LIMITS[marketplace].title) ? 'not-allowed' : 'pointer' }}>
                  {loading ? '⚡ Generating with AI...' : '🚀 Generate Listing'}
                </button>
                {titleLength > LIMITS[marketplace].title && <p style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center', marginTop: '-0.5rem' }}>⚠️ Product name exceeds {marketplace} character limit!</p>}
              </form>
            </div>
            <div className="card">
              {result ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981' }}>📊 Quality Scores</h3>
                      {!isPro && <button onClick={() => router.push('/pricing')} style={{ padding: '0.35rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.375rem', color: '#10b981', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>⭐ Unlock Score Boost</button>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                      {[
                        { label: 'SEO', value: animatedScores.seo, target: result.seoScore, color: getScoreColor(result.seoScore), key: 'seo' },
                        { label: 'Convert', value: animatedScores.conversion, target: result.conversionScore, color: getScoreColor(result.conversionScore), key: 'conversion' },
                        { label: 'Readable', value: animatedScores.readability, target: result.readabilityScore, color: getScoreColor(result.readabilityScore), key: 'readability' },
                        { label: 'Quality', value: animatedScores.errors, target: result.errorScore, color: getScoreColor(result.errorScore), key: 'quality' },
                      ].map((score) => (
                        <div key={score.label} style={{ textAlign: 'center', background: '#0a0e1a', padding: '0.75rem', borderRadius: '0.5rem', position: 'relative' }} onMouseEnter={() => setHoveredScore(score.key)} onMouseLeave={() => setHoveredScore(null)}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: score.color, marginBottom: '0.25rem' }}>{score.value}%</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{score.label}</span>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(107, 114, 128, 0.2)', border: '1px solid rgba(107, 114, 128, 0.3)', fontSize: '0.6rem', fontWeight: 600, color: '#9ca3af', cursor: 'help' }}>i</div>
                          </div>
                          {score.target < 95 && (
                            <button onClick={() => handleImproveScore(score.key)} disabled={improving === score.key || !isPro} style={{ width: '100%', padding: '0.25rem', background: isPro ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)', border: isPro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(107, 114, 128, 0.3)', borderRadius: '0.25rem', color: isPro ? '#10b981' : '#6b7280', fontSize: '0.65rem', cursor: isPro ? 'pointer' : 'not-allowed', fontWeight: 600, opacity: improving === score.key ? 0.5 : 1 }}>
                              {improving === score.key ? '⏳ Boosting...' : isPro ? '🔄 Boost' : '🔒 Pro Only'}
                            </button>
                          )}
                          {hoveredScore === score.key && (
                            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '0.5rem', padding: '0.75rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', minWidth: '200px', maxWidth: '250px', fontSize: '0.75rem', lineHeight: 1.5, color: '#e5e7eb', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
                              {scoreExplanations[score.key]}
                              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1f2937' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>📝 SEO Title ({result.title.length} chars)</h3>
                      <button onClick={() => copyToClipboard(result.title)} style={{ background: 'none', border: '1px solid #1f2937', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem' }}>📋 Copy</button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.875rem', lineHeight: 1.6 }}>{result.title}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>🎯 Conversion Bullets</h3>
                      <button onClick={() => copyToClipboard(result.bullets.map(b => `${b.hook}: ${b.detail}`).join('\n'))} style={{ background: 'none', border: '1px solid #1f2937', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem' }}>📋 Copy</button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem' }}>
                      <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem', lineHeight: 1.8 }}>
                        {result.bullets.map((bullet, i) => (
                          <li key={i} style={{ marginBottom: '0.75rem' }}><span style={{ fontWeight: 600, color: '#10b981' }}>{bullet.hook}:</span> {bullet.detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>📖 Description ({result.description.length} chars)</h3>
                      <button onClick={() => copyToClipboard(result.description)} style={{ background: 'none', border: '1px solid #1f2937', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem' }}>📋 Copy</button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.875rem', lineHeight: 1.6 }}>{result.description}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>🏷️ SEO Meta Data</h3>
                      <button onClick={() => copyToClipboard(`Meta: ${result.metaData.metaDescription}\nKeywords: ${result.metaData.keywords}\nSlug: ${result.metaData.urlSlug}`)} style={{ background: 'none', border: '1px solid #1f2937', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem' }}>📋 Copy</button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.75rem', lineHeight: 1.6 }}>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Meta Description:</strong> {result.metaData.metaDescription}</p>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Keywords:</strong> {result.metaData.keywords}</p>
                      <p><strong>URL Slug:</strong> {result.metaData.urlSlug}</p>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>💻 HTML Output</h3>
                      <button onClick={() => copyToClipboard(result.htmlOutput)} style={{ background: 'none', border: '1px solid #1f2937', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem' }}>📋 Copy</button>
                    </div>
                    <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem', overflowX: 'auto' }}>
                      <pre style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{result.htmlOutput}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 1.25rem', color: '#9ca3af' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>⚡</div>
                  <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Ready to generate!</p>
                  <p style={{ fontSize: '0.875rem' }}>Fill in the 3 fields and hit generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showCsvModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }} onClick={() => !csvProcessing && setShowCsvModal(false)}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📂 Bulk CSV Upload</h2>
              {!csvProcessing && <button onClick={() => setShowCsvModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem' }}>×</button>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#60a5fa', lineHeight: 1.6, marginBottom: '0.75rem' }}><strong>CSV Format:</strong> Your file should have these columns:</p>
                <pre style={{ fontSize: '0.75rem', color: '#93c5fd', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.375rem', overflowX: 'auto' }}>Product Name,Features,Price Point{'\n'}RFID Wallet,"RFID blocking{'\n'}Italian leather{'\n'}Slim design",mid{'\n'}Yoga Mat,"Non-slip surface{'\n'}Eco-friendly{'\n'}6mm thick",budget</pre>
                <p style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: '0.5rem' }}>Price Point options: budget, mid, premium</p>
              </div>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <div style={{ border: '2px dashed #1f2937', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: csvFile ? 'rgba(16, 185, 129, 0.1)' : '#0a0e1a' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleCsvUpload({ target: { files: [file] } }) }}>
                  <input type="file" accept=".csv" onChange={handleCsvUpload} disabled={csvProcessing} style={{ display: 'none' }} />
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{csvFile ? '✅' : '📁'}</div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{csvFile ? csvFile.name : 'Click to upload or drag & drop'}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>CSV files only</p>
                </div>
              </label>
              {csvFile && !csvProcessing && !csvResults.length && <button onClick={processCsvFile} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>🚀 Generate All Listings</button>}
              {csvProcessing && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Processing...</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981' }}>{csvProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#1f2937', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${csvProgress}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              {csvResults.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>✅ Generated {csvResults.filter(r => r.success).length} / {csvResults.length}</h3>
                    <button onClick={downloadCsvResults} style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.375rem', color: '#10b981', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>📥 Download Results</button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#0a0e1a', borderRadius: '0.5rem', padding: '1rem' }}>
                    {csvResults.map((result, i) => (
                      <div key={i} style={{ padding: '0.75rem', marginBottom: '0.5rem', background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{result.success ? '✅' : '❌'} {result.productName}</div>
                        {!result.success && <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>Error: {result.error}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
