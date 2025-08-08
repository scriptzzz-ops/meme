import React from 'react';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Brand */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Made with <Heart className="h-4 w-4 text-red-500 inline mx-1" /> by MemeForge
            </span>
          </div>
          
          {/* Center - Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Support
            </a>
          </div>
          
          {/* Right side - Social */}
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a 
              href="#" 
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a 
              href="#" 
              className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        
        {/* Bottom copyright */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            © 2025 MemeForge. All rights reserved. Create, Share, Go Viral! 🚀
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;