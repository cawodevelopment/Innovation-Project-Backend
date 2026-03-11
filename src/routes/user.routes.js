import express from 'express';
import * as userController from '../controllers/user.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/me')
  .get(authenticate, userController.getMe)
  .put(authenticate, userController.updateMe)
  .delete(authenticate, userController.deleteMe);

export default router;