"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Activity, ShieldAlert, Users, Clock } from 'lucide-react';

const trustScoreData = [
  { name: 'Mon', score: 92 },
  { name: 'Tue', score: 89 },
  { name: 'Wed', score: 95 },
  { name: 'Thu', score: 94 },
  { name: 'Fri', score: 98 },
  { name: 'Sat', score: 97 },
  { name: 'Sun', score: 96 },
];

const volumeData = [
  { name: 'Mon', sessions: 12 },
  { name: 'Tue', sessions: 15 },
  { name: 'Wed', sessions: 8 },
  { name: 'Thu', sessions: 22 },
  { name: 'Fri', sessions: 18 },
  { name: 'Sat', sessions: 5 },
  { name: 'Sun', sessions: 3 },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-display font-medium text-text-primary tracking-tight">Analytics</h1>
        <p className="text-text-secondary mt-1">Platform usage and aggregate trust score trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <MetricCard title="Total Sessions" value="83" icon={Users} trend="+12% this week" isPositive />
         <MetricCard title="Avg Trust Score" value="94.2%" icon={Activity} trend="Stable" />
         <MetricCard title="Total Alerts" value="14" icon={ShieldAlert} trend="-5% this week" isPositive />
         <MetricCard title="Avg Duration" value="42m" icon={Clock} trend="+2m this week" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Trust Score Line Chart */}
         <div className="bg-surface-base border border-border rounded-2xl p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
               <div>
                 <h3 className="text-sm font-medium text-text-primary">Average Trust Score</h3>
                 <p className="text-xs text-text-secondary mt-1">7-day rolling average</p>
               </div>
               <div className="px-2 py-1 bg-brand-surface text-brand-accent rounded-[4px] border border-brand-primary/20 text-[10px] uppercase tracking-widest font-medium">
                 Weekly Top
               </div>
            </div>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trustScoreData}>
                   <defs>
                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis dataKey="score" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 2']} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#2dd4bf' }}
                   />
                   <Area type="monotone" dataKey="score" stroke="#2dd4bf" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Volume Bar Chart */}
         <div className="bg-surface-base border border-border rounded-2xl p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
               <div>
                 <h3 className="text-sm font-medium text-text-primary">Session Volume</h3>
                 <p className="text-xs text-text-secondary mt-1">Interviews completed per day</p>
               </div>
            </div>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={volumeData}>
                   <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                   />
                   <Bar dataKey="sessions" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, isPositive = false }: any) {
  return (
    <div className="border border-border bg-surface-base p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">{title}</span>
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div>
        <span className="text-3xl font-semibold text-text-primary font-display">{value}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-medium uppercase tracking-widest ${isPositive ? 'text-brand-accent' : 'text-text-muted'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
