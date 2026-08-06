import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { Modal, Field, LoadingRows, searchStyle, primaryBtn, cancelBtn, fLabel, fInput, errorBox } from './EmployeesPage'
import {
  CalendarCheck,
  Clock,
  TrendingUp,
  Timer,
  LogIn,
  LogOut,
  LayoutList,
  Download,
} from 'lucide-react'

interface Attendance {
  att_id: number
  emp_id: number
  att_date: string
  check_in?: string
  check_out?: string
  att_status: 'present' | 'absent' | 'half_day' | 'late'
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  present: { bg: '#dcfce7', fg: '#16a34a' },
  absent: { bg: '#fef2f2', fg: '#dc2626' },
  half_day: { bg: '#fef9c3', fg: '#ca8a04' },
  late: { bg: '#fff7ed', fg: '#d97706' },
}

// ── Root: role-aware ──────────────────────────────────────────────────────────

export default function AttendancePage() {
  const { user } = useAuth()
  if (user?.role === 'STAFF') return <StaffAttendance />
  return <AdminAttendance />
}

// ── Staff Attendance View ─────────────────────────────────────────────────────

function StaffAttendance() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())
  const [modal, setModal] = useState<'mark' | 'edit' | null>(null)
  const [form, setForm] = useState({ att_date: todayStr(), check_in: '', check_out: '', att_status: 'present' })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/attendance/employee/${user?.emp_id}`)
      setRecords(res.data?.data ?? res.data ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const todayRecord = records.find((r) => r.att_date === todayStr())
  const monthRec = records.filter((r) => r.att_date.startsWith(currentMonth()))
  const presentDays = monthRec.filter((r) => r.att_status === 'present').length
  const lateDays = monthRec.filter((r) => r.att_status === 'late').length
  const totalMs = monthRec.reduce((sum, r) => {
    if (r.check_in && r.check_out) {
      const base = r.att_date
      return sum + (new Date(`${base}T${r.check_out}`).getTime() - new Date(`${base}T${r.check_in}`).getTime())
    }
    return sum
  }, 0)
  const totalHrs = (totalMs / 3_600_000).toFixed(1)
  const avgHrs = monthRec.length > 0 ? (totalMs / 3_600_000 / monthRec.length).toFixed(1) : '0.0'

  const openMark = () => {
    setForm({ att_date: todayStr(), check_in: '', check_out: '', att_status: 'present' })
    setEditId(null); setError(''); setModal('mark')
  }
  const openEdit = (a: Attendance) => {
    setForm({ att_date: a.att_date, check_in: a.check_in || '', check_out: a.check_out || '', att_status: a.att_status })
    setEditId(a.att_id); setError(''); setModal('edit')
  }
  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { ...form, emp_id: user?.emp_id }
      if (modal === 'mark') await api.post('/attendance', payload)
      else if (editId) await api.put(`/attendance/${editId}`, payload)
      setModal(null); load()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save attendance.')
    }
    setSaving(false)
  }

  const h12 = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <PageHeader title="My Attendance" sub={`Tracking for ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} />

      {/* Top row: shift hero + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Shift Hero */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f2d6b' }}>Today's Shift</div>
            <ShiftPill record={todayRecord} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#0f2d6b', letterSpacing: -1, lineHeight: 1 }}>
              {h12.replace(' AM', '').replace(' PM', '')}
              <span style={{ fontSize: 22, fontWeight: 600, color: '#94a3b8', marginLeft: 4 }}>
                {now.getHours() >= 12 ? 'PM' : 'AM'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{dateLabel}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <CheckCell icon={<LogIn size={16} color="#64748b" />} label="Checked In" value={todayRecord?.check_in ? formatTime12(todayRecord.check_in) : '--:-- --'} />
            <button
              onClick={openMark}
              style={{ background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 8px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <LogOut size={15} />
              {todayRecord ? 'Edit Record' : 'Mark Today'}
            </button>
          </div>

          <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={13} />
            Core Hours: 09:00 – 17:00
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 16 }}>
          <StatCard icon={<CalendarCheck size={20} color="#1a56db" />} label="Present Days" sub="MTD" value={presentDays} unit={`/ ${monthRec.length}`} iconBg="#e8effd" />
          <StatCard icon={<TrendingUp size={20} color="#dc2626" />} label="Late Arrivals" value={lateDays} iconBg="#fef2f2" iconColor="#dc2626" />
          <StatCard icon={<Timer size={20} color="#16a34a" />} label="Total Hours Worked" value={totalHrs} unit="hrs" iconBg="#dcfce7" />
          <StatCard icon={<Clock size={20} color="#7c3aed" />} label="Avg Daily Hours" value={avgHrs} unit="hrs/day" iconBg="#f3eeff" />
        </div>
      </div>

      {/* Attendance Log */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f2d6b' }}>Attendance Log</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ToolBtn icon={<LayoutList size={14} />} label="List" active />
            <ToolBtn icon={<Download size={14} />} label="Export" />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          {loading ? <LoadingRows /> : (
            records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>No attendance records found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr>
                    {['Date', 'Check-In', 'Check-Out', 'Total Hours', 'Status', ''].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((a, i) => {
                    const sc = STATUS_COLORS[a.att_status] ?? { bg: '#f1f5f9', fg: '#64748b' }
                    const hrs = calcHours(a.att_date, a.check_in, a.check_out)
                    return (
                      <tr key={a.att_id} style={{ borderBottom: i < records.length - 1 ? '1px solid #f8faff' : 'none' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {new Date(a.att_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {' '}
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>
                            {new Date(a.att_date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: a.check_in ? '#1e293b' : '#cbd5e1' }}>
                          {a.check_in ? formatTime12(a.check_in) : '--:-- --'}
                        </td>
                        <td style={{ padding: '12px 14px', color: a.check_out ? '#1e293b' : '#cbd5e1' }}>
                          {a.check_out ? formatTime12(a.check_out) : '--:-- --'}
                        </td>
                        <td style={{ padding: '12px 14px', color: hrs ? '#1e293b' : '#cbd5e1' }}>
                          {hrs ? `${hrs} hrs` : '--'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: sc.bg, color: sc.fg, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, textTransform: 'capitalize' }}>
                            {a.att_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button onClick={() => openEdit(a)} style={{ background: 'none', border: 'none', color: '#1a56db', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* Mark/Edit Modal */}
      {modal && (
        <Modal title={modal === 'mark' ? 'Mark Attendance' : 'Edit Attendance'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Date" type="date" value={form.att_date} onChange={(v) => setForm({ ...form, att_date: v })} required />
            <div>
              <label style={fLabel}>Status</label>
              <select style={fInput} value={form.att_status} onChange={(e) => setForm({ ...form, att_status: e.target.value })}>
                {['present', 'absent', 'half_day', 'late'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <Field label="Check In" type="time" value={form.check_in} onChange={(v) => setForm({ ...form, check_in: v })} />
            <Field label="Check Out" type="time" value={form.check_out} onChange={(v) => setForm({ ...form, check_out: v })} />
          </div>
          {error && <div style={errorBox}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={cancelBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ShiftPill({ record }: { record?: Attendance }) {
  if (!record) return <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>Not Marked</span>
  if (record.check_in && !record.check_out) return <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />On Shift</span>
  const sc = STATUS_COLORS[record.att_status] ?? { bg: '#f1f5f9', fg: '#64748b' }
  return <span style={{ background: sc.bg, color: sc.fg, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>{record.att_status.replace('_', ' ')}</span>
}

function CheckCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ background: '#f8faff', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>{icon}<span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</span></div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f2d6b' }}>{value}</div>
    </div>
  )
}

function StatCard({ icon, label, sub, value, unit, iconBg }: { icon: React.ReactNode; label: string; sub?: string; value: number | string; unit?: string; iconBg: string; iconColor?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        {sub && <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: '#0f2d6b', letterSpacing: -0.5 }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: '#94a3b8' }}>{unit}</span>}
      </div>
    </div>
  )
}

function ToolBtn({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: active ? '#f8faff' : '#fff', color: active ? '#1a56db' : '#64748b', fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>
      {icon}{label}
    </button>
  )
}

// ── Admin/HR/Manager Attendance View (preserved) ──────────────────────────────

function AdminAttendance() {
  const [records, setRecords] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEmpId, setFilterEmpId] = useState('')
  const [modal, setModal] = useState<'mark' | 'edit' | null>(null)
  const [form, setForm] = useState({ emp_id: '', att_date: todayStr(), check_in: '', check_out: '', att_status: 'present' })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const url = filterEmpId ? `/attendance/employee/${filterEmpId}` : '/attendance'
      const res = await api.get(url)
      setRecords(res.data?.data ?? res.data ?? [])
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [filterEmpId])

  const openMark = () => { setForm({ emp_id: '', att_date: todayStr(), check_in: '', check_out: '', att_status: 'present' }); setEditId(null); setError(''); setModal('mark') }
  const openEdit = (a: Attendance) => { setForm({ emp_id: String(a.emp_id), att_date: a.att_date, check_in: a.check_in || '', check_out: a.check_out || '', att_status: a.att_status }); setEditId(a.att_id); setError(''); setModal('edit') }
  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { ...form, emp_id: Number(form.emp_id) }
      if (modal === 'mark') await api.post('/attendance', payload)
      else if (editId) await api.put(`/attendance/${editId}`, payload)
      setModal(null); load()
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save.') }
    setSaving(false)
  }
  const handleDelete = async (id: number) => { try { await api.delete(`/attendance/${id}`); load() } catch {} }

  return (
    <div>
      <PageHeader title="Attendance" sub="Track and manage employee attendance" />
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Filter by Employee ID…" value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)} style={{ ...searchStyle, width: 220 }} />
            {filterEmpId && <button onClick={() => setFilterEmpId('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', color: '#64748b' }}>Clear</button>}
          </div>
          <button onClick={openMark} style={primaryBtn}>+ Mark Attendance</button>
        </div>
        {loading ? <LoadingRows /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr>{['ID', 'Employee', 'Date', 'Check In', 'Check Out', 'Status', 'Actions'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {records.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No records found</td></tr> : records.map((a) => {
                  const sc = STATUS_COLORS[a.att_status] ?? { bg: '#f1f5f9', fg: '#64748b' }
                  return (
                    <tr key={a.att_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{a.att_id}</span></td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f2d6b' }}>#{a.emp_id}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{a.att_date}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{a.check_in || '—'}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{a.check_out || '—'}</td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: sc.bg, color: sc.fg, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, textTransform: 'capitalize' }}>{a.att_status.replace('_', ' ')}</span></td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(a)} style={{ background: '#e8effd', color: '#1a56db', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDelete(a.att_id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <Modal title={modal === 'mark' ? 'Mark Attendance' : 'Edit Attendance'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Employee ID" type="number" value={form.emp_id} onChange={(v) => setForm({ ...form, emp_id: v })} required />
            <Field label="Date" type="date" value={form.att_date} onChange={(v) => setForm({ ...form, att_date: v })} required />
            <Field label="Check In" type="time" value={form.check_in} onChange={(v) => setForm({ ...form, check_in: v })} />
            <Field label="Check Out" type="time" value={form.check_out} onChange={(v) => setForm({ ...form, check_out: v })} />
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={fLabel}>Status</label>
              <select style={fInput} value={form.att_status} onChange={(e) => setForm({ ...form, att_status: e.target.value })}>
                {['present', 'absent', 'half_day', 'late'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          {error && <div style={errorBox}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={cancelBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().split('T')[0] }
function currentMonth() { return new Date().toISOString().slice(0, 7) }
function formatTime12(t: string) {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  return `${((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
function calcHours(date: string, checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return null
  const ms = new Date(`${date}T${checkOut}`).getTime() - new Date(`${date}T${checkIn}`).getTime()
  return (ms / 3_600_000).toFixed(1)
}
