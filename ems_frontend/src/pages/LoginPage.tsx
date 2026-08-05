import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/api/client'
import netsolBuilding from '@/imports/image-1.png'
import netsolLogo from '@/imports/image.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
      })

      login(data.access_token)
      navigate('/')
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Invalid credentials. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {/* Left Panel */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '64px 56px',
        }}
      >
        <img
          src={netsolBuilding}
          alt="NETSOL Technologies headquarters"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
          }}
        >
          <div
  style={{
    width: '100%',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: '18px 22px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  }}
>
  <p
    style={{
      margin: 0,
      color: '#fff',
      fontSize: 15,
      lineHeight: 1.6,
      fontWeight: 400,
    }}
  >
    Empowering automotive finance and digital retail with intelligent,
    cloud-native solutions built for speed, flexibility, and innovation.
  </p>
</div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 5vw, 64px)',
          boxShadow: '-4px 0 40px rgba(15,45,107,0.08)',
        }}
      >
        <div style={{ marginBottom: 40 }}>
          <img
            src={netsolLogo}
            alt="NETSOL Technologies"
            style={{
              height: 36,
              marginBottom: 24,
            }}
          />

          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#0f2d6b',
              margin: '0 0 6px',
            }}
          >
            Welcome back
          </h2>

          <p
            style={{
              color: '#64748b',
              fontSize: 14,
              margin: 0,
            }}
          >
            Sign in to your EMS account to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <label style={labelStyle}>Email Address</label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@netsol.com"
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = '#1a56db')
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = '#e2e8f0')
              }
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = '#1a56db')
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = '#e2e8f0')
              }
            />
          </div>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#93b4e8' : '#1a56db',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '14px',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p
          style={{
            color: '#94a3b8',
            fontSize: 12,
            textAlign: 'center',
            marginTop: 40,
          }}
        >
          © {new Date().getFullYear()} NETSOL Technologies. All rights reserved.
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'Poppins, sans-serif',
  color: '#1e293b',
  outline: 'none',
  transition: 'border-color 0.15s',
  background: '#fafbff',
}