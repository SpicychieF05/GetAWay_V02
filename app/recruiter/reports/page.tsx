"use client";

import { Download, FileText, Search } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium text-text-primary tracking-tight">Security Reports</h1>
          <p className="text-text-secondary mt-1">Detailed trust and security analysis of completed sessions.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 rounded-md bg-surface-base border border-border text-text-primary hover:bg-surface-hover hover:text-white font-medium transition-colors text-sm">
          <Download className="w-4 h-4" />
          <span>Export All</span>
        </button>
      </div>

      <div className="bg-surface-base border border-border rounded-2xl flex flex-col overflow-hidden min-h-0 flex-1">
        <div className="p-4 border-b border-border bg-white/[0.02] flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">Completed Sessions</h3>
          <div className="flex gap-2 items-center relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="bg-background border border-border-strong rounded-md pl-9 pr-3 py-1.5 text-xs w-64 text-text-primary outline-none focus:border-brand-primary" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-text-muted font-medium uppercase tracking-widest sticky top-0 bg-surface-base border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Session ID</th>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Final Trust Score</th>
                <th className="px-6 py-4 font-medium">Status / Flags</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm border-t border-border">
              <ReportRow id="GW-1c4d7f8a3f9" candidate="Jordan Smith" date="Today, 2:00 PM" score={98} status="Clean" />
              <ReportRow id="GW-x9d8e7b6a5k" candidate="Alex Mercer" date="Yesterday, 10:30 AM" score={85} status="1 Minor Flag" isWarning />
              <ReportRow id="GW-p2o3i4u5y6t" candidate="Emily Davis" date="Oct 12, 4:15 PM" score={42} status="Multiple Flags" isDanger />
              <ReportRow id="GW-z1x2c3v4b5n" candidate="Liam Wilson" date="Oct 10, 9:00 AM" score={95} status="Clean" />
              <ReportRow id="GW-m9n8b7v6c5x" candidate="Sophia Martinez" date="Oct 08, 1:45 PM" score={91} status="Clean" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ id, candidate, date, score, status, isWarning = false, isDanger = false }: { id: string, candidate: string, date: string, score: number, status: string, isWarning?: boolean, isDanger?: boolean }) {
  return (
    <tr className="border-b border-border hover:bg-white/[0.01] transition-colors">
      <td className="px-6 py-4 font-mono text-text-secondary text-xs">{id}</td>
      <td className="px-6 py-4 font-medium text-text-primary">{candidate}</td>
      <td className="px-6 py-4 text-text-secondary text-xs">{date}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div className={`h-full ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-brand-primary'}`} style={{ width: `${score}%` }}></div>
          </div>
          <span className={`text-xs font-medium ${isDanger ? 'text-rose-400' : isWarning ? 'text-amber-500' : 'text-text-primary'}`}>{score}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {status === 'Clean' ? (
          <span className="px-2 py-0.5 bg-surface-hover rounded-[4px] text-[10px] text-text-secondary uppercase tracking-widest">{status}</span>
        ) : isWarning ? (
          <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-[4px] text-[10px] text-amber-500 font-medium uppercase tracking-widest">
            {status}
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded-[4px] text-[10px] text-rose-500 font-medium uppercase tracking-widest">
            {status}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
         <button className="text-brand-accent hover:text-white transition-colors p-1.5 rounded-md hover:bg-surface-hover inline-flex items-center justify-center">
            <FileText className="w-4 h-4" />
         </button>
      </td>
    </tr>
  );
}
