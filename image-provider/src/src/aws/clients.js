import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { REGION } from "../config.js";

const s3 = new S3Client({ region: REGION });
const ddb = new DynamoDBClient({ region: REGION });

export{ s3, ddb };
