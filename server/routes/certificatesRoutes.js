import express from 'express';
import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '../controllers/certificatesController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Read Routes
router.get('/', getAllCertificates);
router.get('/:id', getCertificateById);

// Protected Write Routes (Admin Only)
router.post('/', authenticateToken, createCertificate);
router.put('/:id', authenticateToken, updateCertificate);
router.delete('/:id', authenticateToken, deleteCertificate);

export default router;
