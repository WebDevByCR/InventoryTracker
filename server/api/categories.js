import express from 'express';
import { insertCategory, findAllCategories } from '../db.mjs';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await findAllCategories({}); // Pass empty object for all categories
    res.json(categories);
  } catch (error) {
    console.error("Error in /api/categories route:", error);
    res.status(500).json({ error: `Error fetching categories: ${error.message}` });
  }
});

router.post('/', async (req, res) => {
  try {
    const newCategory = await insertCategory(req.body); // Assuming insertCategory is a Promise
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Error adding category: ' + error.message });
  }
});

export default router;