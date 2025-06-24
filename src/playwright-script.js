const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const wsEndpoint = process.argv[2];
  const jsonString = process.argv[3];

  if (!wsEndpoint || !jsonString) {
    console.error("❌ Usage: node script.js <wsEndpoint> <jsonString>");
    process.exit(1);
  }

  let recipients;
  try {
    recipients = JSON.parse(jsonString); // [{phone, message}, ...]
  } catch (err) {
    console.error("❌ Invalid JSON payload.");
    process.exit(1);
  }

  const browser = await chromium.connectOverCDP(wsEndpoint);
  const context = browser.contexts()[0];
  const page = await context.newPage();

  for (const { phone, message } of recipients) {
    try {
      console.log(`📤 Sending to ${phone}...`);
      await page.goto(`https://web.whatsapp.com/send?phone=${phone}`, {
        waitUntil: 'domcontentloaded'
      });


      await page.waitForTimeout(8000); // Let chat load fully

  // Updated selector (works with different languages like Portuguese)
        const inputSelector = 'div[contenteditable="true"][role="textbox"][aria-label*="mensagem"]';

        console.log("Waiting for message input...");
        await page.waitForSelector(inputSelector, { timeout: 30000 });
        await page.click(inputSelector); // focus on input

        console.log("Typing message...");
        await page.type(inputSelector, message, { delay: 50 });
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        console.log(`✅ Message sent to ${phoneNumber}`);
        process.exit(0);
    } catch (err) {
      console.error(`❌ Failed to send to ${phone}: ${err.message}`);
      await page.screenshot({ path: `error-${phone}.png` });
    }
  }

  await browser.close();
})();




