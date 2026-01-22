require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS: để cookie admin chạy khi FE gọi backend
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Quan trọng: trả lời preflight
app.options('*', cors({ origin: allowedOrigin, credentials: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', routes);

const port = Number(process.env.PORT || 5001);

connectDB()
  .then(() => {
    app.listen(port, () =>
      console.log(`🚀 Backend running on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error('❌ DB connect failed:', err.message);
    process.exit(1);
  });
