"use client";

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Video, Mic, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function CandidateOnboarding({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);
  const [deviceCheck, setDeviceCheck] = useState<'pending' | 'success' | 'failed'>('pending');

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionsGranted(true);
      setDeviceCheck('success');
      // Stop the stream right away, will acquire again in the room
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
       setPermissionsGranted(false);
       setDeviceCheck('failed');
    }
  };

  const joinSession = () => {
    router.push(`/candidate/rooms/${roomId}?token=${token}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface-base border border-border rounded-xl p-8 space-y-6">
         <div className="text-center">
            <h1 className="text-2xl font-display font-medium text-text-primary">System Check</h1>
            <p className="text-sm text-text-secondary mt-2">GetAWay requires access to your camera and microphone to proctor this interview securely.</p>
         </div>

         <div className="space-y-4">
           {/* Camera Check */}
           <div className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated border border-border">
              <div className="flex items-center space-x-3">
                 <Video className="w-5 h-5 text-text-secondary" />
                 <span className="text-sm font-medium text-text-primary">Camera Access</span>
              </div>
              {deviceCheck === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
              {deviceCheck === 'failed' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
              {deviceCheck === 'pending' && <span className="w-5 h-5 rounded-full border-2 border-border border-t-brand-primary animate-spin" />}
           </div>

           {/* Mic Check */}
           <div className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated border border-border">
              <div className="flex items-center space-x-3">
                 <Mic className="w-5 h-5 text-text-secondary" />
                 <span className="text-sm font-medium text-text-primary">Microphone Access</span>
              </div>
              {deviceCheck === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
              {deviceCheck === 'failed' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
              {deviceCheck === 'pending' && <span className="w-5 h-5 rounded-full border-2 border-border border-t-brand-primary animate-spin" />}
           </div>
         </div>

         {deviceCheck === 'pending' && (
           <button onClick={requestPermissions} className="w-full py-3 rounded-lg bg-text-primary text-background font-medium hover:bg-text-secondary transition-colors">
             Grant Permissions
           </button>
         )}

         {deviceCheck === 'success' && (
           <button onClick={joinSession} className="w-full py-3 rounded-lg bg-brand-primary text-background font-medium hover:bg-brand-hover transition-colors">
             Join Interview Room
           </button>
         )}

         {deviceCheck === 'failed' && (
           <div className="text-sm text-rose-500 bg-rose-500/10 p-4 rounded-lg border border-rose-500/20 text-center">
             Please allow camera and microphone permissions in your browser settings to continue.
           </div>
         )}
      </div>
    </div>
  );
}
