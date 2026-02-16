import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0a0e1a', borderBottom: '1px solid #1f2937', padding: '1rem 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
     <button
  onClick={() => router.push('/')}
  style={{ 
    background: 'none', 
    border: 'none', 
    color: '#10b981', 
    fontSize: '1.5rem', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem',
    transition: 'all 0.3s ease'
  }}
  className="logo-hover"
>
  <span style={{ display: 'inline-block' }} className="logo-icon">⚡</span>
  <span style={{ 
    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}>ListingWriter</span>
</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {session ? (
            <>
              {router.pathname !== '/dashboard' && (
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  Dashboard
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{session.user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>{session.user.tier || 'free'} Plan</p>
                </div>
                <button
                  onClick={() => signOut()}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.5rem' }}
                  title="Sign out"
                >
                  🚪
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="btn-primary"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </header>
  )
}