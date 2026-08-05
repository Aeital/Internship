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