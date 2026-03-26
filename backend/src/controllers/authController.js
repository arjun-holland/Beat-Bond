import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import generateTokens from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import redis from '../config/redis.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (user) {
      // Generate email verification token
      const verificationToken = crypto.randomBytes(20).toString('hex');
      
      // Store in Redis with 24 hours expiration 
      // Key format: verify_email:<token>
      await redis.set(`verify_email:${verificationToken}`, user._id.toString(), 'EX', 24 * 60 * 60);

      // Send Email
      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
      const message = `
        <h1>Welcome to Smart Spotify</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Smart Spotify - Verify your Email',
        html: message
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const userId = await redis.get(`verify_email:${token}`);
    
    if (!userId) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.isEmailVerified = true;
    await user.save();

    // Delete token from redis
    await redis.del(`verify_email:${token}`);

    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email address before logging in' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set JWT as HTTP-Only cookie, 7 days for refresh token logic usually
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: accessToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
