const db = require('../db/knex');
const { hashPassword } = require('../utils/password');
const { mapUser, isValidEmail } = require('./authController');

const listUsers = async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);
  const role = req.query.role ? String(req.query.role).toLowerCase() : null;
  const active = req.query.active;

  const query = db('users').select(
    'id',
    'name',
    'email',
    'role',
    'is_active',
    'created_at',
    'updated_at'
  );

  if (role) {
    query.where({ role });
  }
  if (active !== undefined) {
    const isActive = active === 'true' || active === '1';
    query.where({ is_active: isActive ? 1 : 0 });
  }

  const users = await query.limit(pageSize).offset((page - 1) * pageSize);
  return res.json({
    data: users.map(mapUser),
    page,
    pageSize
  });
};

const getUser = async (req, res) => {
  const id = Number(req.params.id);
  const user = await db('users').where({ id }).first();
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json({ user: mapUser(user) });
};

const createUser = async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = String(req.body.role || 'user').toLowerCase();

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be user or admin.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const existing = await db('users').where({ email }).first();
  if (existing) {
    return res.status(409).json({ message: 'Email already registered.' });
  }

  const passwordHash = await hashPassword(password);
  const [id] = await db('users').insert({
    name,
    email,
    password_hash: passwordHash,
    role,
    is_active: 1
  });

  const user = await db('users').where({ id }).first();
  return res.status(201).json({ user: mapUser(user) });
};

const updateUser = async (req, res) => {
  const id = Number(req.params.id);
  const user = await db('users').where({ id }).first();
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const updates = {};

  if (req.body.name !== undefined) {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Name cannot be empty.' });
    }
    updates.name = name;
  }

  if (req.body.email !== undefined) {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }
    const existing = await db('users').where({ email }).andWhereNot({ id }).first();
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    updates.email = email;
  }

  if (req.body.role !== undefined) {
    const role = String(req.body.role || '').toLowerCase();
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be user or admin.' });
    }
    updates.role = role;
  }

  if (req.body.isActive !== undefined) {
    updates.is_active = req.body.isActive ? 1 : 0;
  }

  if (req.body.password !== undefined) {
    const password = String(req.body.password || '');
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    updates.password_hash = await hashPassword(password);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' });
  }

  updates.updated_at = db.fn.now();
  await db('users').where({ id }).update(updates);

  const updated = await db('users').where({ id }).first();
  return res.json({ user: mapUser(updated) });
};

const deactivateUser = async (req, res) => {
  const id = Number(req.params.id);
  const user = await db('users').where({ id }).first();
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await db('users').where({ id }).update({
    is_active: 0,
    updated_at: db.fn.now()
  });

  return res.json({ message: 'User deactivated.' });
};

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser
};
