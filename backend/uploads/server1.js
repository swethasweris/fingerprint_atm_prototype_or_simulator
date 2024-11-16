const http = require('http');
const fs = require('fs');
const path = require('path');
const multiparty = require('multiparty');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Import the User model
const crypto = require('crypto'); // Import crypto for fingerprint comparison

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fingerprintATM')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Content-Type': 'text/plain' });
    res.end();
    return;
  }

  // Handle registration
  if (req.method === 'POST' && req.url === '/register') {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error processing registration' }));
        return;
      }

      const username = fields.username[0].trim();
      const password = fields.password[0].trim();
      const uploadedFile = files.fingerprint[0];

      if (!username || !password || !uploadedFile) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Missing fields' }));
        return;
      }

      const uploadsDir = path.join(__dirname, 'uploads');
      const uploadedFilePath = path.join(uploadsDir, uploadedFile.originalFilename);

      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      // Move file to uploads directory
      fs.rename(uploadedFile.path, uploadedFilePath, async (err) => {
        if (err) {
          console.error('Error saving fingerprint:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Error saving fingerprint' }));
          return;
        }

        // Check if four users already exist
        const userCount = await User.countDocuments();
        if (userCount >= 4) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Maximum number of users reached' }));
          return;
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user in MongoDB
        try {
          const newUser = new User({
            username,
            password: hashedPassword,
            fingerprintPath: uploadedFilePath
          });

          await newUser.save();
          console.log('User registered:', username);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Registration successful' }));
        } catch (error) {
          console.error('Error saving user data:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Error saving user data' }));
        }
      });
    });

  // Handle login
  } else if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { username, password } = JSON.parse(body);

        if (!username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Missing fields' }));
          return;
        }

        const user = await User.findOne({ username });

        if (!user) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid username or password' }));
          return;
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid username or password' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Login successful' }));
      } catch (error) {
        console.error('Error during login:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error logging in' }));
      }
    });

  // Handle file upload and fingerprint comparison
  } else if (req.method === 'POST' && req.url === '/upload') {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error processing file' }));
        return;
      }

      const uploadedFile = files.fingerprint[0];
      const uploadsDir = path.join(__dirname, 'uploads');
      const uploadedFilePath = path.join(uploadsDir, uploadedFile.originalFilename);

      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      // Move the uploaded fingerprint file to the uploads directory
      fs.rename(uploadedFile.path, uploadedFilePath, async (err) => {
        if (err) {
          console.error('Error saving file:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Error saving file' }));
          return;
        }

        // Find all users and compare their fingerprints with the uploaded file
        const users = await User.find();
        let isAuthenticated = false;

        for (const user of users) {
          const isMatch = compareFingerprints(uploadedFilePath, user.fingerprintPath);
          
          if (isMatch) {
            isAuthenticated = true;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              accountDetails: {
                username: user.username,
                accountNumber: '1234567890', // Replace with actual details
                accountHolder: user.username
              }
            }));
            return;
          }
        }

        if (!isAuthenticated) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Authentication failed' }));
        }
      });
    });

  // Default 404 handler for other routes
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Not Found' }));
  }
});

// Dummy function to simulate fingerprint comparison
const compareFingerprints = (uploadedPath, storedPath) => {
  return crypto.createHash('md5').update(fs.readFileSync(uploadedPath)).digest('hex') === crypto.createHash('md5').update(fs.readFileSync(storedPath)).digest('hex');
};

// Start the server
server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
