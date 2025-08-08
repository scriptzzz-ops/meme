import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface AIMemeGeneratorProps {
  onMemeGenerated: (imageUrl: string, topText: string, bottomText: string) => void;
}

const AIMemeGenerator: React.FC<AIMemeGeneratorProps> = ({ onMemeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isServerRunning, setIsServerRunning] = useState(false);

  // Check if server is running on component mount
  React.useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        setIsServerRunning(true);
        setError('');
      }
    } catch (err) {
      setIsServerRunning(false);
      setError('Backend server is not running. Please start the server first.');
    }
  };

  const generateAIMeme = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for your meme');
      return;
    }

    if (!isServerRunning) {
      setError('Backend server is not running. Please start the server first.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        onMemeGenerated(data.imageUrl, 'AI Generated', 'Meme');
        setPrompt('');
        setError('');
      } else {
        throw new Error(data.message || 'Image generation failed');
      }

    } catch (err) {
      console.error('AI meme generation error:', err);
      
      if (err.message.includes('fetch')) {
        setError('Cannot connect to server. Make sure the backend is running on port 3001.');
        setIsServerRunning(false);
      } else {
        setError(err.message || 'Failed to generate meme. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      generateAIMeme();
    }
  };

  const suggestions = [
    "A cat realizing it's Monday morning",
    "When you finally understand a programming concept",
    "Trying to explain memes to your parents",
    "The feeling when your code works on first try",
    "When someone says they don't like pizza"
  ];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Describe your meme idea
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., A surprised cat when it sees a cucumber..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            rows={2}
            disabled={isGenerating}
          />
          <div className="absolute bottom-1 right-2 text-xs text-gray-400">
            {prompt.length}/200
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-600 font-medium">{error}</p>
              {!isServerRunning && (
                <div className="mt-2">
                  <p className="text-xs text-red-500">To start the server:</p>
                  <code className="text-xs bg-red-100 px-1 py-0.5 rounded mt-1 block">
                    cd server && npm start
                  </code>
                  <button
                    onClick={checkServerHealth}
                    className="text-xs text-red-600 underline mt-1 hover:text-red-800"
                  >
                    Check again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={generateAIMeme}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed ${
          isServerRunning 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate AI Meme
          </>
        )}
      </button>

      <div>
        <p className="text-xs font-medium text-gray-700 mb-1">Need inspiration?</p>
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setPrompt(suggestion)}
              disabled={isGenerating}
              className="w-full text-left px-2 py-1.5 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      </div>

      <div className={`p-2 border rounded-md ${
        isServerRunning 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-3 w-3 ${
            isServerRunning ? 'text-green-600' : 'text-yellow-600'
          }`} />
          <p className={`text-xs ${
            isServerRunning ? 'text-green-700' : 'text-yellow-700'
          }`}>
            <strong>Server Status:</strong> {isServerRunning ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIMemeGenerator;
