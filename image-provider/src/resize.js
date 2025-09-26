// utils/resize.js
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('resize-image');

async function resizeImage(buffer, width = 300) {
  return await tracer.startActiveSpan('resizeImage', async (span) => {
    try {
      //await new Promise((r) => setTimeout(r, 6000));
      span.setStatus({ code: 1 });
      return buffer;
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: 2 });
      throw err;
    } finally {
      span.end();
    }
  });
}

module.exports = { resizeImage };
