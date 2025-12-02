const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({
    error: err.message ?? 'Unexpected error',
  });
});

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
