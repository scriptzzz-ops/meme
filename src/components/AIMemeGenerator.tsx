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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/generate-meme', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ prompt }),
      // });
      
      // const data = await response.json();
      
      // Placeholder for demonstration - replace with actual API response
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock response - replace with actual API data
      const mockResponse = {
        imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
        topText: 'WHEN YOU ASK FOR AI MEMES',
        bottomText: 'BUT GET PLACEHOLDER CATS'
      };
      
      onMemeGenerated(mockResponse.imageUrl, mockResponse.topText, mockResponse.bottomText);
      setPrompt('');
      
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
      {/* Prompt Input */}
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

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Generate Button */}
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

      {/* Suggestions */}
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

      {/* API Status Indicator */}
      <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3 w-3 text-amber-600" />
          <p className="text-xs text-amber-700">
            <strong>API Integration Pending:</strong> Ready for your API configuration
          </p>
        </div>
        <p className="text-xs text-amber-600">
          Currently showing placeholder responses for demonstration
        </p>
      </div>
    </div>
  );
};

export default AIMemeGenerator;