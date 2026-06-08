"use client";

import { useEffect, useState } from 'react';
import { roomRepository } from '@/repositories/room.repository';
import { Room } from '@/types';
import { createRoom } from '@/app/actions/room.actions';
import { Video, Plus, Copy, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';

export default function SessionsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const recruiterId = getFirebaseAuth().currentUser?.uid;

  useEffect(() => {
    async function loadRooms() {
      if (!recruiterId) return;
      const data = await roomRepository.getRecruiterRooms(recruiterId);
      setRooms(data);
      setLoading(false);
    }
    loadRooms();
  }, [recruiterId]);

  const handleCreateRoom = async () => {
    if (!recruiterId) return;
    setCreating(true);
    try {
      await createRoom(recruiterId);
      const data = await roomRepository.getRecruiterRooms(recruiterId);
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  const copyLink = (roomId: string, token: string) => {
    const url = `${window.location.origin}/candidate/onboard/${roomId}?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(roomId);
    setTimeout(() => setCopiedLink(null), 2000);
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium text-text-primary tracking-tight">Interview Sessions</h1>
          <p className="text-text-secondary mt-1">Manage and create secure interview rooms.</p>
        </div>
        <button
          onClick={handleCreateRoom}
          disabled={creating}
          className="flex items-center space-x-2 px-4 py-2 rounded-md bg-brand-primary text-black font-bold hover:bg-brand-hover transition-colors disabled:opacity-50 text-sm"
        >
          {creating ? <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" /> : <Plus className="w-4 h-4 text-black" />}
          <span>Create Room</span>
        </button>
      </div>

      <div className="bg-surface-base border border-border rounded-2xl flex flex-col overflow-hidden min-h-0 flex-1">
        {loading ? (
          <div className="p-12 text-center text-text-secondary">Loading your sessions...</div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
                <Video className="w-5 h-5 text-text-secondary" />
             </div>
             <h3 className="font-medium text-text-primary mb-1">No Active Sessions</h3>
             <p className="text-sm text-text-secondary mb-6">Create a room to start a new interview.</p>
             <button onClick={handleCreateRoom} disabled={creating} className="px-4 py-2 bg-brand-primary text-black font-bold rounded-md text-sm hover:bg-brand-hover transition-colors">
               Create First Room
             </button>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-auto">
            {rooms.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(room => (
              <div key={room.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                 <div>
                   <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-mono text-sm font-medium text-text-primary">{room.id}</h3>
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-medium uppercase tracking-widest ${
                        room.status === 'active' ? 'bg-brand-primary/10 text-brand-accent border border-brand-primary/20' : 
                        room.status === 'waiting' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                        'bg-surface-hover text-text-secondary border border-border'
                      }`}>
                         {room.status}
                      </span>
                   </div>
                   <p className="text-[11px] text-text-secondary font-mono tracking-wide">Created {new Date(room.createdAt).toLocaleString()}</p>
                 </div>
                 
                 <div className="flex items-center space-x-3">
                   <button 
                     onClick={() => copyLink(room.id, room.candidateToken)}
                     className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-base border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors font-medium"
                   >
                     {copiedLink === room.id ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <Copy className="w-3.5 h-3.5" />}
                     <span>{copiedLink === room.id ? 'Copied' : 'Copy Link'}</span>
                   </button>
                   
                   <Link 
                     href={`/recruiter/rooms/${room.id}`}
                     className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-brand-primary text-black font-bold hover:bg-brand-hover transition-colors text-xs"
                   >
                     <span>Enter Room</span>
                     <ChevronRight className="w-3.5 h-3.5" />
                   </Link>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
