# chrome-devtool MCP server

Minimal Model Context Protocol (MCP) server for chrome-devtool that communicates over stdio.

Quick start

1. Install (no deps required):

```bash
npm install
```

2. Run:

```bash
npm start
```

3. Test (one-off):

```bash
printf '{"id":1,"method":"echo","params":{"msg":"hello"}}\n' | node index.js
```

This will print a JSON response line with `result.echoed`.

.vscode/mcp.json

The included `.vscode/mcp.json` config provides a simple stdio binding for debugging in VS Code.
