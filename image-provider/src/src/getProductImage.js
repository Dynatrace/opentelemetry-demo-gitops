const { trace } = require('@opentelemetry/api');
const { log } = require('./logger');
const { NotFoundError } = require('./errors');
const { inferContentType } = require('./util');
const { getProductImageName } = require('./aws/ddb');
const { objectExists, getObjectBuffer, putObject, presignGetUrl } = require('./aws/s3');

const tracer = trace.getTracer('product-image-lambda');

/**
 * Build S3 keys for original and target sizes.
 */
function buildKeys(screen, imageName) {
  return {
    originalKey: `original/${imageName}`,
    targetKey: `${screen}/${imageName}`,
  };
}

/**
 * Ensure the target-sized image exists; if not, fetch original, "resize" (sleep), and upload.
 */
async function ensureTargetImage({
  bucket,
  screen,
  productId,
  imageName,
  presignTtlSeconds,
}) {
  const { originalKey, targetKey } = buildKeys(screen, imageName);

  const exists = await tracer.startActiveSpan('S3:HeadObject check if image for screen size exists', async (span) => {
    try {
      const found = await objectExists(bucket, targetKey);
      span.setAttribute('s3.target.exists', found);
      if (!found) {
        // Required warning message
        log.warn(`Image for screen size ${screen} not found under the path: ${targetKey}`, {
          bucket,
          key: targetKey,
          screen,
        });
      }
      return found;
    } finally {
      span.end();
    }
  });

  if (exists) {
    log.warn(`Image for screen size ${screen} not found under the path: ${targetKey}, resizing the original product image ${originalKey}.`, {
        key: targetKey,
        screen,
        originalKey
        });
       
    await tracer.startActiveSpan('Resize original product image', async (span) => {
      try {
        // Download original
        const originalBuf = await tracer.startActiveSpan('S3:GetObject get original product image from S3', async (getSpan) => {
          try {
            const buf = await getObjectBuffer(bucket, originalKey);
            getSpan.setAttribute('s3.original.bytes', buf.length);
            return buf;
          } finally {
            getSpan.end();
          }
        });

        await tracer.startActiveSpan('Image resizing', async (resizeSpan) => {
          // 6s sleep to simulate processing without altering bytes
          await new Promise((r) => setTimeout(r, 6000));
          resizeSpan.end();
        });

        // Upload target
        await tracer.startActiveSpan('S3:PutObject put resized image to S3', async (putSpan) => {
          const contentType = inferContentType(imageName);

          await putObject(bucket, targetKey, originalBuf, contentType, {
            source: 'lambda-resizer',
            screen,
            productId: String(productId),
          });
          putSpan.end();
        });
      } finally {
        span.end();
      }
    });
  }

  // Presign final URL
  const url = await tracer.startActiveSpan('S3:GetObject get presign URL', async (span) => {
    try {
      const signed = await presignGetUrl(bucket, targetKey, presignTtlSeconds);
      span.setAttribute('s3.presign.expiresIn', presignTtlSeconds);
      return signed;
    } finally {
      span.end();
    }
  });

  return { url, key: targetKey };
}

async function handleProductImageRequest({
  bucket,
  table,
  idAttr,
  imageAttr,
  productId,
  screen,
  presignTtlSeconds,
}) {
  // 1) Get image name from DynamoDB
  const imageName = await tracer.startActiveSpan('DynamoDB:GetItem - get product image filename', async (span) => {
    try {
      const name = await getProductImageName({
        tableName: table,
        productId,
        idAttr,
        imageAttr,
      });
      span.setAttribute('dynmodb.productId', productId);
      span.setAttribute('imageName', name || '');
      return name;
    } finally {
      span.end();
    }
  });

  if (!imageName) {
    throw new NotFoundError('Product or image name not found.', { productId });
  }

  // Ensure target image and presign URL
  const { url, key } = await ensureTargetImage({
    bucket,
    screen,
    productId,
    imageName,
    presignTtlSeconds,
  });

  return { url, key };
}

module.exports = { handleProductImageRequest };