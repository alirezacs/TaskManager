const db = require('../db/knex');

const VALID_STATUS = ['todo', 'done', 'hold', 'canceled'];
const VALID_PRIORITY = ['low', 'medium', 'high'];

const mapTask = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status,
  dueDate: task.due_date,
  ownerId: task.owner_id,
  createdAt: task.created_at,
  updatedAt: task.updated_at
});

const listTasks = async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);
  const status = req.query.status ? String(req.query.status).toLowerCase() : null;
  const priority = req.query.priority ? String(req.query.priority).toLowerCase() : null;
  const q = req.query.q ? String(req.query.q).trim() : null;
  const userIdFilter = req.query.userId ? Number(req.query.userId) : null;

  const query = db('tasks').select(
    'id',
    'title',
    'description',
    'priority',
    'status',
    'due_date',
    'owner_id',
    'created_at',
    'updated_at'
  );

  if (req.user.role !== 'admin') {
    query.where({ owner_id: req.user.id });
  } else if (userIdFilter) {
    query.where({ owner_id: userIdFilter });
  }

  if (status) {
    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status filter.' });
    }
    query.where({ status });
  }

  if (priority) {
    if (!VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority filter.' });
    }
    query.where({ priority });
  }

  if (q) {
    query.where((builder) => {
      builder.where('title', 'like', `%${q}%`).orWhere('description', 'like', `%${q}%`);
    });
  }

  const tasks = await query
    .orderBy('created_at', 'desc')
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return res.json({
    data: tasks.map(mapTask),
    page,
    pageSize
  });
};

const getTask = async (req, res) => {
  const id = Number(req.params.id);
  const task = await db('tasks').where({ id }).first();
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }
  if (req.user.role !== 'admin' && task.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  return res.json({ task: mapTask(task) });
};

const createTask = async (req, res) => {
  const title = String(req.body.title || '').trim();
  const description = req.body.description === undefined ? null : String(req.body.description || '').trim();
  const priority = String(req.body.priority || 'medium').toLowerCase();
  const status = String(req.body.status || 'todo').toLowerCase();
  const dueDate = req.body.dueDate ? String(req.body.dueDate) : null;

  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  if (!VALID_PRIORITY.includes(priority)) {
    return res.status(400).json({ message: 'Priority must be low, medium, or high.' });
  }
  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ message: 'Status must be todo, done, hold, or canceled.' });
  }

  const [id] = await db('tasks').insert({
    title,
    description,
    priority,
    status,
    due_date: dueDate,
    owner_id: req.user.id
  });

  const task = await db('tasks').where({ id }).first();
  return res.status(201).json({ task: mapTask(task) });
};

const updateTask = async (req, res) => {
  const id = Number(req.params.id);
  const task = await db('tasks').where({ id }).first();
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }
  if (req.user.role !== 'admin' && task.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  const updates = {};

  if (req.body.title !== undefined) {
    const title = String(req.body.title || '').trim();
    if (!title) {
      return res.status(400).json({ message: 'Title cannot be empty.' });
    }
    updates.title = title;
  }

  if (req.body.description !== undefined) {
    updates.description = req.body.description === null ? null : String(req.body.description || '').trim();
  }

  if (req.body.priority !== undefined) {
    const priority = String(req.body.priority || '').toLowerCase();
    if (!VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high.' });
    }
    updates.priority = priority;
  }

  if (req.body.status !== undefined) {
    const status = String(req.body.status || '').toLowerCase();
    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Status must be todo, done, hold, or canceled.' });
    }
    updates.status = status;
  }

  if (req.body.dueDate !== undefined) {
    updates.due_date = req.body.dueDate ? String(req.body.dueDate) : null;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' });
  }

  updates.updated_at = db.fn.now();
  await db('tasks').where({ id }).update(updates);

  const updated = await db('tasks').where({ id }).first();
  return res.json({ task: mapTask(updated) });
};

const deleteTask = async (req, res) => {
  const id = Number(req.params.id);
  const task = await db('tasks').where({ id }).first();
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }
  if (req.user.role !== 'admin' && task.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  await db('tasks').where({ id }).del();
  return res.json({ message: 'Task deleted.' });
};

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
