# Moondream Live Video Demo

A real-time video analysis demo using Moondream's vision AI. Analyze your webcam feed with custom queries and detect gestures/actions in real-time.

## Features

- 🎥 Real-time webcam/video analysis
- 💬 Live visual summaries with custom queries
- 🎯 Pre-defined gesture detection (smiling, thumbs up, peace sign, etc.)
- ⚡ Custom trigger creation for any action
- 🎨 Modern glassmorphism UI with fullscreen support
- 📱 Fully responsive design

## Prerequisites

You need a Moondream API key from [moondream.ai](https://moondream.ai)

## Quick Start

### Option 1: Set API key then start server

```bash
export MOONDREAM_API_KEY="your_api_key_here"
npm install
npm run dev
```

### Option 2: Set API key inline with server start

```bash
MOONDREAM_API_KEY="your_api_key_here" npm run dev
```

### Option 3: Using pnpm

```bash
pnpm install
MOONDREAM_API_KEY="your_api_key_here" pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Configure API Key

Create a `.env.local` file in the root directory:

```bash
MOONDREAM_API_KEY=your_api_key_here
```

Or export it in your shell:

```bash
export MOONDREAM_API_KEY="your_api_key_here"
```

### 3. Run the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Query 1: Live Visual Summary
- Provides continuous narration of what's happening in the video
- Customizable prompt (default: "summarize what you see in one short sentence")
- Updates every 2 seconds

### Query 2: Action Detection
- Detects specific gestures or actions using trigger-based detection
- Pre-defined triggers include:
  - 😊 Smiling
  - 👍 Thumbs up
  - 👅 Sticking tongue out
  - ✌️ Peace sign
  - 🥤 Drinking water
- Create custom triggers for any action you want to detect

### Custom Triggers
1. Click the action selector dropdown
2. Select "+ Create Custom Trigger"
3. Define your trigger:
   - **Name**: Display name for the trigger
   - **Detection query**: Question to ask (e.g., "is anyone waving? yes or no")
   - **Trigger text**: Text to match in response (e.g., "yes")
   - **Notification text**: Message when detected (e.g., "👋 Wave Detected!")
4. Custom triggers are saved in your browser's local storage

## Keyboard Shortcuts

- `F` - Toggle fullscreen mode
- `Esc` - Exit fullscreen mode

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Moondream API** - Vision AI

## Project Structure

```
moondream-live-demo/
├── app/
│   ├── page.tsx              # Main page component
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── live-demo.tsx         # Core demo component
│   └── ui/                   # Shadcn UI components
├── lib/
│   └── utils.ts              # Utility functions
├── public/
│   └── md_logo.svg           # Moondream logo
├── package.json
└── README.md
```

## API Usage

The demo sends video frames to the Moondream API approximately every 2 seconds for Query 1 (visual summary) and Query 2 (action detection).

**Estimated API usage:**
- ~30 requests per minute per query (2 queries = ~60 requests/min)
- Frame rate can be adjusted in the code by modifying `INFERENCE_INTERVAL_MS`

## Troubleshooting

### Camera Not Working
- Check browser permissions for camera access
- Try refreshing the page
- Ensure no other application is using the camera

### API Errors
- Verify your API key is correct
- Check that the API key has sufficient credits
- Ensure the key is properly set in your environment

### Performance Issues
- Try reducing the frame resolution in the code
- Increase the `INFERENCE_INTERVAL_MS` value
- Close other tabs or applications

## Customization

### Change Inference Interval
Edit `INFERENCE_INTERVAL_MS` in `components/live-demo.tsx`:
```typescript
const INFERENCE_INTERVAL_MS = 2000; // milliseconds between inferences
```

### Modify Styling
The UI uses Tailwind CSS classes and inline styles with glassmorphism effects. Adjust the styling in the component files.

### Add More Pre-defined Triggers
Edit the `PRE_DEFINED_TRIGGERS` array in `components/live-demo.tsx`.

## License

MIT License - feel free to use this code for your own projects!

## Support

For API support and questions, visit [moondream.ai](https://moondream.ai)

## Credits

Built with ❤️ using Moondream Vision AI

