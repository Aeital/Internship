import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { PageHeader, cardStyle } from './DashboardPage'
import { LoadingRows, searchStyle } from './EmployeesPage'

interface AuditLog {
  log_id?: number
  id?: number
  emp_id?: number
  action?: string
  description?: string
  timestamp?: string
  created_at?: string
}

interface ApprovalLog {
  log_id?: number
  id?: number
  leave_id: number
  action: string
  approved_by?: number
  timestamp?: string
}

export default function AuditPage() {
  const [tab, setTab] = useState<'audit' | 'approval'>('audit')
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [approvalLogs, setApprovalLogs] = useState<ApprovalLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEmpId, setFilterEmpId] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const url = filterEmpId ? `/audit/audit-logs/employee/${filterEmpId}` : '/audit/audit-logs'
      const [auditRes, approvalRes] = await Promise.allSettled([
        api.get(url),
        api.get('/audit/approval-logs'),
      ])
      if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.data?.data ?? auditRes.value.data ?? [])
      if (approvalRes.status === 'fulfilled') setApprovalLogs(approvalRes.value.data?.data ?? approvalRes.value.data ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filterEmpId])

  return (
    <div>
      <PageHeader title="Audit Logs" sub="System activity and approval history (Admin only)" />

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[{ id: 'audit', label: `Audit Logs (${auditLogs.length})` }, { id: 'approval', label: `Approval Logs (${approvalLogs.length})` }].map((t) => (
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

      {tab === 'audit' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <input placeholder="Filter by Employee ID…" value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)} style={{ ...searchStyle, width: 220 }} />
            {filterEmpId && <button onClick={() => setFilterEmpId('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', color: '#64748b' }}>Clear</button>}
          </div>

          {loading ? <LoadingRows /> : (
            auditLogs.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>No audit logs found</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {auditLogs.map((log, i) => {
                  const ts = log.timestamp || log.created_at
                  return (
                    <div key={log.log_id ?? log.id ?? i} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: i < auditLogs.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'flex-start' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8effd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 14 }}>📋</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: '#1e293b' }}>{log.action || log.description || 'System action'}</div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          {log.emp_id && <span style={{ fontSize: 12, color: '#64748b' }}>Employee #{log.emp_id}</span>}
                          {ts && <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(ts).toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      )}

      {tab === 'approval' && (
        <div style={cardStyle}>
          {loading ? <LoadingRows /> : (
            approvalLogs.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>No approval logs found</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr>
                      {['Log ID', 'Leave ID', 'Action', 'Approved By', 'Timestamp'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {approvalLogs.map((log, i) => {
                      const ts = log.timestamp
                      const actionColors: Record<string, string> = { approved: '#16a34a', rejected: '#dc2626', pending: '#d97706' }
                      const color = actionColors[log.action?.toLowerCase()] || '#64748b'
                      return (
                        <tr key={log.log_id ?? log.id ?? i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px' }}><span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{log.log_id ?? log.id}</span></td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f2d6b' }}>#{log.leave_id}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ background: color + '18', color, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, textTransform: 'capitalize' }}>{log.action}</span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>{log.approved_by ? `#${log.approved_by}` : '—'}</td>
                          <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{ts ? new Date(ts).toLocaleString() : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
