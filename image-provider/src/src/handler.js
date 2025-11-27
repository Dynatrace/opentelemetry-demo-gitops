const { trace } = require("@opentelemetry/api");
const { ValidationError, NotFoundError } = require("./errors");
const {
  REGION,
  BUCKET,
  PRODUCTS_TABLE,
  DDB_PRODUCT_ID_KEY,
  DDB_IMAGE_ATTR,
  PRESIGN_TTL_SECONDS,
  DEFAULT_SCREEN,
} = require("./config");
const { sanitizeScreen } = require("./util");
const { handleProductImageRequest } = require("./getProductImage");

const log = require("./logger");

const tracer = trace.getTracer("product-image-lambda");

const CORS_HEADERS = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,x-envoy-fault-delay-request",
  "Cache-Control": "no-cache",
});

/**
 * Lambda handler (API Gateway HTTP API).
 */
async function handler(event) {
  if (event?.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  return tracer.startActiveSpan(
    "Invoke lambda /images/presign.",
    async (span) => {
      try {
        const qs = event?.queryStringParameters || {};
        const productId = qs.productId;
        const screen = sanitizeScreen(qs.screen, DEFAULT_SCREEN);

        if (!productId) {
          throw new ValidationError("Missing productId.");
        }

        const { url, key } = await handleProductImageRequest({
          bucket: BUCKET,
          table: PRODUCTS_TABLE,
          idAttr: DDB_PRODUCT_ID_KEY,
          imageAttr: DDB_IMAGE_ATTR,
          productId,
          screen,
          presignTtlSeconds: PRESIGN_TTL_SECONDS,
        });

        span.setAttribute("response.hasUrl", Boolean(url));
        return {
          statusCode: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            bucket: BUCKET,
            key,
            screen,
            region: REGION,
            expiresIn: PRESIGN_TTL_SECONDS,
          }),
        };
      } catch (err) {
        span.recordException(err);
        span.setStatus({ code: 2, message: err.message });

        if (err instanceof ValidationError) {
          log.error("Validation error", {
            error: err.message,
            ...(err.details || {}),
          });
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: err.message }),
          };
        }

        if (err instanceof NotFoundError) {
          log.error("Not found", {
            error: err.message,
            ...(err.details || {}),
          });
          return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: err.message }),
          };
        }

        log.error("Handler error", { error: err.message, stack: err.stack });
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Internal server error" }),
        };
      } finally {
        span.end();
      }
    }
  );
}

module.exports = { handler };
