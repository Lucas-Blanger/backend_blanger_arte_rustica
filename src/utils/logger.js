const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

// Garante que o diretório de logs existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const combinedLogPath = path.join(logsDir, 'combined.log');
const errorLogPath = path.join(logsDir, 'error.log');
const accessLogPath = path.join(logsDir, 'access.log');

function formatTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

function writeToLog(filePath, logLine) {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.appendFileSync(filePath, logLine + '\n', 'utf8');
  } catch (err) {
    console.error('[LOGGER_ERROR] Falha ao escrever no log:', err.message);
  }
}

const logger = {
  logsDir,
  combinedLogPath,
  errorLogPath,
  accessLogPath,

  info(message) {
    const logLine = `[${formatTimestamp()}] [INFO]: ${message}`;
    console.log(logLine);
    writeToLog(combinedLogPath, logLine);
  },

  warn(message) {
    const logLine = `[${formatTimestamp()}] [WARN]: ${message}`;
    console.warn(logLine);
    writeToLog(combinedLogPath, logLine);
  },

  error(message, err = null) {
    let logLine = `[${formatTimestamp()}] [ERROR]: ${message}`;
    if (err && err.stack) {
      logLine += `\nStack: ${err.stack}`;
    } else if (err) {
      logLine += ` | Exception: ${JSON.stringify(err)}`;
    }
    console.error(logLine);
    writeToLog(combinedLogPath, logLine);
    writeToLog(errorLogPath, logLine);
  },

  http(message) {
    const logLine = `[${formatTimestamp()}] [HTTP]: ${message}`;
    writeToLog(combinedLogPath, logLine);
    writeToLog(accessLogPath, logLine);
  },

  // Stream para integração com o Morgan
  stream: {
    write: (message) => {
      logger.http(message.trim());
    },
  },
};

module.exports = logger;
