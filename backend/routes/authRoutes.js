import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'yuva_pulse_default_secret_2026';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// @desc    Register user/volunteer
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, age_group } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      age_group: age_group || 'N/A'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Login user/volunteer
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get user profile/mood history
// @route   GET /api/auth/profile
router.get('/profile', async (req, res) => {
  try {
    if (!req.headers.authorization) return res.status(401).json({ error: 'No token provided' });
    const token = req.headers.authorization.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'yuva_pulse_default_secret_2026';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
