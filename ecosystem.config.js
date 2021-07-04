const { WEB_INSTANCES = 2 } = process.env;

module.exports = {
  apps: [{
    name: 'app',
    script: './dist/server.js',
    instances: WEB_INSTANCES,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    }
  }]
};
