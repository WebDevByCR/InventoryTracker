import express from 'express';
const router = express.Router();
import Joi from 'joi'
import { findAllItems, insertItem, updateItem, deleteItem } from '../db.mjs'; '../db.mjs';

// Joi schema
const itemSchema = Joi.object({
  name: Joi.string().min(3).required(),
  category: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
});

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await findAllItems(); // Assuming findAllItems is a Promise
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Error fetching items' });
  }
});

// Add a new item
router.post('/', async (req, res) => {
  const { error, value } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newItem = await insertItem(value); // Assuming insertItem is a Promise
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Error adding item' });
  }
});

// Update an item
router.put('/:id', async (req, res) => {
  const itemId = req.params.id;
  const { error, value } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const numReplaced = await updateItem(itemId, value);
    if (numReplaced === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Error updating item' });
  }
});

// Delete an item
router.delete('/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    const numRemoved = await deleteItem(itemId);
    if (numRemoved === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Error deleting item' });
  }
});

export default router;
