import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { Modal, Field, LoadingRows, primaryBtn, cancelBtn, fLabel, fInput, errorBox } from './EmployeesPage'
import { Plus, ChevronLeft, ChevronRight, CalendarDays, Umbrella, Stethoscope, Coffee } from 'lucide-react'

interface LeaveRequest {
  leave_id: number
  emp_id: number
  type_id: number
  start_date: string
  end_date: string
  leave_status: 'pending' | 'approved' | 'rejected'
  approved_by?: number
}

interface LeaveType {
  type_id: number
  type_name: string
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#fff7ed', fg: '#d97706' },
  approved: { bg: '#dcfce7', fg: '#16a34a' },
  rejected: { bg: '#fef2f2', fg: '#dc2626' },
}

// ── Root: role-aware ──────────────────────────────────────────────────────────

export default function LeavePage() {
  const { user } = useAuth()
  if (user?.role === 'STAFF') return <StaffLeave />
  return <AdminLeave />
}

// ── Staff Leave View ──────────────────────────────────────────────────────────

function StaffLeave() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [types, setTypes] = useState<LeaveType[]>([])
  const [balances, setBalances] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ type_id: '', start_date: '', end_date: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [calMonth, setCalMonth] = useState(new Date())

  const loadAll = async () => {
    setLoading(true)
    try {
      const [reqRes, typeRes] = await Promise.allSettled([
        api.get(`/leave/requests/employee/${user?.emp_id}`),
        api.get('/leave/types'),
      ])
      let fetchedTypes: LeaveType[] = []
      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data?.data ?? reqRes.value.data ?? [])
      if (typeRes.status === 'fulfilled') {
        fetchedTypes = typeRes.value.data?.data ?? typeRes.value.data ?? []
        setTypes(fetchedTypes)
      }
      // Fetch balances for each type
      if (user?.emp_id && fetchedTypes.length > 0) {
        const balRes = await Promise.allSettled(
          fetchedTypes.map((t) => api.get(`/leave/balance/${user.emp_id}/${t.type_id}`))
        )
        const bal: Record<number, number> = {}
        balRes.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            const d = r.value.data?.data ?? r.value.data
            bal[fetchedTypes[i].type_id] = d?.remaining_days ?? d?.balance ?? 0
          }
        })
        setBalances(bal)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const handleRequest = async () => {
    setSaving(true); setError('')
    try {
      await api.post('/leave/requests', { emp_id: user?.emp_id, type_id: Number(form.type_id), start_date: form.start_date, end_date: form.end_date })
      setModal(false); loadAll()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit request.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    try { await api.delete(`/leave/requests/${id}`); loadAll() } catch {}
  }

  // Balance card config per common type names
  const typeIcons: Record<string, React.ReactNode> = {
    annual: <Umbrella size={18} color="#1a56db" />,
    sick: <Stethoscope size={18} color="#dc2626" />,
    casual: <Coffee size={18} color="#16a34a" />,
  }
  const typeColors: Record<string, string> = {
    annual: '#1a56db', sick: '#dc2626', casual: '#16a34a',
  }
  const typeLimits: Record<string, number> = { annual: 20, sick: 10, casual: 5 }

  return (
    <div>
      <PageHeader
        title="Leave Management"
        sub="Manage your time off, view balances, and request leave."
        action={
          <button
            onClick={() => { setForm({ type_id: types[0]?.type_id?.toString() ?? '', start_date: '', end_date: '' }); setError(''); setModal(true) }}
            style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> Request Leave
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          {/* Balance cards */}
          {loading ? <LoadingRows /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
              {types.map((t) => {
                const key = t.type_name.toLowerCase()
                const color = typeColors[key] ?? '#1a56db'
                const limit = typeLimits[key] ?? 10
                const used = limit - (balances[t.type_id] ?? limit)
                const remaining = balances[t.type_id] ?? limit
                const pct = Math.max(0, Math.min(100, (remaining / limit) * 100))
                const icon = typeIcons[key] ?? <CalendarDays size={18} color={color} />
                return (
                  <div key={t.type_id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f2d6b' }}>{t.type_name}</div>
                      {icon}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f2d6b', lineHeight: 1, marginBottom: 4 }}>
                      {remaining}
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}> / {limit} DAYS</span>
                    </div>
                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, marginTop: 10 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                )
              })}
              {types.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>No leave types configured.</div>}
            </div>
          )}

          {/* Leave requests table */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f2d6b' }}>My Leave Requests</div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{requests.length} total</span>
            </div>

            {loading ? <LoadingRows /> : requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: 13 }}>
                <CalendarDays size={32} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
                No leave requests submitted yet.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr>
                    {['Leave Type', 'Dates', 'Duration', 'Status', ''].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11.5, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => {
                    const typeName = types.find((t) => t.type_id === r.type_id)?.type_name ?? `Type ${r.type_id}`
                    const sc = STATUS_COLORS[r.leave_status] ?? { bg: '#f1f5f9', fg: '#64748b' }
                    const days = calcDays(r.start_date, r.end_date)
                    const tKey = typeName.toLowerCase()
                    const tColor = typeColors[tKey] ?? '#1a56db'
                    return (
                      <tr key={r.leave_id} style={{ borderBottom: i < requests.length - 1 ? '1px solid #f8faff' : 'none' }}>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: tColor, display: 'inline-block', flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, color: '#0f2d6b' }}>{typeName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 12px', color: '#64748b', fontSize: 13 }}>
                          {formatDate(r.start_date)}<br />
                          {r.end_date !== r.start_date && <span style={{ color: '#94a3b8' }}>– {formatDate(r.end_date)}</span>}
                        </td>
                        <td style={{ padding: '12px 12px', fontWeight: 600, color: '#1e293b' }}>{days} Day{days !== 1 ? 's' : ''}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ background: sc.bg, color: sc.fg, fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99, textTransform: 'capitalize' }}>{r.leave_status}</span>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          {r.leave_status === 'pending' && (
                            <button onClick={() => handleDelete(r.leave_id)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Mini Calendar */}
        <div style={cardStyle}>
          <MiniCalendar month={calMonth} onPrev={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} onNext={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} requests={requests} />

          {/* Upcoming leave */}
          {(() => {
            const upcoming = requests.filter((r) => r.leave_status === 'approved' && new Date(r.start_date) >= new Date()).slice(0, 2)
            if (upcoming.length === 0) return null
            return (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Upcoming Leave</div>
                {upcoming.map((r) => (
                  <div key={r.leave_id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f8faff' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e8effd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarDays size={16} color="#1a56db" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f2d6b' }}>{types.find((t) => t.type_id === r.type_id)?.type_name ?? 'Leave'}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{formatDate(r.start_date)} · {calcDays(r.start_date, r.end_date)} Day(s)</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {modal && (
        <Modal title="New Leave Request" onClose={() => setModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={fLabel}>Leave Type</label>
              <select style={fInput} value={form.type_id} onChange={(e) => setForm({ ...form, type_id: e.target.value })}>
                <option value="">Select type…</option>
                {types.map((t) => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Start Date" type="date" value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} required />
              <Field label="End Date" type="date" value={form.end_date} onChange={(v) => setForm({ ...form, end_date: v })} required />
            </div>
            {form.start_date && form.end_date && (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0284c7', fontWeight: 500 }}>
                Duration: {calcDays(form.start_date, form.end_date)} day(s)
              </div>
            )}
          </div>
          {error && <div style={errorBox}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(false)} style={cancelBtn}>Cancel</button>
            <button onClick={handleRequest} disabled={saving} style={primaryBtn}>{saving ? 'Submitting…' : 'Submit Request'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function MiniCalendar({ month, onPrev, onNext, requests }: { month: Date; onPrev: () => void; onNext: () => void; requests: LeaveRequest[] }) {
  const year = month.getFullYear()
  const mon = month.getMonth()
  const label = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, mon, 1).getDay()
  const daysInMonth = new Date(year, mon + 1, 0).getDate()
  const today = new Date()

  const leaveDates = new Set<string>()
  requests.filter((r) => r.leave_status === 'approved').forEach((r) => {
    let d = new Date(r.start_date)
    const end = new Date(r.end_date)
    while (d <= end) {
      leaveDates.add(d.toISOString().split('T')[0])
      d = new Date(d.getTime() + 86_400_000)
    }
  })

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f2d6b' }}>Calendar</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 12.5, color: '#64748b', minWidth: 90, textAlign: 'center' }}>{label}</span>
          <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(mon + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = today.getFullYear() === year && today.getMonth() === mon && today.getDate() === day
          const isLeave = leaveDates.has(dateStr)
          return (
            <div
              key={i}
              style={{
                textAlign: 'center',
                fontSize: 12.5,
                padding: '5px 2px',
                borderRadius: 6,
                fontWeight: isToday ? 700 : 400,
                background: isToday ? '#0f2d6b' : isLeave ? '#e8effd' : 'transparent',
                color: isToday ? '#fff' : isLeave ? '#1a56db' : '#1e293b',
                cursor: 'default',
              }}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Admin / Manager Leave View (preserved) ────────────────────────────────────

function AdminLeave() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'requests' | 'types' | 'pending'>('requests')
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [types, setTypes] = useState<LeaveType[]>([])
  const [pending, setPending] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'request' | 'type' | null>(null)
  const [form, setForm] = useState({ type_id: '', start_date: '', end_date: '' })
  const [typeForm, setTypeForm] = useState({ type_name: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadAll = async () => {
    setLoading(true)
    try {
      const [reqRes, typeRes] = await Promise.allSettled([
        api.get(`/leave/requests/employee/${user?.emp_id}`),
        api.get('/leave/types'),
      ])
      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data?.data ?? reqRes.value.data ?? [])
      if (typeRes.status === 'fulfilled') setTypes(typeRes.value.data?.data ?? typeRes.value.data ?? [])
      if (user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'HR') {
        const pendRes = await api.get(`/leave/requests/pending/${user.emp_id}`).catch(() => null)
        if (pendRes) setPending(pendRes.data?.data ?? pendRes.data ?? [])
      }
    } catch {}
    setLoading(false)
  }
  useEffect(() => { loadAll() }, [])

  const handleRequest = async () => {
    setSaving(true); setError('')
    try {
      await api.post('/leave/requests', { emp_id: user?.emp_id, type_id: Number(form.type_id), start_date: form.start_date, end_date: form.end_date })
      setModal(null); loadAll()
    } catch (err: any) { setError(err.response?.data?.error || 'Failed.') }
    setSaving(false)
  }

  const handleAddType = async () => {
    setSaving(true); setError('')
    try { await api.post('/leave/types', typeForm); setModal(null); loadAll() }
    catch (err: any) { setError(err.response?.data?.error || 'Failed.') }
    setSaving(false)
  }

  const updateStatus = async (leaveId: number, status: string) => {
    try { await api.put(`/leave/requests/${leaveId}`, { leave_status: status, approved_by: user?.emp_id }); loadAll() } catch {}
  }
  const deleteRequest = async (id: number) => { try { await api.delete(`/leave/requests/${id}`); loadAll() } catch {} }

  const canManageTypes = user?.role === 'ADMIN' || user?.role === 'HR'
  const showPending = user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'HR'
  const tabs = [
    { id: 'requests', label: 'My Requests' },
    ...(showPending ? [{ id: 'pending', label: `Pending Approvals${pending.length ? ` (${pending.length})` : ''}` }] : []),
    { id: 'types', label: 'Leave Types' },
  ]

  return (
    <div>
      <PageHeader title="Leave Management" sub="Submit, track, and approve leave requests" />
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#0f2d6b' : '#64748b', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f2d6b' }}>My Leave Requests</div>
            <button onClick={() => { setForm({ type_id: '', start_date: '', end_date: '' }); setError(''); setModal('request') }} style={primaryBtn}>+ New Request</button>
          </div>
          {loading ? <LoadingRows /> : (
            requests.length === 0 ? <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>No requests yet</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead><tr>{['Type', 'From', 'To', 'Status', 'Approved By', ''].map((h) => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {requests.map((r) => {
                    const sc = STATUS_COLORS[r.leave_status] ?? { bg: '#f1f5f9', fg: '#64748b' }
                    return (
                      <tr key={r.leave_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 500, color: '#0f2d6b' }}>{types.find((t) => t.type_id === r.type_id)?.type_name ?? `Type ${r.type_id}`}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{r.start_date}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{r.end_date}</td>
                        <td style={{ padding: '12px 14px' }}><span style={{ background: sc.bg, color: sc.fg, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, textTransform: 'capitalize' }}>{r.leave_status}</span></td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{r.approved_by ? `#${r.approved_by}` : '—'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          {r.leave_status === 'pending' && <button onClick={() => deleteRequest(r.leave_id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>Delete</button>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      )}

      {tab === 'pending' && showPending && (
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f2d6b', marginBottom: 20 }}>Pending Approvals</div>
          {loading ? <LoadingRows /> : pending.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>No pending requests</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pending.map((r) => (
                <div key={r.leave_id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f2d6b', fontSize: 14 }}>Employee #{r.emp_id}</div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{r.start_date} → {r.end_date} · {types.find((t) => t.type_id === r.type_id)?.type_name ?? `Type ${r.type_id}`}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => updateStatus(r.leave_id, 'approved')} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, padding: '6px 14px', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => updateStatus(r.leave_id, 'rejected')} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 14px', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'types' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f2d6b' }}>Leave Types</div>
            {canManageTypes && <button onClick={() => { setTypeForm({ type_name: '' }); setError(''); setModal('type') }} style={primaryBtn}>+ Add Type</button>}
          </div>
          {loading ? <LoadingRows /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {types.map((t) => (
                <div key={t.type_id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', borderLeft: '3px solid #1a56db' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>TYPE-{t.type_id}</div>
                  <div style={{ fontWeight: 600, color: '#0f2d6b', fontSize: 14 }}>{t.type_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modal === 'request' && (
        <Modal title="New Leave Request" onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={fLabel}>Leave Type</label>
              <select style={fInput} value={form.type_id} onChange={(e) => setForm({ ...form, type_id: e.target.value })}>
                <option value="">Select type…</option>
                {types.map((t) => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
              </select>
            </div>
            <Field label="Start Date" type="date" value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} required />
            <Field label="End Date" type="date" value={form.end_date} onChange={(v) => setForm({ ...form, end_date: v })} required />
          </div>
          {error && <div style={errorBox}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={cancelBtn}>Cancel</button>
            <button onClick={handleRequest} disabled={saving} style={primaryBtn}>{saving ? 'Submitting…' : 'Submit'}</button>
          </div>
        </Modal>
      )}
      {modal === 'type' && (
        <Modal title="Add Leave Type" onClose={() => setModal(null)}>
          <Field label="Type Name" value={typeForm.type_name} onChange={(v) => setTypeForm({ type_name: v })} required />
          {error && <div style={errorBox}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={cancelBtn}>Cancel</button>
            <button onClick={handleAddType} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function calcDays(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}
