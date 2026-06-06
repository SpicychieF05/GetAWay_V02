"use client";

import { useRoom } from '@/hooks/useRoom';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface InterviewRoomProps {
  roomId: string;
  role: 'recruiter' | 'candidate';
  /** Optional pre-acquired MediaStream from DeviceCheckStep. When provided,
   *  getUserMedia is skipped and this stream is used directly. */
  preAcquiredStream?: MediaStream | null;
}

export function InterviewRoom({ roomId, role, preAcquiredStream }: InterviewRoomProps) {
  const { room, loading, error } = useRoom(roomId);
  const [localStream, setLocalStream] = useState<MediaStream | null>(
    preAcquiredStream ?? null
  );
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { remoteStream, connectionState } = useWebRTC({
    roomId,
    role,
    localStream,
  });

  // Get User Media — skipped if a pre-acquired stream was passed in
  useEffect(() => {
    // If DeviceCheckStep already acquired the stream, seed the video element
    if (preAcquiredStream) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = preAcquiredStream;
      }
      return;
    }

    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to get media", err);
      }
    }
    getMedia();
    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preAcquiredStream]);

  // Set Remote Stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !micEnabled);
      setMicEnabled(!micEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-text-secondary">Connecting to secure room...</div>;
  if (!room) return <div className="min-h-screen bg-background flex items-center justify-center text-rose-500">Room not found or unauthorized.</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-surface-base flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black font-black text-lg">GW</div>
            <span className="font-semibold text-lg tracking-tight">GetAWay</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest bg-surface-elevated px-2 py-1 rounded">Room: {roomId.slice(0, 16)}</span>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-black border border-border-strong rounded-full text-[10px] font-mono text-brand-accent tracking-widest uppercase">
            <div className={`w-1.5 h-1.5 rounded-full ${connectionState === 'connected' ? 'bg-brand-accent animate-pulse' : 'bg-amber-500'}`}></div>
            <span>{connectionState}</span>
          </div>
        </div>
        {role === 'recruiter' && (
          <div className="flex items-center space-x-3">
             <div className="text-right">
               <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest">Trust Score</p>
               <p className="font-mono text-brand-primary font-bold text-lg">{room.trustScore ?? 100}%</p>
             </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Video Area */}
        <div className="flex-1 flex flex-col relative bg-surface-base border border-border rounded-2xl overflow-hidden">
           {remoteStream ? (
             <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center flex-col text-text-secondary space-y-4">
               <div className="w-16 h-16 rounded-full bg-surface-elevated animate-pulse" />
               <p className="font-display font-medium tracking-wide">Waiting for {role === 'recruiter' ? 'Candidate' : 'Recruiter'} to join...</p>
             </div>
           )}

           {/* Local PiP */}
           <div className="absolute top-6 right-6 w-48 aspect-video bg-black rounded-xl overflow-hidden border border-border shadow-2xl">
             {localStream ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary font-medium">Camera off</div>
             )}
           </div>

           {/* Controls Overlay */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-[#0a0a0a]/80 backdrop-blur-xl px-6 py-3 rounded-full border border-border-strong shadow-2xl">
              <button onClick={toggleMic} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${micEnabled ? 'bg-white/10 text-text-primary hover:bg-white/20' : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 border border-rose-500/30'}`}>
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button onClick={toggleVideo} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${videoEnabled ? 'bg-white/10 text-text-primary hover:bg-white/20' : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 border border-rose-500/30'}`}>
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <div className="w-px h-6 bg-border mx-2" />
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <PhoneOff className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Sidebar (Recruiter only) */}
        {role === 'recruiter' && (
          <aside className="w-80 flex flex-col border border-border rounded-2xl bg-surface-base overflow-hidden shrink-0">
            <div className="p-4 border-b border-border bg-white/[0.02]">
              <h3 className="font-medium text-sm text-text-primary">System Monitoring</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <AlertCard message="Multiple faces detected in frame." time="10:02 AM" severity="high" />
              <AlertCard message="Background tab opened." time="10:05 AM" severity="medium" />
              <AlertCard message="Audio anomaly detected." time="10:12 AM" severity="low" />
            </div>
            
            <div className="p-5 bg-gradient-to-br from-brand-surface to-transparent border-t border-brand-primary/20 shrink-0">
              <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-3">Live Analysis</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-text-secondary">Face Match</span>
                  <span className="text-brand-accent">98.2%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-text-secondary">Voice Match</span>
                  <span className="text-brand-accent">99.1%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-text-secondary">Gaze Deviation</span>
                  <span className="text-brand-accent">Minimal</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

function AlertCard({ message, time, severity }: { message: string, time: string, severity: 'low' | 'medium' | 'high' }) {
  const colors = {
    high: 'text-rose-500 border-rose-500/20 bg-rose-500/5',
    medium: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
    low: 'text-text-secondary border-border bg-surface-hover'
  };

  return (
    <div className={`p-3 rounded-lg border flex items-start space-x-3 ${colors[severity]}`}>
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs opacity-80 mt-1 font-mono">{time}</p>
      </div>
    </div>
  );
}
