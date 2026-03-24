// src/aws/s3.js
import { HeadObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./clients.js";
import log from "../logger.js";
import { streamToBuffer } from "../util.js";

/**
 * Check if an object exists via HeadObject
 */
async function objectExists(bucket, key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    log.error('Error checking if object exists in S3', { error, bucket, key });
    throw error;
  }
}

/**
 * Read object into Buffer
 */
async function getObjectBuffer(bucket, key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const buf = await streamToBuffer(res.Body);
  // log.info('Fetched original image', { bucket, key, bytes: buf.length });
  return buf;
}

/**
 * Put an object
 */
async function putObject(bucket, key, body, contentType, metadata) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    }),
  );
}

/**
 * Presign a GetObject URL
 */
async function presignGetUrl(bucket, key, expiresInSeconds) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
}

export {
  objectExists,
  getObjectBuffer,
  putObject,
  presignGetUrl,
};
