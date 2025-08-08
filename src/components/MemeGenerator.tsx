import React, { useState, useRef, useCallback } from 'react';
import { Download, RotateCcw, Palette, Type, Image as ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';
import TextControls from './TextControls';
import { drawMemeOnCanvas } from '../utils/canvas';
import { MemeText } from '../types';

const MemeGenerator: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [topText, setTopText] = useState<MemeText>({
    content: 'TOP TEXT',
    fontSize: 48,
    color: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 3,
    y: 50
  });
  const [bottomText, setBottomText] = useState<MemeText>({
    content: 'BOTTOM TEXT',
    fontSize: 48,
    color: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 3,
    y: 90
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const handleAIMemeGenerated = (imageUrl: string, topTextContent: string, bottomTextContent: string) => {
    setTopText(prev => ({ ...prev, content: topTextContent }));
    setBottomText(prev => ({ ...prev, content: bottomTextContent }));
  };

  const updatePreview = useCallback(() => {
    if (!selectedImage || !previewRef.current) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        drawMemeOnCanvas(previewRef.current!, img, topText, bottomText);
      } catch (error) {
        console.error('Error drawing meme on canvas:', error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', error);
    };
    
    img.src = selectedImage;
  }, [selectedImage, topText, bottomText]);

  React.useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const downloadMeme = () => {
    if (!selectedImage || !canvasRef.current) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Use high resolution for download
        const canvas = canvasRef.current!;
        canvas.width = Math.min(img.width, 1920); // Max width 1920px
        canvas.height = Math.min(img.height, 1920); // Max height 1920px
        
        // Scale font sizes for high resolution
        const scale = Math.min(canvas.width / 500, canvas.height / 500);
        const downloadTopText = { ...topText, fontSize: Math.max(topText.fontSize * scale, 24) };
        const downloadBottomText = { ...bottomText, fontSize: Math.max(bottomText.fontSize * scale, 24) };
        
        drawMemeOnCanvas(canvas, img, downloadTopText, downloadBottomText);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `meme-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 0.95);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading meme:', error);
        alert('Error downloading meme. Please try again.');
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image for download:', error);
      alert('Error loading image for download. Please try again.');
    };
    
    img.src = selectedImage;
  };

  const resetMeme = () => {
    setTopText(prev => ({ ...prev, content: 'TOP TEXT' }));
    setBottomText(prev => ({ ...prev, content: 'BOTTOM TEXT' }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {/* Controls Panel */}
      <div className="lg:col-span-1 space-y-4">
        {/* Image Selection */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-800">Choose Image</h3>
          </div>
          <ImageUpload 
            onImageSelect={setSelectedImage} 
            onAIMemeGenerated={handleAIMemeGenerated}
          />
        </div>

        {/* Text Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Type className="h-5 w-5 text-purple-600" />
            <h3 className="text-base font-semibold text-gray-800">Text Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Top Text
              </h4>
              <TextControls 
                text={topText} 
                onChange={setTopText} 
                placeholder="Enter top text..."
              />
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Bottom Text
              </h4>
              <TextControls 
                text={bottomText} 
                onChange={setBottomText} 
                placeholder="Enter bottom text..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-5 w-5 text-green-600" />
            <h3 className="text-base font-semibold text-gray-800">Actions</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={resetMeme}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            
            <button
              onClick={downloadMeme}
              disabled={!selectedImage}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-md text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Preview</h3>
          
          <div className="flex justify-center">
            {selectedImage ? (
              <div className="relative">
                <canvas
                  ref={previewRef}
                  className="max-w-full max-h-80 rounded-lg shadow-sm border border-gray-200"
                  width={500}
                  height={500}
                />
              </div>
            ) : (
              <div className="w-full max-w-sm h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Select an image to start</p>
                  <p className="text-xs text-gray-400 mt-1">Upload, template, or AI generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for high-res download */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MemeGenerator;