import React from 'react';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { MEME_TEMPLATES } from '../constants/memeTemplates';

interface TemplatesPageProps {
  onBackToHome: () => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ onBackToHome }) => {
  const handleTemplateUse = (template: any) => {
    // This would typically navigate back to the generator with the selected template
    onBackToHome();
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
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
            <h1 className="text-3xl font-bold text-gray-900">Meme Templates</h1>
            <p className="text-gray-600">Choose from our collection of popular meme templates</p>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MEME_TEMPLATES.map((template, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square relative group">
                <img
                  src={template.url}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleTemplateUse(template)}
                      className="p-2 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <button
                  onClick={() => handleTemplateUse(template)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{MEME_TEMPLATES.length}</div>
              <div className="text-sm text-gray-600">Templates Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">∞</div>
              <div className="text-sm text-gray-600">AI Generated Options</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">HD</div>
              <div className="text-sm text-gray-600">High Quality Downloads</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;