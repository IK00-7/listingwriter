import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  const firstName = session?.user?.name?.split(' ')[0] || 'Account'

  return (
    <header style={{ 
      background: '#141824', 
      borderBottom: '1px solid #1f2937',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo - NOW GOES TO HOMEPAGE */}
        <Link href="/">
          <a style={{ 
            fontSize: '1.5rem',
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.filter = 'brightness(1.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.filter = 'brightness(1)'
          }}
          >
            {/* Lightning with animation */}
            <span style={{ 
              display: 'inline-block',
              animation: 'pulse 2s ease-in-out infinite',
              fontSize: '1.5rem'
            }}>⚡</span>
            <span className="hide-on-mobile-logo">ListingWriter</span>
          </a>
        </Link>

        {/* Navigation */}
        {session ? (
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem'
          }}>
            <Link href="/dashboard">
              <a style={{ 
                color: router.pathname === '/dashboard' ? '#10b981' : '#d1d5db',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = router.pathname === '/dashboard' ? '#10b981' : '#d1d5db'}
              >
                Dashboard
              </a>
            </Link>

            <Link href="/history">
              <a style={{ 
                color: router.pathname === '/history' ? '#10b981' : '#d1d5db',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = router.pathname === '/history' ? '#10b981' : '#d1d5db'}
              >
                History
              </a>
            </Link>

            <Link href="/pricing">
              <a style={{ 
                color: router.pathname === '/pricing' ? '#10b981' : '#d1d5db',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = router.pathname === '/pricing' ? '#10b981' : '#d1d5db'}
              >
                Pricing
              </a>
            </Link>

            {/* User profile button */}
            <Link href="/profile">
              <a style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.85rem',
                background: router.pathname === '/profile' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                border: `2px solid ${router.pathname === '/profile' ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}`,
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                e.currentTarget.style.borderColor = '#10b981'
              }}
              onMouseLeave={(e) => {
                if (router.pathname !== '/profile') {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'
                }
              }}
              >
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%',
                    border: '2px solid #10b981'
                  }}
                />
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  color: '#10b981'
                }}>
                  {firstName}
                </span>
              </a>
            </Link>
          </nav>
        ) : (
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem'
          }}>
            <Link href="/pricing">
              <a style={{ 
                color: '#d1d5db',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              >
                Pricing
              </a>
            </Link>

            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              style={{
                padding: '0.65rem 1.5rem',
                background: '#10b981',
                color: '#0a0e1a',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#34d399'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#10b981'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Get Started
            </button>
          </nav>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          header > div {
            padding: 0.85rem 1rem !important;
          }
          
          nav {
            gap: 0.75rem !important;
          }
          
          nav a {
            font-size: 0.85rem !important;
          }
          
          .hide-on-mobile-logo {
            display: none;
          }
        }

        /* Desktop */
        @media (min-width: 769px) {
          .hide-on-mobile-logo {
            display: inline;
          }
        }
      `}</style>
    </header>
  )
}
