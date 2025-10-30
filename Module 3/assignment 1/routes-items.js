// routes/items.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// If using DB, require model (wrapped in try/catch to avoid crash if not connected)
let ItemModel = null;
try {
  ItemModel = require('../models/item');
} catch (e) {
  // ignore; will use in-memory
}

// Helper to access store (DB or in-memory)
async function getAllItems(ctx) {
  if (ctx.useDb && ItemModel) return await ItemModel.find().sort({ createdAt: -1 }).lean();
  return ctx.inMemoryStore.items.slice().reverse();
}

async function getItemById(ctx, id) {
  if (ctx.useDb && ItemModel) return await ItemModel.findById(id).lean();
  return ctx.inMemoryStore.items.find(i => i.id === id);
}

async function createItem(ctx, data) {
  if (ctx.useDb && ItemModel) {
    const doc = await ItemModel.create(data);
    return doc.toObject();
  }
  const newItem = {
    id: uuidv4(),
    title: data.title || '',
    description: data.description || '',
    createdAt: new Date().toISOString(),
  };
  ctx.inMemoryStore.items.push(newItem);
  return newItem;
}

async function updateItem(ctx, id, data) {
  if (ctx.useDb && ItemModel) {
    const updated = await ItemModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return updated;
  }
  const idx = ctx.inMemoryStore.items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  ctx.inMemoryStore.items[idx] = { ...ctx.inMemoryStore.items[idx], ...data };
  return ctx.inMemoryStore.items[idx];
}

async function deleteItem(ctx, id) {
  if (ctx.useDb && ItemModel) {
    await ItemModel.findByIdAndDelete(id);
    return true;
  }
  const idx = ctx.inMemoryStore.items.findIndex(i => i.id === id);
  if (idx === -1) return false;
  ctx.inMemoryStore.items.splice(idx, 1);
  return true;
}

// GET /api/items
router.get('/', async (req, res) => {
  try {
    const items = await getAllItems(req.appContext);
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await getItemById(req.appContext, req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/items
router.post('/', async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      createdAt: new Date().toISOString(),
    };
    const item = await createItem(req.appContext, payload);
    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/items/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateItem(req.appContext, req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteItem(req.appContext, req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
