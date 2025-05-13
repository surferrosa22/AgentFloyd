# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Floyd is an intelligent, always-on AI assistant with a modern UI, built with Next.js, React, and Tailwind CSS. The application provides a chat interface with AI-powered responses, dark/light theme support, and other advanced capabilities.

## Commands

### Development

```bash
# Start the development server with Turbopack
npm run dev

# Build the application for production
npm run build

# Start the production server
npm run start

# Lint the codebase
npm run lint
```

## Environment Setup

Create a `.env.local` file in the project root with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Architecture

### Core Components

1. **Chat Context System** (`/src/lib/chat-context.tsx`):
   - Manages chat state including messages, chat history, and typing indicators
   - Provides context for chat operations across the application
   - Handles persistence of chats in localStorage

2. **OpenAI Integration** (`/src/lib/openai.ts`):
   - Handles communication with OpenAI's API
   - Implements chat completion and prompt enhancement capabilities
   - Uses GPT-4o model for AI responses

3. **Voice Recognition** (`/src/lib/voice-recognition.ts` and `/src/hooks/use-voice-recognition.ts`):
   - Implements Web Speech API for voice input
   - Provides a custom hook for voice recognition functionality in components

4. **UI Components** (`/src/components/ui/`):
   - Contains reusable UI components like chat input, messages, animated elements
   - Implements theming with dark/light mode support
   - Uses Framer Motion for animations

### Key Pages

1. **Chat Page** (`/src/app/chat/page.tsx`):
   - Main chat interface with sidebar and message display
   - Implements the animated AI chat component

2. **API Routes**:
   - `/src/app/api/chat/route.ts`: Handles chat completion requests
   - `/src/app/api/enhance/route.ts`: Implements prompt enhancement
   - `/src/app/api/speech/route.ts`: Placeholder for speech recognition

## Project Structure

```
floyd/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── chat/         # Chat page
│   │   └── ...
│   ├── components/       # Reusable React components
│   │   ├── blocks/       # High-level UI blocks
│   │   ├── mobile/       # Mobile-specific components
│   │   └── ui/           # UI components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions and core logic
├── public/               # Static assets
└── ...
```

## Key Concepts and Patterns

1. **Component Architecture**:
   - UI components follow Radix UI and Tailwind CSS patterns
   - Emphasizes reusable, composable components
   - Responsive design with specific mobile components

2. **State Management**:
   - Uses React Context API for global state
   - Local state with useState for component-specific state
   - LocalStorage for persistence

3. **Theme System**:
   - Dark/light theme with next-themes
   - Consistent color schemes between modes
   - Animation transitions between themes

4. **Animations**:
   - Framer Motion for component animations
   - CSS animations for subtle UI effects
   - Adaptive animations based on theme

5. **API Integration**:
   - Server components for API calls when possible
   - Client-side fetching with proper error handling
   - Streaming responses for chat messages