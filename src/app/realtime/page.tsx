'use client';

import { useState } from 'react';
import { RealtimeChat } from '@/components/RealtimeChat';
import { RealtimeChatWS } from '@/components/RealtimeChatWS';
import { RealtimeChatFixed } from '@/components/RealtimeChatFixed';

export default function RealtimePage() {
  const [implementation, setImplementation] = useState<'webrtc' | 'websocket' | 'fixed-rtc'>('fixed-rtc');
  
  return (
    <div className="container mx-auto py-8 h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">OpenAI Realtime API Demo</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          This demo showcases the OpenAI Realtime API functionality for speech-to-speech interactions.
        </p>
        
        <div className="flex flex-wrap mt-4 gap-4">
          <button
            type="button"
            onClick={() => setImplementation('webrtc')}
            className={`px-4 py-2 rounded-md ${
              implementation === 'webrtc' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            Original WebRTC
          </button>
          
          <button
            type="button"
            onClick={() => setImplementation('websocket')}
            className={`px-4 py-2 rounded-md ${
              implementation === 'websocket' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            WebSocket Implementation
          </button>
          
          <button
            type="button"
            onClick={() => setImplementation('fixed-rtc')}
            className={`px-4 py-2 rounded-md ${
              implementation === 'fixed-rtc' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            Fixed WebRTC (Recommended)
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        {implementation === 'webrtc' ? (
          <RealtimeChat />
        ) : implementation === 'websocket' ? (
          <RealtimeChatWS />
        ) : (
          <RealtimeChatFixed />
        )}
      </div>
    </div>
  );
} 