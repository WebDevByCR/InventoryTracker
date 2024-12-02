import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import itemsRouter from './api/items.js';
import categoriesRouter from './api/categories.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files

// Use the API routes
app.use('/api/items', itemsRouter);
app.use('/api/categories', categoriesRouter);

// Fallback to serve index.html for other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
