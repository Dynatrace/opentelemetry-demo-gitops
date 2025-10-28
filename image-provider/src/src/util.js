const path = require('node:path');

/**
 * Whitelist sanitizer for screen param, e.g., "860x600".
 */
function sanitizeScreen(screen, fallback = '860x600') {
  if (!screen) return fallback;
  const s = String(screen).trim();
  return /^[0-9]+x[0-9]+$/.test(s) ? s : fallback;
}

/**
 * Infer Content-Type from the image file name.
 */
function inferContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Convert Readable stream to Buffer
 */
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

module.exports = {
  sanitizeScreen,
  inferContentType,
  streamToBuffer,
};