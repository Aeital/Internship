import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { Modal, Field, LoadingRows, searchStyle, primaryBtn, cancelBtn, fLabel, fInput, errorBox } from './EmployeesPage'

interface Department {
  dept_id: number
  dept_name: string
  dept_description?: string
}

export default function DepartmentsPage() {
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'HR'
  const [depts, setDepts] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState({ dept_name: '', dept_description: '' })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/departments')
      setDepts(res.data?.data ?? res.data ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = depts.filter((d) =>
    d.dept_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.dept_description?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm({ dept_name: '', dept_description: '' }); setEditId(null); setError(''); setModal('create') }
  const openEdit = (d: Department) => { setForm({ dept_name: d.dept_name, dept_description: d.dept_description || '' }); setEditId(d.dept_id); setError(''); setModal('edit') }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'create') await api.post('/departments', form)
      else if (editId) await api.put(`/departments/${editId}`, form)
      setModal(null); load()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save department.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    try { await api.delete(`/departments/${id}`); load() } catch {}
    setDeleteConfirm(null)
  }

  return (
    <div>
      <PageHeader title="Departments" sub="Manage organizational departments" />

      <div style={{ ...cardStyle }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <input placeholder="Search departments…" value={search} onChange={(e) => setSearch(e.target.value)} style={searchStyle} />
          {canEdit && <button onClick={openCreate} style={primaryBtn}>+ Add Department</button>}
        </div>

        {loading ? <LoadingRows /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: '24px 0' }}>No departments found</div>
            ) : filtered.map((d) => (
              <div
                key={d.dept_id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 20,
                  borderLeft: '4px solid #1a56db',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ background: '#e8effd', color: '#1a56db', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                    DEPT-{d.dept_id}
                  </span>
                  {canEdit && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(d)} style={{ background: 'none', border: 'none', color: '#1a56db', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit' }}>Edit</button>
                      <button onClick={() => setDeleteConfirm(d.dept_id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit' }}>Delete</button>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f2d6b', marginBottom: 6 }}>{d.dept_name}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{d.dept_description || 'No description provided.'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'New Department' : 'Edit Department'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Department Name" value={form.dept_name} onChange={(v) => setForm({ ...form, dept_name: v })} required />
            <div>
              <label style={fLabel}>Description</label>
              <textarea value={form.dept_description} onChange={(e) => setForm({ ...form, dept_description: e.target.value })} rows={3} style={{ ...fInput, resize: 'vertical' }} />
            </div>
          </div>
          {error && <div style={errorBox}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={cancelBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}

      {deleteConfirm !== null && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
          <p style={{ color: '#64748b', marginTop: 0 }}>Delete department #{deleteConfirm}?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setDeleteConfirm(null)} style={cancelBtn}>Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm!)} style={{ ...primaryBtn, background: '#dc2626' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
