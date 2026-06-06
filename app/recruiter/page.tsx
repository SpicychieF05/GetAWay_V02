export default function DashboardOverview() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-display font-medium text-text-primary tracking-tight">Overview</h1>
        <p className="text-text-secondary mt-1">Monitor active interviews and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <MetricCard title="Active Sessions" value="14" trend="+2 today" />
        <MetricCard title="Avg. Trust Score" value="94.2%" trend="Stable" />
        <MetricCard title="AI Detections" value="28" trend="↑ 12%" isWarning />
        <MetricCard title="ICE Success Rate" value="99.8%" trend="Optimal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 pb-6">
        <div className="lg:col-span-2 border border-border bg-surface-base rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">Active Monitoring</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Filter by ID..." className="bg-background border border-border-strong rounded-md px-3 py-1 text-xs w-48 text-text-primary outline-none focus:border-brand-primary" />
              <button className="px-3 py-1 bg-brand-primary text-black rounded-md text-xs font-bold hover:bg-brand-hover transition-colors">New Room</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] text-text-muted font-medium uppercase tracking-widest sticky top-0 bg-surface-base border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Room Identifier</th>
                  <th className="px-6 py-4 font-medium">Candidate Name</th>
                  <th className="px-6 py-4 font-medium">Trust Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Alerts</th>
                  <th className="px-6 py-4 font-medium text-right">Diagnostic</th>
                </tr>
              </thead>
              <tbody className="text-sm border-t border-border">
                <SessionRow id="GW-a3f9e2b1c4d" name="Sarah Jenkins" score={92} status="Live" alerts="0" diag="32ms • HD" isLive />
                <SessionRow id="GW-8e2b14f09a1" name="Michael Chen" score={74} status="Live" alerts="2 Flags" diag="48ms • SD" isWarning isLive />
                <SessionRow id="GW-1c4d7f8a3f9" name="Jordan Smith" score={98} status="Review" alerts="0" diag="Completed" />
              </tbody>
            </table>
          </div>
        </div>
        
        <aside className="w-full flex md:flex-col gap-6 shrink-0 h-full overflow-hidden">
          <div className="flex-1 bg-surface-base border border-border rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-white/[0.02]">
              <h3 className="font-medium text-sm">Security Audit Log</h3>
            </div>
            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              <AuditLog time="14:22:04" type="success" text="Session GW-a3f9: Token validation success." />
              <AuditLog time="14:21:58" type="warning" text="Warning: Browser focus lost on GW-8e2b." />
              <AuditLog time="14:18:12" type="success" text="ICE gathering completed for candidate MJC." />
              <AuditLog time="14:15:30" type="danger" text="Security: Unauthorized access attempt blocked." />
            </div>
          </div>
          <div className="p-5 bg-gradient-to-br from-brand-surface to-transparent border border-brand-primary/20 rounded-2xl shrink-0">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">AI Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Facial Recognition</span>
                <span className="text-brand-accent">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Gaze Tracking</span>
                <span className="text-brand-accent">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Secondary Audio</span>
                <span className="text-brand-accent">Active</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, isWarning = false }: { title: string, value: string, trend: string, isWarning?: boolean }) {
  return (
    <div className="border border-border bg-surface-base p-4 rounded-xl flex flex-col gap-1">
      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{title}</span>
      <div className="flex items-end justify-between mt-1">
        <span className="text-2xl font-semibold text-text-primary">{value}</span>
        <span className={`text-[10px] font-medium ${isWarning ? 'text-rose-400' : 'text-brand-accent'}`}>{trend}</span>
      </div>
    </div>
  );
}

function SessionRow({ id, name, score, status, alerts, diag, isWarning = false, isLive = false }: { id: string, name: string, score: number, status: string, alerts: string, diag: string, isWarning?: boolean, isLive?: boolean }) {
  return (
    <tr className="border-b border-border hover:bg-white/[0.01] transition-colors">
      <td className="px-6 py-4 font-mono text-text-secondary text-xs">{id}</td>
      <td className="px-6 py-4 font-medium text-text-primary">{name}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div className={`h-full ${isWarning ? 'bg-amber-500' : 'bg-brand-primary'}`} style={{ width: `${score}%` }}></div>
          </div>
          <span className="text-xs text-text-primary">{score}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${isLive ? 'text-brand-accent' : 'text-text-muted'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-brand-primary animate-pulse' : 'bg-text-muted'}`}></span>
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        {alerts === '0' ? (
          <span className="px-2 py-0.5 bg-surface-hover rounded-[4px] text-[10px] text-text-secondary">{alerts}</span>
        ) : (
          <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-[4px] text-[10px] text-amber-500 font-medium">
            {alerts}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right font-mono text-[10px] text-text-muted">{diag}</td>
    </tr>
  );
}

function AuditLog({ time, type, text }: { time: string, type: 'success' | 'warning' | 'danger', text: string }) {
  const timeColors = {
    success: 'text-brand-accent',
    warning: 'text-amber-500',
    danger: 'text-rose-500'
  };
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-[10px] font-mono ${timeColors[type]}`}>{time}</span>
      <p className="text-xs text-text-primary/80">{text}</p>
    </div>
  );
}
