'use client';

import React from 'react';
import { StarsBackground } from '@/components/ui/stars-background';
import { 
  MessageSquare, 
  PlusCircle, 
  Command, 
  Sparkles, 
  Paperclip, 
  Settings, 
  HelpCircle,
  Edit2
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="relative flex-1 w-full">
        <StarsBackground 
          className="z-0 absolute inset-0" 
          starDensity={0.0005} 
          allStarsTwinkle={true} 
          minTwinkleSpeed={0.5} 
          maxTwinkleSpeed={1} 
          twinkleProbability={1} 
        />
        
        <div className="relative z-10 container mx-auto py-12 px-4 max-w-3xl">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-400 mb-8">
            Help & Frequently Asked Questions
          </h1>
          
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                Getting Started
              </h2>
              <div className="bg-white/[0.03] rounded-lg p-5 border border-white/10">
                <p className="text-white/80 mb-4">
                  Floyd is an AI assistant that can help with a variety of tasks. Here's how to get started:
                </p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Click on the <PlusCircle className="h-4 w-4 inline mx-1" /> button to start a new chat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Type your message in the input field at the bottom of the screen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Press Enter or click the Send button to send your message</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Your conversation history will be saved automatically</span>
                  </li>
                </ul>
              </div>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <Command className="h-5 w-5 text-indigo-400" />
                Commands & Special Features
              </h2>
              <div className="bg-white/[0.03] rounded-lg p-5 border border-white/10">
                <p className="text-white/80 mb-4">
                  Floyd supports special commands to help with specific tasks:
                </p>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1 font-mono">/clone</span>
                    <span>Generate UI from a screenshot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1 font-mono">/figma</span>
                    <span>Import designs from Figma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1 font-mono">/page</span>
                    <span>Generate a new web page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1 font-mono">/improve</span>
                    <span>Improve existing UI design</span>
                  </li>
                </ul>
                <p className="mt-4 text-white/60 text-sm">
                  Start typing / in the chat to see available commands. You can also click the <Command className="h-3.5 w-3.5 inline mx-1" /> button to show commands.
                </p>
              </div>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Enhance Button
              </h2>
              <div className="bg-white/[0.03] rounded-lg p-5 border border-white/10">
                <p className="text-white/80">
                  The <span className="bg-white/[0.08] text-white/90 px-2 py-1 rounded-md text-sm">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Enhance
                  </span> button improves your prompts for better results. Click it before sending your message to:
                </p>
                <ul className="mt-3 space-y-2 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Make your questions more specific</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Add relevant context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Get better, more detailed responses</span>
                  </li>
                </ul>
              </div>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-indigo-400" />
                Managing Chats
              </h2>
              <div className="bg-white/[0.03] rounded-lg p-5 border border-white/10">
                <p className="text-white/80 mb-4">
                  You can manage multiple conversations:
                </p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Create a new chat with the <PlusCircle className="h-4 w-4 inline mx-1" /> button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Click on a chat in the sidebar to switch between conversations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Rename a chat using the edit icon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Delete a chat using the trash icon</span>
                  </li>
                </ul>
                <p className="mt-4 text-white/60 text-sm">
                  On mobile, tap the menu button in the sidebar to access your chats.
                </p>
              </div>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Settings
              </h2>
              <div className="bg-white/[0.03] rounded-lg p-5 border border-white/10">
                <p className="text-white/80">
                  Visit the <Settings className="h-4 w-4 inline mx-1" /> Settings page to:
                </p>
                <ul className="mt-3 space-y-2 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Switch between light and dark themes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Configure your AI preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Manage your API keys</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 