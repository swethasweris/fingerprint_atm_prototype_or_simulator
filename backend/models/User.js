// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fingerprintPath: { type: String, required: true },
    balance: { type: Number, default: 0 } // Balance field initialized to 0
});

const User = mongoose.model('User', userSchema);
module.exports = User;
