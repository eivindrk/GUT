const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

function send(obj) {
  try {
    process.stdout.write(JSON.stringify(obj) + "\n");
  } catch (e) {
    // ignore
  }
}

rl.on('line', (line) => {
  if (!line) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch (err) {
    // Not JSON, ignore
    return;
  }

  // Basic MCP-like handling: respond to requests with an echo result
  const id = msg.id || null;
  const method = msg.method || null;

  if (method === 'initialize') {
    send({ id, result: { message: 'chrome-devtool MCP server initialized' } });
    return;
  }

  // Echo back params for any other method
  send({ id, result: { echoed: msg.params || null, method } });
});

// Keep process alive
process.stdin.on('end', () => process.exit(0));
