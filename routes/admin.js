const express = require('express');
const multer = require('multer');
const path = require('path');
const sanitize = require('sanitize-filename');
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitize(file.originalname);
    cb(null, Date.now() + '-' + sanitized);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Admin login routes
router.get('/login', (req, res) => {
  res.render('admin/login');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/admin/upload');
  } else {
    res.render('admin/login', { error: 'Invalid credentials' });
  }
});

// Admin dashboard route
router.get('/upload', (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect('/admin/login');
  }
  res.render('admin/upload');
});

// PDF upload route
router.post('/upload', (req, res, next) => {
  if (!req.session.authenticated) {
    return res.redirect('/admin/login');
  }
  upload.single('pdfFile')(req, res, (err) => {
    if (err) {
      return res.render('admin/upload', { error: err.message });
    }
    if (!req.file) {
      return res.render('admin/upload', { error: 'No file uploaded' });
    }
    res.render('admin/upload', { success: 'File uploaded successfully' });
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

module.exports = router;
