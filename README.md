# Moondream Live Video Demo

A real-time video analysis demo using Moondream's vision AI. Analyze your webcam feed with custom queries and detect gestures/actions in real-time.

## ✨ Features

- 🎥 **Real-time webcam/video analysis** - Stream from your camera or upload a video
- 💬 **Live visual summaries** - Continuous narration with custom prompts
- 🎯 **Gesture detection** - Pre-defined triggers (smiling, thumbs up, peace sign, etc.)
- ⚡ **Custom triggers** - Create your own action detectors
- 🎨 **Modern glassmorphism UI** - Beautiful, responsive design
- 🖥️ **Fullscreen support** - Immersive viewing experience
- 💾 **Persistent storage** - Custom triggers saved in browser

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Moondream API key from [moondream.ai](https://moondream.ai)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/conwayanderson/moondream-live-demo.git
cd moondream-live-demo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up your API key**

Create a `.env.local` file in the root directory:
```bash
echo "MOONDREAM_API_KEY=your_api_key_here" > .env.local
```

Or export it in your shell:
```bash
export MOONDREAM_API_KEY="your_api_key_here"
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

### One-Line Setup (macOS/Linux)
```bash
npm install && MOONDREAM_API_KEY="your_api_key" npm run dev
```

## 🎮 How to Use

### Getting Started

1. Click **"Start Webcam"** to begin (or choose a video file)
2. Grant camera permissions when prompted
3. Watch as the AI analyzes your video in real-time!

### Query 1: Live Visual Summary

- Provides continuous narration of what's happening in the video
- Customizable prompt (default: "summarize what you see in one short sentence")
- Updates every ~2 seconds

### Query 2: Action Detection

- Detects specific gestures or actions using trigger-based detection
- **Pre-defined triggers include:**
  - 😊 Smiling
  - 👍 Thumbs up
  - 👅 Sticking tongue out
  - ✌️ Peace sign
  - 🥤 Drinking water

### Creating Custom Triggers

1. Click the action selector dropdown
2. Select **"+ Create Custom Trigger"**
3. Define your trigger:
   - **Name**: Display name (e.g., "Waving")
   - **Detection query**: Question to ask (e.g., "is anyone waving? yes or no")
   - **Trigger text**: Text to match in response (e.g., "yes")
   - **Notification text**: Message when detected (e.g., "👋 Wave Detected!")
4. Custom triggers are automatically saved in your browser

### Keyboard Shortcuts

- **F** - Toggle fullscreen mode
- **Esc** - Exit fullscreen mode

## 🛠️ Tech Stack

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Shadcn UI](https://ui.shadcn.com/)** - Component library
- **[Moondream API](https://moondream.ai)** - Vision AI

## 📁 Project Structure

```
moondream-live-demo/
├── app/
│   ├── page.tsx              # Main page component
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── live-demo.tsx         # Core demo component
│   └── ui/                   # UI components (Button, Card, Dialog, etc.)
├── lib/
│   └── utils.ts              # Utility functions
├── public/
│   └── md_logo.svg           # Moondream logo
└── package.json
```

## ⚙️ Configuration

### Changing Inference Interval

Edit `INFERENCE_INTERVAL_MS` in `components/live-demo.tsx`:
```typescript
const INFERENCE_INTERVAL_MS = 2000; // milliseconds between inferences
```

### Modifying Pre-defined Triggers

Edit the `PRE_DEFINED_TRIGGERS` array in `components/live-demo.tsx`:
```typescript
const PRE_DEFINED_TRIGGERS: Trigger[] = [
  {
    id: 'your-trigger',
    name: 'Your Trigger Name',
    query: 'your detection query? yes or no',
    triggerText: 'yes',
    notificationText: '🎯 Your Notification!',
  },
  // ... more triggers
];
```

### Customizing Styles

The UI uses Tailwind CSS classes and glassmorphism effects. Modify styling in:
- `app/globals.css` - Global styles
- `components/live-demo.tsx` - Component-specific styles
- `tailwind.config.ts` - Theme configuration

## 🔧 Troubleshooting

### Camera Not Working

- Check browser permissions for camera access
- Ensure no other application is using the camera
- Try refreshing the page
- Use Chrome/Edge for best compatibility

### API Errors

- Verify your API key is correct
- Check that the key has sufficient credits at [moondream.ai](https://moondream.ai)
- Ensure the API key is properly set in `.env.local` or environment variables

### Build Errors

If you encounter build issues:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm cache clean --force
npm install
```

### Performance Issues

- Try reducing the frame resolution in the code
- Increase the `INFERENCE_INTERVAL_MS` value to reduce API calls
- Close other tabs or applications

## 📊 API Usage

The demo sends video frames to the Moondream API approximately every 2 seconds for both queries.

**Estimated API usage:**
- ~30 requests per minute per query
- 2 queries = ~60 requests/min total
- Frame rate can be adjusted by modifying `INFERENCE_INTERVAL_MS`

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/conwayanderson/moondream-live-demo)

1. Click the button above or connect your GitHub repo to Vercel
2. Add your `MOONDREAM_API_KEY` in the Environment Variables section
3. Deploy!

### Environment Variables

Make sure to set these in your deployment platform:
```
MOONDREAM_API_KEY=your_api_key_here
```

## 📜 License

MIT License - feel free to use this code for your own projects!

## 💡 Support

- **API Support**: Visit [moondream.ai](https://moondream.ai)
- **Issues**: Open an issue on [GitHub](https://github.com/conwayanderson/moondream-live-demo/issues)
- **Questions**: Check existing issues or create a new one

## 🙏 Credits

Built with ❤️ using [Moondream Vision AI](https://moondream.ai)

---

**Ready to start?** Follow the [Quick Start](#-quick-start) section above!
