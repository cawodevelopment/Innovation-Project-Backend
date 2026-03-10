import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.get('get/me', userController.getMe);
router.put('update/me', userController.updateMe);
router.delete('delete/me', userController.deleteMe);

export default router;