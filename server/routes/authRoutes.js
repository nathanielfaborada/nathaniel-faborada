import express from 'express';
import { login, logout, getMe, forgotPassword, resetPassword, verifyResetToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token', verifyResetToken);

// Protected auth status verification
router.get('/me', authenticateToken, getMe);

export default router;
