const http = require('http');
const fs = require('fs');
const path = require('path');
const base = require('@playwright/test').test;
const { expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function createServer(requestLog) {
  return http.createServer((req, res) => {
    requestLog.push({ method: req.method, url: req.url });
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    } catch {
      res.writeHead(400).end('Bad request');
      return;
    }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(ROOT, '.' + pathname);
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
        return;
      }
      const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
}

const test = base.extend({
  // Fresh, empty log per test.
  requestLog: async ({}, use) => {
    await use([]);
  },
  // Fresh server per test on an ephemeral 127.0.0.1 port, logging into this test's requestLog.
  serverURL: async ({ requestLog }, use) => {
    const server = createServer(requestLog);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address();
    await use(`http://127.0.0.1:${port}`);
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  },
});

module.exports = { test, expect };
