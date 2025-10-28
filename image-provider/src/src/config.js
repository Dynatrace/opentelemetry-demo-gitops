const REGION = 'us-east-1';

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

function getIntEnv(name, defaultVal) {
  const raw = process.env[name];
  if (!raw) return defaultVal;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) throw new Error(`Invalid integer for ${name}: ${raw}`);
  return parsed;
}

module.exports = {
  REGION,
  BUCKET: requireEnv('BUCKET'),
  PRODUCTS_TABLE: requireEnv('PRODUCTS_TABLE'),
  DDB_PRODUCT_ID_KEY: 'id',
  DDB_IMAGE_ATTR: process.env.DDB_IMAGE_ATTR || 'imageName',
  PRESIGN_TTL_SECONDS: getIntEnv('PRESIGN_TTL_SECONDS', 900),
  DEFAULT_SCREEN: process.env.DEFAULT_SCREEN || '860x600',
};