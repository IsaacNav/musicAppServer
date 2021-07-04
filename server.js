const debug = require('debug')('nomisoft-back:server');
const http = require('http');
const app = require('./app');
const port = Number(process.env.PORT) || 1338;

app.set('port', port);

process.on('uncaughtException', (err) => {
  console.error(`${new Date().toISOString()} uncaughtException: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error(`${new Date().toISOString()} unhandledRejection: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  const ERRORS = {
    'EACCES': () => {
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    },
    'EADDRINUSE': () => {
      console.error(`${bind} is already in use`);
      process.exit(1);
    },
    default: () => {
      throw error;
    }
  }
  const handler = ERRORS[error.code] || ERRORS.default;
  handler();
};


/**
 * Create HTTP server.
 */

  const httpServer = http.createServer(_app);
  httpServer.listen(_port, () => {
    console.log(`Thread threadId: ${threadId} pid: ${process.pid} port: ${_port} alive!`);
  });


const SIGS = [
    'SIGINT', // Ctrl + C
    'SIGBREAK', // Ctrl + C
    'SIGTERM', // Soft Shutown
  ];

  SIGS.forEach((SIG) => {
    process.on(SIG, function () {
      console.log(`Worker ${threadId} exiting`);
      console.log('Cleanup here');
      process.exit();
    });
  });
