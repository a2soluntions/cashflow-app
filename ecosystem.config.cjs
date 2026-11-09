module.exports = {
  apps: [
    {
      name: 'a2mentor-app',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3004,
        APP_URL: 'https://a2mentor.nx49.com.br'
      }
    }
  ]
};
