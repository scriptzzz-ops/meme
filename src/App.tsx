import React, { useState } from 'react';
import { Zap, Sparkles, TrendingUp } from 'lucide-react';
import MemeGenerator from './components/MemeGenerator';
import Footer from './components/Footer';
import TemplatesPage from './pages/TemplatesPage';
import AboutPage from './pages/AboutPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'templates':
        return <TemplatesPage onBackToHome={() => setCurrentPage('home')} />;
      case 'about':
        return <AboutPage onBackToHome={() => setCurrentPage('home')} />;
      default:
        return (
          <>
            {/* Hero Section */}
            <section className="py-12 px-4">
              <div className="container mx-auto text-center max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    Create Viral Memes in
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Seconds</span>
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Upload your images, choose from trending templates, or let AI generate the perfect meme for you. 
                    Share your creativity with the world!
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">AI-Powered Generation</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Instant Download</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200/50">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Professional Quality</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Meme Generator */}
            <main className="pb-12 px-4">
              <div className="container mx-auto">
                <MemeGenerator />
              </div>
            </main>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo Space - Replace this div with your logo */}
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-xs text-gray-500 font-medium">LOGO</span>
              </div>
              <div>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="text-left"
                >
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    MemeForge
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">AI-Powered Meme Generator</p>
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Trending Now</span>
              </div>
              <nav className="flex items-center gap-6 text-sm font-medium">
                <button 
                  onClick={() => setCurrentPage('home')}
                  className={`transition-colors ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setCurrentPage('templates')}
                  className={`transition-colors ${currentPage === 'templates' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  Templates
                </button>
                <button 
                  onClick={() => setCurrentPage('about')}
                  className={`transition-colors ${currentPage === 'about' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  About
                </button>
              </nav>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="p-2 text-gray-600 hover:text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {renderPage()}

      <Footer />
    </div>
  );
}

export default App;