import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { sendResetPasswordEmail } from '../utils/sendEmail.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/login
 * Authenticates admin by verifying hashed password with bcrypt.
 */
export async function login(req, res) {
  try {
    const { username, email, password } = req.body;

    const identifier = username || email;
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password.',
      });
    }

    // Query user by username or email
    const [rows] = await pool.execute(
      'SELECT id, username, email, password_hash, role FROM users WHERE username = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const user = rows[0];

    // Verify password against stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Generate JWT Token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'admin',
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Set HTTP-Only Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/logout
 * Clears JWT session cookie.
 */
export async function logout(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout.',
      error: error.message,
    });
  }
}

/**
 * GET /api/auth/me
 * Returns current authenticated user profile.
 */
export async function getMe(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching user data.',
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/forgot-password
 * Generates reset token, saves expiration, and emails reset link via Brevo.
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Query user by email
    const [users] = await pool.execute(
      'SELECT id, username, email FROM users WHERE LOWER(email) = ? LIMIT 1',
      [trimmedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    const user = users[0];

    // 2. Generate random crypto token and hash it for DB storage
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 3. Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // 4. Update user record in database
    await pool.execute(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [hashedToken, expiresAt, user.id]
    );

    // 5. Build reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:1234';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    // 6. Send transactional email via Brevo REST API
    await sendResetPasswordEmail(user.email, resetToken);

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email!',
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process forgot password request.',
    });
  }
}

/**
 * POST /api/auth/reset-password
 * Verifies token validity, hashes new password, and clears reset token fields.
 */
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 1. Hash incoming token with SHA-256
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Query user with matching token
    const [users] = await pool.execute(
      'SELECT id, username, email, reset_password_expires FROM users WHERE reset_password_token = ? LIMIT 1',
      [hashedToken]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or already used password reset token.',
      });
    }

    const user = users[0];

    // 3. Verify token expiration
    if (!user.reset_password_expires || new Date(user.reset_password_expires).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link has expired. Please request a new one.',
      });
    }

    // 4. Hash new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // 5. Update user and clear reset tokens
    await pool.execute(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [passwordHash, user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in.',
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password.',
    });
  }
}
