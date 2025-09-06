const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const { connectDB } = require('./config/database');
const submissionRoutes = require('./routes/submissionRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Helmet + CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
      },
    },
  })
);

app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Body parsing
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect DB
connectDB();

// Routes
app.use('/', submissionRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
