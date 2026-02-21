import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useEffect } from 'react'
import Header from '../components/Header'
import Pricing from '../components/Pricing'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Count up animation
    function countUp() {
      const counter = document.getElementById('seller-count')
      if (!counter) return
      
      let count = 0
      const target = 2000
      const duration = 2000
      const increment = target / (duration / 16)
      
      const timer = setInterval(() => {
        count += increment
        if (count >= target) {
          counter.textContent = target.toLocaleString()
          clearInterval(timer)
        } else {
          counter.textContent = Math.floor(count).toLocaleString()
        }
      }, 16)
    }
    
    // Scroll reveal
    function reveal() {
      const reveals = document.querySelectorAll('.scroll-reveal')
      reveals.forEach(el => {
        const windowHeight = window.innerHeight
        const elementTop = el.getBoundingClientRect().top
        const elementVisible = 150
        
        if (elementTop < windowHeight - elementVisible) {
          el.classList.add('revealed')
        }
      })
    }
    
    window.addEventListener('scroll', reveal)
    countUp()
    reveal()

    return () => {
      window.removeEventListener('scroll', reveal)
    }
  }, [])

  if (status === 'authenticated') {
    router.push('/dashboard')
    return null
  }

  return (
    <>
      <Head>
        <title>ListingWriter - Listings that actually sell</title>
      </Head>

      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f3f4f6' }}>
        <Header />
        
        {/* Hero */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%, rgba(59, 130, 246, 0.1) 100%)' }} />
          <div style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
            <div 
              id="trust-badge"
              className="ring-pulse"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem 1rem', 
                borderRadius: '9999px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                color: '#10b981', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                marginBottom: '2rem' 
              }}
            >
              ⚡ Trusted by <span id="seller-count" style={{ fontWeight: 700 }}>0</span>+ sellers worldwide
            </div>
            
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: 1.1 }}>
              Listings that <span className="gradient-text">actually sell.</span>
            </h1>
            
            <p style={{ fontSize: '1.5rem', color: '#9ca3af', maxWidth: '900px', margin: '0 auto 3rem' }}>
              Generate SEO-optimized product listings for Amazon, Shopify, and eBay in seconds. Better keywords, better structure, better conversions.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Start Writing Free →
              </button>
            </div>
          </div>
        </section>

        <div style={{ padding: '6rem 2rem', background: '#0f1419', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937' }}>
  <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
    
    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Why ListingWriter <span style={{ color: '#10b981' }}>Destroys</span> ChatGPT
      </h2>
      <p style={{ fontSize: '1.25rem', color: '#9ca3af' }}>
        Stop wasting hours prompting ChatGPT. We've done the hard work for you.
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
      
      {/* ChatGPT - The Bad Way */}
      <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '2rem' }}>
          😤 Using ChatGPT
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem', lineHeight: 2 }}>
          <li>❌ 30+ minutes crafting the perfect prompt</li>
          <li>❌ Generic output - looks like everyone else</li>
          <li>❌ No SEO optimization - rankings tank</li>
          <li>❌ Ignores marketplace character limits</li>
          <li>❌ No quality scores - flying blind</li>
          <li>❌ Manual formatting for each marketplace</li>
          <li>❌ No bulk CSV processing</li>
          <li>❌ Result: Low conversions, wasted time</li>
        </ul>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>30+ min</div>
          <div style={{ fontSize: '0.875rem', color: '#fca5a5' }}>per listing</div>
        </div>
      </div>

      {/* ListingWriter - The Smart Way */}
      <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '2px solid rgba(16, 185, 129, 0.5)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '2rem' }}>
          ⚡ Using ListingWriter
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem', lineHeight: 2 }}>
          <li>✓ <strong>3 simple fields</strong> - done in 30 seconds</li>
          <li>✓ <strong>Marketplace-specific AI</strong> trained on $100M+ sales</li>
          <li>✓ <strong>Automatic SEO</strong> - rank higher instantly</li>
          <li>✓ <strong>Auto character limits</strong> - always compliant</li>
          <li>✓ <strong>Quality scores</strong> - SEO, Conversion, Readability</li>
          <li>✓ <strong>One-click boost</strong> - improve any score</li>
          <li>✓ <strong>CSV bulk upload</strong> - 50 products in minutes</li>
          <li>✓ <strong>Result: 3x conversions, 95% time saved</strong></li>
        </ul>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>30 sec</div>
          <div style={{ fontSize: '0.875rem', color: '#34d399' }}>per listing</div>
        </div>
      </div>
    </div>

    {/* The Numbers */}
    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))', border: '2px solid #10b981', padding: '2rem', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#10b981' }}>
        💰 The Math That'll Blow Your Mind
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>60x</div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Faster</div>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>95%</div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Time Saved</div>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>3x</div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Conversions</div>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>$0.58</div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Per Listing</div>
        </div>
      </div>
      <p style={{ fontSize: '1.125rem', color: '#d1d5db' }}>
        Stop wasting <strong style={{ color: '#ef4444' }}>$50/hour</strong> of your time. 
        Our AI does it in <strong style={{ color: '#10b981' }}>30 seconds</strong> with better results.
      </p>
    </div>

  </div>
</div>

        {/* Pricing */}
        <div className="scroll-reveal">
          <Pricing />
        </div>

        {/* CTA */}
        <section className="scroll-reveal" style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, #0a0e1a 50%, rgba(59, 130, 246, 0.1) 100%)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Ready to write listings that sell?</h2>
            <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '2.5rem' }}>Start free. No credit card required.</p>
            <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 3rem' }}>
              Start Writing Free →
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid #1f2937', padding: '3rem 2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>⚡ ListingWriter</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>© 2026 ListingWriter. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}
