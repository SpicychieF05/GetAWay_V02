"use client";

import { User, Shield, Bell, Key, Zap } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-display font-medium text-text-primary tracking-tight">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account and platform preferences.</p>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0 pb-8">
         <aside className="w-full md:w-64 shrink-0">
           <nav className="flex md:flex-col gap-1 overflow-x-auto">
             <TabButton active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={User}>Account</TabButton>
             <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield}>Security Policy</TabButton>
             <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={Bell}>Notifications</TabButton>
             <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={Key}>API Keys</TabButton>
             <TabButton active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} icon={Zap}>Advanced</TabButton>
           </nav>
         </aside>
         
         <div className="flex-1 bg-surface-base border border-border rounded-2xl overflow-y-auto shadow-sm">
           {activeTab === 'account' && <AccountSettings />}
           {activeTab === 'security' && <SecuritySettings />}
           {(activeTab !== 'account' && activeTab !== 'security') && (
             <div className="p-8 text-text-secondary text-sm">Settings coming soon for this section.</div>
           )}
         </div>
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </button>
  );
}

function AccountSettings() {
  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-1 tracking-tight">Profile Details</h3>
        <p className="text-sm text-text-secondary">Update your personal information and email.</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <label className="text-[10px] uppercase font-medium text-text-muted tracking-widest">Full Name</label>
          <input type="text" defaultValue="Recruiter Admin" className="bg-background border border-border-strong rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary" />
        </div>
        <div className="grid gap-2">
          <label className="text-[10px] uppercase font-medium text-text-muted tracking-widest">Email Address</label>
          <input type="email" defaultValue="admin@getaway.app" className="bg-background border border-border-strong rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary" />
        </div>
      </div>

      <div className="pt-6 border-t border-border flex justify-end">
        <button className="px-4 py-2 bg-brand-primary text-black font-bold rounded-md text-sm hover:bg-brand-hover transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-1 tracking-tight">AI Detection Policies</h3>
        <p className="text-sm text-text-secondary">Configure strictness rules for AI-powered proctoring.</p>
      </div>

      <div className="space-y-6">
        <SettingToggle 
          title="Strict Video Monitoring" 
          description="Flag sessions automatically when multiple faces are detected or face is lost for >5 seconds."
          checked={true}
        />
        <SettingToggle 
          title="Audio Anomaly Detection" 
          description="Detect background voices or synthetic audio generation during the session."
          checked={true}
        />
        <SettingToggle 
          title="Browser Unfocus Alert" 
          description="Alert when Candidate clicks out of the interview browser tab."
          checked={true}
        />
      </div>

      <div className="pt-6 border-t border-border flex justify-end">
        <button className="px-4 py-2 bg-brand-primary text-black font-bold rounded-md text-sm hover:bg-brand-hover transition-colors">
          Update Policies
        </button>
      </div>
    </div>
  );
}

function SettingToggle({ title, description, checked }: any) {
  const [isOn, setIsOn] = useState(checked);
  return (
    <div className="flex items-start justify-between cursor-pointer" onClick={() => setIsOn(!isOn)}>
      <div className="pr-8">
        <h4 className="text-sm font-medium text-text-primary">{title}</h4>
        <p className="text-xs text-text-secondary mt-1">{description}</p>
      </div>
      <button className={`w-10 h-5 rounded-full relative transition-colors ${isOn ? 'bg-brand-primary' : 'bg-surface-elevated'}`}>
        <span className={`absolute top-0.5 left-0.5 bg-black w-4 h-4 rounded-full transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
