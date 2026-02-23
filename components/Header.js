import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

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
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <Link href="/">
          <a style={{ 
            fontSize: '1.25rem',
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
              animation: 'pulse 2s ease-in-out infinite'
            }}>⚡</span> ListingWriter
          </a>
        </Link>

        {session ? (
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            flex: 1
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

            <Link href="/profile">
              <a style={{ 
                color: router.pathname === '/profile' ? '#10b981' : '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.color = '#10b981'}
              onMouseLeave={(e) => e.target.style.color = router.pathname === '/profile' ? '#10b981' : '#9ca3af'}
              >
                Profile
              </a>
            </Link>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              paddingLeft: '0.5rem',
              borderLeft: '1px solid #1f2937'
            }}>
              <img 
                src={session.user.image} 
                alt="Profile" 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%',
                  border: '2px solid #10b981'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: '#9ca3af',
                  lineHeight: 1,
                  display: 'none'
                }}>
                  {session.user.name}
                </span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 600,
                  color: '#10b981',
                  textTransform: 'capitalize',
                  lineHeight: 1
                }}>
                  {session.user.tier || 'free'}
                </span>
              </div>
            </div>
          </nav>
        ) : (
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <Link href="/pricing">
              <a style={{ 
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.875rem',
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
              onClick={() => router.push('/')}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: '#0a0e1a',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
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

        /* Mobile specific fixes */
        @media (max-width: 768px) {
          header div {
            padding: 0.75rem !important;
          }
          
          nav {
            width: 100%;
            justify-content: space-between !important;
          }
          
          nav a {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </header>
  )
}
