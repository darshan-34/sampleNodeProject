// server.js

// 1) import
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 2) register early (adjust origin to your frontend URL)
app.use(cors());

// 3) body parsing and static
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const pool = require('./db');

// 4) ROUTES
// Route for first page form submission
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

// NEW ROUTE for second page table data submission
app.post('/submit-table', async (req, res) => {
  const tableData = req.body;

  try {
    // Validate that we received an array
    if (!Array.isArray(tableData)) {
      return res.status(400).json({ ok: false, error: 'Expected an array of data' });
    }

    const results = [];

    // Insert each row individually
    for (const row of tableData) {
      const { name, age, state, occupation, phonenumber } = row;

      const result = await pool.query(
        'INSERT INTO submissions_page2 (name, age, state, occupation, phonenumber) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, age, state, occupation, phonenumber]
      );

      results.push(result.rows[0]);
    }

    res.json({
      ok: true,
      insertedCount: results.length,
      saved: results
    });

  } catch (e) {
    console.error('Database error:', e);
    res.status(500).json({ ok: false, error: 'Database insert failed', details: e.message });
  }
});

// Route to get form data from first page
app.get('/get-form-data', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM submissions ORDER BY created_at DESC'
    );
    res.json({ ok: true, data: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to fetch form data' });
  }
});

// Route to get table data from second page
app.get('/get-table-data', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM submissions_page2 ORDER BY created_at DESC'
    );
    res.json({ ok: true, data: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to fetch table data' });
  }
});

// NEW ROUTE: Delete all form data
app.delete('/delete-form-data', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM submissions');
    res.json({ 
      ok: true, 
      message: `Successfully deleted ${result.rowCount} form data records` 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to delete form data' });
  }
});

// NEW ROUTE: Delete all table data
app.delete('/delete-table-data', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM submissions_page2');
    res.json({ 
      ok: true, 
      message: `Successfully deleted ${result.rowCount} table data records` 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to delete table data' });
  }
});

// Health check route
app.get('/health', (_, res) => res.send('healthy'));

// 5) start
app.listen(3000, () => console.log('API on http://localhost:3000'));
