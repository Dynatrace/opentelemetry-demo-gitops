const { trace, context } = require('@opentelemetry/api');

function baseLog(level, message, extra = {}) {
  const activeSpan = trace.getSpan(context.active());
  const sc = activeSpan ? activeSpan.spanContext() : undefined;
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(sc ? { traceId: sc.traceId, spanId: sc.spanId } : {}),
    ...extra,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

const log = {
  info: (m, e) => baseLog('info', m, e),
  warn: (m, e) => baseLog('warn', m, e),
  error: (m, e) => baseLog('error', m, e),
};

module.exports = { log };