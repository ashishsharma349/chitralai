const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./src/config/db');
const jobRoutes = require('./src/routes/job.routes');
const screeningRoutes = require('./src/routes/screening.routes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use('/api/jobs', jobRoutes);
app.use('/api/screen', screeningRoutes);


app.get('/api/health', async (req, res, next) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        server: 'OK',
        database: 'OK',
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const isClientError = status >= 400 && status < 500;
  return res.status(status).json({
    error: {
      message: isClientError ? err.message : 'An unexpected internal server error occurred.',
      status,
      timestamp: new Date().toISOString(),
    },
  });
});

// Starts the Express server and establishes the database connection
async function startServer() {
  try {
    await connectDB();
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('Database schemas verified.');
    }
    app.listen(PORT, () => {
      console.log(`Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed due to database connection error:', error.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

module.exports = app;
