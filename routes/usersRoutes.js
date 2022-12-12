const router = require('express').Router();
const { validateUserInfo } = require('../utils/validators/userValidator');
const { getMyData, updateUserInfo } = require('../controllers/usersControllers');

router.get('/me', getMyData);
router.patch('/me', validateUserInfo, updateUserInfo);

module.exports = router;
