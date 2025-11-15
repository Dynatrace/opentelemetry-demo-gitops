// logger.js
const { createLogger, format, transports } = require('winston');
const { trace, context } = require('@opentelemetry/api');

// Accept only known Winston levels; default to info
const VALID_LEVELS = new Set(['error','warn','info','http','verbose','debug','silly']);
function resolveLogLevel(envVal) {
  const lvl = (envVal || 'info').toString().toLowerCase().trim();
  return VALID_LEVELS.has(lvl) ? lvl : 'info';
}

// Map winston level -> uppercase loglevel expected by Dynatrace
const toLogLevelUpper = (lvl) => {
  const map = {
    error: 'ERROR',
    warn:  'WARN',
    info:  'INFO',
    http:  'INFO',
    verbose: 'DEBUG',
    debug: 'DEBUG',
    silly: 'TRACE',
  };
  return map[lvl] || 'INFO';
};

// Add loglevel field and keep level as-is
const addLogLevelField = format((info) => {
  info.loglevel = toLogLevelUpper(info.level); // <- Dynatrace-friendly
  return info;
});

const logger = createLogger({
  level: resolveLogLevel(process.env.LOG_LEVEL),
  format: format.combine(
    format.timestamp(),
    addLogLevelField(),     // <- injects `loglevel`
    format.json()
  ),
  transports: [new transports.Console()],
});

// Optional: confirm at cold start which level is active
logger.info('Logger initialized', { level: logger.level, loglevel: toLogLevelUpper(logger.level) });

module.exports = logger;