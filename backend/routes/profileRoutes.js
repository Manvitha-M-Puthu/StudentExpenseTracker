// profileRoutes.js
import express from 'express';
import { getProfileHandler, updateProfileHandler, updateProfilePictureHandler, upload } from '../controllers/profileController.js';

const router = express.Router();

// Get user profile
router.get('/:userId', getProfileHandler);

// Update user profile
router.put('/:userId', updateProfileHandler);

// Update profile picture (separate endpoint for easier handling)
router.put('/:userId/picture', upload, updateProfilePictureHandler);

export default router;