import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/api/client'
import netsolBuilding from '@/imports/image-1.png'

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
      const { data } = await api.post('/auth/login', { email, password })
      login(data.access_token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Left panel — brand */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px',
          overflow: 'hidden',
          minWidth: 0,
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
        {/* Dark blue overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,45,107,0.95) 40%, rgba(15,45,107,0.6) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <NetsolMark />
          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 700,
              lineHeight: 1.25,
              margin: '20px 0 12px',
            }}
          >
            Employee Management System
          </h1>
          <p style={{ color: '#93b4e8', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Streamline HR operations, attendance, payroll, and leave management — all in one secure platform.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 36 }}>
            {[['500+', 'Employees'], ['99.9%', 'Uptime'], ['ISO', 'Certified']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ color: '#4d94ff', fontWeight: 700, fontSize: 22 }}>{val}</div>
                <div style={{ color: '#93b4e8', fontSize: 12, marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 5vw, 64px)',
          boxShadow: '-4px 0 40px rgba(15,45,107,0.08)',
        }}
      >
        <div style={{ marginBottom: 40 }}>
          <NetsolMark />
          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#0f2d6b',
              margin: '20px 0 6px',
            }}
          >
            Welcome back
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Sign in to your EMS account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@netsol.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#1a56db')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#1a56db')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
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

        <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 40 }}>
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

function NetsolMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#1a56db" />
        <path d="M10 30 L10 10 L18 22 L18 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M22 10 L30 10 L30 30 L22 18 L22 30" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#0f2d6b', letterSpacing: 0.5 }}>NETSOL</div>
        <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>Technologies</div>
      </div>
    </div>
  )
}
