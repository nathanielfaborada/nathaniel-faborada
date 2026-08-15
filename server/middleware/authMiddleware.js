import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_jwt_secret_key_2026';

/**
 * Authentication Middleware
 * Protects write endpoints (POST, PUT, DELETE) by validating JWT token.
 * Reads token from Authorization header ('Bearer <token>') or HTTP-only cookies.
 */
export function authenticateToken(req, res, next) {
  let token = null;

  // 1. Check Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 2. Check HTTP-only cookie
    token = req.cookies.token;
  }

  // If no token is found, block access
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Access token is missing.',
    });
  }

  try {
    // Verify token validity
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired access token.',
      error: error.message,
    });
  }
}

export default authenticateToken;
