import React from 'react';
import { ArrowLeft, Sparkles, Zap, Heart, Users, Download, Palette } from 'lucide-react';

interface AboutPageProps {
  onBackToHome: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">About MemeForge</h1>
            <p className="text-gray-600">The ultimate AI-powered meme creation platform</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white mb-8">
          <div className="text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Create Viral Memes in Seconds</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              MemeForge combines the power of AI with intuitive design tools to help you create 
              professional-quality memes that capture attention and spread like wildfire.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Generation</h3>
            </div>
            <p className="text-gray-600">
              Our advanced AI understands context and humor to generate perfect meme images 
              from simple text descriptions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Palette className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Professional Editor</h3>
            </div>
            <p className="text-gray-600">
              Fine-tune every aspect of your meme with our powerful editor. Adjust fonts, 
              colors, positioning, and effects with precision.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">High-Quality Downloads</h3>
            </div>
            <p className="text-gray-600">
              Export your memes in high resolution, perfect for social media, printing, 
              or any platform you choose.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Template Library</h3>
            </div>
            <p className="text-gray-600">
              Access hundreds of popular meme templates, or upload your own images 
              to create something completely unique.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Your Method</h3>
              <p className="text-sm text-gray-600">
                Upload an image, select a template, or describe your idea for AI generation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Customize & Edit</h3>
              <p className="text-sm text-gray-600">
                Add text, adjust styling, and perfect your meme with our intuitive editor
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share & Go Viral</h3>
              <p className="text-sm text-gray-600">
                Download in high quality and share across all your favorite platforms
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose MemeForge?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
              <div className="text-sm font-medium text-gray-900">Unlimited Creations</div>
              <div className="text-xs text-gray-600">No limits on your creativity</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">HD</div>
              <div className="text-sm font-medium text-gray-900">High Quality</div>
              <div className="text-xs text-gray-600">Professional resolution</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
              <div className="text-sm font-medium text-gray-900">Smart Generation</div>
              <div className="text-xs text-gray-600">Powered by advanced AI</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">Free</div>
              <div className="text-sm font-medium text-gray-900">No Cost</div>
              <div className="text-xs text-gray-600">Completely free to use</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-50 rounded-lg p-8">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of creators who are already making viral content with MemeForge. 
            Start creating your first meme today!
          </p>
          <button
            onClick={onBackToHome}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Start Creating Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;