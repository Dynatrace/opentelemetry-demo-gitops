// src/aws/ddb.js
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from "./clients.js";
import log from "../logger.js"; 

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

export { getProductBucket };
