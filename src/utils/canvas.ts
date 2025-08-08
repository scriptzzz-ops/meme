import { MemeText } from '../types';

export const drawMemeOnCanvas = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  topText: MemeText,
  bottomText: MemeText
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas dimensions to match preview
  const maxWidth = 500;
  const maxHeight = 500;
  
  let { width, height } = image;
  
  // Scale image to fit canvas while maintaining aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const scale = Math.min(maxWidth / width, maxHeight / height);
    width *= scale;
    height *= scale;
  }
  
  canvas.width = width;
  canvas.height = height;

  // Clear canvas and draw image
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  // Configure text rendering
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw text function
  const drawText = (text: MemeText) => {
    if (!text.content.trim()) return;
    
    const fontSize = Math.max(text.fontSize * (width / 500), 16);
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    
    const x = width / 2;
    const y = (text.y / 100) * height;
    
    // Draw stroke (outline)
    if (text.strokeWidth > 0) {
      ctx.strokeStyle = text.stroke;
      ctx.lineWidth = text.strokeWidth * 2;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(text.content, x, y);
    }
    
    // Draw fill text
    ctx.fillStyle = text.color;
    ctx.fillText(text.content, x, y);
  };

  // Draw both texts
  drawText(topText);
  drawText(bottomText);
};