import express from 'express';
import {
  getAllCreations,
  getCreationById,
  createCreation,
  updateCreation,
  deleteCreation,
} from '../controllers/creationsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Read Routes
router.get('/', getAllCreations);
router.get('/:id', getCreationById);

// Protected Write Routes (Admin Only)
router.post('/', authenticateToken, createCreation);
router.put('/:id', authenticateToken, updateCreation);
router.delete('/:id', authenticateToken, deleteCreation);

export default router;
