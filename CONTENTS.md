# 📦 Package Contents

## Overview

This package contains everything you need to run the Moondream Live Video Demo locally.

## 📁 Directory Structure

```
moondream-live-demo/
├── 📖 Documentation
│   ├── README.md           # Complete guide and documentation
│   ├── QUICKSTART.md       # 3-minute quick start guide
│   ├── SETUP.md            # Detailed setup instructions
│   ├── CONTENTS.md         # This file
│   └── LICENSE             # MIT License
│
├── ⚙️ Configuration
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   ├── postcss.config.js   # PostCSS configuration
│   ├── next.config.js      # Next.js configuration
│   ├── .eslintrc.json      # ESLint configuration
│   ├── .gitignore          # Git ignore rules
│   └── env.example.txt     # Environment variable template
│
├── 📱 Application Code
│   ├── app/
│   │   ├── page.tsx        # Main application page
│   │   ├── layout.tsx      # Root layout component
│   │   └── globals.css     # Global styles and CSS variables
│   │
│   ├── components/
│   │   ├── live-demo.tsx   # Core demo component with all logic
│   │   └── ui/             # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   │
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   │
│   └── public/
│       └── md_logo.svg     # Moondream logo
│
└── 🔨 Build Output (generated)
    ├── node_modules/       # Dependencies (after npm install)
    ├── .next/              # Next.js build output (after build)
    └── .env.local          # Your local environment file (create this)
```

## 📄 Key Files Explained

### Documentation Files

- **README.md**: Comprehensive documentation covering features, setup, usage, customization, and troubleshooting
- **QUICKSTART.md**: Get up and running in 3 minutes with minimal steps
- **SETUP.md**: Detailed installation and configuration guide with platform-specific instructions
- **CONTENTS.md**: This file - explains the package structure

### Application Files

- **app/page.tsx**: Entry point that checks for API key and renders the demo
- **components/live-demo.tsx**: Main component with:
  - Webcam integration
  - Real-time video analysis
  - Gesture detection system
  - Custom trigger creation
  - Fullscreen support
  - Result history management

### UI Components

All components in `components/ui/` are from Shadcn UI library and include:
- Styled with Tailwind CSS
- Accessible (ARIA compliant)
- Fully typed with TypeScript
- Customizable through className props

### Configuration Files

- **package.json**: Lists all dependencies and npm scripts
- **tsconfig.json**: TypeScript compiler options
- **tailwind.config.ts**: Tailwind theme and plugin configuration
- **next.config.js**: Next.js build and runtime configuration

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🔑 Required Setup

1. **Install dependencies**: `npm install`
2. **Set API key**: Create `.env.local` with your Moondream API key
3. **Run**: `npm run dev`

See QUICKSTART.md or SETUP.md for detailed instructions.

## 🎯 Features Included

- ✅ Real-time webcam video analysis
- ✅ Dual-query system (visual summary + action detection)
- ✅ Pre-defined gesture triggers (smiling, thumbs up, etc.)
- ✅ Custom trigger creation and persistence
- ✅ Fullscreen mode
- ✅ Glassmorphism UI design
- ✅ Mobile responsive layout
- ✅ Rate limiting with exponential backoff
- ✅ Error handling and recovery
- ✅ TypeScript for type safety
- ✅ Modern React patterns (hooks, memoization)

## 📦 Dependencies

### Core Framework
- Next.js 14 (React framework)
- React 18 (UI library)
- TypeScript (Type safety)

### UI & Styling
- Tailwind CSS (Utility-first CSS)
- Shadcn UI (Component library)
- Lucide React (Icons)

### UI Components
- Radix UI (Headless UI primitives)
- Class Variance Authority (Component variants)
- tailwind-merge (Utility merging)

## 🔒 Security Notes

- Never commit `.env.local` to version control
- API keys are server-side only (not exposed to browser)
- Camera access requires user permission
- All API calls are authenticated

## 📊 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with WebRTC support

## 💡 Customization Options

The demo is fully customizable:

- Modify inference intervals
- Change styling and colors
- Add new trigger types
- Adjust video resolution
- Customize UI layout
- Add new features

See README.md for customization examples.

## 📞 Support

- Documentation: See README.md and SETUP.md
- API Issues: Visit moondream.ai for support
- Feature Requests: Modify the code to suit your needs

## 📜 License

MIT License - see LICENSE file for details.

---

**Ready to start?** See QUICKSTART.md for the fastest way to get running!

