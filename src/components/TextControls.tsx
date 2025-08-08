import React from 'react';
import { Type, Palette } from 'lucide-react';
import { MemeText } from '../types';

interface TextControlsProps {
  text: MemeText;
  onChange: (text: MemeText) => void;
  placeholder: string;
}

const TextControls: React.FC<TextControlsProps> = ({ text, onChange, placeholder }) => {
  const updateText = (updates: Partial<MemeText>) => {
    onChange({ ...text, ...updates });
  };

  return (
    <div className="space-y-3">
      {/* Text Input */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Text Content
        </label>
        <input
          type="text"
          value={text.content}
          onChange={(e) => updateText({ content: e.target.value })}
          placeholder={placeholder}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Font Size: {text.fontSize}px
        </label>
        <input
          type="range"
          min="20"
          max="80"
          value={text.fontSize}
          onChange={(e) => updateText({ fontSize: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={text.color}
              onChange={(e) => updateText({ color: e.target.value })}
              className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={text.color}
              onChange={(e) => updateText({ color: e.target.value })}
              className="flex-1 px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Outline Color
          </label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={text.stroke}
              onChange={(e) => updateText({ stroke: e.target.value })}
              className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={text.stroke}
              onChange={(e) => updateText({ stroke: e.target.value })}
              className="flex-1 px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Outline Width: {text.strokeWidth}px
        </label>
        <input
          type="range"
          min="0"
          max="8"
          value={text.strokeWidth}
          onChange={(e) => updateText({ strokeWidth: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Position */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Vertical Position: {text.y}%
        </label>
        <input
          type="range"
          min="5"
          max="95"
          value={text.y}
          onChange={(e) => updateText({ y: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
};

export default TextControls;