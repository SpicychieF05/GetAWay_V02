import { useEffect, useRef, useState, useCallback } from 'react';
import { webrtcService } from '@/services/firebase.client';
import { WebRTCNode, ICECandidate } from '@/types';

interface UseWebRTCProps {
  roomId: string;
  role: 'recruiter' | 'candidate';
  localStream: MediaStream | null;
}

export function useWebRTC({ roomId, role, localStream }: UseWebRTCProps) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const isCaller = role === 'recruiter';
  const localCandidatesCollection = isCaller ? 'callerCandidates' : 'calleeCandidates';
  const remoteCandidatesCollection = isCaller ? 'calleeCandidates' : 'callerCandidates';

  const setupWebRTC = useCallback(async () => {
    const servers = {
      iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
      ],
      iceCandidatePoolSize: 10,
    };

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    // Local stream tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    // Remote stream tracks
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);

    // ICE Candidates collecting
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        webrtcService.addCandidate(roomId, localCandidatesCollection, {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid!,
          sdpMLineIndex: event.candidate.sdpMLineIndex!,
        });
      }
    };

    if (isCaller) {
      // Caller (Recruiter) Creates Offer
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer: WebRTCNode = { type: offerDescription.type as 'offer', sdp: offerDescription.sdp! };
      await webrtcService.setSignalingNode(roomId, 'offer', offer);

      // Listen for Answer
      webrtcService.subscribeToSignalingNode(roomId, 'answer', async (answer) => {
        if (!pc.currentRemoteDescription && answer) {
          const answerDescription = new RTCSessionDescription(answer);
          await pc.setRemoteDescription(answerDescription);
        }
      });
    } else {
      // Callee (Candidate) Listens for Offer
      webrtcService.subscribeToSignalingNode(roomId, 'offer', async (offer) => {
        if (!pc.currentRemoteDescription && offer) {
          const offerDescription = new RTCSessionDescription(offer);
          await pc.setRemoteDescription(offerDescription);

          const answerDescription = await pc.createAnswer();
          await pc.setLocalDescription(answerDescription);

          const answer: WebRTCNode = { type: answerDescription.type as 'answer', sdp: answerDescription.sdp! };
          await webrtcService.setSignalingNode(roomId, 'answer', answer);
        }
      });
    }

    // Listen for Remote ICE Candidates
    webrtcService.subscribeToCandidates(roomId, remoteCandidatesCollection, (data) => {
      const candidate = new RTCIceCandidate(data);
      pc.addIceCandidate(candidate);
    });
  }, [roomId, isCaller, localStream, localCandidatesCollection, remoteCandidatesCollection]);

  useEffect(() => {
    setupWebRTC();
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [setupWebRTC]);

  return { remoteStream, connectionState, pcRef };
}
