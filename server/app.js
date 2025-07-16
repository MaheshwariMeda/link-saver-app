const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require("./db");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
// === SIGNUP ===
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    const info = stmt.run(email, hashed);

    const token = jwt.sign({ id: info.lastInsertRowid, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'User already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
});


// === LOGIN ===
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// === TEST PROTECTED ROUTE ===
const authenticateToken = require('./auth');
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, you are authenticated!` });
});


// === Helper: Fetch title and favicon ===
async function fetchMetadata(url) {
  try {
    const { data, request } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $('title').first().text() || url;
    let favicon = $('link[rel="icon"]').attr('href') ||
                  $('link[rel="shortcut icon"]').attr('href') ||
                  '/favicon.ico';

    // To Convert relative favicon to full URL
    if (favicon && !favicon.startsWith('http')) {
      const origin = new URL(request.res.responseUrl).origin;
      favicon = origin + favicon;
    }

    return { title, favicon };
  } catch (err) {
    console.error('Metadata fetch failed:', err.message);
    return { title: url, favicon: '' };
  }
}

// === Helper: Get summary from Jina AI ===
async function fetchSummary(url) {
  try {
    const res = await axios.post('https://api.jina.ai/summarize', {
      input: url,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return res.data.summary || '';
  } catch (err) {
    console.error('Summary fetch failed:', err.message);
    return 'Summary not available';
  }
}

// === POST /api/bookmarks ===
app.post('/api/bookmarks', authenticateToken, async (req, res) => {
  const { url } = req.body;
  const userId = req.user.id;

  try {
    const { title, favicon } = await fetchMetadata(url);
    const summary = await fetchSummary(url);

    const stmt = db.prepare(`
      INSERT INTO bookmarks (user_id, url, title, favicon, summary)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, url, title, favicon, summary);

    const newBookmark = {
      id: result.lastInsertRowid,
      url, title, favicon, summary,
    };

    res.status(201).json(newBookmark);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save bookmark' });
  }
});

// === GET /api/bookmarks ===
app.get('/api/bookmarks', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const stmt = db.prepare(`
    SELECT id, url, title, favicon, summary, created_at
    FROM bookmarks WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  const bookmarks = stmt.all(userId);
  res.json(bookmarks);
});

// === DELETE /api/bookmarks/:id ===
app.delete('/api/bookmarks/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const bookmarkId = req.params.id;

  const stmt = db.prepare(`
    DELETE FROM bookmarks WHERE id = ? AND user_id = ?
  `);

  const result = stmt.run(bookmarkId, userId);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Bookmark not found' });
  }

  res.json({ message: 'Deleted successfully' });
});


app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running,and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);