const readline = require('readline');
const puppeteer = require('puppeteer');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

let browser = null;
let page = null;
const commandQueue = [];
let isProcessing = false;
let stdinClosed = false;

function send(obj) {
  try {
    process.stdout.write(JSON.stringify(obj) + "\n");
  } catch (e) { /* Ignore */ }
}

async function processCommand(msg) {
  const { id, method, params } = msg;
  try {
    switch (method) {
      case 'initialize':
        if (!browser) {
          console.error('MCP: Initializing browser instance...');
          browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
          page = await browser.newPage();
          console.error('MCP: Browser initialized successfully.');
        }
        send({ id, result: { message: 'Browser MCP server initialized successfully.' } });
        break;
      case 'mcp_navigate':
        if (!page) throw new Error('Browser not initialized.');
        console.error(`MCP: Navigating to ${params.url}...`);
        await page.goto(params.url, { waitUntil: 'load' });
        console.error('MCP: Navigation complete.');
        send({ id, result: { message: `Successfully navigated to ${params.url}` } });
        break;
      case 'mcp_click':
        if (!page) throw new Error('Browser not initialized.');
        console.error(`MCP: Clicking selector "${params.selector}"...`);
        await page.waitForSelector(params.selector, { visible: true });
        await page.click(params.selector);
        console.error('MCP: Click complete.');
        send({ id, result: { message: `Successfully clicked selector "${params.selector}"` } });
        break;
      case 'mcp_getUrl':
        if (!page) throw new Error('Browser not initialized.');
        const currentUrl = page.url();
        console.error(`MCP: Getting current URL: ${currentUrl}`);
        send({ id, result: { url: currentUrl } });
        break;
      case 'mcp_getHtml':
        if (!page) throw new Error('Browser not initialized.');
        console.error('MCP: Getting HTML content...');
        const html = await page.content();
        send({ id, result: { html_length: html.length } });
        break;
      case 'mcp_close':
        console.error('MCP: Closing browser via command...');
        if (browser) {
          await browser.close();
          browser = null;
          page = null;
        }
        console.error('MCP: Browser closed.');
        send({ id, result: { message: 'Browser closed successfully.' } });
        break;
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (err) {
    console.error(`MCP Error (method: ${method}): ${err.message}`);
    send({ id, error: err.message });
  }
}

async function processQueue() {
  if (isProcessing) return;
  if (commandQueue.length === 0) {
    if (stdinClosed) {
      console.error('MCP: Stdin is closed and queue is empty. Exiting.');
      if (browser) await browser.close();
      process.exit(0);
    }
    return; // Queue is empty, wait for more commands
  }

  isProcessing = true;
  const msg = commandQueue.shift();
  await processCommand(msg);
  isProcessing = false;
  
  process.nextTick(processQueue); // Process next command
}

rl.on('line', (line) => {
  if (!line) return;
  try {
    commandQueue.push(JSON.parse(line));
    processQueue();
  } catch (err) {
    send({ error: 'Invalid JSON message', details: err.message });
  }
});

rl.on('close', () => {
  console.error('MCP: Stdin stream closed. Finishing queue then exiting.');
  stdinClosed = true;
  processQueue(); // Trigger queue processing to handle exit condition
});

console.error("Browser MCP Server (v3 with graceful exit) is ready.");