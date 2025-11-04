# Setup Instructions

## Prerequisites

Before you begin, you need:

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org)
   - Verify installation: `node --version`

2. **Moondream API Key**
   - Sign up at [moondream.ai](https://moondream.ai)
   - Navigate to your account settings to generate an API key
   - Keep your API key secure and never commit it to version control

## Installation Steps

### Step 1: Install Dependencies

Choose your preferred package manager:

**Using npm:**
```bash
npm install
```

**Using pnpm (faster):**
```bash
pnpm install
```

**Using yarn:**
```bash
yarn install
```

### Step 2: Configure Your API Key

You have three options to set your API key:

#### Option A: Create a .env.local file (Recommended)

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your API key:
```
MOONDREAM_API_KEY=md_your_actual_api_key_here
```

#### Option B: Export as environment variable

**macOS/Linux:**
```bash
export MOONDREAM_API_KEY="md_your_actual_api_key_here"
```

**Windows (PowerShell):**
```powershell
$env:MOONDREAM_API_KEY="md_your_actual_api_key_here"
```

**Windows (Command Prompt):**
```cmd
set MOONDREAM_API_KEY=md_your_actual_api_key_here
```

#### Option C: Inline with start command

**macOS/Linux:**
```bash
MOONDREAM_API_KEY="md_your_actual_api_key_here" npm run dev
```

**Windows (PowerShell):**
```powershell
$env:MOONDREAM_API_KEY="md_your_actual_api_key_here"; npm run dev
```

### Step 3: Start the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### "API Key Required" Error

If you see this error, your API key is not being read. Try:

1. Verify the API key is in `.env.local`
2. Restart the development server after creating `.env.local`
3. Check that `.env.local` is in the project root directory
4. Ensure no extra spaces or quotes in the `.env.local` file

### Camera Access Issues

1. **Permission denied**: Grant camera permissions in your browser settings
2. **Camera not found**: Ensure your webcam is connected and not being used by another application
3. **HTTPS required**: Some browsers require HTTPS for camera access. Use `localhost` which is typically allowed.

### API Rate Limiting

If you encounter rate limiting:

1. The app automatically retries with exponential backoff
2. Consider reducing inference frequency by modifying `INFERENCE_INTERVAL_MS` in the code
3. Check your API plan limits at moondream.ai

### Build Issues

If installation fails:

1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Update Node.js to the latest LTS version

## Usage Tips

- **Fullscreen Mode**: The demo starts in fullscreen mode by default. Press ESC or click the minimize button to exit.
- **Custom Triggers**: Create custom gesture detection by clicking the action selector and choosing "Create Custom Trigger"
- **Query Input**: Modify the prompt input to change what the AI describes in real-time
- **Performance**: For better performance on slower machines, increase the inference interval in the code

## Next Steps

Once you have the app running:

1. Grant camera permissions when prompted
2. Click "Start Webcam" to begin
3. Try different pre-defined triggers like "Smiling" or "Thumbs Up"
4. Create your own custom triggers for specific gestures or actions
5. Experiment with different query prompts to see various descriptions

## Support

- **Documentation**: [moondream.ai/docs](https://moondream.ai/docs)
- **API Issues**: Contact support through moondream.ai
- **Code Issues**: Check the GitHub repository for issues and updates

## Security Notes

- Never commit your `.env.local` file or API keys to version control
- The `.gitignore` file is already configured to exclude these files
- Rotate your API key if you suspect it has been compromised

