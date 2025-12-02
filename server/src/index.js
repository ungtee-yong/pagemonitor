const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const facebookRouter = require('./routes/facebook');
const { getRuntimeConfig } = require('./lib/config');
const { isMockMode } = require('./services/facebookService');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const { port } = getRuntimeConfig();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: isMockMode() ? 'mock' : 'live',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/facebook', facebookRouter);

app.use((err, _req, res, _next) => {
  console.error('[server:error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`⚡ Facebook Page monitor API running on http://localhost:${port}`);
});
