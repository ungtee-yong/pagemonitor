const axios = require('axios');
const {
  requireCredentials,
  buildAuthParams,
} = require('./config');

const graph = axios.create({
  baseURL: 'https://graph.facebook.com/v19.0',
  timeout: 15000,
});

const composeFields = () => {
  const commentFields = [
    'id',
    'message',
    'created_time',
    'permalink_url',
    'comment_count',
    'from{id,name,picture{data{url}}}',
  ].join(',');

  return [
    'id',
    'message',
    'story',
    'created_time',
    'permalink_url',
    'full_picture',
    `comments.limit(50).summary(true){${commentFields}}`,
  ].join(',');
};

const handleFacebookError = (error) => {
  if (error.response?.data?.error) {
    const fbError = error.response.data.error;
    const sanitized = new Error(`${fbError.type || 'FacebookError'}: ${fbError.message}`);
    sanitized.status = error.response.status;
    sanitized.code = fbError.code;
    sanitized.fbtrace_id = fbError.fbtrace_id;
    throw sanitized;
  }

  if (error.response) {
    const generic = new Error('Facebook API request failed');
    generic.status = error.response.status;
    throw generic;
  }

  throw error;
};

const fetchPosts = async (params = {}) => {
  const { pageId, accessToken, appSecret } = requireCredentials();

  try {
    const response = await graph.get(`/${pageId}/posts`, {
      params: {
        ...buildAuthParams(accessToken, appSecret),
        fields: composeFields(),
        limit: params.limit || 10,
        after: params.after,
        since: params.since,
        until: params.until,
      },
    });

    return response.data;
  } catch (error) {
    handleFacebookError(error);
  }
};

const replyToComment = async (commentId, message) => {
  if (!commentId) {
    const err = new Error('Comment ID is required');
    err.status = 400;
    throw err;
  }

  const { accessToken, appSecret } = requireCredentials();

  try {
    const response = await graph.post(`/${commentId}/comments`, null, {
      params: {
        ...buildAuthParams(accessToken, appSecret),
        message,
      },
    });

    return response.data;
  } catch (error) {
    handleFacebookError(error);
  }
};

module.exports = {
  fetchPosts,
  replyToComment,
};
