const { chromium } = require('playwright');
const process = require('process');
const axios = require('axios');

(async () => {
  let browser;
  try {
    const wsEndpoint = process.argv[2]; // e.g., ws://127.0.0.1:56968/devtools/browser/...
    const phoneNumber = process.argv[3]; // e.g., +5511999998888

    if (!wsEndpoint || !phoneNumber) {
      throw new Error('Missing wsEndpoint or phoneNumber');
    }

    browser = await chromium.connectOverCDP(wsEndpoint);
    const context = browser.contexts()[0];
    const page = await context.newPage();

    // Increase navigation timeout and retry on network failure
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle', timeout: 60000 }); // Increased to 1 minutes

    // Click "Entrar com número de telefone"
    // await page.waitForSelector('[role="button"]:has-text("Entrar com número de telefone")', { timeout: 30000 });
    // await page.click('[role="button"]:has-text("Entrar com número de telefone")');
    await page.waitForSelector('role=button[name="Entrar com número de telefone"]', { timeout: 10000 });
    await page.click('role=button[name="Entrar com número de telefone"]');


    // Wait for and fill phone number input
    await page.waitForSelector('input[aria-label="Insira seu número de telefone."]', { timeout: 5000 });
    await page.fill('input[aria-label="Insira seu número de telefone."]', phoneNumber.replace('+', ''));

    // Click "Avançar"
    await page.waitForSelector('button:has-text("Avançar")', { timeout: 5000, state: 'visible' });
    await page.click('button:has-text("Avançar")');

    // Wait for PIN with improved retry logic and debugging
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.waitForSelector('[aria-details="link-device-phone-number-code-screen-instructions"]', { timeout: 5000 });
        const pinElements = await page.$$('[aria-details="link-device-phone-number-code-screen-instructions"] span.x2b8uid');
        if (pinElements.length > 0) {
          const pin = (await Promise.all(pinElements.map(el => el.textContent()))).join('');
          // const pin = (await Promise.all(pinElements.map(el => el.textContent()))).join('').replace('-', '');
          console.log(`Captured PIN: ${pin}`);
          console.log(JSON.stringify({ pin: pin.trim() }));

          await axios.post('http://localhost:3000/api/pin', {
            phone: phoneNumber,
            pin: pin
          });

          return;
        } else {
          throw new Error('No PIN elements found');
        }
      } catch (e) {
        console.error(`PIN capture attempt ${attempt + 1} failed: ${e.message}`);
        if (attempt === 2) throw e;
        await new Promise(resolve => setTimeout(resolve, 10000)); // Increased to 10 seconds
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.log(JSON.stringify({ pin: 'Failed to capture PIN' }));
  } finally {
    await browser?.close();
  }
})();