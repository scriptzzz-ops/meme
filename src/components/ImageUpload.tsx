import React, { useState } from 'react';
import { Upload, Grid3X3, Sparkles } from 'lucide-react';
import { MEME_TEMPLATES } from '../constants/memeTemplates';
import AIMemeGenerator from './AIMemeGenerator';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onAIMemeGenerated?: (imageUrl: string, topText: string, bottomText: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, onAIMemeGenerated }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'templates' | 'ai'>('upload');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelect(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (templateUrl: string) => {
    onImageSelect(templateUrl);
  };

  const handleAIMemeGenerated = (imageUrl: string, topText: string, bottomText: string) => {
    onImageSelect(imageUrl);
    onAIMemeGenerated?.(imageUrl, topText, bottomText);
  };

  return (
    <div className="space-y-3">
      {/* Tab Buttons */}
      <div className="grid grid-cols-3 bg-gray-100 rounded-md p-0.5">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Grid3X3 className="h-3 w-3" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'ai'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          AI Generate
        </button>
      </div>

      {/* Content */}
      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-500 mx-auto mb-1" />
            <p className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">
              Click to upload image
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </button>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {MEME_TEMPLATES.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateSelect(template.url)}
              className="relative group overflow-hidden rounded-md border border-gray-200 hover:border-blue-400 transition-colors"
            >
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-16 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-1.5 py-0.5 rounded">
                  {template.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'ai' && (
        <AIMemeGenerator onMemeGenerated={handleAIMemeGenerated} />
      )}
    </div>
  );
};

export default ImageUpload;
