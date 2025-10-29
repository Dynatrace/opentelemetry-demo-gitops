const process = require("process");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const { W3CTraceContextPropagator } = require("@opentelemetry/core");
const {
  AwsInstrumentation,
} = require("@opentelemetry/instrumentation-aws-sdk");
const {
  WinstonInstrumentation,
} = require("@opentelemetry/instrumentation-winston");
const {
  SEMRESATTRS_SERVICE_NAME,
} = require("@opentelemetry/semantic-conventions");
const { awsEc2DetectorSync } = require("@opentelemetry/resource-detector-aws");
const {
  Resource,
  detectResourcesSync,
  envDetectorSync,
  hostDetectorSync,
  processDetectorSync,
} = require("@opentelemetry/resources");
const logsAPI = require("@opentelemetry/api-logs");
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} = require("@opentelemetry/sdk-logs");

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
  new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
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
      [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
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
      .then(() => console.log("Tracing and metrics terminated TEST"))
      .catch((error) => console.log("Error terminating tracing: ", error))
      .finally(() => process.exit(0));
  });
}

nodeSDKBuilder();
