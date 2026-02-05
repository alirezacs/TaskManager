const db = require('../db/knex');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../middleware/auth');

const mapUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: !!user.is_active,
  createdAt: user.created_at,
  updatedAt: user.updated_at
});

const isValidEmail = (email) => {
  const value = String(email || '').toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const register = async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
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
    role: 'user',
    is_active: 1
  });

  const user = await db('users').where({ id }).first();
  const token = signToken(user);

  return res.status(201).json({ token, user: mapUser(user) });
};

const login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await db('users').where({ email }).first();
  if (!user || !user.is_active) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isMatch = await verifyPassword(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = signToken(user);
  return res.json({ token, user: mapUser(user) });
};

const me = async (req, res) => {
  const user = await db('users').where({ id: req.user.id }).first();
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json({ user: mapUser(user) });
};

module.exports = { register, login, me, mapUser, isValidEmail };
