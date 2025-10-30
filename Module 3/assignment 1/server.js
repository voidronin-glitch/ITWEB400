// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const USE_DB = process.env.USE_DB === 'true'; // set to "true" to use MongoDB
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory fallback store (if you don't want to configure MongoDB)
const inMemoryStore = {
  items: [], // { id, title, description, createdAt }
  nextId: 1,
};

// If using DB, initialize Mongoose
if (USE_DB) {
  const mongoose = require('mongoose');
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fullstack_project';
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Falling back to in-memory store');
  });
  // require the model so routes can use it
  const Item = require('./models/item');
}

// Routes
const itemsRouter = require('./routes/items');
app.use('/api/items', (req, res, next) => {
  // expose whether DB is enabled to routes
  req.appContext = { useDb: USE_DB, inMemoryStore };
  next();
}, itemsRouter);

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`USE_DB=${USE_DB}`);
});
