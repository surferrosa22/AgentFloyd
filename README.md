# Floyd AI Agent

Floyd is an intelligent, always-on AI assistant—ready to help, automate, and empower your workflow. Experience the next generation of AI-driven productivity with modern UX and advanced capabilities.

## Features

- **Modern, responsive UI** for both desktop and mobile
- **Chat interface** with AI-powered responses
- **Dark/light theme support** with seamless transitions
- **Command palette** for quick actions
- **Prompt enhancement** capabilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/surferrosa22/AgentFloyd.git
cd AgentFloyd
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## Technology Stack

- [Next.js 15.3.2](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [Tailwind CSS 4](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [OpenAI API](https://openai.com/api/) - AI functionality
- [Radix UI](https://www.radix-ui.com/) - Headless UI components

## Project Structure

```
floyd/
├── .cursor/            # Cursor IDE configuration files
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable React components
│   └── lib/            # Utility functions and helpers
├── public/             # Static assets
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Project dependencies
```

## License

This project is licensed under the MIT License.

## OpenAI Realtime API Integration

This project includes integration with OpenAI's Realtime API for speech-to-speech conversational experiences and real-time transcription.

### Setup

1. Create a `.env.local` file in the project root with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

2. Install dependencies and run the development server:
```bash
npm install
npm run dev
```

3. Navigate to `/realtime` in your browser to access the Realtime API demo.

### Features

- Real-time speech-to-speech conversation
- WebRTC connection for client-side applications
- Voice activity detection (VAD)
- Streaming transcription
