"use client";

import { useState } from "react";
import { useRealtimeApiRTC } from "@/hooks/useRealtimeApiFixedRTC";

// Minimal page that lets us verify that the Realtime Audio/WebRTC flow
// works end-to-end without the complexity of the full chat UI.
export default function RealtimeTestPage() {
  type RealtimeLogEvent = unknown; // Replace with a stricter type if desired.
  const [events, setEvents] = useState<RealtimeLogEvent[]>([]);
  const [text, setText] = useState("");

  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    toggleListening,
    sendMessage,
  } = useRealtimeApiRTC({
    onMessage: (evt) => {
      // Keep only the last 100 events for readability.
      setEvents((prev) => [...prev.slice(-99), evt]);
    },
    onError: (err) => console.error(err),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText("");
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">OpenAI Realtime API – Test Page</h1>

      {/* Connection controls */}
      <div className="space-x-2">
        <button
          type="button"
          onClick={() => (isConnected ? disconnect() : connect())}
          disabled={isConnecting}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        >
          {isConnecting ? "Connecting…" : isConnected ? "Disconnect" : "Connect"}
        </button>
        {isConnected && (
          <button
            type="button"
            onClick={toggleListening}
            className="px-4 py-2 rounded-md bg-green-600 text-white"
          >
            Toggle Listening
          </button>
        )}
      </div>

      {/* Text input */}
      {isConnected && (
        <form onSubmit={handleSend} className="space-x-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message and press Enter"
            className="border rounded-md p-2 w-80"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-purple-600 text-white"
          >
            Send
          </button>
        </form>
      )}

      {/* Error display */}
      {error && (
        <div className="text-red-600 break-words whitespace-pre-wrap">
          {error.message}
        </div>
      )}

      {/* Events log */}
      <div className="border h-96 overflow-y-auto text-xs p-2 bg-gray-50 rounded-md">
        {events.map((evt) => {
          const key = typeof evt === 'object' && evt && 'event_id' in (evt as Record<string, unknown>)
            ? (evt as Record<string, unknown>).event_id as string
            : `${Date.now()}-${Math.random()}`;
          return (
            <pre key={key} className="whitespace-pre-wrap break-all">
              {JSON.stringify(evt, null, 2)}
            </pre>
          );
        })}
      </div>
    </div>
  );
} 