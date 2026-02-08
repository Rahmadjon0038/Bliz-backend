const appConfig = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'change-me-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
  smsSender: process.env.SMS_SENDER || 'Billz'
};

module.exports = appConfig;
