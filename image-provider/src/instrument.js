import process from "process";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { awsEc2DetectorSync } from "@opentelemetry/resource-detector-aws";
import { 
  Resource,
  detectResourcesSync,
  envDetectorSync,
  hostDetectorSync,
  processDetectorSync,
} from "@opentelemetry/resources";
import logsAPI from "@opentelemetry/api-logs";
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} from "@opentelemetry/sdk-logs";

const _traceExporter = new OTLPTraceExporter();
const _spanProcessor = new BatchSpanProcessor(_traceExporter);

// To start a logger, you first need to initialize the Logger provider.
const loggerProvider = new LoggerProvider({
  // without resource we don't have proper service.name, service.version correlated with logs
  resource: detectResourcesSync({
    // this have to be manually adjusted to match SDK OTEL_NODE_RESOURCE_DETECTORS
    detectors: [
      envDetectorSync,
      processDetectorSync,
      hostDetectorSync,
      awsEc2DetectorSync,
    ],
  }),
});

// Add a processor to export log record
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()),
);
logsAPI.logs.setGlobalLoggerProvider(loggerProvider);

async function nodeSDKBuilder() {
  const awsInstrumentationConfig = new AwsInstrumentation({
    suppressInternalInstrumentation: true,
    sqsExtractContextPropagationFromPayload: true,
    // Add custom attributes for S3 Calls
    preRequestHook: (span, request) => {
      if (span.serviceName === "s3") {
        span.setAttribute("aws.s3.bucket", request.request.commandInput.Bucket);
        span.setAttribute("aws.s3.key", request.request.commandInput.Key);
      }
    },
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    }),
    textMapPropagator: new W3CTraceContextPropagator(),
    instrumentations: [
      new WinstonInstrumentation({
        logHook: (span, record) => {
          record["resource.service.name"] = process.env.OTEL_SERVICE_NAME;
        },
      }),
      awsInstrumentationConfig,
    ],
    spanProcessor: _spanProcessor,
    traceExporter: _traceExporter,
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("Tracing and metrics terminated"))
      .catch((error) => console.log("Error terminating tracing: ", error))
      .finally(() => process.exit(0));
  });
}

nodeSDKBuilder();