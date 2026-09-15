import React, { useState } from 'react';
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
  serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://vetconnect-dev.livekit.cloud',
  onDisconnected,
}) => {
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);

  const handleJoin = (audio: boolean, video: boolean) => {
    setAudioEnabled(audio);
    setVideoEnabled(video);
    setHasJoined(true);
  };

  if (!hasJoined) {
    return <PreJoinModal onJoin={handleJoin} onCancel={onDisconnected} />;
  }

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col">
      <LiveKitRoom
        video={videoEnabled}
        audio={audioEnabled}
        token={token}
        serverUrl={serverUrl}
        connect={true}
        onDisconnected={onDisconnected}
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
