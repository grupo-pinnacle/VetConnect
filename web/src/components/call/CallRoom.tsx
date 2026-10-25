import React, { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { PreJoinModal } from './PreJoinModal';

interface CallRoomProps {
  token: string;
  serverUrl?: string;
  onDisconnected?: () => void;
}

export const CallRoom: React.FC<CallRoomProps> = ({
  token,
  serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://vetconnect-mrsu677e.livekit.cloud',
  onDisconnected,
}) => {
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);

  // Emit page:ready handshake for mobile WebView wrapper
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'page:ready' }));
    }
  }, []);

  // Screen WakeLock while in call
  useEffect(() => {
    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      try {
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock?.request) {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Silently swallow per specification
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
        wakeLockSentinel = null;
      }
    };
  }, []);

  const handleJoin = (audio: boolean, video: boolean) => {
    setAudioEnabled(audio);
    setVideoEnabled(video);
    setHasJoined(true);
  };

  const handleDisconnected = () => {
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'call:ended' }));
    }
    onDisconnected?.();
  };

  if (!hasJoined) {
    return <PreJoinModal onJoin={handleJoin} onCancel={handleDisconnected} />;
  }

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-slate-900">
      <LiveKitRoom
        video={videoEnabled}
        audio={audioEnabled}
        token={token}
        serverUrl={serverUrl}
        connect={true}
        onDisconnected={handleDisconnected}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        {/* Antipattern 3 Guardrail: Exclusively VideoConference. Do NOT add RoomAudioRenderer */}
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default CallRoom;
