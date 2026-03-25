// src/aws/ddb.js
const { GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { ddb } = require("./clients");
const { log } = require("../logger");

/**
 * Get the bucket name for a given productImage.
 *
 * @returns {Promise<string|null>}
 */
async function getProductBucket({
  tableName,
  productImage,
  idAttr,
  bucketAttr,
}) {
  const cmd = new GetItemCommand({
    TableName: tableName,
    Key: { [idAttr]: { S: String(productImage) } },
    ProjectionExpression: "#b",
    ExpressionAttributeNames: {
      "#b": bucketAttr
    }
  });

  const res = await ddb.send(cmd);
  if (!res.Item) {
    log.warn("DynamoDB item not found.", { productImage });
    return null;
  }
  
  const bucket = res.Item[bucketAttr]?.S;

  if (!bucket) {
    log.warn("Missing bucket in DynamoDB item.", { productImage });
    return null;
  }

  return bucket;
}

module.exports = { getProductBucket };
