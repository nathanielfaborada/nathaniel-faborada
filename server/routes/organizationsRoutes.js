import express from 'express';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '../controllers/organizationsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Read Route
router.get('/', getAllOrganizations);

// Protected Write Routes (Admin Only)
router.post('/', authenticateToken, createOrganization);
router.put('/:id', authenticateToken, updateOrganization);
router.delete('/:id', authenticateToken, deleteOrganization);

export default router;
