const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getModels } = require('../models');
const { getJwtSecret } = require('../utils/jwt');
const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  getJwtSecret(),
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, owner_invite_code } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    if (String(name).trim().length < 2) return res.status(400).json({ success: false, message: 'Name must contain at least 2 characters.' });
    if (String(password).length < 8) return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters.' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const { User } = getModels();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: String(name).trim(), email: normalizedEmail,
      phone: phone ? String(phone).trim() : null,
      password: hashedPassword, role: role === 'owner' ? 'owner' : 'user',
    });
    const token = generateToken(user);
    res.status(201).json({
      success: true, message: 'Account registered successfully.',
      data: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, token },
    });
  } catch (error) { next(error); }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    const { User } = getModels();
    const user = await User.findOne({ where: { email: String(email).trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = generateToken(user);
    res.json({
      success: true, message: 'Logged in successfully.',
      data: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, token },
    });
  } catch (error) { next(error); }
};
const getProfile = async (req, res, next) => {
  try {
    const { User } = getModels();
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'phone', 'role', 'created_at'] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const { User } = getModels();
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (name !== undefined) {
      if (String(name).trim().length < 2) return res.status(400).json({ success: false, message: 'Name must contain at least 2 characters.' });
      user.name = String(name).trim();
    }
    if (phone !== undefined) user.phone = phone ? String(phone).trim() : null;
    await user.save();
    res.json({
      success: true, message: 'Profile updated successfully.',
      data: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) { next(error); }
};
module.exports = { register, login, getProfile, updateProfile };
