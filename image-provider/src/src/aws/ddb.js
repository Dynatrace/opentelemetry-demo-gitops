// src/aws/ddb.js
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { ddb } = require('./clients');
const { log } = require('../logger');

/**
 * Get the image file name for a given productId.
 * Falls back to "picture" attribute if preferred attribute is missing.
 *
 * @returns {Promise<string|null>}
 */
async function getProductImageName({
  tableName,
  productId,
  idAttr,
  imageAttr,
}) {
  const cmd = new GetItemCommand({
    TableName: tableName,
    Key: { [idAttr]: { S: String(productId) } },
    ProjectionExpression: `${imageAttr}, picture`,
  });

  const res = await ddb.send(cmd);
  if (!res.Item) {
    log.warn('DynamoDB item not found.', { productId });
    return null;
  }
  const preferred = res.Item[imageAttr]?.S;
  const fallback = res.Item.picture?.S;
  const imageName = preferred || fallback || null;

  // log.info('DynamoDB GetItem succeeded.', { productId, imageName });
  return imageName;
}

module.exports = { getProductImageName };