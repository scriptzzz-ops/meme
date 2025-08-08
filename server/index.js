const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Perchance AI Image Generator Proxy Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/generate-image", async (req, res) => {
  let browser = null;
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid input", message: "Prompt is required" });
    }
    const trimmed = prompt.trim().slice(0, 500);

    console.log(`🎨 Generating image for prompt: "${trimmed}"`);

    // Windows-friendly Puppeteer launch
    browser = await puppeteer.launch({
      headless: true, // 'new' is only for newer Puppeteer builds
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" +
        " AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto("https://perchance.org/ai-text-to-image-generator", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await page.waitForTimeout(2000);

    // Locate input
    const selectors = [
      'textarea[placeholder*="prompt"]',
      'textarea[placeholder*="Prompt"]',
      "textarea",
      'input[type="text"]',
      '[contenteditable="true"]',
    ];

    let inputHandle = null;
    for (const sel of selectors) {
      inputHandle = await page.$(sel);
      if (inputHandle) break;
    }
    if (!inputHandle) throw new Error("Could not find prompt input.");

    await inputHandle.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await inputHandle.type(trimmed, { delay: 30 });

    // Locate generate button
    let genBtn = null;
    const btnSelectors = [
      "//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'generate')]",
      "//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create')]",
    ];
    for (const xpath of btnSelectors) {
      const found = await page.$x(xpath);
      if (found.length) {
        genBtn = found[0];
        break;
      }
    }
    if (!genBtn) throw new Error("Could not find generate button.");

    await genBtn.click();

    // Wait for generated image
    let imageUrl = null;
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(2000);
      const imgs = await page.$$eval("img", imgs =>
        imgs.map(img => ({
          src: img.src,
          width: img.naturalWidth,
          height: img.naturalHeight,
        }))
      );
      const candidate = imgs.find(
        img =>
          img.width > 200 &&
          img.height > 200 &&
          !img.src.includes("logo") &&
          !img.src.includes("icon")
      );
      if (candidate) {
        imageUrl = candidate.src;
        break;
      }
    }

    if (!imageUrl) throw new Error("Image generation timed out.");

    res.json({
      success: true,
      imageUrl,
      prompt: trimmed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error generating image:", err.message);
    res
      .status(500)
      .json({ success: false, error: "Generation Failed", message: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.use("*", (req, res) => {
  res
    .status(404)
    .json({ success: false, error: "Not Found", message: "The requested endpoint does not exist" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
