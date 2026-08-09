import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { LayoutGrid, List, Search, Edit2, Trash2, Plus, Mail, Phone, Calendar, Building2, Award, X } from 'lucide-react'

interface Employee {
  emp_id: number
  emp_name: string
  email: string
  role: string
  dept_id?: number
  phone?: string
  hire_date?: string
  staff_grade?: string
  manager_id?: number
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
  const [roleFilter, setRoleFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [modal, setModal] = useState<'create' | 'edit' | 'profile' | 'dependents' | null>(null)
  const [form, setForm] = useState<any>({ ...emptyForm })
  const [editId, setEditId] = useState<number | null>(null)
  const [profileEmp, setProfileEmp] = useState<Employee | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [newEmpId, setNewEmpId] = useState<number | null>(null)
  const [depForm, setDepForm] = useState({ dep_name: '', relationship_type: '' })
  const [addedDependents, setAddedDependents] = useState<{ dep_name: string; relationship_type: string }[]>([])
  const [depSaving, setDepSaving] = useState(false)
  const [depError, setDepError] = useState('')
  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/employees')
      setEmployees(res.data?.data ?? res.data ?? [])
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = employees.filter((e) => {
    const matchSearch = !search ||
      e.emp_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(e.emp_id).includes(search)
    const matchRole = roleFilter === 'all' || e.role === roleFilter
    return matchSearch && matchRole
  })

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setError(''); setModal('create') }
  const openEdit = (emp: Employee, ev: React.MouseEvent) => {
    ev.stopPropagation()
    setForm({ emp_name: emp.emp_name, email: emp.email, role: emp.role, dept_id: emp.dept_id ?? '', phone: emp.phone ?? '', hire_date: emp.hire_date ?? '', staff_grade: emp.staff_grade ?? '', password: '', dob: '', manager_id: emp.manager_id ?? '' })
    setEditId(emp.emp_id); setError(''); setModal('edit')
  }
  const openProfile = (emp: Employee) => { setProfileEmp(emp); setModal('profile') }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload: any = { ...form }
      if (payload.dept_id) payload.dept_id = Number(payload.dept_id)
      if (payload.manager_id) payload.manager_id = Number(payload.manager_id)
      if (modal === 'create') {
        const res = await api.post('/employees', payload)
        const created = res.data?.data ?? res.data
        load()
        setNewEmpId(created?.emp_id ?? null)
        setDepForm({ dep_name: '', relationship_type: '' })
        setAddedDependents([])
        setDepError('')
        setModal('dependents')
      } else if (editId) {
        if (!payload.password) delete payload.password
        await api.put(`/employees/${editId}`, payload)
        setModal(null); load()
      }
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save employee.') }
    setSaving(false)
  }
  const handleAddDependent = async () => {
    if (!depForm.dep_name || !depForm.relationship_type) { setDepError('Please fill in both fields.'); return }
    setDepSaving(true); setDepError('')
    try {
      await api.post('/dependents', { emp_id: newEmpId, dep_name: depForm.dep_name, relationship_type: depForm.relationship_type })
      setAddedDependents([...addedDependents, { dep_name: depForm.dep_name, relationship_type: depForm.relationship_type }])
      setDepForm({ dep_name: '', relationship_type: '' })
    } catch (err: any) { setDepError(err.response?.data?.error || 'Failed to add dependent.') }
    setDepSaving(false)
  }
  const handleDelete = async (id: number) => {
    try { await api.delete(`/employees/${id}`); load() } catch {}
    setDeleteConfirm(null)
  }

  const roleOptions = ['all', 'ADMIN', 'HR', 'MANAGER', 'STAFF']

  return (
    <div>
      <PageHeader
        title="Employee Directory"
        sub={`${filtered.length} of ${employees.length} employee${employees.length !== 1 ? 's' : ''}`}
        action={canEdit ? (
          <button onClick={openCreate} style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Add Employee
          </button>
        ) : undefined}
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Search by name, email, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...searchStyle, paddingLeft: 34, width: '100%' }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ ...fInput, width: 'auto', padding: '9px 14px', minWidth: 130 }}
        >
          {roleOptions.map((r) => (
            <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>
          ))}
        </select>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
          {(['grid', 'list'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{ background: viewMode === m ? '#fff' : 'transparent', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: viewMode === m ? '#0f2d6b' : '#94a3b8', display: 'flex', alignItems: 'center', boxShadow: viewMode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
            >
              {m === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          No employees match your search.
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map((emp) => (
            <EmployeeCard key={emp.emp_id} emp={emp} canEdit={canEdit} onCardClick={openProfile} onEdit={openEdit} onDelete={(id, ev) => { ev.stopPropagation(); setDeleteConfirm(id) }} />
          ))}
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr>
                  {['ID', 'Name', 'Email', 'Role', 'Grade', 'Hire Date', ...(canEdit ? ['Actions'] : [])].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.emp_id} onClick={() => openProfile(emp)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f8faff')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{emp.emp_id}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Initials name={emp.emp_name} size={32} />
                        <span style={{ fontWeight: 600, color: '#0f2d6b' }}>{emp.emp_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{emp.email}</td>
                    <td style={{ padding: '12px 14px' }}><RoleBadge role={emp.role} /></td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{emp.staff_grade || '—'}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : '—'}</td>
                    {canEdit && (
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={(ev) => openEdit(emp, ev)} style={{ background: '#e8effd', color: '#1a56db', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Edit2 size={13} /> Edit</button>
                          <button onClick={(ev) => { ev.stopPropagation(); setDeleteConfirm(emp.emp_id) }} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={13} /> Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
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

      {/* Dependents step (right after creating an employee) */}
      {modal === 'dependents' && newEmpId && (
        <Modal title="Add Dependents" onClose={() => { setModal(null); load() }}>
          <p style={{ color: '#64748b', marginTop: 0, fontSize: 13 }}>
            Employee created successfully. You can add their dependents now, or skip and add them later.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Full Name" value={depForm.dep_name} onChange={(v) => setDepForm({ ...depForm, dep_name: v })} />
            <div>
              <label style={fLabel}>Relationship</label>
              <select style={fInput} value={depForm.relationship_type} onChange={(e) => setDepForm({ ...depForm, relationship_type: e.target.value })}>
                <option value="">Select…</option>
                {['Spouse', 'Child', 'Parent', 'Sibling', 'Other'].map((r) => <option key={r} value={r.toLowerCase()}>{r}</option>)}
              </select>
            </div>
          </div>
          {depError && <div style={errorBox}>{depError}</div>}

          {addedDependents.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Added</div>
              {addedDependents.map((d, i) => (
                <div key={i} style={{ fontSize: 13, color: '#0f2d6b', padding: '4px 0' }}>• {d.dep_name} ({d.relationship_type})</div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => { setModal(null); load() }} style={cancelBtn}>Done</button>
            <button onClick={handleAddDependent} disabled={depSaving} style={primaryBtn}>{depSaving ? 'Adding…' : '+ Add Dependent'}</button>
          </div>
        </Modal>
      )}

      {/* Profile Modal */}

      {/* Profile Modal */}
      {modal === 'profile' && profileEmp && (
        <Modal title="Employee Profile" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', padding: '4px 0 24px' }}>
              <Initials name={profileEmp.emp_name} size={64} fontSize={22} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#0f2d6b', lineHeight: 1.2, marginBottom: 6 }}>{profileEmp.emp_name}</div>
                <RoleBadge role={profileEmp.role} />
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>ID: EMP-{String(profileEmp.emp_id).padStart(4, '0')}</div>
              </div>
            </div>
            {/* Detail grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              <ProfileField icon={<Mail size={14} color="#1a56db" />} label="Email" value={profileEmp.email} />
              <ProfileField icon={<Phone size={14} color="#1a56db" />} label="Phone" value={profileEmp.phone || '—'} />
              <ProfileField icon={<Building2 size={14} color="#1a56db" />} label="Department" value={profileEmp.dept_id ? `Dept #${profileEmp.dept_id}` : '—'} />
              <ProfileField icon={<Award size={14} color="#1a56db" />} label="Grade" value={profileEmp.staff_grade || '—'} />
              <ProfileField icon={<Calendar size={14} color="#1a56db" />} label="Hire Date" value={profileEmp.hire_date ? new Date(profileEmp.hire_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'} />
              {profileEmp.manager_id && <ProfileField icon={<Award size={14} color="#1a56db" />} label="Reports To" value={`EMP-${String(profileEmp.manager_id).padStart(4, '0')}`} />}
            </div>
            {canEdit && (
              <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                <button onClick={(ev) => { openEdit(profileEmp, ev) }} style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: 6 }}><Edit2 size={14} /> Edit</button>
                <button onClick={() => { setModal(null); setDeleteConfirm(profileEmp.emp_id) }} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, fontFamily: 'Poppins, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={14} /> Delete</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
          <p style={{ color: '#64748b', marginTop: 0 }}>Are you sure you want to delete employee #{deleteConfirm}? This cannot be undone.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setDeleteConfirm(null)} style={cancelBtn}>Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm!)} style={{ ...primaryBtn, background: '#dc2626' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Employee Card (grid view) ─────────────────────────────────────────────────

function EmployeeCard({ emp, canEdit, onCardClick, onEdit, onDelete }: {
  emp: Employee
  canEdit: boolean
  onCardClick: (e: Employee) => void
  onEdit: (e: Employee, ev: React.MouseEvent) => void
  onDelete: (id: number, ev: React.MouseEvent) => void
}) {
  const roleColors: Record<string, string> = { ADMIN: '#7c3aed', HR: '#0891b2', MANAGER: '#1a56db', STAFF: '#16a34a' }
  const accent = roleColors[emp.role] ?? '#1a56db'
  return (
    <div
      onClick={() => onCardClick(emp)}
      style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: `3px solid ${accent}`, borderRadius: 14, padding: '20px 18px', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.1s', position: 'relative' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,45,107,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <Initials name={emp.emp_name} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0f2d6b', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.emp_name}</div>
          <RoleBadge role={emp.role} />
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={(ev) => onEdit(emp, ev)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
              <Edit2 size={14} />
            </button>
            <button onClick={(ev) => onDelete(emp.emp_id, ev)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <CardMeta icon={<Mail size={12} color="#94a3b8" />} value={emp.email} />
        {emp.dept_id && <CardMeta icon={<Building2 size={12} color="#94a3b8" />} value={`Dept #${emp.dept_id}`} />}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>{emp.staff_grade ? `Grade ${emp.staff_grade}` : 'No grade'}</span>
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</span>
        </div>
      </div>
    </div>
  )
}

function CardMeta({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon}
      <span style={{ fontSize: 12.5, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}
        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 13.5, color: '#0f2d6b', fontWeight: 500, paddingLeft: 20 }}>{value}</div>
    </div>
  )
}

function Initials({ name, size = 40, fontSize = 15 }: { name: string; size?: number; fontSize?: number }) {
  const colors = ['#1a56db', '#0891b2', '#7c3aed', '#16a34a', '#d97706', '#dc2626']
  const idx = name ? (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length : 0
  const initials = name ? name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : '?'
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: colors[idx] + '22', border: `2px solid ${colors[idx]}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: colors[idx], flexShrink: 0, letterSpacing: 0.5 }}>
      {initials}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = { ADMIN: '#7c3aed', HR: '#0891b2', MANAGER: '#1a56db', STAFF: '#16a34a' }
  const color = colors[role] || '#64748b'
  return (
    <span style={{ background: color + '18', color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{ height: 160, background: '#f1f5f9', borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

export const searchStyle: React.CSSProperties = { padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontFamily: 'Poppins, sans-serif', outline: 'none', background: '#fafbff' }
export const primaryBtn: React.CSSProperties = { background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
export const cancelBtn: React.CSSProperties = { background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
export const fLabel: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }
export const fInput: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13.5, fontFamily: 'Poppins, sans-serif', outline: 'none', background: '#fafbff', boxSizing: 'border-box' }
export const errorBox: React.CSSProperties = { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginTop: 12 }
