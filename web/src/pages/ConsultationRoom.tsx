import React from 'react';
import { useParams } from 'react-router-dom';
import CallRoom from '../components/call/CallRoom';

export const ConsultationRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Placeholder token for page shell
  const dummyToken = 'mock-livekit-token';

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center z-10">
        <h1 className="text-lg font-bold">Sala de Videoconsulta #{id}</h1>
      </header>
      <div className="flex-1">
        <CallRoom token={dummyToken} />
      </div>
    </div>
  );
};

export default ConsultationRoom;
