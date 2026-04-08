// ============================================================
//  VAIDYAGRAMA — Local Demo Server
//  Run: node local-server.js
//  Then open: http://localhost:3000
// ============================================================

// Load API key from .env file (never hardcode keys here)
require('dotenv').config();

const http = require('http');
const fs   = require('fs');
const path = require('path');

// Load the same chat function used on Netlify
const { handler } = require('./netlify/functions/chat.js');

const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js'  : 'application/javascript',
  '.css' : 'text/css',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg' : 'image/svg+xml',
  '.pdf' : 'application/pdf',
  '.xml' : 'application/xml',
  '.txt' : 'text/plain',
  '.md'  : 'text/plain',
  '.toml': 'text/plain',
};

const server = http.createServer(async (req, res) => {

  // ── Handle the AI chat API call ──────────────────────────────
  if (req.url === '/.netlify/functions/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const result = await handler({ httpMethod: 'POST', body });
        const headers = Object.assign(
          { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          result.headers || {}
        );
        res.writeHead(result.statusCode || 200, headers);
        res.end(result.body);
      } catch (err) {
        console.error('Chat handler error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error: ' + err.message }));
      }
    });
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // ── Serve static files ────────────────────────────────────────
  let urlPath = req.url.split('?')[0]; // strip query strings
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(__dirname, urlPath);
  const ext      = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try with .html extension (e.g. /about → about.html)
      fs.readFile(filePath + '.html', (err2, data2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 — File not found: ' + urlPath);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data2);
        }
      });
    } else {
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });

});

// ── Start ─────────────────────────────────────────────────────
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-key-here')) {
  console.error('\n❌  ERROR: OpenAI API key not found!');
  console.error('   Copy .env.example to .env and add your key.\n');
  process.exit(1);
}

server.listen(PORT, () => {
  console.log('\n✅  Vaidyagrama local server is running!');
  console.log('');
  console.log('   👉  Open this in your browser:');
  console.log('       http://localhost:' + PORT);
  console.log('');
  console.log('   Press Ctrl+C to stop the server.\n');
});
