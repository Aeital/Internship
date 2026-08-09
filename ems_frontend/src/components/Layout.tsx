import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clock,
  DollarSign,
  Heart,
  ShieldCheck,
  LogOut,
  Menu,
} from 'lucide-react'

const ALL_NAV_ITEMS = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true, roles: ['ADMIN', 'HR', 'MANAGER', 'STAFF'] },
  { to: '/employees', label: 'Employees', Icon: Users, roles: ['ADMIN', 'HR', 'MANAGER'] },
  { to: '/departments', label: 'Departments', Icon: Building2, roles: ['ADMIN', 'HR'] },
  { to: '/attendance', label: 'Attendance', Icon: CalendarCheck, roles: ['ADMIN', 'HR', 'MANAGER', 'STAFF'] },
  { to: '/leave', label: 'Leave', Icon: Clock, roles: ['ADMIN', 'HR', 'MANAGER', 'STAFF'] },
  { to: '/payroll', label: 'Payroll', Icon: DollarSign, roles: ['ADMIN', 'HR', 'STAFF','MANAGER'] },
  { to: '/audit', label: 'Audit Logs', Icon: ShieldCheck, roles: ['ADMIN'] },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleItems = ALL_NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? 64 : 240,
          minWidth: collapsed ? 64 : 240,
          background: '#0f2d6b',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? '20px 16px' : '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <NetsolLogo size={32} />
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>
                NETSOL
              </div>
              <div style={{ color: '#93b4e8', fontSize: 10, fontWeight: 400, letterSpacing: 1, textTransform: 'uppercase' }}>
                EMS Portal
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 20px' : '10px 24px',
                color: isActive ? '#fff' : '#93b4e8',
                background: isActive ? 'rgba(26,86,219,0.6)' : 'transparent',
                borderLeft: isActive ? '3px solid #4d94ff' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              {({ isActive }) => (
                <>
                  <item.Icon size={18} color={isActive ? '#fff' : '#93b4e8'} strokeWidth={isActive ? 2.2 : 1.8} />
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User & Collapse */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 16, flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#1a56db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {user?.role?.[0]}
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{user?.role}</div>
                  <div style={{ color: '#93b4e8', fontSize: 11 }}>ID: {user?.emp_id}</div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              color: '#93b4e8',
              cursor: 'pointer',
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header
          style={{
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setCollapsed((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Welcome,</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#0f2d6b',
                background: '#e8effd',
                padding: '3px 10px',
                borderRadius: 99,
              }}
            >
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NetsolLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#1a56db" />
      <path d="M10 30 L10 10 L18 22 L18 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M22 10 L30 10 L30 30 L22 18 L22 30" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
