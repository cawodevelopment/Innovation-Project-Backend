import express from 'express';
import * as userController from '../controllers/user.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import validate from '../middlewares/inputSanitisation.middleware.js';
import updateMeSchema from '../schemas/user/updateMe.schema.js';
import deleteMeSchema from '../schemas/user/deleteMe.schema.js';
import addUserDietaryPreferenceSchema from '../schemas/user/addUserDietaryPreference.schema.js';
import addUserAllergenSchema from '../schemas/user/addUserAllergen.schema.js';

const router = express.Router();

router.route('/me')
  .get(authenticate, userController.getMe)
  .put(authenticate, validate(updateMeSchema), userController.updateMe)
  .delete(authenticate, validate(deleteMeSchema), userController.deleteMe);

router.route('/me/dietary-preferences')
  .get(authenticate, userController.getUserDietaryPreferences)
  .post(authenticate, validate(addUserDietaryPreferenceSchema), userController.addUserDietaryPreference)
  .delete(authenticate, validate(addUserDietaryPreferenceSchema), userController.removeUserDietaryPreference);

router.route('/me/allergens')
  .get(authenticate, userController.getUserAllergens)
  .post(authenticate, validate(addUserAllergenSchema), userController.addUserAllergen)
  .delete(authenticate, validate(addUserAllergenSchema), userController.removeUserAllergen);

export default router;