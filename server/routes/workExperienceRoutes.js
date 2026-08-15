import express from 'express';
import {
  getAllWorkExperiences,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
} from '../controllers/workExperienceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Read Route
router.get('/', getAllWorkExperiences);

// Protected Write Routes (Admin Only)
router.post('/', authenticateToken, createWorkExperience);
router.put('/:id', authenticateToken, updateWorkExperience);
router.delete('/:id', authenticateToken, deleteWorkExperience);

export default router;
