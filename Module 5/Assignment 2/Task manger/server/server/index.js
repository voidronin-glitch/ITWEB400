const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.sqlite');
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) return console.error('DB open error', err);
  console.log('Connected to SQLite DB at', DB_PATH);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      details TEXT DEFAULT '',
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    completed: !!row.completed,
    created_at: row.created_at
  };
}

app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(rowToTask));
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, details } = req.body;
  if (!title || title.trim() === '') return res.status(400).json({ error: 'title required' });
  const stmt = db.prepare('INSERT INTO tasks (title, details) VALUES (?, ?)');
  stmt.run(title.trim(), details || '', function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.status(201).json(rowToTask(row));
    });
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, details, completed } = req.body;
  db.run(
    'UPDATE tasks SET title = COALESCE(?, title), details = COALESCE(?, details), completed = COALESCE(?, completed) WHERE id = ?',
    [title, details, completed ? 1 : 0, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'not found' });
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json(rowToTask(row));
      });
    }
  );
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'not found' });
    res.status(204).send();
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
