// server/index.js
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Perchance AI Image Generator Proxy Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/generate-image', async (req, res) => {
  let browser = null;
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid input', message: 'Prompt is required' });
    }
    const trimmed = prompt.trim().slice(0, 500);

    console.log(`🎨 Generating image for prompt: "${trimmed}"`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)' +
      ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate
    await page.goto('https://perchance.org/ai-text-to-image-generator', { waitUntil: 'networkidle2', timeout: 60000 });

    // Small delay to let client scripts initialize
    await page.waitForTimeout(2000);

    // Find prompt input robustly
    const promptSelectors = [
      'textarea[placeholder*="prompt"]',
      'textarea[placeholder*="Prompt"]',
      'textarea',
      'input[type="text"]',
      'input[placeholder*="prompt"]',
      'input[placeholder*="Prompt"]'
    ];

    let inputHandle = null;
    for (const sel of promptSelectors) {
      try {
        inputHandle = await page.$(sel);
        if (inputHandle) break;
      } catch (e) { /* ignore */ }
    }
    if (!inputHandle) {
      // fallback: look for contenteditable
      inputHandle = await page.$('[contenteditable="true"]');
    }
    if (!inputHandle) {
      throw new Error('Could not locate text input on Perchance page.');
    }

    // Clear & type prompt
    await inputHandle.click({ clickCount: 3 });
    await inputHandle.press && await inputHandle.press('Backspace').catch(()=>{});
    await inputHandle.type(trimmed, { delay: 30 });

    // Find generate button (multiple strategies)
    let genBtn = null;

    // Basic selectors
    const generateSelectors = [
      'button[onclick*="generate"]',
      'button:contains("Generate")',
      'button:contains("generate")',
      'button[class*="generate"]',
      'button',
      'input[type="submit"]',
      'input[type="button"]'
    ];

    for (const sel of generateSelectors) {
      try {
        genBtn = await page.$(sel);
        if (genBtn) {
          // attempt a quick check: button text should include "generate" or "create"
          const txt = await page.evaluate(el => (el.textContent || el.value || '').toLowerCase(), genBtn);
          if (txt.includes('generate') || txt.includes('create') || txt.includes('go') || txt.includes('run')) break;
          // sometimes the first button is unrelated - keep searching
        }
      } catch (e) { /* ignore */ }
    }

    // XPath fallback by text
    if (!genBtn) {
      const buttonsByText = await page.$x("//button[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'generate') or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create')]");
      if (buttonsByText.length) genBtn = buttonsByText[0];
    }

    // Last resort: pick the first big visible button
    if (!genBtn) {
      const allButtons = await page.$$('button, input[type="button"], input[type="submit"]');
      for (const b of allButtons) {
        try {
          const box = await b.boundingBox();
          if (box && box.width > 40 && box.height > 20) {
            genBtn = b;
            break;
          }
        } catch (e) {}
      }
    }

    if (!genBtn) {
      throw new Error('Could not find generate button on Perchance page.');
    }

    // Click it
    await genBtn.click();

    // Poll for generated image (max ~2 minutes)
    const maxAttempts = 60; // 60 * 2s = 120s
    let attempts = 0;
    let imageUrl = null;

    while (attempts < maxAttempts && !imageUrl) {
      attempts++;
      await page.waitForTimeout(2000);
      // Collect images and filter plausible candidates
      const imgs = await page.$$('img');
      for (const img of imgs) {
        try {
          const src = await page.evaluate(el => el.src || '', img);
          const naturalWidth = await page.evaluate(el => el.naturalWidth || 0, img);
          const naturalHeight = await page.evaluate(el => el.naturalHeight || 0, img);
          if (!src) continue;
          // heuristics: not a small icon and likely a generated asset
          const lower = src.toLowerCase();
          if (naturalWidth > 200 && naturalHeight > 200 &&
              !lower.includes('sprite') && !lower.includes('logo') && !lower.includes('icon')) {
            // If blob: or data:, handle accordingly
            if (src.startsWith('blob:')) {
              try {
                const dataUrl = await page.evaluate(async (u) => {
                  const r = await fetch(u);
                  const b = await r.blob();
                  return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(b);
                  });
                }, src);
                imageUrl = dataUrl;
                break;
              } catch (e) {
                continue;
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

      // If any error messages appear on page, bail quickly
      const errorEls = await page.$$('[class*="error"], [class*="Error"], .alert-danger');
      for (const el of errorEls) {
        const txt = await page.evaluate(e => e.textContent || '', el);
        if (txt && txt.trim()) {
          throw new Error(`Perchance error: ${txt.trim()}`);
        }
      }
    }

    if (!imageUrl) {
      throw new Error('Image generation timed out or Perchance returned no image.');
    }

    // Success
    return res.json({
      success: true,
      imageUrl,
      prompt: trimmed,
      generatedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('❌ Error generating image:', err && err.message ? err.message : err);
    if (err.message && err.message.includes('timed out')) {
      return res.status(408).json({ success: false, error: 'Timeout', message: err.message });
    }
    if (err.message && (err.message.includes('navigate') || err.message.includes('net::ERR'))) {
      return res.status(503).json({ success: false, error: 'Service Unavailable', message: 'Unable to reach Perchance.org' });
    }
    return res.status(500).json({ success: false, error: 'Generation Failed', message: err.message || 'Unknown error' });

  } finally {
    if (browser) {
      try { await browser.close(); console.log('🔒 Browser closed'); } catch (e) { console.error('Error closing browser:', e && e.message); }
    }
  }
});

// Fallback 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Not Found', message: 'The requested endpoint does not exist' });
});

app.listen(PORT, () => {
  console.log(`🚀 Perchance AI Image Generator Proxy Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Generate endpoint: http://localhost:${PORT}/api/generate-image`);
});
