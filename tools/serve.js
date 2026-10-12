/*
 * 本地预览服务器：静态托管当前目录，并强制禁用缓存。
 *
 *   node tools/serve.js            默认 http://127.0.0.1:8080
 *   node tools/serve.js 9000       指定端口
 *
 * 相比 python -m http.server 的区别：
 *   - 响应头带 no-store/no-cache，改完 lang/*.json 或 assets/js/main.js
 *     后浏览器刷新（F5）即可看到最新内容，无需清缓存或强制刷新；
 *   - 关闭目录列表，只提供站点内的静态文件；
 *   - 端口被占用时会自动往后顺延，最多尝试 20 个端口。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE = path.resolve(__dirname, '..');
const startPort = Number(process.argv[2]) || 8080;
const MAX_PORT_TRIES = 20;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
    ...headers,
  });
  res.end(body);
}

function resolveSafe(urlPath) {
  // 阻止 ../ 穿越到站点目录之外
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const target = path.resolve(SITE, '.' + decoded);
  if (target !== SITE && !target.startsWith(SITE + path.sep)) return null;
  return target;
}

const server = http.createServer((req, res) => {
  let target = resolveSafe(req.url || '/');
  if (!target) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(target, (err, stat) => {
    if (!err && stat.isDirectory()) target = path.join(target, 'index.html');

    fs.readFile(target, (readErr, buf) => {
      if (readErr) {
        send(res, 404, `404 Not Found: ${req.url}`);
        return;
      }
      const type = MIME[path.extname(target).toLowerCase()] || 'application/octet-stream';
      send(res, 200, buf, { 'Content-Type': type, 'Content-Length': buf.length });
    });
  });
});

let port = startPort;
let tries = 0;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && tries < MAX_PORT_TRIES) {
    tries += 1;
    port += 1;
    console.log(`[serve] 端口 ${port - 1} 已被占用，改用 ${port}`);
    server.listen(port, '127.0.0.1');
    return;
  }
  console.error(`[serve] 启动失败：${err.message}`);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[serve] 站点根目录：${SITE}`);
  console.log(`[serve] 本地预览：http://127.0.0.1:${port}/`);
  console.log('[serve] 已禁用缓存：改完内容后浏览器按 F5 即可看到最新效果');
});
