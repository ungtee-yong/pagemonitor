const crypto = require('crypto');

const truthyValues = new Set(['true', '1', 'yes', 'on']);

const boolFromEnv = (value) => {
  if (typeof value === 'string') {
    return truthyValues.has(value.toLowerCase());
  }
  return Boolean(value);
};

const getRuntimeConfig = () => {
  return {
    port: Number(process.env.PORT) || 4000,
    pageId: process.env.FACEBOOK_PAGE_ID,
    accessToken:
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    useMockData: boolFromEnv(process.env.FACEBOOK_USE_MOCK_DATA),
  };
};

const requireCredentials = () => {
  const { pageId, accessToken } = getRuntimeConfig();
  if (!pageId || !accessToken) {
    const missing = [];
    if (!pageId) missing.push('FACEBOOK_PAGE_ID');
    if (!accessToken) missing.push('FACEBOOK_PAGE_ACCESS_TOKEN');
    const error = new Error(
      `Missing Facebook credentials: ${missing.join(', ') || 'unknown'}`
    );
    error.status = 500;
    throw error;
  }
  return getRuntimeConfig();
};

const buildAuthParams = (accessToken, appSecret) => {
  const params = { access_token: accessToken };
  if (accessToken && appSecret) {
    params.appsecret_proof = crypto
      .createHmac('sha256', appSecret)
      .update(accessToken)
      .digest('hex');
  }
  return params;
};

module.exports = {
  getRuntimeConfig,
  requireCredentials,
  buildAuthParams,
};
