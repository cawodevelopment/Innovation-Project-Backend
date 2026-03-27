import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logoutUser);

export default router;