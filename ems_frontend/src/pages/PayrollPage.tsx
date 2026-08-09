import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, cardStyle } from './DashboardPage'
import { Modal, Field, LoadingRows, searchStyle, primaryBtn, cancelBtn, fLabel, fInput, errorBox } from './EmployeesPage'
import { Download, TrendingUp, TrendingDown, Wallet, Filter } from 'lucide-react'

interface Payroll {
  payroll_id: number
  emp_id: number
  month: string
  basic_salary: number
  deductions: number
  net_salary: number
  generated_at?: string
}

// ── Root: role-aware ──────────────────────────────────────────────────────────

export default function PayrollPage() {
  const { user } = useAuth()
  if (user?.role === 'STAFF' || user?.role === 'MANAGER') return <StaffPayroll />
  return <AdminPayroll />
}

// ── Staff Payroll View ────────────────────────────────────────────────────────

function StaffPayroll() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/payroll/employee/${user?.emp_id}`)
        const data: Payroll[] = res.data?.data ?? res.data ?? []
        // Sort latest first
        setRecords(data.sort((a, b) => b.month.localeCompare(a.month)))
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const filtered = records.filter((r) =>
    r.month.includes(search) || r.net_salary?.toString().includes(search)
  )

  const latest = records[0]
  const prev = records[1]
  const ytdNet = records
    .filter((r) => r.month.startsWith(new Date().getFullYear().toString()))
    .reduce((s, r) => s + (r.net_salary || 0), 0)
  const currentDeductions = latest?.deductions ?? 0
  const netChange = latest && prev ? ((latest.net_salary - prev.net_salary) / prev.net_salary) * 100 : null

  return (
    <div>
      <PageHeader
        title="My Payroll History"
        sub="View and download your recent payslips and earnings summaries."
        action={
          <button style={{ ...cancelBtn, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0' }}>
            <Filter size={14} /> Filter
          </button>
        }
      />

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <SummaryCard
          label="Last Salary (Net)"
          value={latest ? `PKR ${latest.net_salary.toLocaleString()}` : '—'}
          sub={netChange !== null ? `${netChange >= 0 ? '+' : ''}${netChange.toFixed(1)}% vs last month` : 'No prior record'}
          subColor={netChange === null ? '#94a3b8' : netChange >= 0 ? '#16a34a' : '#dc2626'}
          SubIcon={netChange === null ? undefined : netChange >= 0 ? TrendingUp : TrendingDown}
          borderColor="#1a56db"
        />
        <SummaryCard
          label="Total YTD Earnings"
          value={`PKR ${ytdNet.toLocaleString()}`}
          sub={`As of ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
          subColor="#64748b"
          borderColor="#16a34a"
        />
        <SummaryCard
          label="Current Month Deductions"
          value={latest ? `PKR ${currentDeductions.toLocaleString()}` : '—'}
          sub="Tax & other deductions"
          subColor="#dc2626"
          borderColor="#dc2626"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
        {/* Payroll table */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f2d6b' }}>Recent Payrolls</div>
            <input
              placeholder="Search by month…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...searchStyle, width: 180, fontSize: 13 }}
            />
          </div>

          {loading ? <LoadingRows /> : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>
              <Wallet size={32} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
              No payroll records found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr>
                  {['Month', 'Basic Salary', 'Deductions', 'Net Salary', 'Status', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11.5, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.payroll_id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8faff' : 'none' }}>
                    <td style={{ padding: '13px 12px', fontWeight: 700, color: '#0f2d6b' }}>
                      {new Date(p.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '13px 12px', color: '#1e293b' }}>
                      PKR {p.basic_salary?.toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 12px', color: '#dc2626', fontWeight: 500 }}>
                      −PKR {p.deductions?.toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 12px', fontWeight: 700, color: '#16a34a' }}>
                      PKR {p.net_salary?.toLocaleString()}
                    </td>
                    <td style={{ padding: '13px 12px' }}>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>PAID</span>
                    </td>
                    <td style={{ padding: '13px 12px' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: '#1a56db', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Download size={13} /> Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payroll Insights */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f2d6b', marginBottom: 16 }}>Payroll Insights</div>

          {latest ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
                Earnings vs Deductions (Avg)
              </div>

              {/* Donut-style ring */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <DonutRing net={latest.net_salary} deductions={latest.deductions} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <LegendRow color="#1a56db" label="Net" value={`${Math.round((latest.net_salary / latest.basic_salary) * 100)}%`} />
                <LegendRow color="#fecaca" label="Deductions" value={`${Math.round((latest.deductions / latest.basic_salary) * 100)}%`} />
              </div>

              {/* Breakdown */}
              <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Latest Month Breakdown</div>
                {[
                  { label: 'Basic Salary', value: latest.basic_salary, color: '#1e293b' },
                  { label: 'Deductions', value: -latest.deductions, color: '#dc2626' },
                  { label: 'Net Salary', value: latest.net_salary, color: '#16a34a' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: row.color }}>
                      {row.value < 0 ? '−' : ''}PKR {Math.abs(row.value).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No data yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub, subColor, SubIcon, borderColor }: { label: string; value: string; sub: string; subColor: string; SubIcon?: any; borderColor: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '22px 24px', borderTop: `4px solid ${borderColor}` }}>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0f2d6b', letterSpacing: -0.5, marginBottom: 8 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: subColor }}>
        {SubIcon && <SubIcon size={13} />}
        {sub}
      </div>
    </div>
  )
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ color: '#64748b', flex: 1 }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#1e293b' }}>{value}</span>
    </div>
  )
}

function DonutRing({ net, deductions }: { net: number; deductions: number }) {
  const total = net + deductions
  const netPct = total > 0 ? (net / total) * 100 : 84
  const r = 48
  const circ = 2 * Math.PI * r
  const netDash = (netPct / 100) * circ
  const label = `${Math.round(netPct)}%`

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#fecaca" strokeWidth="14" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="#1a56db" strokeWidth="14"
          strokeDasharray={`${netDash} ${circ - netDash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f2d6b' }}>{label}</div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>Net</div>
      </div>
    </div>
  )
}

// ── Admin / HR Payroll View (preserved) ───────────────────────────────────────

function AdminPayroll() {
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'HR'
  const [records, setRecords] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEmpId, setFilterEmpId] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState({ emp_id: '', month: currentMonth(), basic_salary: '', deductions: '0' })
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

  const openCreate = () => { setForm({ emp_id: '', month: currentMonth(), basic_salary: '', deductions: '0' }); setEditId(null); setError(''); setModal('create') }
  const openEdit = (p: Payroll) => { setForm({ emp_id: String(p.emp_id), month: p.month, basic_salary: String(p.basic_salary), deductions: String(p.deductions) }); setEditId(p.payroll_id); setError(''); setModal('edit') }
  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { emp_id: Number(form.emp_id), month: form.month, basic_salary: Number(form.basic_salary), deductions: Number(form.deductions) }
      if (modal === 'create') await api.post('/payroll', payload)
      else if (editId) await api.put(`/payroll/${editId}`, payload)
      setModal(null); load()
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save.') }
    setSaving(false)
  }
  const handleDelete = async (id: number) => { try { await api.delete(`/payroll/${id}`); load() } catch {} }
  const totalNet = records.reduce((s, r) => s + (r.net_salary || 0), 0)

  return (
    <div>
      <PageHeader title="Payroll" sub="Generate and manage employee payroll records" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[{ label: 'Total Records', value: records.length, color: '#1a56db' }, { label: 'Total Net Salary', value: `PKR ${totalNet.toLocaleString()}`, color: '#16a34a' }].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: `4px solid ${s.color}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f2d6b' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Filter by Employee ID…" value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)} style={{ ...searchStyle, width: 220 }} />
            {filterEmpId && <button onClick={() => setFilterEmpId('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', color: '#64748b' }}>Clear</button>}
          </div>
          {canEdit && <button onClick={openCreate} style={primaryBtn}>+ Generate Payroll</button>}
        </div>
        {loading ? <LoadingRows /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr>{['ID', 'Employee', 'Month', 'Basic', 'Deductions', 'Net', 'Generated', 'Actions'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {records.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No payroll records found</td></tr> : records.map((p) => (
                  <tr key={p.payroll_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}><span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{p.payroll_id}</span></td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f2d6b' }}>#{p.emp_id}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{p.month}</td>
                    <td style={{ padding: '12px 14px' }}>PKR {p.basic_salary?.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', color: '#dc2626' }}>−PKR {p.deductions?.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#16a34a' }}>PKR {p.net_salary?.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{p.generated_at ? new Date(p.generated_at).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
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
