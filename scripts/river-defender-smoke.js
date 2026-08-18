const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 760 }
  });

  const messages = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      messages.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    messages.push(err.message);
  });

  // Open the actual DisasterVerse River Defender route
  await page.goto('http://localhost:5173/river-defender', {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(600);

  // Verify HUD appears
  const hudVisible = await page.locator('#hud:not(.hidden)').count();

  // Verify game canvas exists
  const canvasBox = await page.locator('#world').boundingBox();

  if (!canvasBox) {
    throw new Error('River Defender canvas was not found.');
  }

  // -----------------------------
  // TEST FLOOD WALL
  // -----------------------------

  await page.click('[data-tool="wall"]');

  await page.mouse.move(
    canvasBox.x + canvasBox.width * 0.43,
    canvasBox.y + canvasBox.height * 0.48
  );

  await page.mouse.click(
    canvasBox.x + canvasBox.width * 0.43,
    canvasBox.y + canvasBox.height * 0.48
  );

  // -----------------------------
  // TEST PUMP
  // -----------------------------

  await page.click('[data-tool="pump"]');

  await page.mouse.move(
    canvasBox.x + canvasBox.width * 0.47,
    canvasBox.y + canvasBox.height * 0.52
  );

  await page.mouse.click(
    canvasBox.x + canvasBox.width * 0.47,
    canvasBox.y + canvasBox.height * 0.52
  );

  // -----------------------------
  // TEST SAND BAGS
  // -----------------------------

  await page.click('[data-tool="sand"]');

  await page.mouse.move(
    canvasBox.x + canvasBox.width * 0.51,
    canvasBox.y + canvasBox.height * 0.53
  );

  await page.mouse.click(
    canvasBox.x + canvasBox.width * 0.51,
    canvasBox.y + canvasBox.height * 0.53
  );

  await page.waitForTimeout(500);

  // Read current HUD state
  const budget = await page.locator('#budget').innerText();
  const status = await page.locator('#status').innerText();

  // Save screenshot
  await page.screenshot({
    path: 'river-defender-smoke.png',
    fullPage: true
  });

  await browser.close();

  const result = {
    hudVisible,
    budget,
    status,
    errors: messages
  };

  console.log(JSON.stringify(result, null, 2));

  // Fail the test if HUD is missing or browser errors occurred
  if (!hudVisible || messages.length) {
    process.exit(1);
  }
})();