const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./src/config/db');
const jobRoutes = require('./src/routes/job.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/jobs', jobRoutes);

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
  return res.status(status).json({
    error: {
      message: err.message || 'An unexpected internal server error occurred.',
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
      await sequelize.sync({ alter: true });
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

startServer();
