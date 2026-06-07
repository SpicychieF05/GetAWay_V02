"use client";

import { useEffect, useRef, useState } from 'react';
import { Camera, Mic, ArrowRight, CheckCircle2, AlertTriangle, Loader2, Wifi } from 'lucide-react';

export type DeviceStatus = 'checking' | 'ok' | 'warning' | 'error';

interface DeviceState {
  camera: DeviceStatus;
  microphone: DeviceStatus;
  cameraLabel?: string;
  microphoneLabel?: string;
}

interface DeviceCheckStepProps {
  onDevicesReady: (stream: MediaStream | null) => void;
}

const STATUS_META: Record<DeviceStatus, { color: string; label: string }> = {
  checking: { color: 'text-text-muted',   label: 'Checking...' },
  ok:       { color: 'text-brand-accent', label: 'Ready' },
  warning:  { color: 'text-amber-400',    label: 'Limited' },
  error:    { color: 'text-rose-400',     label: 'Not available' },
};

function StatusIcon({ status }: { status: DeviceStatus }) {
  if (status === 'checking') return <Loader2 className="w-4 h-4 animate-spin text-text-muted" />;
  if (status === 'ok')       return <CheckCircle2 className="w-4 h-4 text-brand-accent" />;
  return <AlertTriangle className={`w-4 h-4 ${status === 'warning' ? 'text-amber-400' : 'text-rose-400'}`} />;
}

export function DeviceCheckStep({ onDevicesReady }: DeviceCheckStepProps) {
  const [devices, setDevices] = useState<DeviceState>({
    camera: 'checking',
    microphone: 'checking',
  });
  const [checksComplete, setChecksComplete] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function runChecks() {
      try {
        const acquired = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoTrack = acquired.getVideoTracks()[0];
        const audioTrack = acquired.getAudioTracks()[0];

        setDevices({
          camera: videoTrack?.enabled ? 'ok' : 'warning',
          microphone: audioTrack?.enabled ? 'ok' : 'warning',
          cameraLabel: videoTrack?.label || undefined,
          microphoneLabel: audioTrack?.label || undefined,
        });

        setStream(acquired);

        if (previewRef.current) {
          previewRef.current.srcObject = acquired;
        }
      } catch (err) {
        const error = err as DOMException;

        if (error.name === 'NotAllowedError') {
          setDevices({ camera: 'error', microphone: 'error' });
        } else if (error.name === 'NotFoundError') {
          try {
            const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
            setDevices({ camera: 'error', microphone: 'ok' });
            setStream(audioOnly);
          } catch {
            setDevices({ camera: 'error', microphone: 'error' });
          }
        } else {
          setDevices({ camera: 'warning', microphone: 'warning' });
        }
      } finally {
        setChecksComplete(true);
      }
    }

    runChecks();
  }, []);

  const allOk = devices.camera === 'ok' && devices.microphone === 'ok';
  const hasErrors = devices.camera === 'error' || devices.microphone === 'error';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-brand-primary/3 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-in slide-in-from-right-8 duration-500 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black font-black text-sm">
            GW
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-text-primary">
            GetAWay
          </span>
        </div>

        <div className="bg-surface-base border border-border-strong rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-8 pt-8 pb-6 border-b border-border text-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto mb-4">
              {!checksComplete ? (
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              ) : allOk ? (
                <CheckCircle2 className="w-8 h-8 text-brand-accent" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              )}
            </div>
            <h1 className="text-xl font-display font-semibold text-text-primary tracking-tight">
              {!checksComplete ? 'Checking Devices…' : allOk ? 'Devices Ready' : 'Device Check Complete'}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {!checksComplete
                ? 'Please allow camera and microphone access when prompted.'
                : allOk
                ? 'Your camera and microphone are working correctly.'
                : 'Some devices could not be detected. You can still proceed.'}
            </p>
          </div>

          {stream && (
            <div className="mx-8 mt-6 rounded-xl overflow-hidden border border-border aspect-video bg-black">
              <video
                ref={previewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="px-8 py-6 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover border border-border">
              <div className="w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Camera</p>
                {devices.cameraLabel && (
                  <p className="text-xs text-text-muted truncate">{devices.cameraLabel}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium ${STATUS_META[devices.camera].color}`}>
                  {STATUS_META[devices.camera].label}
                </span>
                <StatusIcon status={devices.camera} />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover border border-border">
              <div className="w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4 text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Microphone</p>
                {devices.microphoneLabel && (
                  <p className="text-xs text-text-muted truncate">{devices.microphoneLabel}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium ${STATUS_META[devices.microphone].color}`}>
                  {STATUS_META[devices.microphone].label}
                </span>
                <StatusIcon status={devices.microphone} />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover border border-border">
              <div className="w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4 text-text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Network</p>
                <p className="text-xs text-text-muted">Connection quality affects video.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-text-muted">Info only</span>
              </div>
            </div>
          </div>

          {checksComplete && hasErrors && (
            <div className="mx-8 mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                One or more devices could not be detected. The recruiter may not see or
                hear you clearly. You can still join — device issues are logged automatically.
              </p>
            </div>
          )}

          <div className="px-8 pb-8">
            <button
              id="enter-live-room-btn"
              type="button"
              onClick={() => onDevicesReady(stream)}
              disabled={!checksComplete}
              className="w-full h-10 rounded-lg bg-brand-primary text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors shadow-[0_0_20px_rgba(20,184,166,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {!checksComplete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Enter Live Room
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
