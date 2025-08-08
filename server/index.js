const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Perchance AI Image Generator Proxy Server is running',
    timestamp: new Date().toISOString()
  });
});

// Main image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  let browser = null;
  
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Prompt is required and must be a non-empty string'
      });
    }

    if (prompt.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Prompt must be less than 500 characters'
      });
    }

    console.log(`🎨 Generating image for prompt: "${prompt}"`);

    // Launch browser with optimized settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      timeout: 30000
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to Perchance AI generator
    console.log('📱 Navigating to Perchance...');
    await page.goto('https://perchance.org/ai-text-to-image-generator', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Find and fill the prompt input
    console.log('✏️ Looking for prompt input...');
    
    const promptSelectors = [
      'textarea[placeholder*="prompt"]',
      'textarea[placeholder*="Prompt"]',
      'input[placeholder*="prompt"]',
      'input[placeholder*="Prompt"]',
      'textarea',
      'input[type="text"]'
    ];

    let promptInput = null;
    for (const selector of promptSelectors) {
      try {
        promptInput = await page.$(selector);
        if (promptInput) {
          console.log(`✅ Found prompt input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!promptInput) {
      // Try to find by text content or aria-label
      promptInput = await page.$('textarea, input[type="text"]');
    }

    if (!promptInput) {
      throw new Error('Could not find prompt input field on the page');
    }

    // Clear and enter the prompt
    await promptInput.click({ clickCount: 3 });
    await promptInput.type(prompt.trim());
    console.log('✅ Prompt entered successfully');

    // Find and click the generate button
    console.log('🔍 Looking for generate button...');
    
    const generateSelectors = [
      'button[onclick*="generate"]',
      'button:contains("Generate")',
      'input[value*="Generate"]',
      'button[class*="generate"]',
      '[onclick*="generate"]'
    ];

    let generateButton = null;
    
    // Try CSS selectors first
    for (const selector of generateSelectors) {
      try {
        generateButton = await page.$(selector);
        if (generateButton) {
          console.log(`✅ Found generate button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // If not found, try XPath for text content
    if (!generateButton) {
      try {
        const buttons = await page.$x("//button[contains(text(), 'Generate') or contains(text(), 'generate')]");
        if (buttons.length > 0) {
          generateButton = buttons[0];
          console.log('✅ Found generate button via XPath');
        }
      } catch (e) {
        console.log('XPath search failed:', e.message);
      }
    }

    // Last resort: find any button that might be the generate button
    if (!generateButton) {
      const allButtons = await page.$$('button, input[type="submit"], input[type="button"]');
      for (const button of allButtons) {
        try {
          const text = await page.evaluate(el => el.textContent || el.value || '', button);
          if (text.toLowerCase().includes('generate') || text.toLowerCase().includes('create')) {
            generateButton = button;
            console.log(`✅ Found generate button with text: "${text}"`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!generateButton) {
      throw new Error('Could not find generate button on the page');
    }

    // Click the generate button
    await generateButton.click();
    console.log('🚀 Generate button clicked, waiting for image...');

    // Wait for image generation with polling
    const maxAttempts = 60; // 2 minutes with 2-second intervals
    let attempts = 0;
    let imageUrl = null;

    while (attempts < maxAttempts && !imageUrl) {
      attempts++;
      await page.waitForTimeout(2000);

      try {
        // Look for generated images
        const images = await page.$$('img');
        
        for (const img of images) {
          try {
            const src = await page.evaluate(el => el.src, img);
            const naturalWidth = await page.evaluate(el => el.naturalWidth, img);
            const naturalHeight = await page.evaluate(el => el.naturalHeight, img);
            
            // Check if this looks like a generated image
            if (src && 
                !src.includes('logo') && 
                !src.includes('icon') && 
                !src.includes('button') &&
                naturalWidth > 200 && 
                naturalHeight > 200 &&
                (src.includes('perchance') || src.includes('generated') || src.startsWith('data:') || src.includes('blob:'))) {
              
              // If it's a data URL or blob, we need to convert it
              if (src.startsWith('data:') || src.startsWith('blob:')) {
                // For data URLs, return as is
                if (src.startsWith('data:')) {
                  imageUrl = src;
                  break;
                }
                // For blob URLs, we need to fetch the actual data
                try {
                  const response = await page.evaluate(async (url) => {
                    const res = await fetch(url);
                    const blob = await res.blob();
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result);
                      reader.readAsDataURL(blob);
                    });
                  }, src);
                  imageUrl = response;
                  break;
                } catch (e) {
                  console.log('Failed to convert blob URL:', e.message);
                }
              } else {
                imageUrl = src;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }

        if (imageUrl) {
          console.log(`🎉 Image generated successfully after ${attempts} attempts`);
          break;
        }

        // Check for error messages
        const errorElements = await page.$$('[class*="error"], [class*="Error"], .alert-danger');
        for (const errorEl of errorElements) {
          try {
            const errorText = await page.evaluate(el => el.textContent, errorEl);
            if (errorText && errorText.trim()) {
              throw new Error(`Generation failed: ${errorText.trim()}`);
            }
          } catch (e) {
            continue;
          }
        }

        console.log(`⏳ Attempt ${attempts}/${maxAttempts}: Still waiting for image...`);
        
      } catch (error) {
        console.error(`Error in attempt ${attempts}:`, error.message);
      }
    }

    if (!imageUrl) {
      throw new Error('Image generation timed out. The service may be busy or unavailable.');
    }

    // Return success response
    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt.trim(),
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    
    // Return appropriate error response
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return res.status(408).json({
        success: false,
        error: 'Timeout',
        message: 'Image generation timed out. Please try again with a simpler prompt.'
      });
    }
    
    if (error.message.includes('navigation') || error.message.includes('net::')) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to reach Perchance.org. Please try again later.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Generation Failed',
      message: error.message || 'An unexpected error occurred during image generation.'
    });
    
  } finally {
    // Always close the browser
    if (browser) {
      try {
        await browser.close();
        console.log('🔒 Browser closed successfully');
      } catch (e) {
        console.error('Error closing browser:', e.message);
      }
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Perchance AI Image Generator Proxy Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Generate endpoint: http://localhost:${PORT}/api/generate-image`);
  console.log(`🌐 CORS enabled for: http://localhost:5173, http://localhost:3000`);
});

module.exports = app;