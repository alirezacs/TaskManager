const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser
} = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users', asyncHandler(listUsers));
router.get('/users/:id', asyncHandler(getUser));
router.post('/users', asyncHandler(createUser));
router.patch('/users/:id', asyncHandler(updateUser));
router.delete('/users/:id', asyncHandler(deactivateUser));

module.exports = router;
