import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { Modal, Field, LoadingRows, searchStyle, primaryBtn, cancelBtn, fLabel, fInput, errorBox } from './EmployeesPage'

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

export default function AttendancePage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEmpId, setFilterEmpId] = useState('')
  const [modal, setModal] = useState<'mark' | 'edit' | null>(null)
  const [form, setForm] = useState({ emp_id: '', att_date: today(), check_in: '', check_out: '', att_status: 'present' })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const url = filterEmpId
        ? `/attendance/employee/${filterEmpId}`
        : '/attendance'
      const res = await api.get(url)
      setRecords(res.data?.data ?? res.data ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filterEmpId])

  const openMark = () => {
    setForm({ emp_id: String(user?.emp_id ?? ''), att_date: today(), check_in: '', check_out: '', att_status: 'present' })
    setEditId(null); setError(''); setModal('mark')
  }

  const openEdit = (a: Attendance) => {
    setForm({ emp_id: String(a.emp_id), att_date: a.att_date, check_in: a.check_in || '', check_out: a.check_out || '', att_status: a.att_status })
    setEditId(a.att_id); setError(''); setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { ...form, emp_id: Number(form.emp_id) }
      if (modal === 'mark') await api.post('/attendance', payload)
      else if (editId) await api.put(`/attendance/${editId}`, payload)
      setModal(null); load()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save attendance.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    try { await api.delete(`/attendance/${id}`); load() } catch {}
  }

  return (
    <div>
      <PageHeader title="Attendance" sub="Track and manage employee attendance records" />

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              placeholder="Filter by Employee ID…"
              value={filterEmpId}
              onChange={(e) => setFilterEmpId(e.target.value)}
              style={{ ...searchStyle, width: 220 }}
            />
            {filterEmpId && (
              <button onClick={() => setFilterEmpId('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', color: '#64748b' }}>
                Clear
              </button>
            )}
          </div>
          <button onClick={openMark} style={primaryBtn}>+ Mark Attendance</button>
        </div>

        {loading ? <LoadingRows /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr>
                  {['ID', 'Employee', 'Date', 'Check In', 'Check Out', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No attendance records found</td></tr>
                ) : records.map((a) => {
                  const sc = STATUS_COLORS[a.att_status] || { bg: '#f1f5f9', fg: '#64748b' }
                  return (
                    <tr key={a.att_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}><span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{a.att_id}</span></td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#0f2d6b' }}>#{a.emp_id}</td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{a.att_date}</td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{a.check_in || '—'}</td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{a.check_out || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{ background: sc.bg, color: sc.fg, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, textTransform: 'capitalize' }}>
                          {a.att_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={tdStyle}>
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
                {['present', 'absent', 'half_day', 'late'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
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

function today() {
  return new Date().toISOString().split('T')[0]
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }
const tdStyle: React.CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' }
