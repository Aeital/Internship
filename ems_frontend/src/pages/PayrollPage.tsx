import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { Modal, Field, LoadingRows, searchStyle, primaryBtn, cancelBtn, fLabel, fInput, errorBox } from './EmployeesPage'

interface Payroll {
  payroll_id: number
  emp_id: number
  month: string
  basic_salary: number
  deductions: number
  net_salary: number
  generated_at?: string
}

export default function PayrollPage() {
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'HR'
  const [records, setRecords] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEmpId, setFilterEmpId] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState({ emp_id: '', month: '', basic_salary: '', deductions: '0' })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const url = filterEmpId ? `/payroll/employee/${filterEmpId}` : '/payroll'
      const res = await api.get(url)
      setRecords(res.data?.data ?? res.data ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filterEmpId])

  const openCreate = () => {
    setForm({ emp_id: '', month: currentMonth(), basic_salary: '', deductions: '0' })
    setEditId(null); setError(''); setModal('create')
  }

  const openEdit = (p: Payroll) => {
    setForm({ emp_id: String(p.emp_id), month: p.month, basic_salary: String(p.basic_salary), deductions: String(p.deductions) })
    setEditId(p.payroll_id); setError(''); setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { emp_id: Number(form.emp_id), month: form.month, basic_salary: Number(form.basic_salary), deductions: Number(form.deductions) }
      if (modal === 'create') await api.post('/payroll', payload)
      else if (editId) await api.put(`/payroll/${editId}`, payload)
      setModal(null); load()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save payroll.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    try { await api.delete(`/payroll/${id}`); load() } catch {}
  }

  const totalNet = records.reduce((s, r) => s + (r.net_salary || 0), 0)

  return (
    <div>
      <PageHeader title="Payroll" sub="Generate and manage employee payroll records" />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: records.length, color: '#1a56db' },
          { label: 'Total Net Salary', value: `PKR ${totalNet.toLocaleString()}`, color: '#16a34a' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: `4px solid ${s.color}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f2d6b' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input placeholder="Filter by Employee ID…" value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)} style={{ ...searchStyle, width: 220 }} />
            {filterEmpId && <button onClick={() => setFilterEmpId('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', color: '#64748b' }}>Clear</button>}
          </div>
          {canEdit && <button onClick={openCreate} style={primaryBtn}>+ Generate Payroll</button>}
        </div>

        {loading ? <LoadingRows /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr>
                  {['ID', 'Employee', 'Month', 'Basic Salary', 'Deductions', 'Net Salary', 'Generated', 'Actions'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No payroll records found</td></tr>
                ) : records.map((p) => (
                  <tr key={p.payroll_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}><span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{p.payroll_id}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#0f2d6b' }}>#{p.emp_id}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{p.month}</td>
                    <td style={{ ...tdStyle, color: '#1e293b' }}>PKR {p.basic_salary?.toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#dc2626' }}>- PKR {p.deductions?.toLocaleString()}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#16a34a' }}>PKR {p.net_salary?.toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#94a3b8', fontSize: 12 }}>{p.generated_at ? new Date(p.generated_at).toLocaleDateString() : '—'}</td>
                    <td style={tdStyle}>
                      {canEdit && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={{ background: '#e8effd', color: '#1a56db', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDelete(p.payroll_id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>Delete</button>
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
        <Modal title={modal === 'create' ? 'Generate Payroll' : 'Edit Payroll'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Employee ID" type="number" value={form.emp_id} onChange={(v) => setForm({ ...form, emp_id: v })} required />
            <div>
              <label style={fLabel}>Month (YYYY-MM)</label>
              <input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} style={fInput} required />
            </div>
            <Field label="Basic Salary (PKR)" type="number" value={form.basic_salary} onChange={(v) => setForm({ ...form, basic_salary: v })} required />
            <Field label="Deductions (PKR)" type="number" value={form.deductions} onChange={(v) => setForm({ ...form, deductions: v })} />
          </div>
          {form.basic_salary && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
              Net Salary: PKR {(Number(form.basic_salary) - Number(form.deductions || 0)).toLocaleString()}
            </div>
          )}
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

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }
const tdStyle: React.CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' }
