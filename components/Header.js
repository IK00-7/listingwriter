import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  // Get first name only for mobile
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
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link href="/">
          <a style={{ 
            fontSize: '1.15rem',
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
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
            <span style={{ 
              display: 'inline-block',
              animation: 'pulse 2s ease-in-out infinite',
              fontSize: '1rem'
            }}>⚡</span>
            <span className="hide-on-tiny-mobile">ListingWriter</span>
            <span className="show-on-tiny-mobile" style={{ display: 'none' }}>LW</span>
          </a>
        </Link>

        {/* Navigation */}
        {session ? (
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem'
          }}>
            <Link href="/dashboard">
              <a style={{ 
                color: router.pathname === '/dashboard' ? '#10b981' : '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = router.pathname === '/dashboard' ? '#10b981' : '#9ca3af'}
              >
                Dashboard
              </a>
            </Link>

            <Link href="/history">
              <a style={{ 
                color: router.pathname === '/history' ? '#10b981' : '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = router.pathname === '/history' ? '#10b981' : '#9ca3af'}
              >
                History
              </a>
            </Link>

            <Link href="/pricing">
              <a style={{ 
                color: router.pathname === '/pricing' ? '#10b981' : '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = router.pathname === '/pricing' ? '#10b981' : '#9ca3af'}
              >
                Pricing
              </a>
            </Link>

            {/* User name as Profile button */}
            <Link href="/profile">
              <a style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                background: router.pathname === '/profile' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.05)',
                border: `1px solid ${router.pathname === '/profile' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)'}`,
                borderRadius: '0.375rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'
              }}
              onMouseLeave={(e) => {
                if (router.pathname !== '/profile') {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'
                }
              }}
              >
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%',
                    border: '1.5px solid #10b981'
                  }}
                />
                <span style={{ 
                  fontSize: '0.75rem', 
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
            gap: '0.75rem'
          }}>
            <Link href="/pricing">
              <a style={{ 
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                Pricing
              </a>
            </Link>

            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: '#0a0e1a',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.background = '#34d399'}
              onMouseLeave={(e) => e.target.style.background = '#10b981'}
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
            transform: scale(1.1);
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          header div {
            padding: 0.65rem 0.75rem !important;
          }
          
          nav {
            gap: 0.5rem !important;
          }
          
          nav a {
            font-size: 0.7rem !important;
          }
        }

        /* Extra tiny mobile */
        @media (max-width: 390px) {
          .hide-on-tiny-mobile {
            display: none !important;
          }
          
          .show-on-tiny-mobile {
            display: inline !important;
          }
        }
      `}</style>
    </header>
  )
}
