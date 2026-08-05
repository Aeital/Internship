import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { Modal, Field, LoadingRows, primaryBtn, cancelBtn, fLabel, fInput, errorBox } from './EmployeesPage'

interface Dependent {
  dep_id: number
  emp_id: number
  dep_name: string
  relationship_type: string
}

export default function DependentsPage() {
  const { user } = useAuth()
  const [dependents, setDependents] = useState<Dependent[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState({ dep_name: '', relationship_type: '' })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/dependents/employee/${user?.emp_id}`)
      setDependents(res.data?.data ?? res.data ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ dep_name: '', relationship_type: '' }); setEditId(null); setError(''); setModal('create') }
  const openEdit = (d: Dependent) => { setForm({ dep_name: d.dep_name, relationship_type: d.relationship_type }); setEditId(d.dep_id); setError(''); setModal('edit') }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { ...form, emp_id: user?.emp_id }
      if (modal === 'create') await api.post('/dependents', payload)
      else if (editId) await api.put(`/dependents/${editId}`, payload)
      setModal(null); load()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save dependent.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    try { await api.delete(`/dependents/${id}`); load() } catch {}
  }

  const RELATIONSHIP_ICONS: Record<string, string> = {
    spouse: '💑', child: '👶', parent: '👨‍👩‍👦', sibling: '👫', other: '👤',
  }

  return (
    <div>
      <PageHeader title="Dependents" sub="Manage your registered family dependents" />

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <span style={{ fontSize: 14, color: '#64748b' }}>{dependents.length} dependent{dependents.length !== 1 ? 's' : ''} registered</span>
          </div>
          <button onClick={openCreate} style={primaryBtn}>+ Add Dependent</button>
        </div>

        {loading ? <LoadingRows /> : (
          dependents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍👩‍👦</div>
              <div style={{ fontSize: 14 }}>No dependents registered yet.</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Add your family members to keep records up to date.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {dependents.map((d) => (
                <div key={d.dep_id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8effd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                      {RELATIONSHIP_ICONS[d.relationship_type?.toLowerCase()] || '👤'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f2d6b', fontSize: 15 }}>{d.dep_name}</div>
                      <div style={{ color: '#64748b', fontSize: 12, textTransform: 'capitalize', marginTop: 2 }}>{d.relationship_type}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => openEdit(d)} style={{ background: '#e8effd', color: '#1a56db', border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(d.dep_id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Add Dependent' : 'Edit Dependent'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Full Name" value={form.dep_name} onChange={(v) => setForm({ ...form, dep_name: v })} required />
            <div>
              <label style={fLabel}>Relationship</label>
              <select style={fInput} value={form.relationship_type} onChange={(e) => setForm({ ...form, relationship_type: e.target.value })}>
                <option value="">Select…</option>
                {['Spouse', 'Child', 'Parent', 'Sibling', 'Other'].map((r) => <option key={r} value={r.toLowerCase()}>{r}</option>)}
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
