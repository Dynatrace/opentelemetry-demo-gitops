const { trace } = require('@opentelemetry/api');
const { NotFoundError } = require('./errors');
const { inferContentType } = require('./util');
const { getProductBucket } = require('./aws/ddb');
const { objectExists, getObjectBuffer, putObject, presignGetUrl } = require('./aws/s3');

const log = require('./logger');

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
  productImage,
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

  if (!exists) {
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
            productImage: String(productImage),
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

      log.info(`Presign URL generated correcltly for product image ${originalKey}.`, {originalKey});

      return signed;
    } finally {
      span.end();
    }
  });

  return { url, key: targetKey };
}

async function handleProductImageRequest({
  table,
  idAttr,
  bucketAttr,
  bucketMapping,
  productImage,
  screen,
  presignTtlSeconds,
}) {
  // 1) Get bucket category from DynamoDB
  const genericBucket = await tracer.startActiveSpan('DynamoDB:GetItem - get product bucket', async (span) => {
    try {
      const bucket = await getProductBucket({
        tableName: table,
        productImage,
        idAttr,
        bucketAttr,
      });
      span.setAttribute('dynamodb.productImage', productImage);
      span.setAttribute('bucket', bucket || '');
      return bucket;
    } finally {
      span.end();
    }
  });

  if (!genericBucket) {
    throw new NotFoundError('Product image not found.', { productImage });
  }

  // 2) Map generic bucket name to actual environment-specific bucket
  const actualBucket = bucketMapping[genericBucket];
  if (!actualBucket) {
    throw new Error(`Unknown bucket category: ${genericBucket}. Available: ${Object.keys(bucketMapping).join(', ')}`);
  }

  log.info(`Mapped bucket: ${genericBucket} -> ${actualBucket}`, { productImage });

  // 3) Ensure target image and presign URL
  const { url, key } = await ensureTargetImage({
    bucket: actualBucket,
    screen,
    productImage,
    imageName: productImage, // Use productImage as the filename
    presignTtlSeconds,
  });

  return { url, key };
}

module.exports = { handleProductImageRequest };

