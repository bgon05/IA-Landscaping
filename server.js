const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'ia_landscaping',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Simple in-memory token storage (stores: token -> user_id)
const sessions = new Map();

// ===== SIGNUP =====
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password required' });
  }

  try {
    const conn = await pool.getConnection();
    try {
      // Check if email exists
      const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password and insert user
      const hash = await bcrypt.hash(password, 10);
      const [result] = await conn.execute(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, hash]
      );

      res.status(201).json({ message: 'Sign up successful', user_id: result.insertId });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== LOGIN =====
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const conn = await pool.getConnection();
    try {
      // Get user by email
      const [users] = await conn.execute('SELECT id, name, password_hash FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = users[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Create session token
      const token = require('crypto').randomBytes(16).toString('hex');
      sessions.set(token, user.id);

      res.json({ token, user_id: user.id, name: user.name });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== GET PROFILE =====
app.get('/api/profile/:user_id', async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const conn = await pool.getConnection();
    try {
      const [profile] = await conn.execute('SELECT * FROM profiles WHERE user_id = ?', [user_id]);
      res.json(profile[0] || {});
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== SAVE PROFILE =====
app.post('/api/profile/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const { property_size, services_interested, address, phone } = req.body || {};

  try {
    const conn = await pool.getConnection();
    try {
      // Check if profile exists
      const [existing] = await conn.execute('SELECT id FROM profiles WHERE user_id = ?', [user_id]);

      if (existing.length > 0) {
        // Update existing profile
        await conn.execute(
          'UPDATE profiles SET property_size = ?, services_interested = ?, address = ?, phone = ? WHERE user_id = ?',
          [property_size, services_interested, address, phone, user_id]
        );
      } else {
        // Create new profile
        await conn.execute(
          'INSERT INTO profiles (user_id, property_size, services_interested, address, phone) VALUES (?, ?, ?, ?, ?)',
          [user_id, property_size, services_interested, address, phone]
        );
      }

      res.json({ message: 'Profile saved' });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Profile save error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
