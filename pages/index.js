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

        {/* Demo Section */}
        <section id="demo" style={{ padding: '6rem 2rem', background: '#141824' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Before vs After</h2>
              <p style={{ fontSize: '1.25rem', color: '#9ca3af' }}>See the difference ListingWriter makes</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
              {/* Before */}
              <div className="card card-error scroll-reveal">
                <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  ❌ Before
                </div>
                <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#d1d5db' }}>Wireless Bluetooth Headphones</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Good headphones with bluetooth. Has noise cancelling and long battery. Comfortable to wear. Works with phone and computer. Good sound quality. Buy now.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>SEO: 25%</span>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Conversion: 18%</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                  <p>⚠️ Vague language ("good", "quality")</p>
                  <p>⚠️ No structure or bullets</p>
                  <p>⚠️ Poor SEO optimization</p>
                </div>
              </div>

              {/* After */}
              <div className="card scroll-reveal delay-200" style={{ border: '2px solid #10b981' }}>
                <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  ✅ After — ListingWriter
                </div>
                <div style={{ background: '#0a0e1a', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Premium Wireless Bluetooth Headphones - Active Noise Cancelling, 40hr Battery | Professional Audio</h3>
                  <ul style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '1rem', listStyle: 'none', padding: 0 }}>
                    <li>🎯 <strong>Advanced ANC Technology</strong> — Block out distractions</li>
                    <li>🔋 <strong>40-Hour Battery Life</strong> — All-day listening</li>
                    <li>⭐ <strong>Hi-Fi Sound</strong> — Studio-quality audio</li>
                  </ul>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>SEO: 92%</span>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Conversion: 87%</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#10b981' }}>
                  <p>✅ Platform-compliant formatting</p>
                  <p>✅ SEO + meta data included</p>
                  <p>✅ Ready to paste and publish</p>
                </div>
              </div>
            </div>
          </div>
        </section>

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