import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface AIMemeGeneratorProps {
  onMemeGenerated: (imageUrl: string, topText: string, bottomText: string) => void;
}

const AIMemeGenerator: React.FC<AIMemeGeneratorProps> = ({ onMemeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateAIMeme = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for your meme');
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

      const data = await response.json();

      if (data.success) {
        onMemeGenerated(data.imageUrl, 'AI Generated', 'Meme');
        setPrompt('');
      } else {
        throw new Error(data.error || 'Image generation failed');
      }

    } catch (err) {
      setError('Failed to generate meme. Please try again.');
      console.error('AI meme generation error:', err);
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
        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={generateAIMeme}
        disabled={isGenerating || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-md text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed"
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

      <div className="p-2 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3 w-3 text-green-600" />
          <p className="text-xs text-green-700">
            <strong>API Connected:</strong> Using backend proxy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIMemeGenerator;
