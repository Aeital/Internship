import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { Modal, Field, LoadingRows, primaryBtn, cancelBtn, fLabel, fInput, errorBox } from './EmployeesPage'

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

export default function LeavePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'requests' | 'types' | 'pending'>('requests')
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [types, setTypes] = useState<LeaveType[]>([])
  const [pending, setPending] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'request' | 'type' | null>(null)
  const [form, setForm] = useState({ emp_id: '', type_id: '', start_date: '', end_date: '' })
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
      await api.post('/leave/requests', { emp_id: Number(form.emp_id || user?.emp_id), type_id: Number(form.type_id), start_date: form.start_date, end_date: form.end_date })
      setModal(null); loadAll()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit leave request.')
    }
    setSaving(false)
  }

  const handleAddType = async () => {
    setSaving(true); setError('')
    try {
      await api.post('/leave/types', typeForm)
      setModal(null); loadAll()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add leave type.')
    }
    setSaving(false)
  }

  const updateStatus = async (leaveId: number, status: string) => {
    try {
      await api.put(`/leave/requests/${leaveId}`, { leave_status: status, approved_by: user?.emp_id })
      loadAll()
    } catch {}
  }

  const deleteRequest = async (id: number) => {
    try { await api.delete(`/leave/requests/${id}`); loadAll() } catch {}
  }

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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              background: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? '#0f2d6b' : '#64748b',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f2d6b' }}>My Leave Requests</h3>
            <button onClick={() => { setForm({ emp_id: '', type_id: '', start_date: '', end_date: '' }); setError(''); setModal('request') }} style={primaryBtn}>
              + New Request
            </button>
          </div>
          {loading ? <LoadingRows /> : <RequestsTable requests={requests} types={types} onDelete={deleteRequest} canDelete />}
        </div>
      )}

      {tab === 'pending' && showPending && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#0f2d6b' }}>Pending Approvals</h3>
          {loading ? <LoadingRows /> : (
            pending.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>No pending requests</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map((r) => (
                  <div key={r.leave_id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f2d6b', fontSize: 14 }}>Employee #{r.emp_id}</div>
                      <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                        {r.start_date} → {r.end_date} · {types.find((t) => t.type_id === r.type_id)?.type_name || `Type ${r.type_id}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => updateStatus(r.leave_id, 'approved')} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, padding: '6px 14px', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        Approve
                      </button>
                      <button onClick={() => updateStatus(r.leave_id, 'rejected')} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 14px', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {tab === 'types' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f2d6b' }}>Leave Types</h3>
            {canManageTypes && (
              <button onClick={() => { setTypeForm({ type_name: '' }); setError(''); setModal('type') }} style={primaryBtn}>+ Add Type</button>
            )}
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
            <button onClick={handleRequest} disabled={saving} style={primaryBtn}>{saving ? 'Submitting…' : 'Submit Request'}</button>
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

function RequestsTable({ requests, types, onDelete, canDelete }: { requests: LeaveRequest[]; types: LeaveType[]; onDelete: (id: number) => void; canDelete?: boolean }) {
  if (requests.length === 0) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>No leave requests</div>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr>
            {['ID', 'Type', 'From', 'To', 'Status', 'Approved By', 'Actions'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => {
            const sc = STATUS_COLORS[r.leave_status] || { bg: '#f1f5f9', fg: '#64748b' }
            return (
              <tr key={r.leave_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px' }}><span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{r.leave_id}</span></td>
                <td style={{ padding: '12px 14px', color: '#0f2d6b', fontWeight: 500 }}>{types.find((t) => t.type_id === r.type_id)?.type_name || `Type ${r.type_id}`}</td>
                <td style={{ padding: '12px 14px', color: '#64748b' }}>{r.start_date}</td>
                <td style={{ padding: '12px 14px', color: '#64748b' }}>{r.end_date}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: sc.bg, color: sc.fg, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, textTransform: 'capitalize' }}>{r.leave_status}</span>
                </td>
                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{r.approved_by ? `#${r.approved_by}` : '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  {canDelete && r.leave_status === 'pending' && (
                    <button onClick={() => onDelete(r.leave_id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>Delete</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
