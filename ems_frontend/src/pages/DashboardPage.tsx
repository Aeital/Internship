import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/api/client'
import { Link } from 'react-router'
import {
  CalendarCheck,
  Clock,
  Users,
  Building2,
  ChevronRight,
  LogIn,
  LogOut,
  Briefcase,
  Hash,
  MapPin,
  UserCircle,
  CalendarDays,
  DollarSign,
  FileText,
} from 'lucide-react'

// ── Shared helpers ────────────────────────────────────────────────────────────

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f2d6b', margin: 0 }}>{title}</h1>
        {sub && <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
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

// ── Root: role-aware router ───────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'STAFF') return <StaffDashboard />
  return <AdminDashboard />
}

// ── Staff Dashboard ───────────────────────────────────────────────────────────

function StaffDashboard() {
  const { user } = useAuth()
  const [employee, setEmployee] = useState<any>(null)
  const [todayAtt, setTodayAtt] = useState<any>(null)
  const [monthAtt, setMonthAtt] = useState<any[]>([])
  const [leaveReqs, setLeaveReqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [empRes, attRes, leaveRes] = await Promise.allSettled([
        api.get(`/employees/${user?.emp_id}`),
        api.get(`/attendance/employee/${user?.emp_id}`),
        api.get(`/leave/requests/employee/${user?.emp_id}`),
      ])
      if (empRes.status === 'fulfilled') setEmployee(empRes.value.data?.data ?? empRes.value.data)
      if (attRes.status === 'fulfilled') {
        const all: any[] = attRes.value.data?.data ?? attRes.value.data ?? []
        const today = new Date().toISOString().split('T')[0]
        setTodayAtt(all.find((a: any) => a.att_date === today) ?? null)
        setMonthAtt(all)
      }
      if (leaveRes.status === 'fulfilled') setLeaveReqs(leaveRes.value.data?.data ?? leaveRes.value.data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  const presentCount = monthAtt.filter((a) => a.att_status === 'present').length
  const lateCount = monthAtt.filter((a) => {
  if (!a.check_in) return false
  const [h, m] = a.check_in.split(':').map(Number)
  return h > 9 || (h === 9 && m > 15)
  }).length
  const pendingLeave = leaveReqs.filter((l) => l.leave_status === 'pending').length

  const greeting = getGreeting()

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f2d6b', margin: 0 }}>
          {greeting}, {employee?.emp_name?.split(' ')[0] ?? 'Employee'}
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
          Here is your daily overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>
        {/* Today's Attendance Card */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f2d6b' }}>Today's Attendance</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <StatusPill att={todayAtt} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            {/* Check In */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <LogIn size={20} color={todayAtt?.check_in ? '#1a56db' : '#cbd5e1'} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>Check In</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: todayAtt?.check_in ? '#0f2d6b' : '#cbd5e1' }}>
                {todayAtt?.check_in ? formatTime12(todayAtt.check_in) : '--:--'}
              </div>
            </div>

            {/* Elapsed */}
            <div style={{ textAlign: 'center', minWidth: 120 }}>
              <ElapsedBar checkIn={todayAtt?.check_in} checkOut={todayAtt?.check_out} />
            </div>

            {/* Check Out */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <LogOut size={20} color={todayAtt?.check_out ? '#1a56db' : '#cbd5e1'} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>Check Out</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: todayAtt?.check_out ? '#0f2d6b' : '#cbd5e1' }}>
                {todayAtt?.check_out ? formatTime12(todayAtt.check_out) : '--:--'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/attendance" style={{ flex: 1, background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              View Attendance
            </Link>
            <Link to="/leave" style={{ flex: 1, background: '#fff', color: '#1a56db', border: '1.5px solid #1a56db', borderRadius: 10, padding: '11px', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              Request Leave
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#e8effd',
              border: '3px solid #1a56db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <UserCircle size={36} color="#1a56db" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f2d6b' }}>{employee?.emp_name ?? '—'}</div>
          <div style={{ fontSize: 13, color: '#1a56db', marginTop: 3, marginBottom: 20 }}>{employee?.staff_grade ?? 'Staff'}</div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ProfileRow icon={<Briefcase size={14} color="#64748b" />} label="Department" value={`Dept ${employee?.dept_id ?? '—'}`} />
            <ProfileRow icon={<Hash size={14} color="#64748b" />} label="Employee ID" value={`EMP-${String(user?.emp_id ?? '').padStart(4, '0')}`} />
            <ProfileRow icon={<MapPin size={14} color="#64748b" />} label="Role" value={user?.role ?? '—'} />
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <MiniStat icon={<CalendarCheck size={18} color="#1a56db" />} label="Days Present (MTD)" value={loading ? '…' : presentCount} bg="#e8effd" />
        <MiniStat icon={<Clock size={18} color="#d97706" />} label="Late Arrivals" value={loading ? '…' : lateCount} bg="#fff7ed" />
        <MiniStat icon={<FileText size={18} color="#7c3aed" />} label="Pending Leave" value={loading ? '…' : pendingLeave} bg="#f3eeff" />
      </div>

      {/* Recent attendance */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f2d6b' }}>Recent Attendance</div>
          <a href="/attendance" style={{ fontSize: 13, color: '#1a56db', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            View all <ChevronRight size={14} />
          </a>
        </div>
        <RecentAttTable records={monthAtt.slice(0, 5)} loading={loading} />
      </div>
    </div>
  )
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
        {icon}
        <span>{label}</span>
      </div>
      <span style={{ fontWeight: 600, color: '#0f2d6b' }}>{value}</span>
    </div>
  )
}

function MiniStat({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number | string; bg: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#0f2d6b', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

function StatusPill({ att }: { att: any }) {
  if (!att) return <Pill bg="#f1f5f9" color="#64748b" dot="#94a3b8" label="Not Marked" />
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    present: { bg: '#dcfce7', color: '#16a34a', dot: '#16a34a', label: 'Present' },
    late: { bg: '#fff7ed', color: '#d97706', dot: '#d97706', label: 'Late' },
    absent: { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Absent' },
    half_day: { bg: '#fef9c3', color: '#ca8a04', dot: '#ca8a04', label: 'Half Day' },
  }
  const s = map[att.att_status] ?? { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8', label: att.att_status }
  return <Pill {...s} />
}

function Pill({ bg, color, dot, label }: { bg: string; color: string; dot: string; label: string }) {
  return (
    <div style={{ background: bg, color, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {label}
    </div>
  )
}

function ElapsedBar({ checkIn, checkOut }: { checkIn?: string; checkOut?: string }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  if (!checkIn) {
    return <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>Not checked in</div>
  }

  const todayBase = new Date().toISOString().split('T')[0]
  const inTime = new Date(`${todayBase}T${checkIn}`)
  const outTime = checkOut ? new Date(`${todayBase}T${checkOut}`) : now
  const elapsedMs = Math.max(0, outTime.getTime() - inTime.getTime())
  const hours = Math.floor(elapsedMs / 3_600_000)
  const mins = Math.floor((elapsedMs % 3_600_000) / 60_000)
  const pct = Math.min(100, (elapsedMs / (9 * 3_600_000)) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#1a56db', borderRadius: 99, transition: 'width 0.5s' }} />
      </div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
        {hours}h {mins}m Elapsed
      </div>
    </div>
  )
}

function RecentAttTable({ records, loading }: { records: any[]; loading: boolean }) {
  if (loading) return <div style={{ height: 80, background: '#f8faff', borderRadius: 8 }} />
  if (records.length === 0) return <div style={{ color: '#94a3b8', fontSize: 13, padding: '16px 0' }}>No attendance records yet.</div>
  const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
    present: { bg: '#dcfce7', fg: '#16a34a' }, absent: { bg: '#fef2f2', fg: '#dc2626' },
    half_day: { bg: '#fef9c3', fg: '#ca8a04' }, late: { bg: '#fff7ed', fg: '#d97706' },
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
      <thead>
        <tr>
          {['Date', 'Check In', 'Check Out', 'Status'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11.5, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((r, i) => {
          const sc = STATUS_COLORS[r.att_status] ?? { bg: '#f1f5f9', fg: '#64748b' }
          return (
            <tr key={i} style={{ borderBottom: i < records.length - 1 ? '1px solid #f8faff' : 'none' }}>
              <td style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 500 }}>{new Date(r.att_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
              <td style={{ padding: '10px 12px', color: '#64748b' }}>{r.check_in ? formatTime12(r.check_in) : '—'}</td>
              <td style={{ padding: '10px 12px', color: '#64748b' }}>{r.check_out ? formatTime12(r.check_out) : '—'}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ background: sc.bg, color: sc.fg, fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99, textTransform: 'capitalize' }}>{r.att_status?.replace('_', ' ')}</span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Admin/HR/Manager Dashboard (preserved) ────────────────────────────────────

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ employees: 0, departments: 0, pendingLeave: 0 })
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
        const pendingLeave = Array.isArray(leaveData) ? leaveData.filter((l: any) => l.leave_status === 'pending').length : 0
        setStats({ employees, departments, pendingLeave })
      } catch {}
      setLoading(false)
    }
    load()
  }, [user])

  const cards = [
    { label: 'Total Employees', value: loading ? '…' : stats.employees, sub: 'Active headcount', color: '#1a56db', Icon: Users },
    { label: 'Departments', value: loading ? '…' : stats.departments, sub: 'Organizational units', color: '#0891b2', Icon: Building2 },
    { label: 'Pending Leave', value: loading ? '…' : stats.pendingLeave, sub: 'Awaiting approval', color: '#d97706', Icon: Clock },
    { label: 'Your Employee ID', value: user?.emp_id ?? '—', sub: user?.role, color: '#7c3aed', Icon: Hash },
  ]

  return (
    <div>
      <PageHeader
        title={`Good ${getGreeting()}, ${user?.role}`}
        sub="Here's your EMS overview for today."
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '22px 24px', borderTop: `4px solid ${c.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <c.Icon size={16} color={c.color} />
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{c.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#0f2d6b', lineHeight: 1 }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{c.sub}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <AdminQuickLinks role={user?.role} />
        <div style={cardStyle}>
          <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Activity feed loads from audit logs</div>
        </div>
      </div>
    </div>
  )
}

function AdminQuickLinks({ role }: { role?: string }) {
  const links = [
    { label: 'View Employees', href: '/employees', roles: ['ADMIN', 'HR', 'MANAGER'], Icon: Users },
    { label: 'Mark Attendance', href: '/attendance', roles: ['ADMIN', 'HR', 'MANAGER'], Icon: CalendarCheck },
    { label: 'Leave Approvals', href: '/leave', roles: ['ADMIN', 'HR', 'MANAGER'], Icon: Clock },
    { label: 'View Payroll', href: '/payroll', roles: ['ADMIN', 'HR'], Icon: DollarSign },
    { label: 'Manage Departments', href: '/departments', roles: ['ADMIN', 'HR'], Icon: Building2 },
    { label: 'Audit Logs', href: '/audit', roles: ['ADMIN'], Icon: FileText },
  ].filter((l) => !role || l.roles.includes(role))
  return (
    <div style={cardStyle}>
      <div style={cardTitleStyle}>Quick Actions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map((l) => (
          <a key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8faff', border: '1px solid #e8effd', borderRadius: 8, color: '#1a56db', textDecoration: 'none', fontSize: 13.5, fontWeight: 500, transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e8effd')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f8faff')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><l.Icon size={15} />{l.label}</div>
            <ChevronRight size={14} />
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime12(t: string) {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
}
