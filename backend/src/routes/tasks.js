const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(listTasks));
router.post('/', asyncHandler(createTask));
router.get('/:id', asyncHandler(getTask));
router.patch('/:id', asyncHandler(updateTask));
router.delete('/:id', asyncHandler(deleteTask));

module.exports = router;
