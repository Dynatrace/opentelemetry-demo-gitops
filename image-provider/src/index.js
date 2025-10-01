require("./instrument"); // OpenTelemetry setup

const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { trace } = require("@opentelemetry/api");
const { resizeImage } = require("./resize");

const s3 = new S3Client({});
const dynamodb = new DynamoDBClient({});
const tracer = trace.getTracer("resize-image-lambda");

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) =>
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });

exports.handler = async (event) => {
  const SOURCE_BUCKET = process.env.BUCKET;
  const DEST_BUCKET = process.env.BUCKET;
  const DYNAMO_TABLE = process.env.DYNAMODB_TABLE_NAME;
  const RESIZE_FLAG = process.env.IMAGE_RESIZE_PROBLEM_FLAG;

  return await tracer.startActiveSpan("resize-product-image", async (span) => {
    try {
      const { productId, screenSize = "200" } =
        event.queryStringParameters || {};

      console.log(`Request for productId ${productId}`);

      if (!productId) {
        throw new Error("Missing required query parameter: productId");
      }

      console.log("Fetching product image from DynamoDB");

      const dbSpan = tracer.startSpan("getProductFromDynamoDB");
      const dbResp = await dynamodb.send(
        new GetItemCommand({
          TableName: DYNAMO_TABLE,
          Key: { id: { S: productId } },
        })
      );
      dbSpan.end();

      const pictureName = dbResp?.Item?.picture?.S;
      console.log(
        `Got product image [${pictureName}] for product id [${productId}] from DynamoDB`
      );

      if (pictureName === undefined) {
        throw new Error("Product not found or missing picture field");
      }

      const getSpan = tracer.startSpan("getImageFromS3");
      const getResp = await s3.send(
        new GetObjectCommand({
          Bucket: SOURCE_BUCKET,
          Key: pictureName,
        })
      );
      let imageBuffer = await streamToBuffer(getResp.Body);
      getSpan.end();

      if (RESIZE_FLAG === "true") {
        imageBuffer = await resizeImage(imageBuffer, parseInt(screenSize, 10));

        const putSpan = tracer.startSpan("putImageToS3");
        await s3.send(
          new PutObjectCommand({
            Bucket: DEST_BUCKET,
            Key: `${screenSize}/${pictureName}`,
            Body: imageBuffer,
            ContentType: "image/jpeg",
          })
        );
        putSpan.end();
      }

      span.setStatus({ code: 1 });
      return {
        statusCode: 200,
        isBase64Encoded: true,
        headers: {
          "Content-Type": "image/jpeg",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        },
        body: imageBuffer.toString("base64"),
      };
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: 2 });
      console.error("Error:", err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    } finally {
      span.end();
    }
  });
};
