import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/api/client'

interface StatCard {
  label: string
  value: string | number
  sub?: string
  color: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ employees: 0, departments: 0, pendingLeave: 0, payroll: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, deptRes, leaveRes] = await Promise.allSettled([
          api.get('/employees'),
          api.get('/departments'),
          user?.role === 'MANAGER' && user.emp_id
            ? api.get(`/leave/requests/pending/${user.emp_id}`)
            : api.get('/leave/requests'),
        ])

        const employees = empRes.status === 'fulfilled' ? (empRes.value.data?.data?.length ?? empRes.value.data?.length ?? 0) : 0
        const departments = deptRes.status === 'fulfilled' ? (deptRes.value.data?.data?.length ?? deptRes.value.data?.length ?? 0) : 0
        const leaveData = leaveRes.status === 'fulfilled' ? (leaveRes.value.data?.data ?? leaveRes.value.data ?? []) : []
        const pendingLeave = Array.isArray(leaveData) ? leaveData.filter((l: any) => l.leave_status === 'pending').length : leaveData.length ?? 0

        setStats({ employees, departments, pendingLeave, payroll: 0 })
      } catch {}
      setLoading(false)
    }
    load()
  }, [user])

  const cards: StatCard[] = [
    { label: 'Total Employees', value: loading ? '…' : stats.employees, sub: 'Active headcount', color: '#1a56db' },
    { label: 'Departments', value: loading ? '…' : stats.departments, sub: 'Organizational units', color: '#0891b2' },
    { label: 'Pending Leave', value: loading ? '…' : stats.pendingLeave, sub: 'Awaiting approval', color: '#d97706' },
    { label: 'Your Employee ID', value: user?.emp_id ?? '—', sub: user?.role, color: '#7c3aed' },
  ]

  return (
    <div>
      <PageHeader
        title={`Good ${getTimeOfDay()}, ${user?.role}`}
        sub="Here's your EMS overview for today."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '22px 24px',
              borderTop: `4px solid ${c.color}`,
            }}
          >
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#0f2d6b', lineHeight: 1 }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <QuickLinks role={user?.role} />
        <RecentActivity empId={user?.emp_id} />
      </div>
    </div>
  )
}

function QuickLinks({ role }: { role?: string }) {
  const links = [
    { label: 'View Employees', href: '/employees', roles: ['ADMIN', 'HR', 'MANAGER'] },
    { label: 'Mark Attendance', href: '/attendance', roles: ['ADMIN', 'HR', 'MANAGER', 'STAFF'] },
    { label: 'Submit Leave Request', href: '/leave', roles: ['ADMIN', 'HR', 'MANAGER', 'STAFF'] },
    { label: 'View Payroll', href: '/payroll', roles: ['ADMIN', 'HR'] },
    { label: 'Manage Departments', href: '/departments', roles: ['ADMIN', 'HR'] },
    { label: 'Audit Logs', href: '/audit', roles: ['ADMIN'] },
  ].filter((l) => !role || l.roles.includes(role))

  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>Quick Actions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: '#f8faff',
              border: '1px solid #e8effd',
              borderRadius: 8,
              color: '#1a56db',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e8effd')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f8faff')}
          >
            {l.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}

function RecentActivity({ empId }: { empId?: number }) {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    if (!empId) return
    api.get(`/audit/audit-logs/employee/${empId}`).then((r) => {
      const data = r.data?.data ?? r.data ?? []
      setItems(Array.isArray(data) ? data.slice(0, 6) : [])
    }).catch(() => {})
  }, [empId])

  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>Recent Activity</h3>
      {items.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
          No recent activity found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#1a56db',
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 13, color: '#1e293b' }}>{item.action || item.description || 'Activity'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f2d6b', margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  )
}

export const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: 24,
}

export const cardTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: '#0f2d6b',
  margin: '0 0 16px',
}
