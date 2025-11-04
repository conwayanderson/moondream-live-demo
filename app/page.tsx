import LiveDemo from "@/components/live-demo";

export default function Home() {
  const apiKey = process.env.MOONDREAM_API_KEY;
  
  if (!apiKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            API Key Required
          </h1>
          <p className="text-gray-300 mb-6">
            Please set your Moondream API key in the environment variables.
          </p>
          <div className="bg-gray-800 rounded-lg p-6 text-left">
            <p className="text-sm text-gray-400 mb-2">Option 1: Export in terminal</p>
            <code className="block bg-gray-900 text-green-400 p-3 rounded mb-4 text-sm">
              export MOONDREAM_API_KEY="your_api_key_here"
            </code>
            
            <p className="text-sm text-gray-400 mb-2">Option 2: Create .env.local file</p>
            <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm">
              MOONDREAM_API_KEY=your_api_key_here
            </code>
          </div>
          <p className="text-gray-400 mt-6 text-sm">
            Get your API key at{" "}
            <a
              href="https://moondream.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              moondream.ai
            </a>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <LiveDemo
        inferenceUrl="https://api.moondream.ai/v1/query"
        apiKey={apiKey}
        defaultFullscreen={true}
      />
    </main>
  );
}

