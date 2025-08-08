const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Perchance AI Image Proxy Server is running' });
});

// Main image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Prompt is required and must be a non-empty string'
      });
    }

    if (prompt.length > 500) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Prompt must be less than 500 characters'
      });
    }

    console.log(`Generating image for prompt: "${prompt}"`);

    // Step 1: Get the initial page to extract necessary tokens/session data
    const pageResponse = await axios.get('https://perchance.org/ai-text-to-image-generator', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // Extract session ID or other necessary data from the page
    const pageContent = pageResponse.data;
    let sessionId = null;
    
    // Look for session ID in the page content
    const sessionMatch = pageContent.match(/sessionId['"]\s*:\s*['"]([^'"]+)['"]/);
    if (sessionMatch) {
      sessionId = sessionMatch[1];
    }

    // Step 2: Make the actual image generation request
    const generateResponse = await axios.post('https://perchance.org/api/generate', {
      prompt: prompt.trim(),
      width: 512,
      height: 512,
      guidanceScale: 7,
      seed: Math.floor(Math.random() * 1000000),
      steps: 20,
      model: 'standard',
      negativePrompt: '',
      sessionId: sessionId
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://perchance.org',
        'Referer': 'https://perchance.org/ai-text-to-image-generator',
        'Connection': 'keep-alive'
      },
      timeout: 60000 // 60 second timeout
    });

    // Step 3: Handle the response
    if (generateResponse.data && generateResponse.data.imageUrl) {
      console.log(`Image generated successfully: ${generateResponse.data.imageUrl}`);
      
      return res.json({
        success: true,
        imageUrl: generateResponse.data.imageUrl,
        prompt: prompt.trim()
      });
    } else if (generateResponse.data && generateResponse.data.taskId) {
      // If we get a task ID, we need to poll for the result
      const taskId = generateResponse.data.taskId;
      console.log(`Got task ID: ${taskId}, polling for result...`);
      
      // Poll for the result
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts with 2 second intervals = 1 minute max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        attempts++;
        
        try {
          const statusResponse = await axios.get(`https://perchance.org/api/status/${taskId}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Referer': 'https://perchance.org/ai-text-to-image-generator'
            }
          });
          
          if (statusResponse.data && statusResponse.data.status === 'completed' && statusResponse.data.imageUrl) {
            console.log(`Image generated successfully after ${attempts} attempts: ${statusResponse.data.imageUrl}`);
            
            return res.json({
              success: true,
              imageUrl: statusResponse.data.imageUrl,
              prompt: prompt.trim()
            });
          } else if (statusResponse.data && statusResponse.data.status === 'failed') {
            throw new Error('Image generation failed on Perchance servers');
          }
          
          console.log(`Attempt ${attempts}: Still processing...`);
        } catch (pollError) {
          console.error(`Polling attempt ${attempts} failed:`, pollError.message);
        }
      }
      
      // If we've exhausted all attempts
      return res.status(408).json({
        error: 'Timeout',
        message: 'Image generation timed out. Please try again.'
      });
    } else {
      throw new Error('Unexpected response format from Perchance API');
    }

  } catch (error) {
    console.error('Error generating image:', error.message);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'Timeout',
        message: 'Request timed out. The image generation service may be busy. Please try again.'
      });
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      return res.status(error.response.status || 500).json({
        error: 'External API Error',
        message: 'Failed to generate image. The external service may be unavailable.',
        details: error.response.status === 429 ? 'Rate limit exceeded. Please try again later.' : undefined
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Unable to reach the image generation service. Please try again later.'
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing your request.'
      });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Perchance AI Image Proxy Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Generate endpoint: http://localhost:${PORT}/api/generate-image`);
});

module.exports = app;