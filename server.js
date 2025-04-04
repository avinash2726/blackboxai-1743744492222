require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const session = require('express-session');
const app = express();

// Security middleware
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true in production with HTTPS
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pdfs', express.static(path.join(__dirname, 'public', 'pdfs')));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticate = (req, res, next) => {
  if (req.session.authenticated) return next();
  res.redirect('/admin/login');
};

// Routes
app.use('/admin', require('./routes/admin'));

// User routes
app.get('/', (req, res) => {
  // In a real app, you would get this from a database
  const pdfs = [
    { name: 'Daily News', date: '2023-05-15', type: 'Daily', filename: 'sample.pdf' }
  ];
  res.render('user/index', { pdfs });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/admin/login`);
});
