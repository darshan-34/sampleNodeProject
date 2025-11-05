// server.js

// 1) import
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 2) register early (adjust origin to your frontend URL)
app.use(cors());  // or app.use(cors())

// 3) body parsing and static
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// server.js (excerpt)
const pool = require('./db');
app.post('/submit', async (req, res) => {
  const { text, dropdown, checkboxes, radio, textarea } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO submissions (text, dropdown, checkboxes, radio, textarea) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [text, dropdown, checkboxes, radio, textarea]
    );
    res.json({ ok: true, saved: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'DB insert failed' });
  }
});

// 4) routes
app.post('/submit', (req, res) => {console.log('Received:', req.body); res.json({ ok: true, received: req.body });});
app.get('/health', (_, res) => res.send('healthy'));

// 5) start
app.listen(3000, () => console.log('API on http://localhost:3000'));
