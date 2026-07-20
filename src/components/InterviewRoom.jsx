import React from 'react';
import { JaaSMeeting } from '@jitsi/react-sdk'; // Use JaaSMeeting instead of JitsiMeeting
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function InterviewRoom() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6 bg-zinc-900/60 p-4 sm:px-6 rounded-2xl border border-zinc-800/80 backdrop-blur-md shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Secure Interview Room</h2>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-all border border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit Room
        </button>
      </div>

      <div className="relative w-full h-[75vh] sm:h-[80vh] rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-2xl">
        <div className="absolute inset-0 w-full h-full [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full">
          {/* 
            Update these credentials:
            1. appId: Found in your JaaS dashboard (the string before /vpaas-magic-cookie...)
            2. roomName: Use the dynamic {roomName} from your URL
          */}
          <JaaSMeeting
            appId="vpaas-magic-cookie-ab1b552089ef4b4baea6a3f79102da35"
            roomName={roomName}
            userInfo={{
              displayName: userData.name || 'User'
            }}
            onApiReady={(externalApi) => {
              externalApi.addEventListener('videoConferenceLeft', () => {
                // 1. Get the user role from local storage or context
                const userData = JSON.parse(localStorage.getItem('user'));

                // 2. Explicitly navigate to the dashboard based on role
                if (userData?.role === 'company') {
                  navigate('/company/dashboard');
                } else if (userData?.role === 'admin') {
                  navigate('/admin');
                } else {
                  navigate('/dashboard');
                }
              });
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }}
          />
        </div>
      </div>
    </div>
  );
}