import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'

interface Employee {
  emp_id: number
  emp_name: string
  email: string
  role: string
  dept_id?: number
  phone?: string
  hire_date?: string
  staff_grade?: string
}

const emptyForm = {
  emp_name: '', email: '', password: '', role: 'STAFF', dept_id: '', manager_id: '',
  phone: '', hire_date: '', dob: '', staff_grade: '',
}

export default function EmployeesPage() {
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'HR'
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState<any>({ ...emptyForm })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/employees')
      setEmployees(res.data?.data ?? res.data ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = employees.filter((e) =>
    e.emp_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setError(''); setModal('create') }
  const openEdit = (emp: Employee) => {
    setForm({ emp_name: emp.emp_name, email: emp.email, role: emp.role, dept_id: emp.dept_id ?? '', phone: emp.phone ?? '', hire_date: emp.hire_date ?? '', staff_grade: emp.staff_grade ?? '', password: '', dob: '', manager_id: '' })
    setEditId(emp.emp_id)
    setError('')
    setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const payload: any = { ...form }
      if (payload.dept_id) payload.dept_id = Number(payload.dept_id)
      if (payload.manager_id) payload.manager_id = Number(payload.manager_id)
      if (modal === 'create') {
        await api.post('/employees', payload)
      } else if (editId) {
        if (!payload.password) delete payload.password
        await api.put(`/employees/${editId}`, payload)
      }
      setModal(null)
      load()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save employee.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    try { await api.delete(`/employees/${id}`); load() } catch {}
    setDeleteConfirm(null)
  }

  return (
    <div>
      <PageHeader title="Employees" sub="Manage all employees in the system" />

      <div style={{ ...cardStyle }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <input
            placeholder="Search by name, email, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchStyle}
          />
          {canEdit && (
            <button onClick={openCreate} style={primaryBtn}>+ Add Employee</button>
          )}
        </div>

        {loading ? (
          <LoadingRows />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {['ID', 'Name', 'Email', 'Role', 'Grade', 'Hire Date', 'Actions'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No employees found</td></tr>
                ) : filtered.map((emp) => (
                  <tr key={emp.emp_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}><span style={idBadge}>{emp.emp_id}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#0f2d6b' }}>{emp.emp_name}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{emp.email}</td>
                    <td style={tdStyle}><RoleBadge role={emp.role} /></td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{emp.staff_grade || '—'}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : '—'}</td>
                    <td style={tdStyle}>
                      {canEdit && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(emp)} style={ghostBtn}>Edit</button>
                          <button onClick={() => setDeleteConfirm(emp.emp_id)} style={dangerGhostBtn}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Add Employee' : 'Edit Employee'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Full Name" value={form.emp_name} onChange={(v) => setForm({ ...form, emp_name: v })} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            {modal === 'create' && <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />}
            <div>
              <label style={fLabel}>Role</label>
              <select style={fInput} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {['ADMIN', 'HR', 'MANAGER', 'STAFF'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <Field label="Department ID" type="number" value={form.dept_id} onChange={(v) => setForm({ ...form, dept_id: v })} />
            <Field label="Manager ID" type="number" value={form.manager_id} onChange={(v) => setForm({ ...form, manager_id: v })} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Date of Birth" type="date" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} />
            <Field label="Hire Date" type="date" value={form.hire_date} onChange={(v) => setForm({ ...form, hire_date: v })} />
            <Field label="Staff Grade" value={form.staff_grade} onChange={(v) => setForm({ ...form, staff_grade: v })} />
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
          <p style={{ color: '#64748b', marginTop: 0 }}>Are you sure you want to delete employee #{deleteConfirm}? This action cannot be undone.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setDeleteConfirm(null)} style={cancelBtn}>Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm!)} style={{ ...primaryBtn, background: '#dc2626' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: '#7c3aed', HR: '#0891b2', MANAGER: '#1a56db', STAFF: '#16a34a',
  }
  return (
    <span style={{ background: (colors[role] || '#64748b') + '18', color: colors[role] || '#64748b', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {role}
    </span>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,107,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f2d6b' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: any; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label style={fLabel}>{label}{required && ' *'}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} style={fInput} />
    </div>
  )
}

export function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 48, background: '#f1f5f9', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }
const tdStyle: React.CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' }
const idBadge: React.CSSProperties = { background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }
export const searchStyle: React.CSSProperties = { padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'Poppins, sans-serif', width: 280, outline: 'none' }
export const primaryBtn: React.CSSProperties = { background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
export const cancelBtn: React.CSSProperties = { background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
const ghostBtn: React.CSSProperties = { background: '#e8effd', color: '#1a56db', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12.5, fontWeight: 500, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
const dangerGhostBtn: React.CSSProperties = { background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12.5, fontWeight: 500, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
export const fLabel: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }
export const fInput: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13.5, fontFamily: 'Poppins, sans-serif', outline: 'none', background: '#fafbff' }
export const errorBox: React.CSSProperties = { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginTop: 12 }
