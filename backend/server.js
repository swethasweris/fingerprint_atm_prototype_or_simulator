const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multiparty = require('multiparty');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fingerprintATM', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Registration endpoint
app.post('/register', (req, res) => {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error processing registration' });
        }

        const username = fields.username[0].trim();
        const password = fields.password[0].trim();
        const uploadedFile = files.fingerprint[0];

        if (!username || !password || !uploadedFile) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        const uploadsDir = path.join(__dirname, 'uploads');
        const uploadedFilePath = path.join(uploadsDir, uploadedFile.originalFilename);

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        fs.rename(uploadedFile.path, uploadedFilePath, async (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error saving fingerprint' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            try {
                const newUser = new User({
                    username,
                    password: hashedPassword,
                    fingerprintPath: uploadedFilePath,
                    balance: 0 // Initialize balance to 0
                });

                await newUser.save();
                res.status(200).json({ success: true, message: 'Registration successful' });
            } catch (error) {
                res.status(500).json({ success: false, message: 'Error saving user data' });
            }
        });
    });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        res.status(200).json({ success: true, message: 'Login successful', username });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error logging in' });
    }
});

// File upload and fingerprint comparison
app.post('/upload', (req, res) => {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error processing file' });
        }

        const username = fields.username[0];
        const uploadedFile = files.fingerprint[0];
        const uploadsDir = path.join(__dirname, 'uploads');
        const uploadedFilePath = path.join(uploadsDir, uploadedFile.originalFilename);

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        fs.rename(uploadedFile.path, uploadedFilePath, async (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error saving file' });
            }

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const isMatch = compareFingerprints(uploadedFilePath, user.fingerprintPath);
            if (isMatch) {
                res.status(200).json({
                    success: true,
                    accountDetails: {
                        accountNumber: '123-456-789',
                        username: user.username,
                        balance: user.balance,
                        bankName: 'Karur Vysya Bank',
                        city: 'Erode',
                        type: 'Savings'
                    }
                });
            } else {
                res.status(401).json({ success: false, message: 'Authentication failed' });
            }
        });
    });
});

// Savings (deposit) endpoint
app.post('/savings', async (req, res) => {
    const { username, amount } = req.body;

    // Input validation
    if (!username || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    try {
        // Find the user in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update the balance
        user.balance += parseFloat(amount);
        await user.save(); // Save the updated user

        // Return the updated balance
        res.status(200).json({ success: true, balance: user.balance });
    } catch (error) {
        console.error("Error processing deposit:", error); // Log error details
        res.status(500).json({ success: false, message: 'Error processing deposit' });
    }
});

// Withdrawal endpoint
app.post('/withdrawal', async (req, res) => {
    const { username, amount } = req.body;

    if (!username || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient funds' });
        }

        user.balance -= parseFloat(amount);
        await user.save();

        // Return the success message with the new balance
        res.status(200).json({ success: true, balance: user.balance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error processing withdrawal' });
    }
});


// Utility function to compare fingerprints
function compareFingerprints(uploadedFilePath, storedFilePath) {
    const uploadedData = fs.readFileSync(uploadedFilePath);
    const storedData = fs.readFileSync(storedFilePath);

    const hashUploaded = crypto.createHash('sha256').update(uploadedData).digest('hex');
    const hashStored = crypto.createHash('sha256').update(storedData).digest('hex');

    return hashUploaded === hashStored;
}

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
