const REGION = "us-east-1";

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

function getIntEnv(name, defaultVal) {
  const raw = process.env[name];
  if (!raw) return defaultVal;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed))
    throw new Error(`Invalid integer for ${name}: ${raw}`);
  return parsed;
}

function getBucketMapping() {
  const bucketsJson = requireEnv("BUCKETS");
  try {
    return JSON.parse(bucketsJson);
  } catch (err) {
    throw new Error(`Failed to parse BUCKETS env var: ${err.message}`);
  }
}

export const PRODUCTS_TABLE = requireEnv("PRODUCTS_TABLE");
export const DDB_PRODUCT_ID_KEY = "id";
export const DDB_BUCKET_ATTR = "bucket";
export const PRESIGN_TTL_SECONDS = getIntEnv("PRESIGN_TTL_SECONDS", 900);
export const DEFAULT_SCREEN = process.env.DEFAULT_SCREEN || "860x600";
export const BUCKET_MAPPING = getBucketMapping();
export { REGION };
