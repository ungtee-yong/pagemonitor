const dotenv = require('dotenv');

dotenv.config();

function ensureEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return process.env[name];
}

module.exports = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  pageId: ensureEnv('FACEBOOK_PAGE_ID'),
  accessToken: ensureEnv('FACEBOOK_ACCESS_TOKEN'),
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS ?? '45', 10),
};
